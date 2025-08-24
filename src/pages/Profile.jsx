import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { MdEditSquare } from "react-icons/md";
import { PiSignOutFill } from "react-icons/pi";
import { MdDownloading } from "react-icons/md";
import { CiSaveDown1 } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    organization: "",
    role: "",
    email: "",
    avatar: "1.png",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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
              organization: "",
              role: "",
              avatar: "1.png",
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
      // alert("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirect to home or login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-wrapper">
      <h2>User Profile</h2>
      <div className="cont">
        <div className="avatar-section">
          <img
            src={`/avatars/${profile.avatar}`}
            alt="User Avatar"
            className="avatar-preview"
          />
          {editing && (
            <select
              name="avatar"
              value={profile.avatar}
              onChange={handleChange}
              className="avatar-select"
            >
              {[...Array(6)].map((_, i) => (
                <option key={i + 1} value={`${i + 1}.png`}>
                  Avatar {i + 1}
                </option>
              ))}
            </select>
          )}
        </div>

        <form>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editing}
          />

          <label>Email (unchangeable):</label>
          <input type="email" value={profile.email} disabled />

          <label>Phone (+91-XXXXXXXXXX):</label>
          <input
            type="tel"
            name="phone"
            value={profile.contact}
            onChange={handleChange}
            pattern="^\[0-9]{10}$"
            placeholder={profile.contact}
            disabled={!editing}
          />

          <label>organization:</label>
          <input
            type="text"
            name="organization"
            className="organization-input"
            value={profile.organization}
            onChange={handleChange}
            disabled={!editing}
          />
        </form>
        <div className="profile-actions">
          <button
            type="button"
            onClick={() => {
              if (editing) {
                handleSave();
              } else {
                setEditing(true);
              }
            }}
            disabled={saving}
            className="edit-save-btn"
          >
            {editing ? (
              saving ? (
                <MdDownloading />
              ) : (
                <CiSaveDown1 />
              )
            ) : (
              <MdEditSquare />
            )}
          </button>

          <button type="button" onClick={handleLogout} className="logout-btn">
            <PiSignOutFill />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
