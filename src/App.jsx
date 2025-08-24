// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./styles/global.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";

// Pages
import Home from "./pages/Home";
import Dyann from "./pages/Dyann";
import Assista from "./pages/Assista";
import Reviews from "./pages/Reviews";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login.jsx";
import Signup from "./pages/SignUp";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Df from "./components/Df.jsx"; // new footer for Assista

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Wrapper for showing different footers
const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      {children}
      {location.pathname === "/assista" ? <Df /> : <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/assista" element={<Assista />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Private Routes */}
            <Route
              path="/dyann"
              element={
                <PrivateRoute>
                  <Dyann />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
