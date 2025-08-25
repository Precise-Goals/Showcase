# AI Data Analysis System Setup

This project integrates the functionality from `app.py` into a React application with a Node.js backend, using Gemini 2.0 Flash for AI-powered CSV analysis.

## Features

- **Dyann Page**: Simple upload interface with minimal UI
- **Dashboard Page**: Comprehensive display of tabular data and SQL queries
- **Gemini 2.0 Flash**: Single LLM for all AI operations
- **Real-time Analysis**: Upload CSV files and ask questions in plain English

## Setup Instructions

### 1. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the server directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Frontend Setup

In the root directory, install dependencies:

```bash
npm install
```

### 3. Running the Application

Start the backend server:

```bash
cd server
npm start
```

In a new terminal, start the frontend:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Dyann Page

1. Click "Start Analysis" to access the upload interface
2. Upload a CSV file
3. Ask a question about your data in plain English
4. Click "Analyze with AI" to get results

### Dashboard Page

1. View comprehensive analysis results
2. See the generated SQL query
3. Read AI explanations
4. Download results as CSV

## API Endpoints

- `POST /api/upload-csv` - Upload and process CSV files
- `POST /api/analyze-csv` - Analyze CSV data with AI
- `POST /api/analyze-document` - Analyze document text
- `GET /api/health` - Health check

## File Structure

```
├── src/
│   ├── components/
│   │   └── FileUpload.jsx          # Upload component for Dyann
│   ├── pages/
│   │   ├── Dyann.jsx              # Upload interface
│   │   └── Dashboard.jsx          # Results display
│   └── ...
├── server/
│   ├── index.js                   # Express server with Gemini integration
│   ├── package.json               # Backend dependencies
│   └── .env                       # Environment variables
└── ...
```

## Dependencies

### Backend

- `@google/generative-ai` - Gemini 2.0 Flash integration
- `express` - Web server
- `multer` - File upload handling
- `csv-parser` - CSV processing
- `cors` - Cross-origin resource sharing

### Frontend

- `react` - UI framework
- `react-icons` - Icons
- `@splinetool/react-spline` - 3D graphics

## Key Features

1. **Single LLM**: Uses only Gemini 2.0 Flash for all AI operations
2. **Minimal UI**: Clean, focused upload interface in Dyann
3. **Comprehensive Dashboard**: Detailed results with SQL queries
4. **Real-time Processing**: Instant analysis and results
5. **Data Persistence**: Results stored in localStorage for dashboard access

## Troubleshooting

1. **API Key Issues**: Ensure your Gemini API key is valid and has sufficient quota
2. **CORS Errors**: Make sure the backend server is running on port 5000
3. **File Upload Issues**: Check that the uploaded file is a valid CSV
4. **Analysis Errors**: Verify the CSV data structure and question format

## Security Notes

- Store API keys in environment variables
- Validate file uploads on both frontend and backend
- Implement proper error handling
- Consider rate limiting for production use
