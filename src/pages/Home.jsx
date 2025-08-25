import React from "react";
import { Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";

const Home = () => {
  return (
    <div
      className="Home"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Background 3D Scene */}
      <div className="scene" style={{ width: "100%", height: "100vh" }}>
        <Spline
          className="sc"
          style={{ width: "100%", height: "100%" }}
          scene="/Home.splinecode"
        />
      </div>

      {/* Hero Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 24px",
          paddingTop: "9%",
          // backdropFilter: "blur(10px)",
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.35) 100%)",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            width: "100%",
            textAlign: "center",
            color: "#fff",
            pointerEvents: "auto",
          }}
        >
          <div style={{ fontSize: 14, letterSpacing: 6, opacity: 0.9 }}>
            DYANN
          </div>
          <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: "12px 0 12px" }}>
            LLM‑powered, AI‑driven analytics for your data
          </h1>
          <p
            style={{
              fontSize: 16,
              opacity: 0.9,
              margin: "0 auto 20px",
              maxWidth: 720,
            }}
          >
            Upload datasets, ask questions in plain language, and get instant
            insights with smart visualizations. Built for speed, clarity, and
            action.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 8,
            }}
          >
            <Link to="/Dashboard" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "#111827",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Open Dashboard
              </button>
            </Link>
            <Link to="/assista" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "rgba(255,255,255,0.9)",
                  color: "#0f172a",
                  border: "1px solid rgba(15,23,42,0.15)",
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Try the AI Assistant
              </button>
            </Link>
          </div>

          {/* Quick value props */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginTop: 28,
              maxWidth: 960,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {[
              {
                title: "Conversational insights",
                desc: "Ask questions in natural language.",
              },
              {
                title: "Visual analytics",
                desc: "Charts and trends generated automatically.",
              },
              {
                title: "CSV friendly",
                desc: "Upload a file and explore instantly.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(6px)",
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informative Sections */}
      <div
        style={{
          background: "#f9fafb",
          color: "#111",
          padding: "60px 20px",
          marginTop: "100vh",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          {/* How it works */}
          <h2 style={{ fontSize: 32, marginBottom: 20, textAlign: "center" }}>
            How It Works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                step: "1",
                title: "Upload or Scrap Data",
                desc: "Bring in data from CSV files or directly scrape it from the web.",
              },
              {
                step: "2",
                title: "Automated SQL Generation",
                desc: "We instantly generate optimized SQL queries for structured insights.",
              },
              {
                step: "3",
                title: "AI‑Driven Analysis",
                desc: "Get plain‑language insights, summaries, and visual reports in seconds.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 20,
                  textAlign: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <h2
            style={{
              fontSize: 32,
              margin: "60px 0 20px",
              textAlign: "center",
            }}
          >
            Key Features
          </h2>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 16,
              listStyle: "none",
              padding: 0,
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {[
              "Smart visualizations by Dyann",
              "Scalable and secure data handling",
              "Automated SQL query builder",
              "Business‑ready AI insights in seconds",
              "Supports web‑scraped + file‑based data",
              "Seamless integration with dashboards",
            ].map((feature) => (
              <li
                key={feature}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 15,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                • {feature}
              </li>
            ))}
          </ul>

          {/* Vision */}
          <h2
            style={{
              fontSize: 32,
              margin: "60px 0 20px",
              textAlign: "center",
            }}
          >
            Our Vision in India
          </h2>
          <p
            style={{
              fontSize: 16,
              maxWidth: 720,
              margin: "0 auto",
              textAlign: "center",
              opacity: 0.9,
            }}
          >
            With businesses across India rapidly adopting digital solutions, our
            goal is to empower startups, SMEs, and enterprises with affordable,
            AI‑driven analytics. By simplifying data analysis, we help
            businesses make faster, data‑backed decisions and scale with
            confidence.
          </p>

          {/* Call to Action */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/Dashboard" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "#111827",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Start Exploring Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
