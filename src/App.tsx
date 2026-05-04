import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage'; // 确保路径正确
import { LicensePage } from './pages/LicensePage';   // 确保路径正确

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/license" element={<LicensePage />} />
      </Routes>
    </Router>
  );
}

export default App;