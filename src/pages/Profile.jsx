import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // Firestore instance

const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    company: "",
    role: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userDoc = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile({
              name: user.displayName || "",
              email: user.email,
              phone: "",
              company: "",
              role: "",
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), profile, { merge: true });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h2>User Profile</h2>
      <form>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
        />

        <label>Email (unchangeable):</label>
        <input type="email" value={profile.email} disabled />

        <label>Phone (+91-XXXXXXXXXX):</label>
        <input
          type="tel"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          pattern="^\+91-[0-9]{10}$"
          placeholder="+91-9876543210"
        />

        <label>Company:</label>
        <input
          type="text"
          name="company"
          value={profile.company}
          onChange={handleChange}
        />

        <label>Role:</label>
        <input
          type="text"
          name="role"
          value={profile.role}
          onChange={handleChange}
        />

        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
