import React from "react";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="Foot">
      <h1 className="f">Assita</h1>
      <p>
        Assista is Small Ai Assistant we usually design to improve our Project's quality and credibility. More important thing is to make product of such quality which can't be found even outside the India in future.
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
