/*
Author: Vishnukarthick K
Description: This file is the main entry point of the React application. It renders the App component into the root DOM element. The App component manages the overall state and layout of the app, including loading states, error handling, and switching between the dashboard and profile views. It also includes a top status bar that shows the data source and refresh status.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
