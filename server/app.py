import streamlit as st
import os
import pandas as pd
import duckdb
from langchain_groq import ChatGroq
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
import time
from datetime import datetime
import json

from dotenv import load_dotenv
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="AI Document & CSV Assistant",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern UI
st.markdown("""
<style>
    /* Global styles */
    .main {
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    }
    
    .sidebar {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    }
    
    /* Main header */
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 3rem 2rem;
        border-radius: 25px;
        margin-bottom: 2.5rem;
        text-align: center;
        color: white;
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        position: relative;
        overflow: hidden;
    }
    
    .main-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
    }
    
    .main-header h1 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1rem;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .main-header p {
        font-size: 1.2rem;
        opacity: 0.95;
        margin-bottom: 0.5rem;
    }
    
    .main-header .developer {
        font-size: 1rem;
        opacity: 0.9;
        margin-top: 1rem;
        font-weight: 600;
    }
    
    /* Stats cards */
    .stats-container {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        padding: 2rem;
        margin-bottom: 2rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stats-card {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        padding: 2rem 1.5rem;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        margin: 0.5rem;
        text-align: center;
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s ease;
    }
    
    .stats-card:hover::before {
        left: 100%;
    }
    
    .stats-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        border-color: rgba(102, 126, 234, 0.5);
    }
    
    .stats-card h4 {
        color: #a8b2d1;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .stats-card h2 {
        color: #ffffff;
        font-size: 2.5rem;
        margin: 0;
        font-weight: 800;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    /* Sidebar styling */
    .sidebar-section {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        padding: 2rem;
        border-radius: 20px;
        margin: 1.5rem 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        color: white;
    }
    
    .sidebar-section h3 {
        color: #ffffff;
        margin-bottom: 1rem;
        font-weight: 700;
        font-size: 1.3rem;
    }
    
    .sidebar-section p {
        color: #a8b2d1;
        margin: 0.5rem 0;
        font-size: 0.95rem;
    }
    
    /* Input container */
    .input-container {
        background: rgba(255, 255, 255, 0.05);
        padding: 2.5rem;
        border-radius: 25px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin: 2rem 0;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    /* Chat messages */
    .user-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 25px 25px 25px 8px;
        margin: 1.5rem 0;
        max-width: 70%;
        margin-left: auto;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        position: relative;
    }
    
    .user-message::after {
        content: '';
        position: absolute;
        right: -10px;
        top: 20px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-left-color: #764ba2;
    }
    
    .ai-message {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        padding: 1.5rem;
        border-radius: 25px 25px 8px 25px;
        margin: 1.5rem 0;
        max-width: 70%;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        position: relative;
    }
    
    .ai-message::before {
        content: '';
        position: absolute;
        left: -10px;
        top: 20px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-right-color: rgba(255, 255, 255, 0.1);
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 1rem 3rem;
        font-weight: 700;
        font-size: 1.1rem;
        transition: all 0.4s ease;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .stButton > button:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
    }
    
    /* Document chunks */
    .document-chunk {
        background: rgba(255, 255, 255, 0.05);
        padding: 1.5rem;
        border-radius: 15px;
        margin: 1rem 0;
        border-left: 5px solid #667eea;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Form elements */
    .stSelectbox > div > div {
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
    }
    
    .stTextInput > div > div > input {
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        color: white;
        backdrop-filter: blur(10px);
    }
    
    .stSlider > div > div > div > div {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }
    
    /* Section headers */
    .section-header {
        color: #ffffff;
        font-size: 1.8rem;
        font-weight: 700;
        margin: 2rem 0 1rem 0;
        text-align: center;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    /* Footer */
    .footer {
        background: rgba(255, 255, 255, 0.05);
        padding: 2rem;
        border-radius: 20px;
        margin-top: 3rem;
        text-align: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .footer p {
        color: #a8b2d1;
        margin: 0.5rem 0;
    }
    
    .footer .developer {
        color: #ffffff;
        font-weight: 700;
        font-size: 1.1rem;
    }
    
    /* Professional response styling */
    .response-container {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1.5rem 0;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .response-header {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .response-header h3 {
        color: #ffffff;
        margin: 0;
        font-weight: 600;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .response-header .icon {
        font-size: 1.4rem;
        opacity: 0.8;
    }
    
    .response-content {
        color: #e8e8e8;
        line-height: 1.6;
        font-size: 0.95rem;
    }
    
    .response-content p {
        margin: 0.8rem 0;
    }
    
    .response-content strong {
        color: #ffffff;
        font-weight: 600;
    }
    
    .highlighted-number {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.9rem;
        display: inline-block;
        margin: 0 0.2rem;
    }
    
    .highlighted-term {
        background: rgba(102, 126, 234, 0.2);
        color: #a8b2d1;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-weight: 600;
        border: 1px solid rgba(102, 126, 234, 0.3);
    }
    
    .insight-box {
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%);
        border-left: 3px solid #4caf50;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
    }
    
    .insight-box h4 {
        color: #4caf50;
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
    }
    
    .metric-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }
    
    .metric-card .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 0.5rem;
    }
    
    .metric-card .metric-label {
        color: #a8b2d1;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Single word answer styling */
    .single-word-container {
        text-align: center;
        padding: 2rem;
        margin: 2rem 0;
    }
    
    .single-word-answer {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1.5rem 3rem;
        border-radius: 50px;
        font-size: 2rem;
        font-weight: 700;
        display: inline-block;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
</style>
""", unsafe_allow_html=True)

