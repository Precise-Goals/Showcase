import React from "react";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="Foot">
      <h1 className="f">Dyann.Co</h1>
      <p>
        This project is a business analytics dashboard designed to help users
        understand their business data and its Visualization
      </p>
      <ul className="icons">
        <li className="icon">
          <FaGithub />
        </li>
        <li className="icon">
          <FaLinkedin />
        </li>
        <li className="icon">
          <FaInstagram />
        </li>
      </ul>
      <p className="cp">Copyright CrossConnectors All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
