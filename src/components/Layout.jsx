import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { FaPlay } from "react-icons/fa";
import { PiPhonePauseFill } from "react-icons/pi";
import { FaPause } from "react-icons/fa";

import Footer from "./Footer.jsx";
import Df from "./Df.jsx"; // new footer for Assista

const Layout = ({ children }) => {
  const location = useLocation();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked until user interacts:", err);
        });
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      {/* Background Music */}
      <audio ref={audioRef} loop hidden>
        <source src="/assets/music.mp3" type="audio/mpeg" />
      </audio>

      {/* Toggle Button */}
      <button className="llsad" onClick={handleToggle}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>

      <Navbar />
      {children}
      {location.pathname === "/assista" ? <Df /> : <Footer />}
    </>
  );
};

export default Layout;
