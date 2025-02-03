import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserContext } from '../contexts/UserContext';
import Swal from 'sweetalert2';

function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalGuides: 0,
    totalJobOpenings: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [learnersData, guidesData, jobOpeningsData] = await Promise.all([
        supabase.from('learnersDB').select('count', { count: 'exact' }),
        supabase.from('guidesDB').select('count', { count: 'exact' }),
        supabase.from('job_openings').select('count', { count: 'exact' })
      ]);

      setStats({
        totalLearners: learnersData.count,
        totalGuides: guidesData.count,
        totalJobOpenings: jobOpeningsData.count
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch dashboard statistics. Please try again later.'
      });
    }
  }

  if (!user || user.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body">
              <h5 className="card-title">Total Learners</h5>
              <p className="card-text display-4">{stats.totalLearners}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body">
              <h5 className="card-title">Total Guides</h5>
              <p className="card-text display-4">{stats.totalGuides}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body">
              <h5 className="card-title">Total Job Openings</h5>
              <p className="card-text display-4">{stats.totalJobOpenings}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="list-group mt-4">
        <Link to="/job-openings" className="list-group-item list-group-item-action bg-dark text-light border-secondary">
          Manage Job Openings
        </Link>
        <Link to="/admin/users" className="list-group-item list-group-item-action bg-dark text-light border-secondary">
          Manage Users
        </Link>
        <Link to="/admin/reports" className="list-group-item list-group-item-action bg-dark text-light border-secondary">
          View Reports
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;

