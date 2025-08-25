# 🤖 Dyann.ai - AI-Powered Data Analyst Assistant

> **Transform your data into actionable insights with natural language queries and voice-powered analysis**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-purple.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0.0-orange.svg)](https://firebase.google.com/)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Proposed Solution](#-proposed-solution)
- [Process Flow](#-process-flow)
- [Methodology](#-methodology)
- [Solution Concept & Feasibility](#-solution-concept--feasibility)
- [Use Cases](#-use-cases)
- [Technology Stack](#-technology-stack)
- [Constraints & Challenges](#-constraints--challenges)
- [Extra Features](#-extra-features)
- [Screenshots](#-screenshots)
- [Future Scope](#-future-scope)
- [Revenue Model](#-revenue-model)
- [Team Information](#-team-information)
- [License](#-license)

---

## 🎯 Problem Statement

In today's data-driven business landscape, organizations face significant challenges:

- **📊 Data Analysis Barrier**: Non-technical users struggle to extract insights from CSV/Excel files due to the SQL knowledge requirement
- **⏰ Time Inefficiency**: Manual data analysis consumes hours that could be spent on strategic decision-making
- **👥 Resource Dependency**: Businesses rely heavily on data analysts for basic queries, creating bottlenecks
- **💸 High Costs**: Hiring specialized data analysts is expensive for small to medium businesses
- **🔍 Limited Accessibility**: Complex data tools exclude stakeholders who need insights but lack technical skills

**The Result**: Valuable business data remains underutilized, decisions are delayed, and opportunities are missed.

---

## 💡 Proposed Solution

### 🤖 Dyann.ai - Text-Based Data Analysis

- **Natural Language Processing**: Ask questions in plain English
- **Automatic SQL Generation**: Converts queries to optimized SQL statements
- **Multi-Format Support**: Upload CSV and Excel files seamlessly
- **Interactive Visualizations**: Charts, tables, and insights in real-time
- **Conversational Q&A**: Follow-up questions for deeper analysis

### 🎙️ Assista.ai - Voice-Powered Assistant

- **Speech-to-Text**: Ask questions using voice commands
- **Text-to-Speech**: Receive spoken insights and explanations
- **Hands-Free Operation**: Perfect for busy professionals
- **Multi-Modal Output**: Voice responses with visual charts/tables

**Together, they democratize data analysis for everyone! 🚀**

---

## 🔄 Process Flow

### Dyann.ai Workflow

```
📁 CSV/Excel Upload → 🔍 Data Preprocessing → 🤖 NL Understanding →
📝 SQL Generation → 🗄️ Database Query → 📊 Visualization → 📋 Insights
```

### Assista.ai Workflow

```
🎤 Voice Input → 🎵 Speech-to-Text → 🤖 AI Processing →
📊 Results Generation → 🔊 Text-to-Speech → 📈 Visual Output
```

![Workflow Diagram](./assets/workflow.png)

---

## 🛠️ Methodology

### 1. **Data Upload & Preprocessing**

- File validation and format detection
- Schema analysis and data type inference
- Data cleaning and normalization
- Security scanning for sensitive information

### 2. **Natural Language Understanding**

- Query intent classification
- Entity recognition and extraction
- Context awareness and conversation memory
- Ambiguity resolution

### 3. **Query Generation & Execution**

- SQL query construction with best practices
- Query optimization for performance
- Error handling and fallback mechanisms
- Result validation and quality checks

### 4. **Insight Generation & Visualization**

- Automated chart type selection
- Statistical analysis and trend detection
- Natural language explanation generation
- Interactive dashboard creation

### 5. **Security & Privacy**

- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Query sanitization and injection prevention
- Audit logging and compliance

---

## ✅ Solution Concept & Feasibility

### **Technical Feasibility** ✅

- **Proven Technologies**: Leveraging mature AI/ML frameworks
- **Scalable Architecture**: Microservices-based design
- **API Integration**: Seamless third-party service integration
- **Real-time Processing**: Low-latency query execution

### **Economic Feasibility** ✅

- **Cost-Effective**: Reduces need for expensive data analysts
- **ROI Positive**: Quick implementation and measurable benefits
- **Subscription Model**: Predictable revenue streams
- **Market Demand**: Growing need for self-service analytics

### **Operational Feasibility** ✅

- **User-Friendly**: Intuitive interface requiring minimal training
- **Cross-Platform**: Works on web, mobile, and desktop
- **24/7 Availability**: Cloud-based deployment
- **Maintenance-Free**: Automated updates and monitoring

### **Scalability Feasibility** ✅

- **Cloud-Native**: Auto-scaling capabilities
- **Multi-Tenant**: Efficient resource utilization
- **Global Distribution**: CDN and edge computing
- **Performance Optimization**: Caching and query optimization

---

## 🎯 Use Cases & Descriptions

### 🏢 **Business Intelligence**

- **Scenario**: Marketing team analyzing customer behavior data
- **Query**: "Show me customer retention rates by region for Q3"
- **Output**: Interactive charts with regional comparisons and trend analysis

### 💰 **Financial Analysis**

- **Scenario**: CFO reviewing quarterly financial statements
- **Query**: "What's our profit margin trend over the last 12 months?"
- **Output**: Time-series charts with profitability insights and recommendations

### 📈 **Marketing Analytics**

- **Scenario**: Marketing manager evaluating campaign performance
- **Query**: "Which marketing channels have the highest ROI?"
- **Output**: Comparative analysis with cost-benefit breakdown

### 🎓 **Educational Research**

- **Scenario**: University analyzing student performance data
- **Query**: "How do online vs. in-person students perform?"
- **Output**: Statistical comparison with significance testing

### 🛒 **E-commerce Optimization**

- **Scenario**: Online store analyzing sales patterns
- **Query**: "What are our top-selling products by season?"
- **Output**: Seasonal trend analysis with inventory recommendations

### 🏥 **Healthcare Analytics**

- **Scenario**: Hospital analyzing patient outcomes
- **Query**: "What factors correlate with readmission rates?"
- **Output**: Correlation analysis with risk factor identification

---

## 🛠️ Technology Stack

### **Frontend**

- **React 18** - Modern UI framework with hooks and context
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **React Router** - Client-side routing

### **Backend**

- **Node.js/Bun** - High-performance JavaScript runtime
- **Express.js** - Minimal web framework
- **Firebase** - Backend-as-a-Service platform
- **Firestore** - NoSQL cloud database

### **AI & Machine Learning**

- **OpenAI GPT-4** - Advanced language model for NL understanding
- **Google Gemini** - Multimodal AI for complex queries
- **LangChain** - Framework for LLM applications
- **Natural** - Natural language processing library

### **Database & Storage**

- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Storage** - File storage for uploads
- **Firebase Auth** - User authentication and authorization

### **Visualization & UI**

- **Recharts** - Responsive chart components
- **React Table** - Flexible table component
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon library

### **Deployment & DevOps**

- **Vercel** - Frontend deployment platform
- **Firebase Hosting** - Static site hosting
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization

---

## ⚠️ Constraints & Challenges

### **Privacy & Security** 🔒

- **Challenge**: Handling sensitive business data
- **Solution**:
  - End-to-end encryption
  - Role-based access control (RBAC)
  - GDPR/CCPA compliance
  - Data anonymization options

### **Cost Management** 💰

- **Challenge**: AI API costs for large-scale usage
- **Solution**:
  - Query caching and optimization
  - Tiered pricing models
  - Batch processing for bulk queries
  - Local model deployment options

### **Scalability** 📈

- **Challenge**: Handling concurrent users and large datasets
- **Solution**:
  - Microservices architecture
  - Auto-scaling cloud infrastructure
  - Database sharding and indexing
  - CDN for global distribution

### **Query Ambiguity** 🤔

- **Challenge**: Interpreting unclear natural language queries
- **Solution**:
  - Context-aware conversation memory
  - Query clarification prompts
  - Multiple interpretation suggestions
  - Learning from user feedback

### **Data Quality** 📊

- **Challenge**: Processing inconsistent or dirty data
- **Solution**:
  - Automated data validation
  - Data cleaning algorithms
  - Quality scoring and alerts
  - Manual override options

---

## ✨ Extra Features

### 🎙️ **Assista.ai - Voice Assistant**

- **Speech Recognition**: Advanced STT with noise cancellation
- **Voice Synthesis**: Natural-sounding TTS responses
- **Multi-Language**: Support for multiple languages
- **Voice Commands**: Customizable voice shortcuts

### ⭐ **User Feedback System**

- **Rating System**: 1-5 star ratings for queries and responses
- **Review Module**: Detailed feedback collection
- **Quality Metrics**: Track accuracy and user satisfaction
- **Improvement Loop**: AI learns from user feedback

### 💼 **Revenue Model**

- **Free Tier**: Basic features with usage limits
- **Pro Plan**: Advanced features and higher limits
- **Enterprise**: Custom solutions and dedicated support
- **API Access**: Developer-friendly API with usage-based pricing


## 📸 Screenshots

### Main Dashboard

![Dashboard Interface](./assets/dashboard.png)

### Data Upload & Analysis

![Data Analysis Workflow](./assets/analysis.png)

### Interactive Charts

![Chart Visualizations](./assets/charts.png)

### Voice Assistant Interface

![Voice Assistant](./assets/voice.png)

### User Reviews & Ratings

![Reviews Module](./assets/reviews.png)

---

## 🚀 Future Scope

### **Enhanced AI Capabilities**

- **Multi-Modal Analysis**: Image and document processing
- **Predictive Analytics**: Machine learning forecasting
- **Natural Language Generation**: Automated report writing
- **Sentiment Analysis**: Understanding data context

### **Platform Expansion**

- **Mobile Apps**: iOS and Android applications
- **Desktop Integration**: Native desktop applications
- **API Ecosystem**: Third-party integrations
- **Marketplace**: Custom visualization templates

### **Advanced Features**

- **Real-time Collaboration**: Multi-user editing
- **Automated Reports**: Scheduled insights delivery
- **Data Pipeline Integration**: ETL process automation
- **Advanced Security**: Blockchain-based data verification

### **Global Reach**

- **Multi-Language Support**: 50+ languages
- **Regional Compliance**: Local data protection laws
- **Global CDN**: Sub-100ms response times worldwide
- **Localization**: Cultural and regional adaptations
  
---

### **API Monetization** 🔌
Currently we are open source, but yea we have future plans regarding this project. about cheapest services at higher Quantity to be provided by Product, which is launched in india, in Artiificial intelligence Sector.

---

## 👥 Team Information

**Project**: Dyann.ai + Assista.ai  
**Event**: Kurukshetra-25 HackFest  
**Category**: AI/ML Innovation  
**Duration**: 48-hour hackathon

### **Team Members**

- **Data Scientists**: AI/ML model development
- **Full-Stack Developers**: Web application development
- **UI/UX Designers**: User interface and experience design
- **DevOps Engineers**: Deployment and infrastructure

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Dyann.ai Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📞 Support

- **Email**: support@dyann.ai
- **Documentation**: [docs.dyann.ai](https://docs.dyann.ai)
- **Community**: [Discord](https://discord.gg/dyann-ai)
- **Issues**: [GitHub Issues](https://github.com/dyann-ai/dyann/issues)

---

<div align="center">

### By Team CrossConnectors
**Made with ❤️ for Kurukshetra-25 HackFest**

[![GitHub stars](https://img.shields.io/github/stars/dyann-ai/dyann?style=social)](https://github.com/dyann-ai/dyann)
[![GitHub forks](https://img.shields.io/github/forks/dyann-ai/dyann?style=social)](https://github.com/dyann-ai/dyann)
[![GitHub issues](https://img.shields.io/github/issues/dyann-ai/dyann)](https://github.com/dyann-ai/dyann/issues)

</div>
