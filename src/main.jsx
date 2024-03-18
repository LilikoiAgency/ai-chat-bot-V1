import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import App from './App.jsx';
import './index.css';
import AssistantBot from './assistantBot.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/assistant-api" element={<AssistantBot />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);