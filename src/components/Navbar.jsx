import React from "react";
import { GiRamProfile } from "react-icons/gi";
import { RiLinkUnlink } from "react-icons/ri";

import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="Navbar">
      <h1>Dyann.</h1>
      <ul className="items">
        <li className="item">
          <Link to="/">Home</Link>
        </li>
        <li className="item">
          <Link to="/dyann">Dyann</Link>
        </li>
        <li className="item">
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className="item">
          <Link to="/assista">Assista</Link>
        </li>
        <li className="item">
          <Link to="/reviews">Reviews</Link>
        </li>
        <li className="item">
          <Link to="/profile">
            <GiRamProfile />
          </Link>
        </li>
        <li className="item">
          <Link to="https://dyann-ai-assistant.onrender.com/" className="item">
            <RiLinkUnlink />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
