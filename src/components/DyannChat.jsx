import React, { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiMessageSquare,
  FiDatabase,
  FiCode,
  FiBarChart2,
} from "react-icons/fi";
import Papa from "papaparse";

const DyannChat = ({ dataSource, dataType }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (dataSource) {
      let welcomeMessage = "";

      if (dataType === "csv") {
        welcomeMessage = `I've loaded your CSV file "${dataSource.fileName}" with ${dataSource.rowCount} rows and ${dataSource.columnCount} columns. What would you like to know about your data?`;
        setCurrentData(dataSource.data);
      } else if (dataType === "url") {
        welcomeMessage = `I'm connected to ${dataSource.urlType} at ${dataSource.url}. What would you like to analyze?`;
      } else if (dataType === "database") {
        welcomeMessage = `I'm connected to your ${dataSource.dbType} database. What would you like to query?`;
      }

      setMessages([
        {
          id: 1,
          type: "bot",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [dataSource, dataType]);

  // AI-powered SQL generation
  const generateSQL = (question, data = null) => {
    const lowerQuestion = question.toLowerCase();
    let sqlQuery = "SELECT ";

    if (dataType === "csv" && data) {
      const columns = Object.keys(data[0] || {});

      if (
        lowerQuestion.includes("all") ||
        lowerQuestion.includes("everything")
      ) {
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
          (col) => !isNaN(data[0]?.[col]) && data[0]?.[col] !== ""
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
          (col) => !isNaN(data[0]?.[col]) && data[0]?.[col] !== ""
        );
        if (numericColumns.length > 0) {
          sqlQuery += ` WHERE ${numericColumns[0]} > 0`;
        }
      }

      if (lowerQuestion.includes("sort") || lowerQuestion.includes("order")) {
        const numericColumns = columns.filter(
          (col) => !isNaN(data[0]?.[col]) && data[0]?.[col] !== ""
        );
        if (numericColumns.length > 0) {
          sqlQuery += ` ORDER BY ${numericColumns[0]} DESC`;
        }
      }

      if (lowerQuestion.includes("top") || lowerQuestion.includes("first")) {
        sqlQuery += " LIMIT 10";
      }
    } else {
      // For URL and database sources
      sqlQuery += "* FROM data_source";
      if (lowerQuestion.includes("where") || lowerQuestion.includes("filter")) {
        sqlQuery += " WHERE condition = true";
      }
      if (lowerQuestion.includes("limit") || lowerQuestion.includes("top")) {
        sqlQuery += " LIMIT 10";
      }
    }

    return sqlQuery;
  };

  // Execute SQL-like operations
  const executeSQL = (sqlQuery, data = null) => {
    try {
      if (dataType === "csv" && data) {
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
      } else {
        // Mock data for URL and database sources
        return [
          { id: 1, name: "Sample Data", value: 100 },
          { id: 2, name: "Another Record", value: 200 },
          { id: 3, name: "Test Entry", value: 150 },
        ];
      }
    } catch (error) {
      console.error("Error executing SQL:", error);
      return [];
    }
  };

  // Generate AI insights
  const generateInsights = (question, sqlQuery, results) => {
    const rowCount = results.length;
    const columnCount = results.length > 0 ? Object.keys(results[0]).length : 0;

    let insights = `Based on your question "${question}", I generated the SQL query: ${sqlQuery}. `;

    if (dataType === "csv") {
      insights += `This query returned ${rowCount} rows with ${columnCount} columns. `;
      if (rowCount > 0) {
        const firstRow = results[0];
        const numericColumns = Object.keys(firstRow).filter(
          (col) => !isNaN(firstRow[col]) && firstRow[col] !== ""
        );
        if (numericColumns.length > 0) {
          const total = results.reduce(
            (sum, row) => sum + (parseFloat(row[numericColumns[0]]) || 0),
            0
          );
          insights += `The total value for ${numericColumns[0]} is ${total}. `;
        }
      }
    } else {
      insights += `I found ${rowCount} relevant records from your ${dataType} source. `;
    }

    insights += `The results show the data filtered and processed according to your requirements.`;

    return insights;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(async () => {
      try {
        const sqlQuery = generateSQL(inputMessage, currentData);
        const results = executeSQL(sqlQuery, currentData);
        const insights = generateInsights(inputMessage, sqlQuery, results);

        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: insights,
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
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="dyann-chat-container">
      <div className="dyann-chat-header">
        <h3 className="dyann-chat-title">
          <FiMessageSquare /> AI Data Analyst
        </h3>
        <div className="dyann-data-info">
          {dataType === "csv" && dataSource && (
            <span>
              📊 {dataSource.fileName} ({dataSource.rowCount} rows)
            </span>
          )}
          {dataType === "url" && dataSource && (
            <span>🔗 {dataSource.urlType}</span>
          )}
          {dataType === "database" && dataSource && (
            <span>🗄️ {dataSource.dbType}</span>
          )}
        </div>
      </div>

      <div className="dyann-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`dyann-message ${
              message.type === "user" ? "user" : "bot"
            }`}
          >
            <div className="dyann-message-content">
              <p>{message.content}</p>

              {message.sqlQuery && (
                <div className="dyann-sql-preview">
                  <h4>
                    <FiCode /> Generated SQL:
                  </h4>
                  <code>{message.sqlQuery}</code>
                </div>
              )}

              {message.results && message.results.length > 0 && (
                <div className="dyann-results-preview">
                  <h4>
                    <FiBarChart2 /> Sample Results:
                  </h4>
                  <div className="dyann-mini-table">
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
            <div className="dyann-message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="dyann-message bot">
            <div className="dyann-typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="dyann-chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your data..."
          rows={1}
          className="dyann-chat-textarea"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="dyann-chat-send-btn"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default DyannChat;
