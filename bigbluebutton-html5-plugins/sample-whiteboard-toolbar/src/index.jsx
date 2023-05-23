import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css";
import WhiteboardToolbarButton from './WhiteboardToolbarButton.jsx';

const elementId = document.currentScript?.getAttribute("elementId") || "root"

const pluginName = document.currentScript?.getAttribute("pluginName") || "plugin"

const root = ReactDOM.createRoot(document.getElementById(elementId));
root.render(
  <React.StrictMode>
    <WhiteboardToolbarButton pluginName={pluginName} />
  </React.StrictMode>
);
