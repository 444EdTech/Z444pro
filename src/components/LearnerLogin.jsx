import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import bcrypt from 'bcryptjs';
import { UserContext } from '../contexts/UserContext';

function LearnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('learnersDB')
        .select('*')
        .or(`email.eq.${email},user_name.eq.${email}`);

      if (error) {
        console.error('Error fetching user:', error.message);
        alert('An error occurred. Please try again.');
        return;
      }

      if (data.length === 0) {
        alert('Invalid email/username or password.');
        return;
      }

      const user = data[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        const userDetails = {
          id: user.id,
          username: user.user_name,
          email: user.email,
          name: user.name,
          role: 'learner',
        };
        login(userDetails);
        navigate('/dashboard/learner');
      } else {
        alert('Invalid email/username or password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow bg-dark text-light">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Learner Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Email or Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </form>
              <p className="mt-3 text-center">
                Don't have an account? <Link to="/register/learner" className="text-decoration-none">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnerLogin;

