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
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const avatars = [1, 2, 3, 4, 5, 6]; // available avatars

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

      // Save extra details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        organization,
        contact,
        email,
        avatar: `/avatars/${avatar}.png`,
        createdAt: new Date(),
      });

      navigate("/dashboard"); // redirect after signup
    } catch (err) {
      setError("Failed to create account. " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create your Dyann Account</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
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

        {/* Avatar Selection */}
        <div className="avatar-picker">
          <p>Select an Avatar:</p>
          <div className="avatar-grid">
            {avatars.map((num) => (
              <img
                key={num}
                src={`/avatars/${num}.png`}
                alt={`avatar-${num}`}
                className={`avatar-option ${avatar === num ? "selected" : ""}`}
                onClick={() => setAvatar(num)}
              />
            ))}
          </div>
        </div>

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
