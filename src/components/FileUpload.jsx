import React, { useState } from "react";
import { FiUpload, FiFile, FiCheck } from "react-icons/fi";

const FileUpload = ({ onFileUpload, onAnalysisComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append("csvFile", file);

      const response = await fetch("http://localhost:5000/api/upload-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Parse CSV data for analysis
        const csvText = await file.text();
        const lines = csvText.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const data = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });
            return row;
          });

        setCsvData(data);
        onFileUpload && onFileUpload(result.data);
      } else {
        alert("Error uploading file: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file. Please make sure the server is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!csvData || !userQuestion.trim()) {
      alert("Please upload a CSV file and enter a question");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("http://localhost:5000/api/analyze-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData,
          userQuestion: userQuestion.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResults(result.data);
        onAnalysisComplete && onAnalysisComplete(result.data);
      } else {
        alert("Error analyzing data: " + result.error);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Error analyzing data. Please make sure the server is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className="file-upload-container"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <h2
        style={{
          color: "#ffffff",
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "1.8rem",
          fontWeight: "700",
        }}
      >
        📊 AI Data Analysis
      </h2>

      {/* File Upload Section */}
      <div style={{ marginBottom: "2rem" }}>
        <label
          htmlFor="file-upload"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            border: "2px dashed rgba(255, 255, 255, 0.3)",
            borderRadius: "15px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "rgba(102, 126, 234, 0.5)";
            e.target.style.backgroundColor = "rgba(102, 126, 234, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
          }}
        >
          {isUploading ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "3px solid #667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              ></div>
              <p style={{ color: "#a8b2d1", margin: 0 }}>Uploading...</p>
            </div>
          ) : uploadedFile ? (
            <div style={{ textAlign: "center" }}>
              <FiCheck
                style={{
                  fontSize: "2rem",
                  color: "#4caf50",
                  marginBottom: "0.5rem",
                }}
              />
              <p
                style={{
                  color: "#ffffff",
                  margin: "0.5rem 0",
                  fontWeight: "600",
                }}
              >
                {uploadedFile.name}
              </p>
              <p style={{ color: "#a8b2d1", margin: 0, fontSize: "0.9rem" }}>
                File uploaded successfully
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <FiUpload
                style={{
                  fontSize: "2rem",
                  color: "#667eea",
                  marginBottom: "0.5rem",
                }}
              />
              <p
                style={{
                  color: "#ffffff",
                  margin: "0.5rem 0",
                  fontWeight: "600",
                }}
              >
                Upload CSV File
              </p>
              <p style={{ color: "#a8b2d1", margin: 0, fontSize: "0.9rem" }}>
                Click to browse or drag and drop
              </p>
            </div>
          )}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Question Input */}
      {csvData && (
        <div style={{ marginBottom: "2rem" }}>
          <label
            style={{
              display: "block",
              color: "#ffffff",
              marginBottom: "0.5rem",
              fontWeight: "600",
            }}
          >
            Ask a question about your data:
          </label>
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="e.g., Show me the top 5 sales by region, What's the average age of customers?"
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              fontSize: "1rem",
              outline: "none",
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isAnalyzing) {
                handleAnalyze();
              }
            }}
          />
        </div>
      )}

      {/* Analyze Button */}
      {csvData && userQuestion.trim() && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "50px",
            border: "none",
            background: isAnalyzing
              ? "rgba(255, 255, 255, 0.1)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#ffffff",
            fontSize: "1.1rem",
            fontWeight: "700",
            cursor: isAnalyzing ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
          onMouseEnter={(e) => {
            if (!isAnalyzing) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 20px rgba(102, 126, 234, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isAnalyzing) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }
          }}
        >
          {isAnalyzing ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "2px solid #ffffff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              Analyzing...
            </div>
          ) : (
            "🚀 Analyze with AI"
          )}
        </button>
      )}

      {/* Results Preview */}
      {analysisResults && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "15px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h3 style={{ color: "#ffffff", marginBottom: "1rem" }}>
            📊 Analysis Complete
          </h3>
          <p style={{ color: "#a8b2d1", marginBottom: "1rem" }}>
            {analysisResults.explanation}
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                backgroundColor: "rgba(102, 126, 234, 0.2)",
                color: "#667eea",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              {analysisResults.rowCount} rows
            </span>
            <span
              style={{
                backgroundColor: "rgba(118, 75, 162, 0.2)",
                color: "#764ba2",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              {analysisResults.columnCount} columns
            </span>
          </div>
          <p style={{ color: "#a8b2d1", fontSize: "0.9rem", margin: 0 }}>
            View detailed results in the Dashboard
          </p>
        </div>
      )}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default FileUpload;
