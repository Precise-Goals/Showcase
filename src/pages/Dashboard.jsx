import React, { useState, useEffect } from "react";
import {
  FiDatabase,
  FiCode,
  FiBarChart2,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import Papa from "papaparse";

const Dashboard = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState("results");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load analysis data from localStorage
    const storedData = localStorage.getItem("analysisData");
    if (storedData) {
      try {
        setAnalysisData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing stored analysis data:", error);
      }
    }
  }, []);

  const downloadResults = () => {
    if (!analysisData) return;

    const csv = Papa.unparse(analysisData.results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis_results.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    setIsLoading(true);
    // Reload from localStorage
    const storedData = localStorage.getItem("analysisData");
    if (storedData) {
      try {
        setAnalysisData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing stored analysis data:", error);
      }
    }
    setTimeout(() => setIsLoading(false), 500);
  };

  if (!analysisData) {
    return (
      <div className="dashboard-container">
        <div className="no-data">
          <FiDatabase size={64} />
          <h2>No Analysis Data Available</h2>
          <p>Please go to the Dyann page and analyze a CSV file first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <FiBarChart2 /> Analysis Dashboard
          </h1>
          <div className="header-actions">
            <button
              onClick={refreshData}
              className="refresh-btn"
              disabled={isLoading}
            >
              <FiRefreshCw className={isLoading ? "spinning" : ""} />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button onClick={downloadResults} className="download-btn">
              <FiDownload /> Download Results
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Rows</h3>
          <p className="stat-value">{analysisData.rowCount}</p>
        </div>
        <div className="stat-card">
          <h3>Total Columns</h3>
          <p className="stat-value">{analysisData.columnCount}</p>
        </div>
        <div className="stat-card">
          <h3>Question Asked</h3>
          <p className="stat-value">{analysisData.userQuestion}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "results" ? "active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            <FiBarChart2 /> Results
          </button>
          <button
            className={`tab ${activeTab === "sql" ? "active" : ""}`}
            onClick={() => setActiveTab("sql")}
          >
            <FiCode /> SQL Query
          </button>
          <button
            className={`tab ${activeTab === "explanation" ? "active" : ""}`}
            onClick={() => setActiveTab("explanation")}
          >
            <FiDatabase /> Explanation
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "results" && (
            <div className="results-tab">
              <h3>Analysis Results</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {analysisData.results.length > 0 &&
                        Object.keys(analysisData.results[0]).map(
                          (col, index) => <th key={index}>{col}</th>
                        )}
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.results.slice(0, 20).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analysisData.results.length > 20 && (
                  <p className="table-note">
                    Showing first 20 rows of {analysisData.results.length} total
                    rows
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "sql" && (
            <div className="sql-tab">
              <h3>Generated SQL Query</h3>
              <div className="sql-code">
                <code>{analysisData.sqlQuery}</code>
              </div>
              <div className="sql-info">
                <h4>Query Details:</h4>
                <ul>
                  <li>
                    <strong>Query Type:</strong> SELECT
                  </li>
                  <li>
                    <strong>Table:</strong> csv_data
                  </li>
                  <li>
                    <strong>Generated for:</strong> {analysisData.userQuestion}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "explanation" && (
            <div className="explanation-tab">
              <h3>Analysis Explanation</h3>
              <div className="explanation-content">
                <p>{analysisData.explanation}</p>
              </div>
              <div className="schema-info">
                <h4>Data Schema:</h4>
                <div className="schema-grid">
                  {analysisData.schemaInfo &&
                    analysisData.schemaInfo.columns.map((col, index) => (
                      <div key={index} className="schema-item">
                        <strong>{col}</strong>
                        <span className="data-type">
                          {analysisData.schemaInfo.dataTypes[col]}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: "Inter", sans-serif;
        }

        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          color: white;
          text-align: center;
        }

        .no-data h2 {
          margin: 20px 0 10px 0;
          font-size: 1.8rem;
        }

        .no-data p {
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-content h1 {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .refresh-btn,
        .download-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refresh-btn:hover,
        .download-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
        }

        .stat-card h3 {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          word-break: break-word;
        }

        .tabs-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          overflow: hidden;
        }

        .tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 16px 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 2px solid transparent;
        }

        .tab:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .tab.active {
          color: white;
          border-bottom-color: #4ade80;
          background: rgba(255, 255, 255, 0.1);
        }

        .tab-content {
          padding: 24px;
        }

        .tab-content h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 20px 0;
        }

        .table-container {
          overflow-x: auto;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
          background: rgba(255, 255, 255, 0.1);
          color: white;
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
          padding: 12px;
          margin: 0;
        }

        .sql-code {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .sql-code code {
          color: #fbbf24;
          font-family: "Fira Code", monospace;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .sql-info h4 {
          color: white;
          font-size: 1.1rem;
          margin: 0 0 12px 0;
        }

        .sql-info ul {
          color: rgba(255, 255, 255, 0.8);
          padding-left: 20px;
        }

        .sql-info li {
          margin-bottom: 8px;
        }

        .explanation-content {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .explanation-content p {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin: 0;
        }

        .schema-info h4 {
          color: white;
          font-size: 1.1rem;
          margin: 0 0 12px 0;
        }

        .schema-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .schema-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .schema-item strong {
          color: white;
          font-size: 14px;
        }

        .data-type {
          color: #4ade80;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-content h1 {
            font-size: 1.5rem;
          }

          .tabs {
            flex-direction: column;
          }

          .tab {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            border-right: none;
          }

          .schema-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
