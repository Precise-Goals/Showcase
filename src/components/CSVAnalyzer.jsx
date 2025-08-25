import React, { useState, useRef } from "react";
import {
  FiUpload,
  FiDatabase,
  FiCode,
  FiBarChart2,
  FiDownload,
} from "react-icons/fi";
import Papa from "papaparse";

const CSVAnalyzer = ({ onAnalysisComplete }) => {
  const [csvData, setCsvData] = useState(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [explanation, setExplanation] = useState("");
  const fileInputRef = useRef(null);

  // CSV Schema Detection (similar to app.py)
  const detectCSVSchema = (data) => {
    if (!data || data.length === 0) {
      return {
        columns: [],
        dataTypes: {},
        sampleValues: {},
        rowCount: 0,
        columnCount: 0,
      };
    }

    const columns = Object.keys(data[0]);
    const dataTypes = {};
    const sampleValues = {};

    columns.forEach((col) => {
      const values = data
        .map((row) => row[col])
        .filter((val) => val !== undefined && val !== null);
      const sampleVals = values.slice(0, 3);

      // Detect data type
      let dataType = "string";
      if (values.length > 0) {
        const firstVal = values[0];
        if (!isNaN(firstVal) && firstVal !== "") {
          dataType = "number";
        } else if (new Date(firstVal).toString() !== "Invalid Date") {
          dataType = "date";
        }
      }

      dataTypes[col] = dataType;
      sampleValues[col] = sampleVals;
    });

    return {
      columns,
      dataTypes,
      sampleValues,
      rowCount: data.length,
      columnCount: columns.length,
    };
  };

  // Generate SQL using a simple rule-based approach (client-side)
  const generateSQL = (schemaInfo, question) => {
    const lowerQuestion = question.toLowerCase();
    const columns = schemaInfo.columns;

    // Simple keyword-based SQL generation
    let sqlQuery = "SELECT ";

    if (lowerQuestion.includes("all") || lowerQuestion.includes("everything")) {
      sqlQuery += "*";
    } else if (
      lowerQuestion.includes("count") ||
      lowerQuestion.includes("how many")
    ) {
      sqlQuery += "COUNT(*) as count";
    } else if (
      lowerQuestion.includes("sum") ||
      lowerQuestion.includes("total")
    ) {
      // Find numeric columns
      const numericColumns = columns.filter(
        (col) => schemaInfo.dataTypes[col] === "number"
      );
      if (numericColumns.length > 0) {
        sqlQuery += `SUM(${numericColumns[0]}) as total`;
      } else {
        sqlQuery += "*";
      }
    } else {
      // Default to first few columns
      sqlQuery += columns.slice(0, 3).join(", ");
    }

    sqlQuery += " FROM csv_data";

    // Add WHERE clause based on keywords
    if (lowerQuestion.includes("where") || lowerQuestion.includes("filter")) {
      const numericColumns = columns.filter(
        (col) => schemaInfo.dataTypes[col] === "number"
      );
      if (numericColumns.length > 0) {
        sqlQuery += ` WHERE ${numericColumns[0]} > 0`;
      }
    }

    // Add ORDER BY
    if (lowerQuestion.includes("sort") || lowerQuestion.includes("order")) {
      const numericColumns = columns.filter(
        (col) => schemaInfo.dataTypes[col] === "number"
      );
      if (numericColumns.length > 0) {
        sqlQuery += ` ORDER BY ${numericColumns[0]} DESC`;
      }
    }

    // Add LIMIT
    if (lowerQuestion.includes("top") || lowerQuestion.includes("first")) {
      sqlQuery += " LIMIT 10";
    }

    return sqlQuery;
  };

  // Execute SQL-like operations on CSV data
  const executeSQLOnCSV = (data, sqlQuery) => {
    try {
      // Simple SQL-like operations
      if (sqlQuery.toLowerCase().includes("select")) {
        let result = [...data];

        // Handle WHERE clause
        if (sqlQuery.toLowerCase().includes("where")) {
          const numericColumns = Object.keys(data[0]).filter(
            (col) => !isNaN(data[0][col])
          );
          if (numericColumns.length > 0) {
            result = result.filter(
              (row) => parseFloat(row[numericColumns[0]]) > 0
            );
          }
        }

        // Handle ORDER BY
        if (sqlQuery.toLowerCase().includes("order by")) {
          const numericColumns = Object.keys(data[0]).filter(
            (col) => !isNaN(data[0][col])
          );
          if (numericColumns.length > 0) {
            result.sort(
              (a, b) =>
                parseFloat(b[numericColumns[0]]) -
                parseFloat(a[numericColumns[0]])
            );
          }
        }

        // Handle LIMIT
        if (sqlQuery.toLowerCase().includes("limit")) {
          const limitMatch = sqlQuery.match(/limit\s+(\d+)/i);
          if (limitMatch) {
            const limit = parseInt(limitMatch[1]);
            result = result.slice(0, limit);
          }
        }

        return result;
      }

      return data;
    } catch (error) {
      console.error("Error executing SQL:", error);
      return data;
    }
  };

  // Generate explanation
  const generateExplanation = (sqlQuery, results, question) => {
    const rowCount = results.length;
    const columnCount = results.length > 0 ? Object.keys(results[0]).length : 0;

    return `Based on your question "${question}", I generated the SQL query: ${sqlQuery}. 
    This query returned ${rowCount} rows with ${columnCount} columns. 
    The results show the data filtered and processed according to your requirements.`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setCsvData(results.data);
          console.log("CSV parsed successfully:", results.data.length, "rows");
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Error parsing CSV file. Please check the file format.");
        },
      });
    } else {
      alert("Please select a valid CSV file.");
    }
  };

  const handleAnalyze = async () => {
    if (!csvData || !userQuestion.trim()) {
      alert("Please upload a CSV file and enter a question.");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Detect schema
      const schemaInfo = detectCSVSchema(csvData);

      // Generate SQL
      const sqlQuery = generateSQL(schemaInfo, userQuestion);
      setGeneratedSQL(sqlQuery);

      // Execute SQL
      const results = executeSQLOnCSV(csvData, sqlQuery);

      // Generate explanation
      const explanationText = generateExplanation(
        sqlQuery,
        results,
        userQuestion
      );
      setExplanation(explanationText);

      // Set analysis results
      const analysisData = {
        sqlQuery,
        results,
        explanation: explanationText,
        rowCount: results.length,
        columnCount: results.length > 0 ? Object.keys(results[0]).length : 0,
        schemaInfo,
        userQuestion,
      };

      setAnalysisResults(analysisData);

      // Pass to parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Error during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadResults = () => {
    if (!analysisResults) return;

    const csv = Papa.unparse(analysisResults.results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis_results.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="csv-analyzer">
      <div className="upload-section">
        <h3>
          <FiUpload /> Upload CSV File
        </h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="upload-btn"
        >
          Choose CSV File
        </button>
        {csvData && (
          <p className="file-info">
            ✅ File loaded: {csvData.length} rows,{" "}
            {Object.keys(csvData[0]).length} columns
          </p>
        )}
      </div>

      <div className="question-section">
        <h3>
          <FiDatabase /> Ask a Question
        </h3>
        <textarea
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="Ask questions like: 'Show me all data', 'What are the top 10 records?', 'Filter where sales > 1000'"
          rows={3}
        />
        <button
          onClick={handleAnalyze}
          disabled={!csvData || !userQuestion.trim() || isAnalyzing}
          className="analyze-btn"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Data"}
        </button>
      </div>

      {analysisResults && (
        <div className="results-section">
          <h3>
            <FiBarChart2 /> Analysis Results
          </h3>

          <div className="sql-section">
            <h4>
              <FiCode /> Generated SQL Query
            </h4>
            <div className="sql-code">
              <code>{generatedSQL}</code>
            </div>
          </div>

          <div className="explanation-section">
            <h4>Explanation</h4>
            <p>{explanation}</p>
          </div>

          <div className="data-section">
            <h4>Results ({analysisResults.rowCount} rows)</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {analysisResults.results.length > 0 &&
                      Object.keys(analysisResults.results[0]).map(
                        (col, index) => <th key={index}>{col}</th>
                      )}
                  </tr>
                </thead>
                <tbody>
                  {analysisResults.results.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {analysisResults.results.length > 10 && (
                <p className="table-note">
                  Showing first 10 rows of {analysisResults.results.length}{" "}
                  total rows
                </p>
              )}
            </div>
          </div>

          <button onClick={downloadResults} className="download-btn">
            <FiDownload /> Download Results
          </button>
        </div>
      )}

      <style jsx>{`
        .csv-analyzer {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: "Inter", sans-serif;
        }

        .upload-section,
        .question-section,
        .results-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        h4 {
          color: #fff;
          margin: 16px 0 8px 0;
          font-size: 16px;
          font-weight: 500;
        }

        .upload-btn,
        .analyze-btn,
        .download-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upload-btn:hover,
        .analyze-btn:hover,
        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 14px;
          resize: vertical;
          margin-bottom: 16px;
        }

        textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .file-info {
          color: #4ade80;
          font-size: 14px;
          margin-top: 8px;
        }

        .sql-code {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
        }

        .sql-code code {
          color: #fbbf24;
          font-family: "Fira Code", monospace;
          font-size: 14px;
          line-height: 1.5;
        }

        .table-container {
          overflow-x: auto;
          margin: 16px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }

        th,
        td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
        }

        td {
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
        }

        .table-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          text-align: center;
          margin-top: 8px;
        }

        p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
};

export default CSVAnalyzer;
