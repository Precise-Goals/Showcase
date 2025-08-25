import React, { useState, useRef } from "react";
import { FiUpload, FiLink, FiDatabase, FiFileText } from "react-icons/fi";
import Papa from "papaparse";

const DyannInput = ({ onDataSourceSet }) => {
  const [activeTab, setActiveTab] = useState("csv");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // CSV Upload Handler
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setIsProcessing(false);
        onDataSourceSet(
          {
            type: "csv",
            data: results.data,
            fileName: file.name,
            rowCount: results.data.length,
            columnCount:
              results.data.length > 0 ? Object.keys(results.data[0]).length : 0,
          },
          "csv"
        );
      },
      error: (error) => {
        setIsProcessing(false);
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file. Please check the file format.");
      },
    });
  };

  // URL Input Handler
  const handleURLSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get("url");
    const urlType = formData.get("urlType");

    if (!url.trim()) {
      alert("Please enter a valid URL");
      return;
    }

    setIsProcessing(true);

    // Simulate URL processing
    setTimeout(() => {
      setIsProcessing(false);
      onDataSourceSet(
        {
          type: "url",
          url: url,
          urlType: urlType,
          data: null, // Will be fetched when needed
        },
        "url"
      );
    }, 2000);
  };

  // Database Connection Handler
  const handleDatabaseSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const connectionString = formData.get("connectionString");
    const dbType = formData.get("dbType");

    if (!connectionString.trim()) {
      alert("Please enter a valid connection string");
      return;
    }

    setIsProcessing(true);

    // Simulate database connection
    setTimeout(() => {
      setIsProcessing(false);
      onDataSourceSet(
        {
          type: "database",
          connectionString: connectionString,
          dbType: dbType,
          data: null, // Will be fetched when needed
        },
        "database"
      );
    }, 2000);
  };

  return (
    <div className="dyann-input-container">
      <div className="dyann-input-tabs">
        <button
          className={`dyann-tab ${activeTab === "csv" ? "active" : ""}`}
          onClick={() => setActiveTab("csv")}
        >
          <FiFileText /> CSV Upload
        </button>
        <button
          className={`dyann-tab ${activeTab === "url" ? "active" : ""}`}
          onClick={() => setActiveTab("url")}
        >
          <FiLink /> URL/Web Data
        </button>
        <button
          className={`dyann-tab ${activeTab === "database" ? "active" : ""}`}
          onClick={() => setActiveTab("database")}
        >
          <FiDatabase /> Database
        </button>
      </div>

      <div className="dyann-input-content">
        {activeTab === "csv" && (
          <div className="dyann-csv-upload">
            <div className="dyann-upload-area">
              <FiUpload className="dyann-upload-icon" />
              <h3>Upload CSV File</h3>
              <p>Drag and drop your CSV file here or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="dyann-upload-btn"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Choose CSV File"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "url" && (
          <div className="dyann-url-input">
            <form onSubmit={handleURLSubmit}>
              <div className="dyann-form-group">
                <label>URL Type</label>
                <select name="urlType" className="dyann-select">
                  <option value="webpage">Web Page</option>
                  <option value="gdocs">Google Docs</option>
                  <option value="gdrive">Google Drive</option>
                  <option value="pdf">PDF Document</option>
                </select>
              </div>

              <div className="dyann-form-group">
                <label>URL</label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://example.com/data.csv"
                  className="dyann-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="dyann-submit-btn"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Connect to URL"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "database" && (
          <div className="dyann-database-input">
            <form onSubmit={handleDatabaseSubmit}>
              <div className="dyann-form-group">
                <label>Database Type</label>
                <select name="dbType" className="dyann-select">
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sqlite">SQLite</option>
                  <option value="mongodb">MongoDB</option>
                </select>
              </div>

              <div className="dyann-form-group">
                <label>Connection String</label>
                <input
                  type="text"
                  name="connectionString"
                  placeholder="postgresql://user:pass@localhost:5432/db"
                  className="dyann-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="dyann-submit-btn"
                disabled={isProcessing}
              >
                {isProcessing ? "Connecting..." : "Connect to Database"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DyannInput;
