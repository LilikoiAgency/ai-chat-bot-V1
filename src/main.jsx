import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Note the addition of Routes
import App from './App.jsx';
import './index.css';
import AssistantBot from './assistantBot.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      {/* Use the Routes component to wrap Route components */}
      <Routes>
        {/* Route for /assistant-api */}
        <Route path="/" element={<App />} />
        
        {/* Route for other paths */}
        <Route path="/assistant-api" element={<AssistantBot />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);