# Simple wrapper to make SentenceTransformer compatible with FAISS
class SentenceTransformerWrapper:
    def __init__(self, model_name):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(model_name)
    
    def __call__(self, texts):
        # Make the wrapper callable like a function
        if isinstance(texts, str):
            return self.embed_query(texts)
        else:
            return self.embed_documents(texts)
    
    def embed_documents(self, texts):
        embeddings = self.model.encode(texts)
        return embeddings.tolist()
    
    def embed_query(self, text):
        embedding = self.model.encode([text])
        return embedding[0].tolist()

# CSV Analysis Functions
def detect_csv_schema(df):
    """Detect and return CSV schema information"""
    schema_info = {
        "columns": [],
        "data_types": {},
        "sample_values": {},
        "row_count": len(df),
        "column_count": len(df.columns)
    }
    
    for col in df.columns:
        # Get data type
        dtype = str(df[col].dtype)
        
        # Get sample values (first 3 non-null values)
        sample_vals = df[col].dropna().head(3).tolist()
        
        schema_info["columns"].append(col)
        schema_info["data_types"][col] = dtype
        schema_info["sample_values"][col] = sample_vals
    
    return schema_info

def generate_sql_with_llm(schema_info, user_question, groq_api_key, model_name):
    """Generate SQL query using LLM based on schema and user question"""
    try:
        llm = ChatGroq(
            groq_api_key=groq_api_key,
            model_name=model_name
        )
        
        # Create a detailed prompt for SQL generation
        prompt = ChatPromptTemplate.from_template("""
        You are an expert SQL developer. Given the following CSV schema and user question, generate a valid SQL query.
        
        CRITICAL: The CSV data is loaded into a DuckDB table named 'csv_data'. You MUST use 'csv_data' as the table name.
        
        CSV Schema:
        - Table name: csv_data
        - Number of rows: {row_count}
        - Number of columns: {column_count}
        - Columns: {columns}
        - Data types: {data_types}
        - Sample values: {sample_values}
        
        User Question: {user_question}
        
        Instructions:
        1. Generate ONLY the SQL query, no explanations
        2. You MUST use 'csv_data' as the table name - this is the actual table in DuckDB
        3. Use standard SQL syntax compatible with DuckDB
        4. Handle column names that might contain spaces by using double quotes
        5. If the question is unclear, ask for clarification
        6. Use appropriate SQL functions for the analysis requested
        7. NEVER use placeholder table names like 'your_table', 'data', 'table', etc.
        8. NEVER use 'csv_data_data' or any variation - ONLY 'csv_data'
        
        Correct examples:
        - SELECT * FROM csv_data LIMIT 10;
        - SELECT column_name FROM csv_data WHERE condition;
        - SELECT COUNT(*) FROM csv_data;
        
        Remember: The table name is exactly 'csv_data' - nothing more, nothing less.
        
        SQL Query:
        """)
        
        response = llm.invoke(prompt.format(
            row_count=schema_info["row_count"],
            column_count=schema_info["column_count"],
            columns=schema_info["columns"],
            data_types=schema_info["data_types"],
            sample_values=schema_info["sample_values"],
            user_question=user_question
        ))
        
        # Extract SQL query from response
        sql_query = response.content.strip()
        
        # Clean up the SQL query (remove markdown formatting if present)
        if sql_query.startswith("```sql"):
            sql_query = sql_query.split("```sql")[1]
        if sql_query.endswith("```"):
            sql_query = sql_query.rsplit("```", 1)[0]
        
        # Ensure the table name is correct
        sql_query = sql_query.strip()
        
        # Debug: Show original SQL query
        print(f"Original SQL from LLM: {sql_query}")
        
        # Replace common incorrect table names with 'csv_data'
        incorrect_table_names = ['your_table', 'data', 'table', 'csv', 'dataset', 'the_table', 'csv_data_data', 'csv_data_csv', 'csv_csv_data']
        for incorrect_name in incorrect_table_names:
            sql_query = sql_query.replace(f'FROM {incorrect_name}', 'FROM csv_data')
            sql_query = sql_query.replace(f'from {incorrect_name}', 'FROM csv_data')
            sql_query = sql_query.replace(f'JOIN {incorrect_name}', 'JOIN csv_data')
            sql_query = sql_query.replace(f'join {incorrect_name}', 'JOIN csv_data')
            sql_query = sql_query.replace(f'UPDATE {incorrect_name}', 'UPDATE csv_data')
            sql_query = sql_query.replace(f'DELETE FROM {incorrect_name}', 'DELETE FROM csv_data')
        
        # Additional safety check for any table name that's not 'csv_data'
        import re
        # Find all FROM/JOIN clauses and ensure they use 'csv_data'
        sql_query = re.sub(r'FROM\s+(\w+)', 'FROM csv_data', sql_query, flags=re.IGNORECASE)
        sql_query = re.sub(r'JOIN\s+(\w+)', 'JOIN csv_data', sql_query, flags=re.IGNORECASE)
        sql_query = re.sub(r'UPDATE\s+(\w+)', 'UPDATE csv_data', sql_query, flags=re.IGNORECASE)
        sql_query = re.sub(r'DELETE\s+FROM\s+(\w+)', 'DELETE FROM csv_data', sql_query, flags=re.IGNORECASE)
        
        # Debug: Show final SQL query
        print(f"Final SQL after fixes: {sql_query}")
        
        return sql_query
        
    except Exception as e:
        st.error(f"Error generating SQL: {str(e)}")
        return None

