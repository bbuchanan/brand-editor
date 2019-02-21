import React, { Component } from "react";
import "primereact/resources/themes/nova-light/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";
import NavTabs from "./components/NavTabs";

const app = () => {
  return (
    <div className="App">
      <NavTabs />
    </div>
  );
};

export default app;
