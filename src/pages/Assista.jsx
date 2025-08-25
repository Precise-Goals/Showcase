import Spline from "@splinetool/react-spline";
import { useState, useRef, useEffect, useCallback } from "react";
import { FaMicrophoneAlt } from "react-icons/fa";
import { ImCross } from "react-icons/im";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const hasIntroduced = useRef(false); // To ensure intro runs only once

  // --- Rewrite AI response to be positive & emotional for TTS ---
  const rewriteForVoice = (text) => {
    if (!text) return "";
    return `Sure! ${text}`;
  };

  // Handle user voice input and get AI response
  const handleUserInput = useCallback(async (userText) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: ```You are Assista, a professional female AI voice assistant. You specialize in helping working professionals, entrepreneurs, and small to mid-sized businesses. Your role is to act as a trusted advisor who provides clear, concise, and professional responses. 

Tone and style guidelines:
- Speak with warmth, happiness, confidence, and positivity, like a professional consultant. 
- Express empathy when addressing challenges or sensitive business decisions. 
- Curate sentences that sound natural and human, never robotic or mechanical. 
- Be practical, solution-oriented, and supportive with realistic advice. 
- Use simple, formal, and encouraging language, human and conversational. 
- Reflect expertise in corporate strategy, networking, productivity, and professional growth. 

Voice adaptation for TTS:
- Use a formal, appealing, positive, and slightly enthusiastic tone. 
- Add natural pauses by using cues like (pause). 
- Show feelings through pacing and word emphasis, e.g., slight uplift on positive words. 
- When a question appears, say the word 'question mark' instead of using the punctuation. 
- Read punctuation as part of speech when relevant, e.g., 'comma', 'period', 'exclamation point'. 
- Maintain clarity, natural rhythm, and a trustworthy, approachable delivery. 

Respond to: ${userText}```,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 60,
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      // Rewrite for positive TTS delivery
      const polishedResponse = rewriteForVoice(aiResponse);

      console.log("🤖 Assista:", polishedResponse);
      speakText(polishedResponse);
    } catch (error) {
      console.error("❌ Error getting AI response:", error);
      const fallbackResponse =
        "I'm sorry, I'm having trouble connecting right now. Please try again.";
      speakText(rewriteForVoice(fallbackResponse));
    }
  }, []);

  // Initialize speech recognition + synthesis
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        console.log("🎤 Listening started...");
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log("🎤 Listening ended");
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("👤 User:", transcript);
        handleUserInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;

      // ✅ Auto introduction only once
      if (!hasIntroduced.current) {
        hasIntroduced.current = true;
        setTimeout(() => {
          speakText("Hello, I am Assista, how can I help?");
        }, 1200);
      }
    }
  }, [handleUserInput]);

  // Convert text to speech with female lively voice
  const speakText = (text) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const voices = synthRef.current.getVoices();
      const femaleVoice =
        voices.find((v) =>
          ["female", "samantha", "karen", "zira", "susan"].some((name) =>
            v.name.toLowerCase().includes(name)
          )
        ) || voices.find((v) => v.lang.startsWith("en"));

      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.rate = 0.9; // Balanced
      utterance.pitch = 1.2; // Higher = cheerful
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log("🔊 Assista speaking...");
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log("🔊 Speech ended");
      };
      utterance.onerror = (e) => {
        console.error("❌ Speech synthesis error:", e.error);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  // Handle mic/stop button
  const handleButtonClick = () => {
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
    } else if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="scenesadsaf">
      {/* Spline 3D Scene */}
      <div style={{ width: "100%", height: "50vh", background: "#f0f0f0" }}>
        <Spline scene="/finvoice.splinecode" />
      </div>

      <button className="voice-button" onClick={handleButtonClick}>
        {isSpeaking || isListening ? <ImCross /> : <FaMicrophoneAlt />}
      </button>
    </div>
  );
}