def execute_sql_on_csv(df, sql_query):
    """Execute SQL query on CSV data using DuckDB"""
    try:
        # Create a DuckDB connection
        con = duckdb.connect(database=':memory:')
        
        # Register the DataFrame as a table
        con.register('csv_data', df)
        
        # Execute the query
        result = con.execute(sql_query)
        
        # Fetch results
        if result.description:  # SELECT query
            columns = [desc[0] for desc in result.description]
            data = result.fetchall()
            result_df = pd.DataFrame(data, columns=columns)
        else:  # Non-SELECT query (INSERT, UPDATE, DELETE)
            result_df = pd.DataFrame({"message": ["Query executed successfully"]})
        
        con.close()
        return result_df, None
        
    except Exception as e:
        return None, str(e)

def explain_results(sql_query, results_df, user_question):
    """Generate explanation of results using LLM"""
    try:
        llm = ChatGroq(
            groq_api_key=os.environ['GROQ_API_KEY'],
            model_name="llama3-8b-8192"  # Use a smaller model for explanations
        )
        
        # Create results summary
        results_summary = f"""
        Query: {sql_query}
        Results: {len(results_df)} rows returned
        Columns: {list(results_df.columns)}
        Sample data: {results_df.head(3).to_dict()}
        """
        
        prompt = ChatPromptTemplate.from_template("""
        You are a data analyst. Explain the results of this SQL query in simple terms.
        
        User Question: {user_question}
        SQL Query: {sql_query}
        Results Summary: {results_summary}
        
        Please provide a brief, clear explanation of:
        1. What the query does
        2. What the results mean
        3. Any insights from the data
        
        Keep it concise and easy to understand.
        """)
        
        response = llm.invoke(prompt.format(
            user_question=user_question,
            sql_query=sql_query,
            results_summary=results_summary
        ))
        
        return response.content.strip()
        
    except Exception as e:
        return f"Unable to generate explanation: {str(e)}"

