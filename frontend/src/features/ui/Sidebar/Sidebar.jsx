import React, { useState } from "react";
import "./Sidebar.module.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        style={{ fontSize: "30px", cursor: "pointer" }}
        onClick={() => setOpen(true)}
      >
        &#9776; open
      </span>

      <div
        className="sidenav"
        style={{ width: open ? "20%" : "0" }}
      >
        <a href="#!" className="closebtn" onClick={() => setOpen(false)}>
          &times;
        </a>
        <a href="#!">About</a>
        <a href="#!">Services</a>
        <a href="#!">Clients</a>
        <a href="#!">Contact</a>
      </div>
    </>
  );
}
