import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LearnerLogin from './components/LearnerLogin';
import GuideLogin from './components/GuideLogin';
import LearnerRegister from './components/LearnerRegister';
import GuideRegister from './components/GuideRegister';

const Login = () => {
    return ( 
        <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <ul className="flex space-x-4">
            <li><Link to="/" className="text-blue-600 hover:underline">Home</Link></li>
            <li><Link to="/login/learner" className="text-blue-600 hover:underline">Learner Login</Link></li>
            <li><Link to="/login/guide" className="text-blue-600 hover:underline">Guide Login</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/learner" element={<LearnerLogin />} />
          <Route path="/login/guide" element={<GuideLogin />} />
          <Route path="/register/learner" element={<LearnerRegister />} />
          <Route path="/register/guide" element={<GuideRegister />} />
        </Routes>
      </div>
    </Router>
     );
}
 
export default Login;