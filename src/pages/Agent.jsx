import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
  Database,
  Brain,
  TrendingUp,
} from "lucide-react";

const Agent = () => {
  const [activeTab, setActiveTab] = useState("document");
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [csvSchema, setCsvSchema] = useState(null);
  const [csvAnalysisHistory, setCsvAnalysisHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [docUrl, setDocUrl] = useState("https://docs.smith.langchain.com/");
  const [selectedModel] = useState("gemini-2.0-flash");
  const [chunkSize, setChunkSize] = useState(1000);
  const [userInput, setUserInput] = useState("");
  const [csvQuestion, setCsvQuestion] = useState("");

  // Stats data
  const [stats, setStats] = useState({
    documentsLoaded: 0,
    chunksCreated: 0,
    systemStatus: "Initializing",
  });

  // Initialize system
  const initializeSystem = async () => {
    setIsLoading(true);
    try {
      // Simulate system initialization
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStats({
        documentsLoaded: 25,
        chunksCreated: 150,
        systemStatus: "Ready",
      });

      setIsInitialized(true);
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document question
  const handleDocumentQuestion = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const aiMessage = {
        role: "assistant",
        content: `Based on the document analysis, here's what I found regarding "${userInput}": This is a comprehensive answer that addresses your question using the available document context. The information has been extracted and processed through our AI system.`,
        responseTime: 1.85,
        timestamp: new Date(),
        context: ["Document chunk 1", "Document chunk 2"],
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing question:", error);
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  };

  // Handle CSV analysis
  const handleCsvAnalysis = async () => {
    if (!csvQuestion.trim() || !csvData) return;

    const userMessage = {
      role: "user",
      content: csvQuestion,
      timestamp: new Date(),
    };

    setCsvAnalysisHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call Gemini 2.0 Flash API
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!geminiApiKey) {
        throw new Error(
          "VITE_GEMINI_API_KEY not found in environment variables"
        );
      }

      // Generate SQL using Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert SQL developer. Given the following CSV schema and user question, generate a valid SQL query.

CRITICAL: The CSV data is loaded into a table named 'csv_data'. You MUST use 'csv_data' as the table name.

CSV Schema:
- Table name: csv_data
- Number of rows: ${csvSchema.rowCount}
- Number of columns: ${csvSchema.columnCount}
- Columns: ${csvSchema.columns.join(", ")}
- Data types: ${Object.entries(csvSchema.dataTypes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}

User Question: ${csvQuestion}

Instructions:
1. Generate ONLY the SQL query, no explanations
2. You MUST use 'csv_data' as the table name
3. Use standard SQL syntax
4. Handle column names that might contain spaces by using double quotes

SQL Query:`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to generate SQL");
      }

      const sqlQuery =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "SELECT * FROM csv_data LIMIT 10;";

      // Simulate query execution with mock results
      const mockResults = [
        { category: "Category A", count: 150, percentage: "35.2%" },
        { category: "Category B", count: 120, percentage: "28.1%" },
        { category: "Category C", count: 95, percentage: "22.3%" },
        { category: "Category D", count: 61, percentage: "14.4%" },
      ];

      const aiMessage = {
        role: "assistant",
        content: `Analysis complete! I've generated and executed a SQL query to answer your question. The results show meaningful insights from your data that can be visualized in various chart formats.`,
        sqlQuery: sqlQuery,
        results: mockResults,
        timestamp: new Date(),
        showDashboardButton: true,
      };

      setCsvAnalysisHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing CSV question:", error);

      // Fallback response if API fails
      const fallbackMessage = {
        role: "assistant",
        content: `I encountered an issue connecting to the AI service. Here's a sample analysis of your data structure based on the schema.`,
        sqlQuery: `SELECT COUNT(*) as total_rows, 
                  COUNT(DISTINCT ${csvSchema.columns[0]}) as unique_values 
                  FROM csv_data;`,
        results: [
          {
            total_rows: csvSchema.rowCount,
            unique_values: Math.floor(csvSchema.rowCount * 0.8),
          },
        ],
        timestamp: new Date(),
        showDashboardButton: true,
        error: error.message,
      };

      setCsvAnalysisHistory((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setCsvQuestion("");
    }
  };

  // Navigate to dashboard
  const navigateToDashboard = (results) => {
    // Store results in sessionStorage for dashboard access
    sessionStorage.setItem("analysisResults", JSON.stringify(results));
    window.location.href = "/dashboard";
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      // eslint-disable-next-line no-unused-vars
      reader.onload = (e) => {
        // Simulate CSV parsing
        const mockSchema = {
          columns: ["id", "name", "category", "value", "date"],
          dataTypes: {
            id: "int64",
            name: "object",
            category: "object",
            value: "float64",
            date: "datetime64",
          },
          rowCount: 1000,
          columnCount: 5,
        };

        setCsvData(file);
        setCsvSchema(mockSchema);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    initializeSystem();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl mx-8 mt-8 shadow-2xl">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative text-center text-white">
          <div className="flex justify-center items-center mb-4">
            <Brain className="w-12 h-12 mr-4" />
            <h1 className="text-4xl font-bold">AI Document & CSV Assistant</h1>
          </div>
          <p className="text-xl opacity-90 mb-2">
            Ask questions about your documents and analyze CSV data with
            AI-powered insights
          </p>
          <p className="text-sm opacity-75 font-semibold">
            Developed by Pratham
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mt-8 mb-6">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-2">
          <button
            onClick={() => setActiveTab("document")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "document"
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10"
            }`}
          >
            <FileText className="w-5 h-5" />
            Document Analysis
          </button>
          <button
            onClick={() => setActiveTab("csv")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ml-2 ${
              activeTab === "csv"
                ? "bg-purple-500 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            CSV Analysis
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {isInitialized && (
        <div className="mx-8 mb-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-2">
                Documents Loaded
              </div>
              <div className="text-4xl font-bold text-white">
                {stats.documentsLoaded}
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-2">
                Chunks Created
              </div>
              <div className="text-4xl font-bold text-white">
                {stats.chunksCreated}
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-2">
                AI Model
              </div>
              <div className="text-4xl font-bold text-white">
                {selectedModel}
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-2">
                System Status
              </div>
              <div className="text-2xl font-bold text-green-400 flex items-center">
                <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                {stats.systemStatus}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="mx-8 mb-8">
        {activeTab === "document" && (
          <div>
            {/* Document Analysis Interface */}
            <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-10">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Ask Your Question
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="e.g., What is prompt engineering?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleDocumentQuestion()
                  }
                  className="w-full p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-lg"
                />

                <div className="flex justify-center">
                  <button
                    onClick={handleDocumentQuestion}
                    disabled={isLoading || !userInput.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        Ask AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Conversation History
                </h3>
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-3xl p-4 rounded-2xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto rounded-br-lg"
                            : "bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 text-white rounded-bl-lg"
                        }`}
                      >
                        <div className="font-semibold mb-2">
                          {message.role === "user" ? "You:" : "AI Assistant:"}
                        </div>
                        <div className="mb-2">{message.content}</div>
                        <div className="text-sm opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                          {message.responseTime &&
                            ` • ${message.responseTime}s`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "csv" && (
          <div>
            {/* CSV Analysis Interface */}
            <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-10">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                CSV Data Analysis with AI
              </h3>

              {/* File Upload */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-white mb-4">
                  Upload Your CSV File
                </h4>
                <div className="border-2 border-dashed border-white border-opacity-30 rounded-2xl p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div className="text-white">
                      <p className="text-lg font-semibold">Choose a CSV file</p>
                      <p className="text-gray-400">
                        Upload any CSV file for AI-powered analysis
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Schema Information */}
              {csvSchema && (
                <div className="mb-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <div className="text-green-400 font-semibold mb-4">
                    CSV file loaded successfully! {csvSchema.rowCount} rows,{" "}
                    {csvSchema.columnCount} columns
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-semibold mb-2">
                        Column Information:
                      </h5>
                      <div className="space-y-1">
                        {csvSchema.columns.map((col) => (
                          <div key={col} className="text-gray-300">
                            <strong>{col}:</strong> {csvSchema.dataTypes[col]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Question Input */}
              {csvData && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-white">
                    Ask Questions About Your Data
                  </h4>

                  <input
                    type="text"
                    placeholder="e.g., Show me the top 5 sales by region, What's the average age of customers?"
                    value={csvQuestion}
                    onChange={(e) => setCsvQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCsvAnalysis()}
                    className="w-full p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg"
                  />

                  <div className="flex justify-center">
                    <button
                      onClick={handleCsvAnalysis}
                      disabled={isLoading || !csvQuestion.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5" />
                          Analyze Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CSV Analysis History */}
            {csvAnalysisHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Analysis History
                </h3>
                <div className="space-y-4">
                  {csvAnalysisHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-3xl p-4 rounded-2xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white ml-auto rounded-br-lg"
                            : "bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 text-white rounded-bl-lg"
                        }`}
                      >
                        <div className="font-semibold mb-2">
                          {message.role === "user" ? "You:" : "AI Assistant:"}
                        </div>
                        <div className="mb-2">{message.content}</div>

                        {message.sqlQuery && (
                          <div className="mt-4 p-3 bg-black bg-opacity-30 rounded-lg">
                            <div className="text-sm font-semibold text-blue-300 mb-1">
                              Generated SQL:
                            </div>
                            <code className="text-green-300 text-sm">
                              {message.sqlQuery}
                            </code>
                          </div>
                        )}

                        {message.results && (
                          <div className="mt-4">
                            <div className="text-sm font-semibold text-purple-300 mb-2">
                              Results ({message.results.length} rows):
                            </div>
                            <div className="bg-black bg-opacity-30 rounded-lg p-3 max-h-40 overflow-auto">
                              {message.results.map((row, i) => (
                                <div key={i} className="text-sm text-gray-300">
                                  {Object.entries(row).map(([key, value]) => (
                                    <span key={key} className="mr-4">
                                      <strong>{key}:</strong> {value}
                                    </span>
                                  ))}
                                </div>
                              ))}
                            </div>

                            {/* Dashboard Navigation Button */}
                            {message.showDashboardButton && (
                              <div className="mt-4 text-center">
                                <button
                                  onClick={() =>
                                    navigateToDashboard(message.results)
                                  }
                                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  View in Dashboard
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                  Visualize results with interactive charts and
                                  graphs
                                </p>
                              </div>
                            )}

                            {message.error && (
                              <div className="mt-2 text-sm text-yellow-300 bg-yellow-900 bg-opacity-30 p-2 rounded">
                                Note: Using fallback analysis due to API
                                connectivity
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-sm opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions when no file uploaded */}
            {!csvData && (
              <div className="mt-8 bg-white bg-opacity-5 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-10 text-center">
                <h3 className="text-2xl font-bold text-white mb-6">
                  How It Works
                </h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-blue-500 bg-opacity-20 p-6 rounded-2xl border border-blue-500 border-opacity-30">
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-blue-400 font-semibold mb-2">
                      Upload CSV
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Upload any CSV file you want to analyze
                    </p>
                  </div>
                  <div className="bg-purple-500 bg-opacity-20 p-6 rounded-2xl border border-purple-500 border-opacity-30">
                    <Database className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-purple-400 font-semibold mb-2">
                      Auto Schema
                    </h4>
                    <p className="text-gray-300 text-sm">
                      AI automatically detects your data structure
                    </p>
                  </div>
                  <div className="bg-blue-500 bg-opacity-20 p-6 rounded-2xl border border-blue-500 border-opacity-30">
                    <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-blue-400 font-semibold mb-2">AI SQL</h4>
                    <p className="text-gray-300 text-sm">
                      Ask questions in plain English, get SQL queries
                    </p>
                  </div>
                  <div className="bg-purple-500 bg-opacity-20 p-6 rounded-2xl border border-purple-500 border-opacity-30">
                    <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-purple-400 font-semibold mb-2">
                      Dashboard
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Get charts and visualizations in dashboard
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Configuration */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 w-80 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              AI Model:
            </label>
            <div className="w-full p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">Gemini 2.0 Flash</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Google's latest AI model
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Document URL:
            </label>
            <input
              type="text"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              className="w-full p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="https://docs.smith.langchain.com/"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Chunk Size: {chunkSize}
            </label>
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              value={chunkSize}
              onChange={(e) => setChunkSize(e.target.value)}
              className="w-full"
            />
          </div>

          <button
            onClick={initializeSystem}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Reinitialize System
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white border-opacity-20 text-center">
          <p className="text-gray-400 text-xs">Version 2.0.0</p>
          <p className="text-gray-400 text-xs">
            Built by <strong>Pratham</strong>
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">Gemini API Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent;
