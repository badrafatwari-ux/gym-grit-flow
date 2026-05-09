import React from "react";
import ReactDOM from "react-dom/client";
import { GymApp } from "@/components/gym/GymApp";
import "./styles.css";

document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GymApp />
  </React.StrictMode>,
);
