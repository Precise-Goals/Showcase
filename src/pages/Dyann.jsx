import React, { useState } from "react";
import Papa from "papaparse";
import initSqlJs from "sql.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

let SQL = null; // sql.js module
let db = null; // SQLite instance

// Generate SQL using Gemini
const generateAnalysis = async ({ question, schema }) => {
  const schemaDescription = schema
    .map((col) => `${col.name} (${col.type})`)
    .join(", ");

  const prompt = `
  You are a SQL assistant.
  The dataset is in a SQLite table named "data".
  Schema: ${schemaDescription}
  
  User question: "${question}"
  
  Respond ONLY in strict JSON without markdown fences, no explanations outside JSON:
  {
    "sql": "SQL_QUERY_HERE",
    "explanation": "EXPLANATION_HERE"
  }
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // 🛠 strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/```(json)?/g, "").trim();
  }

  // 🛠 try to extract valid JSON even if extra text is around
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini did not return valid JSON: " + text);
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Gemini returned invalid JSON:", text, err);
    throw new Error("Failed to parse Gemini response.");
  }
};

// Run SQL using sql.js
const executeSQL = (sql) => {
  try {
    const res = db.exec(sql); // returns array of results
    if (!res.length) return [];
    const cols = res[0].columns;
    const values = res[0].values;
    return values.map((row) =>
      Object.fromEntries(row.map((val, i) => [cols[i], val]))
    );
  } catch (err) {
    console.error("SQL execution error:", err);
    return [];
  }
};

const Dyann = () => {
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentExplanation, setCurrentExplanation] = useState("");

  // Parse CSV and load into SQLite
  const parseAndLoadCSV = async (csvText) => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const rows = parsed.data;
    if (!rows.length) throw new Error("Empty dataset");

    // Infer schema
    const schema = Object.keys(rows[0]).map((col) => ({
      name: col,
      type: "TEXT",
    }));

    // Init sql.js
    if (!SQL)
      SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });
    db = new SQL.Database();

    // Create table
    const colDefs = schema.map((c) => `"${c.name}" ${c.type}`).join(", ");
    db.run(`CREATE TABLE data (${colDefs});`);

    // Insert data
    const insertStmt = db.prepare(
      `INSERT INTO data (${schema
        .map((c) => `"${c.name}"`)
        .join(", ")}) VALUES (${schema.map(() => "?").join(", ")})`
    );
    rows.forEach((row) => {
      insertStmt.run(Object.values(row));
    });
    insertStmt.free();

    setSchema(schema);
    setData(rows);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const text = await file.text();
      await parseAndLoadCSV(text);
      setResults([]);
      setCurrentQuery("");
      setCurrentExplanation("");
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim() || !data.length) return;
    setLoading(true);
    setError("");
    try {
      const analysis = await generateAnalysis({ question, schema });
      const queryResults = executeSQL(analysis.sql);
      setResults(queryResults);
      setCurrentQuery(analysis.sql);
      setCurrentExplanation(analysis.explanation);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inpsa" style={{ padding: "2rem" }}>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {data.length > 0 && (
        <>
          <h3>Dataset Loaded: {data.length} rows</h3>
          <input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={handleQuestionSubmit} disabled={loading}>
            {loading ? "Processing..." : "Ask"}
          </button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {currentExplanation && (
        <div>
          <h3>Analysis</h3>
          <p>{currentExplanation}</p>
          <pre>{currentQuery}</pre>
        </div>
      )}

      {results.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              {Object.keys(results[0]).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dyann;
