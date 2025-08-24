// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showAvatars, setShowAvatars] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const avatars = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!avatar) {
      setError("Please select an avatar");
      return;
    }

    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        organization,
        contact,
        email,
        avatar, // "1.png", "2.png" etc.
        createdAt: new Date(),
      });

      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create account. " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>SIGN UP</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="fors">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Organization Name"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Avatar Selection */}
        <div className="avatar-picker">
          <p>{!avatar ? "Choose an Avatar" : ""}</p>

          {/* Show preview if selected */}
          {avatar && (
            <div className="avatar-preview">
              <img src={`/avatars/${avatar}`} alt="selected avatar" />
            </div>
          )}

          <button
            type="button"
            className="choose-avatar-btn"
            onClick={() => setShowAvatars(!showAvatars)}
          >
            {showAvatars ? "Close Avatar Picker" : "Choose Avatar"}
          </button>

          {showAvatars && (
            <div className="avatar-grid">
              {avatars.map((file) => (
                <img
                  key={file}
                  src={`/avatars/${file}`}
                  alt={`avatar-${file}`}
                  className={`avatar-option ${
                    avatar === file ? "selected" : ""
                  }`}
                  onClick={() => {
                    setAvatar(file);
                    setShowAvatars(false); // close picker after choosing
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn">Sign Up</button>
      </form>

      <p className="tog">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
