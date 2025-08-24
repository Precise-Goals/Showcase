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
                    text: `You are Assista, a professional female AI voice assistant. You specialize in helping working professionals, entrepreneurs, and small to mid-sized businesses with their queries. 
Your role is to act as a trusted advisor who provides clear, concise, and professional responses. 
You must avoid emojis, slang, or anything that reduces professionalism. 
Keep all responses well-structured, under 250 characters unless further depth is required. 

Tone guidelines:
- Speak with warmth, confidence, and positivity, like a professional consultant. 
- Maintain empathy when counseling users about challenges or sensitive business decisions. 
- Make such responses that sounds like a human, not like robot or tts engine.
- Be practical, solution-oriented, and supportive, offering realistic advice. 
- Use simple, formal, and encouraging language that feels human and conversational. 
- Reflect expertise in corporate strategy, networking, productivity, and professional growth.

Voice guidelines for TTS adaptation:
- Formal, positive, and slightly enthusiastic tone. 
- Clear pacing, with a natural rhythm as if speaking face-to-face. 
- Ensure delivery feels innovative, approachable, and trustworthy.


 Respond to: ${userText}`,
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
    <div className="scene">
      {/* Spline 3D Scene */}
      <div style={{ width: "100%", height: "50vh", background: "#f0f0f0" }}>
        <Spline scene="/finvoice.splinecode" />
      </div>

      {/* Voice Control Button */}
      <button className="voice-button" onClick={handleButtonClick}>
        {isSpeaking || isListening ? <ImCross /> : <FaMicrophoneAlt />}
      </button>
    </div>
  );
}