def enhance_response_with_highlighting(response_text, response_type="document"):
    """Add highlighting and formatting to AI responses"""
    
    # Safety check: ensure response_text is clean and doesn't contain HTML
    if not response_text or not isinstance(response_text, str):
        return "No response content available."
    
    # Remove any potential HTML tags from the response text to prevent conflicts
    import re
    clean_text = re.sub(r'<[^>]+>', '', response_text)
    clean_text = clean_text.strip()
    
    # Check if response is a single word or very short
    words = clean_text.split()
    is_single_word = len(words) <= 3
    
    if is_single_word:
        # For single word/short answers, use professional single word styling
        if response_type == "csv":
            enhanced_response = f"""
            <div class="response-container">
                <div class="response-header">
                    <h3><span class="icon">📊</span>Analysis Summary</h3>
                </div>
                <div class="single-word-container">
                    <div class="single-word-answer">🎯 {clean_text}</div>
                </div>
                <div class="insight-box">
                    <h4><span class="icon">💡</span>Key Insight</h4>
                    <p>This is the direct answer to your question.</p>
                </div>
            </div>
            """
        else:
            enhanced_response = f"""
            <div class="response-container">
                <div class="response-header">
                    <h3><span class="icon">🔍</span>Answer</h3>
                </div>
                <div class="single-word-container">
                    <div class="single-word-answer">🎯 {clean_text}</div>
                </div>
                <div class="insight-box">
                    <h4><span class="icon">📚</span>Source</h4>
                    <p>This information was extracted from your uploaded documents.</p>
                </div>
            </div>
            """
    else:
        # For longer responses, use professional structured layout
        if response_type == "csv":
            enhanced_response = f"""
            <div class="response-container">
                <div class="response-header">
                    <h3><span class="icon">📊</span>Analysis Summary</h3>
                </div>
                <div class="response-content">
                    {clean_text}
                </div>
                <div class="insight-box">
                    <h4><span class="icon">💡</span>Key Insight</h4>
                    <p>The query successfully analyzed your data and returned meaningful results.</p>
                </div>
            </div>
            """
        else:
            enhanced_response = f"""
            <div class="response-container">
                <div class="response-header">
                    <h3><span class="icon">🔍</span>Answer</h3>
                </div>
                <div class="response-content">
                    {clean_text}
                </div>
                <div class="insight-box">
                    <h4><span class="icon">📚</span>Source</h4>
                    <p>This information was extracted from your uploaded documents.</p>
                </div>
            </div>
            """
    
    # For longer responses, also highlight key terms and numbers
    if not is_single_word:
        # Highlight numbers, percentages, and key terms
        import re
        
        # First, escape any existing HTML in the response text to prevent conflicts
        import html
        
        # Create a safe version of the response text for highlighting
        safe_text = html.escape(response_text)
        
        # Highlight numbers and percentages with professional styling
        highlighted_text = re.sub(r'(\d+(?:\.\d+)?%)', r'<span class="highlighted-number">\1</span>', safe_text)
        highlighted_text = re.sub(r'(\d+(?:\.\d+)?)', r'<span class="highlighted-number">\1</span>', highlighted_text)
        
        # Highlight key terms with professional styling
        key_terms = ['total', 'average', 'maximum', 'minimum', 'count', 'sum', 'result', 'analysis', 'insight', 'pattern', 'trend']
        for term in key_terms:
            pattern = r'\b' + re.escape(term) + r'\b'
            highlighted_text = re.sub(pattern, r'<span class="highlighted-term">\g<0></span>', highlighted_text, flags=re.IGNORECASE)
        
        # Replace the text content in the enhanced response
        enhanced_response = enhanced_response.replace(clean_text, highlighted_text)
    
    # Final safety check: ensure no malformed HTML tags
    enhanced_response = re.sub(r'<([^>]*?)<', r'<\1', enhanced_response)  # Fix double <
    enhanced_response = re.sub(r'>([^<]*?)>', r'>\1<', enhanced_response)  # Fix double >
    
    return enhanced_response

