import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import bcrypt from 'bcryptjs';
import { UserContext } from '../contexts/UserContext';
import Swal from 'sweetalert2';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('adminsDB')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        Swal.fire('Error', 'Invalid username or password', 'error');
        return;
      }

      const isValidPassword = await bcrypt.compare(password, data.password);

      if (isValidPassword) {
        const adminDetails = {
          id: data.id,
          username: data.username,
          role: 'admin',
        };
        login(adminDetails);
        navigate('/admin-dashboard');
      } else {
        Swal.fire('Error', 'Invalid username or password', 'error');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Swal.fire('Error', 'An error occurred during login', 'error');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow bg-dark text-light">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Admin Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

