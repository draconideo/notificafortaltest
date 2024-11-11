import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Information from './Pages/information/information';
import Home from './Pages/HomeDenounces/Home';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/information" element={<Information />} />
          <Route path="/HomeDenounces" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