# Sidebar
with st.sidebar:
    st.markdown("""
    <div class="sidebar-section">
        <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">🤖 AI Document Assistant</h3>
        <p style="color: #6c757d; margin: 0; font-size: 0.9rem;">Powered by Groq & LangChain</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Model selection
    st.markdown("### 🚀 Model Configuration")
    selected_model = st.selectbox(
        "Choose Model:",
        ["llama3-8b-8192", "llama3-70b-8192", "gemma2-9b-it"],
        index=0,
        help="Select the AI model for processing your questions"
    )
    
    # Document source
    st.markdown("### 📚 Document Source")
    doc_url = st.text_input(
        "Document URL:",
        value="https://docs.smith.langchain.com/",
        help="Enter the URL of the document you want to analyze"
    )
    
    # Chunk settings
    st.markdown("### ⚙️ Processing Settings")
    chunk_size = st.slider("Chunk Size:", 500, 2000, 1000, 100, help="Size of text chunks for processing")
    chunk_overlap = st.slider("Chunk Overlap:", 100, 500, 200, 50, help="Overlap between chunks for better context")
    
    # Initialize button
    if st.button("🔄 Reinitialize System", type="primary", use_container_width=True):
        st.session_state.initialized = False
        st.rerun()
    
    # Add some spacing
    st.markdown("<br><br>", unsafe_allow_html=True)
    
    # Version info
    st.markdown("""
    <div class="sidebar-section" style="text-align: center;">
        <p style="color: #6c757d; font-size: 0.8rem; margin: 0;">Version 1.0.0</p>
        <p style="color: #6c757d; font-size: 0.8rem; margin: 0;">Built by <strong>Pratham</strong> ❤️</p>
    </div>
    """, unsafe_allow_html=True)

# Main content
st.markdown("""
<div class="main-header">
    <h1>🤖 AI Document & CSV Assistant</h1>
    <p>Ask questions about your documents and analyze CSV data with AI-powered SQL generation</p>
</div>
""", unsafe_allow_html=True)

# Create tabs for different features
tab1, tab2 = st.tabs(["📚 Document Analysis", "📊 CSV Analysis"])

# Initialize session state for CSV
if "csv_data" not in st.session_state:
    st.session_state.csv_data = None
if "csv_schema" not in st.session_state:
    st.session_state.csv_schema = None
if "csv_analysis_history" not in st.session_state:
    st.session_state.csv_analysis_history = []

## load the Groq API key
try:
    groq_api_key = os.environ['GROQ_API_KEY']
except KeyError:
    st.error("❌ GROQ_API_KEY not found in environment variables. Please set it in your .env file.")
    st.stop()

# Initialize session state
if "initialized" not in st.session_state:
    st.session_state.initialized = False
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "doc_url" not in st.session_state:
    st.session_state.doc_url = doc_url

# Check if we need to reinitialize (URL changed or not initialized)
if (not st.session_state.initialized or 
    st.session_state.doc_url != doc_url):
    st.session_state.initialized = False
    st.session_state.doc_url = doc_url

# Tab 1: Document Analysis
with tab1:
    # Initialize system
    if not st.session_state.initialized:
        with st.spinner("🔄 Initializing AI system..."):
            try:
                # Use sentence-transformers wrapper for embeddings
                st.session_state.embeddings = SentenceTransformerWrapper('all-MiniLM-L6-v2')
                
                # Load documents
                st.session_state.loader = WebBaseLoader(doc_url)
                st.session_state.docs = st.session_state.loader.load()
                
                # Split documents
                st.session_state.text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=chunk_size, 
                    chunk_overlap=chunk_overlap
                )
                st.session_state.final_documents = st.session_state.text_splitter.split_documents(
                    st.session_state.docs[:50]
                )
                
                # Create vector store
                st.session_state.vectors = FAISS.from_documents(
                    st.session_state.final_documents, 
                    st.session_state.embeddings
                )
                
                st.session_state.initialized = True
                st.success("✅ AI system initialized successfully!")
                
            except Exception as e:
                st.error(f"❌ Error initializing system: {str(e)}")
                st.stop()

    # Display stats
    if st.session_state.initialized:
        st.markdown('<h2 class="section-header">📊 System Overview</h2>', unsafe_allow_html=True)
        
        # Create a container for better alignment
        with st.container():
            st.markdown('<div class="stats-container">', unsafe_allow_html=True)
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.markdown("""
                <div class="stats-card">
                    <h4>📄 Documents Loaded</h4>
                    <h2>{}</h2>
                </div>
                """.format(len(st.session_state.docs)), unsafe_allow_html=True)
            
            with col2:
                st.markdown("""
                <div class="stats-card">
                    <h4>🔍 Chunks Created</h4>
                    <h2>{}</h2>
                </div>
                """.format(len(st.session_state.final_documents)), unsafe_allow_html=True)
            
            with col3:
                st.markdown("""
                <div class="stats-card">
                    <h4>🤖 AI Model</h4>
                    <h2 style="font-size: 1.5rem;">{}</h2>
                </div>
                """.format(selected_model), unsafe_allow_html=True)
            
            with col4:
                st.markdown("""
                <div class="stats-card">
                    <h4>⚡ System Status</h4>
                    <h2 style="color: #28a745;">🟢 Ready</h2>
                </div>
                """.format(), unsafe_allow_html=True)
            st.markdown('</div>', unsafe_allow_html=True)

    # Chat interface
    if st.session_state.initialized:
        st.markdown('<h2 class="section-header">💬 Ask Your Question</h2>', unsafe_allow_html=True)
        
        # Input container
        with st.container():
            st.markdown('<div class="input-container">', unsafe_allow_html=True)
            
            # Clean input field with no label
            user_input = st.text_input(
                "",  # Empty label
                placeholder="e.g., What is prompt engineering?",
                key="user_input",
                label_visibility="collapsed"
            )
            
            # Button centered below input
            col1, col2, col3 = st.columns([1, 1, 1])
            with col2:
                if st.button("🚀 Ask AI", type="primary", use_container_width=True, key="ask_ai_doc"):
                    if user_input:
                        # Add to chat history
                        st.session_state.chat_history.append({
                            "role": "user",
                            "content": user_input,
                            "timestamp": datetime.now()
                        })
                        
                        # Process the question
                        with st.spinner("🤔 AI is thinking..."):
                            try:
                                llm = ChatGroq(
                                    groq_api_key=groq_api_key,
                                    model_name=selected_model
                                )
                                
                                prompt = ChatPromptTemplate.from_template("""
                                You are a helpful AI assistant. Answer the user's question based on the provided context only.
                                If the context doesn't contain enough information, say so clearly.
                                
                                Context: {context}
                                
                                Question: {input}
                                
                                Please provide a clear, accurate, and helpful response based on the context.
                                """)
                                
                                document_chain = create_stuff_documents_chain(llm, prompt)
                                retriever = st.session_state.vectors.as_retriever()
                                retrieval_chain = create_retrieval_chain(retriever, document_chain)
                                
                                start_time = time.time()
                                response = retrieval_chain.invoke({"input": user_input})
                                response_time = time.time() - start_time
                                
                                # Add AI response to chat history
                                st.session_state.chat_history.append({
                                    "role": "assistant",
                                    "content": response['answer'],
                                    "context": response["context"],
                                    "response_time": response_time,
                                    "timestamp": datetime.now()
                                })
                                
                                st.rerun()
                                
                            except Exception as e:
                                st.error(f"❌ Error processing question: {str(e)}")
            
            st.markdown('</div>', unsafe_allow_html=True)
        
        # Display chat history
        if st.session_state.chat_history:
            st.markdown('<h2 class="section-header">📝 Conversation History</h2>', unsafe_allow_html=True)
            
            for i, message in enumerate(st.session_state.chat_history):
                if message["role"] == "user":
                    st.markdown(f"""
                    <div class="user-message">
                        <strong>You:</strong> {message["content"]}
                        <br><small>{message["timestamp"].strftime("%H:%M:%S")}</small>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    # Enhance response with highlighting
                    enhanced_content = enhance_response_with_highlighting(message["content"], "document")
                    
                    st.markdown(f"""
                    <div class="ai-message">
                        <strong>🤖 AI Assistant:</strong>
                        <br><small>Response time: {message.get("response_time", 0):.2f}s | {message["timestamp"].strftime("%H:%M:%S")}</small>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Display enhanced content
                    st.markdown(enhanced_content, unsafe_allow_html=True)
                    
                    # Show context documents
                    if "context" in message and message["context"]:
                        with st.expander(f"📚 View {len(message['context'])} relevant document chunks"):
                            for j, doc in enumerate(message["context"]):
                                st.markdown(f"""
                                <div class="document-chunk">
                                    <strong>Chunk {j+1}:</strong><br>
                                    {doc.page_content[:300]}{'...' if len(doc.page_content) > 300 else ''}
                                </div>
                                """, unsafe_allow_html=True)

# Tab 2: CSV Analysis
with tab2:
    st.markdown('<h2 class="section-header">📊 CSV Data Analysis with AI</h2>', unsafe_allow_html=True)
    
    # File upload section
    st.markdown('<h3 style="color: #ffffff; margin: 1.5rem 0;">📁 Upload Your CSV File</h3>', unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader(
        "Choose a CSV file",
        type=['csv'],
        help="Upload any CSV file for AI-powered analysis"
    )
    
    if uploaded_file is not None:
        try:
            # Read CSV file
            df = pd.read_csv(uploaded_file)
            st.session_state.csv_data = df
            
            # Auto-detect schema
            schema_info = detect_csv_schema(df)
            st.session_state.csv_schema = schema_info
            
            # Display file info
            st.success(f"✅ CSV file loaded successfully! {len(df)} rows, {len(df.columns)} columns")
            
            # Show schema information
            with st.expander("🔍 View Detected Schema", expanded=True):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown("**📋 Column Information:**")
                    for col in schema_info["columns"]:
                        st.markdown(f"- **{col}**: {schema_info['data_types'][col]}")
                
                with col2:
                    st.markdown("**📊 Sample Values:**")
                    for col in schema_info["columns"]:
                        sample_vals = schema_info["sample_values"][col]
                        if sample_vals:
                            st.markdown(f"- **{col}**: {', '.join(map(str, sample_vals[:2]))}")
                        else:
                            st.markdown(f"- **{col}**: No data")
            
            # Show preview of data
            st.markdown('<h4 style="color: #ffffff; margin: 1rem 0;">📋 Data Preview</h4>', unsafe_allow_html=True)
            st.dataframe(df.head(10), use_container_width=True)
            
            # Analysis section
            st.markdown('<h3 style="color: #ffffff; margin: 2rem 0;">🤖 Ask Questions About Your Data</h3>', unsafe_allow_html=True)
            
            # Input container for CSV questions
            with st.container():
                st.markdown('<div class="input-container">', unsafe_allow_html=True)
                
                csv_question = st.text_input(
                    "",  # Empty label
                    placeholder="e.g., Show me the top 5 sales by region, What's the average age of customers?",
                    key="csv_question",
                    label_visibility="collapsed"
                )
                
                # Button for CSV analysis
                col1, col2, col3 = st.columns([1, 1, 1])
                with col2:
                    if st.button("🚀 Analyze Data", type="primary", use_container_width=True, key="analyze_csv"):
                        if csv_question:
                            # Add to CSV analysis history
                            st.session_state.csv_analysis_history.append({
                                "role": "user",
                                "content": csv_question,
                                "timestamp": datetime.now()
                            })
                            
                            # Process the CSV question
                            with st.spinner("🤔 AI is generating SQL..."):
                                try:
                                    # Generate SQL query
                                    sql_query = generate_sql_with_llm(
                                        schema_info, 
                                        csv_question, 
                                        groq_api_key, 
                                        selected_model
                                    )
                                    
                                    if sql_query:
                                        # Execute SQL on CSV
                                        results_df, error = execute_sql_on_csv(df, sql_query)
                                        
                                        if results_df is not None:
                                            # Generate explanation
                                            explanation = explain_results(sql_query, results_df, csv_question)
                                            
                                            # Create enhanced explanation with key metrics
                                            enhanced_explanation = f"""
                                            {explanation}
                                            
                                            <div class="metrics-grid">
                                                <div class="metric-card">
                                                    <div class="metric-value">{len(results_df)}</div>
                                                    <div class="metric-label">Rows Returned</div>
                                                </div>
                                                <div class="metric-card">
                                                    <div class="metric-value">{len(results_df.columns)}</div>
                                                    <div class="metric-label">Columns Analyzed</div>
                                                </div>
                                                <div class="metric-card">
                                                    <div class="metric-value">✓</div>
                                                    <div class="metric-label">Query Success</div>
                                                </div>
                                            </div>
                                            
                                            <div class="insight-box">
                                                <h4><span class="icon">🔍</span>Query Preview</h4>
                                                <p><code>{sql_query[:100]}{'...' if len(sql_query) > 100 else ''}</code></p>
                                            </div>
                                            """
                                            
                                            # Add AI response to history
                                            st.session_state.csv_analysis_history.append({
                                                "role": "assistant",
                                                "content": enhanced_explanation,
                                                "sql_query": sql_query,
                                                "results": results_df,
                                                "timestamp": datetime.now()
                                            })
                                            
                                            st.rerun()
                                        else:
                                            st.error(f"❌ SQL execution error: {error}")
                                    else:
                                        st.error("❌ Failed to generate SQL query")
                                        
                                except Exception as e:
                                    st.error(f"❌ Error processing CSV question: {str(e)}")
                
                st.markdown('</div>', unsafe_allow_html=True)
            
            # Display CSV analysis history
            if st.session_state.csv_analysis_history:
                st.markdown('<h3 style="color: #ffffff; margin: 2rem 0;">📝 Analysis History</h3>', unsafe_allow_html=True)
                
                for i, message in enumerate(st.session_state.csv_analysis_history):
                    if message["role"] == "user":
                        st.markdown(f"""
                        <div class="user-message">
                            <strong>You:</strong> {message["content"]}
                            <br><small>{message["timestamp"].strftime("%H:%M:%S")}</small>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        # Enhance response with highlighting
                        enhanced_content = enhance_response_with_highlighting(message["content"], "csv")
                        
                        st.markdown(f"""
                        <div class="ai-message">
                            <strong>🤖 AI Assistant:</strong>
                            <br><small>{message["timestamp"].strftime("%H:%M:%S")}</small>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        # Display enhanced content
                        st.markdown(enhanced_content, unsafe_allow_html=True)
                        
                        # Show SQL query
                        if "sql_query" in message:
                            with st.expander("🔍 View Generated SQL"):
                                st.code(message["sql_query"], language="sql")
                        
                        # Show results
                        if "results" in message and message["results"] is not None:
                            with st.expander(f"📊 View Results ({len(message['results'])} rows)"):
                                st.dataframe(message["results"], use_container_width=True)
                                
                                # Download results
                                csv_data = message["results"].to_csv(index=False)
                                st.download_button(
                                    label="💾 Download Results as CSV",
                                    data=csv_data,
                                    file_name=f"analysis_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                                    mime="text/csv",
                                    key=f"download_csv_{i}_{message['timestamp'].strftime('%Y%m%d_%H%M%S')}"
                                )
    
        except Exception as e:
            st.error(f"❌ Error reading CSV file: {str(e)}")
            st.session_state.csv_data = None
            st.session_state.csv_schema = None
    
    else:
        # Show instructions when no file is uploaded
        st.markdown("""
        <div style="text-align: center; padding: 3rem; background: rgba(255, 255, 255, 0.05); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h3 style="color: #ffffff; margin-bottom: 1rem;">🚀 How It Works</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                <div style="background: rgba(102, 126, 234, 0.1); padding: 1.5rem; border-radius: 15px; border: 1px solid rgba(102, 126, 234, 0.3);">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">📁 Upload CSV</h4>
                    <p style="color: #a8b2d1; font-size: 0.9rem;">Upload any CSV file you want to analyze</p>
                </div>
                <div style="background: rgba(118, 75, 162, 0.1); padding: 1.5rem; border-radius: 15px; border: 1px solid rgba(118, 75, 162, 0.3);">
                    <h4 style="color: #764ba2; margin-bottom: 0.5rem;">🔍 Auto Schema</h4>
                    <p style="color: #a8b2d1; font-size: 0.9rem;">AI automatically detects your data structure</p>
                </div>
                <div style="background: rgba(102, 126, 234, 0.1); padding: 1.5rem; border-radius: 15px; border: 1px solid rgba(102, 126, 234, 0.3);">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">🤖 AI SQL</h4>
                    <p style="color: #a8b2d1; font-size: 0.9rem;">Ask questions in plain English, get SQL queries</p>
                </div>
                <div style="background: rgba(118, 75, 162, 0.1); padding: 1.5rem; border-radius: 15px; border: 1px solid rgba(118, 75, 162, 0.3);">
                    <h4 style="color: #764ba2; margin-bottom: 0.5rem;">📊 Results</h4>
                    <p style="color: #a8b2d1; font-size: 0.9rem;">Get results with AI explanations</p>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

# Footer
st.markdown("---")
st.markdown("""
<div class="footer">
    <p>🤖 AI Document & CSV Assistant | Powered by Groq & LangChain | Built with Streamlit</p>
    <p class="developer">Developed by <strong>Pratham</strong> 🚀</p>
</div>
""", unsafe_allow_html=True)
    