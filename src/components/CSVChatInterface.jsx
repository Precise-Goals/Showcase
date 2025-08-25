import React, { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiMessageSquare,
  FiFileText,
  FiDatabase,
} from "react-icons/fi";
import Papa from "papaparse";

const CSVChatInterface = ({ csvData, onAnalysisComplete }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (csvData) {
      setMessages([
        {
          id: 1,
          type: "bot",
          content: `I've loaded your CSV file with ${csvData.length} rows and ${
            Object.keys(csvData[0]).length
          } columns. What would you like to know about your data?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [csvData]);

  // CSV Schema Detection
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

  // Generate SQL using a simple rule-based approach
  const generateSQL = (schemaInfo, question) => {
    const lowerQuestion = question.toLowerCase();
    const columns = schemaInfo.columns;

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
      const numericColumns = columns.filter(
        (col) => schemaInfo.dataTypes[col] === "number"
      );
      if (numericColumns.length > 0) {
        sqlQuery += `SUM(${numericColumns[0]}) as total`;
      } else {
        sqlQuery += "*";
      }
    } else {
      sqlQuery += columns.slice(0, 3).join(", ");
    }

    sqlQuery += " FROM csv_data";

    if (lowerQuestion.includes("where") || lowerQuestion.includes("filter")) {
      const numericColumns = columns.filter(
        (col) => schemaInfo.dataTypes[col] === "number"
      );
      if (numericColumns.length > 0) {
        sqlQuery += ` WHERE ${numericColumns[0]} > 0`;
      }
    }

    if (lowerQuestion.includes("sort") || lowerQuestion.includes("order")) {
      const numericColumns = columns.filter(
        (col) => schemaInfo.dataTypes[col] === "number"
      );
      if (numericColumns.length > 0) {
        sqlQuery += ` ORDER BY ${numericColumns[0]} DESC`;
      }
    }

    if (lowerQuestion.includes("top") || lowerQuestion.includes("first")) {
      sqlQuery += " LIMIT 10";
    }

    return sqlQuery;
  };

  // Execute SQL-like operations on CSV data
  const executeSQLOnCSV = (data, sqlQuery) => {
    try {
      if (sqlQuery.toLowerCase().includes("select")) {
        let result = [...data];

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

    return `Based on your question "${question}", I generated the SQL query: ${sqlQuery}. This query returned ${rowCount} rows with ${columnCount} columns. The results show the data filtered and processed according to your requirements.`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setUploadedFile(file);
          setMessages([
            {
              id: 1,
              type: "bot",
              content: `I've loaded your CSV file "${file.name}" with ${
                results.data.length
              } rows and ${
                Object.keys(results.data[0]).length
              } columns. What would you like to know about your data?`,
              timestamp: new Date(),
            },
          ]);
          if (onAnalysisComplete) {
            onAnalysisComplete(results.data);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setMessages([
            {
              id: 1,
              type: "bot",
              content:
                "Sorry, I couldn't parse that CSV file. Please check the file format and try again.",
              timestamp: new Date(),
            },
          ]);
        },
      });
    } else {
      setMessages([
        {
          id: 1,
          type: "bot",
          content: "Please select a valid CSV file.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !csvData) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      try {
        const schemaInfo = detectCSVSchema(csvData);
        const sqlQuery = generateSQL(schemaInfo, inputMessage);
        const results = executeSQLOnCSV(csvData, sqlQuery);
        const explanation = generateExplanation(
          sqlQuery,
          results,
          inputMessage
        );

        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: explanation,
          sqlQuery,
          results: results.slice(0, 5), // Show first 5 results
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: "bot",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="csv-chat-interface">
      <div className="chat-header">
        <h3>
          <FiMessageSquare /> CSV Chat Assistant
        </h3>
        {!uploadedFile && (
          <div className="file-upload-section">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              id="csv-upload"
              style={{ display: "none" }}
            />
            <label htmlFor="csv-upload" className="upload-btn">
              <FiFileText /> Upload CSV
            </label>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.type === "user" ? "user" : "bot"}`}
          >
            <div className="message-content">
              <p>{message.content}</p>
              {message.sqlQuery && (
                <div className="sql-preview">
                  <h4>
                    <FiDatabase /> Generated SQL:
                  </h4>
                  <code>{message.sqlQuery}</code>
                </div>
              )}
              {message.results && message.results.length > 0 && (
                <div className="results-preview">
                  <h4>Sample Results:</h4>
                  <div className="mini-table">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(message.results[0]).map((col, index) => (
                            <th key={index}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.results.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.values(row).map((value, colIndex) => (
                              <td key={colIndex}>{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            uploadedFile
              ? "Ask me anything about your CSV data..."
              : "Upload a CSV file first to start chatting"
          }
          disabled={!uploadedFile}
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || !uploadedFile}
          className="send-btn"
        >
          <FiSend />
        </button>
      </div>

      <style jsx>{`
        .csv-chat-interface {
          display: flex;
          flex-direction: column;
          height: 600px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chat-header h3 {
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
        }

        .file-upload-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .upload-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
        }

        .message.bot {
          align-self: flex-start;
        }

        .message-content {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 15px;
          color: white;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .message-content p {
          margin: 0 0 10px 0;
          line-height: 1.5;
        }

        .sql-preview {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .sql-preview h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sql-preview code {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 8px 12px;
          font-family: "Fira Code", monospace;
          font-size: 12px;
          color: #fbbf24;
          display: block;
          overflow-x: auto;
        }

        .results-preview {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .results-preview h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .mini-table {
          overflow-x: auto;
          max-height: 200px;
          overflow-y: auto;
        }

        .mini-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .mini-table th,
        .mini-table td {
          padding: 6px 8px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mini-table th {
          background: rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }

        .message-timestamp {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 5px;
          align-self: flex-end;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 15px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chat-input {
          display: flex;
          gap: 10px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chat-input textarea {
          flex: 1;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          resize: none;
          outline: none;
        }

        .chat-input textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .chat-input textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(74, 222, 128, 0.3);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CSVChatInterface;
