import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';
import { UserContext } from '../contexts/UserContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Swal from 'sweetalert2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports() {
  const [jobStats, setJobStats] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchJobStats();
  }, []);

  async function fetchJobStats() {
    try {
      const { data, error } = await supabase
        .from('job_openings')
        .select('job_type')
        .not('job_type', 'is', null);

      if (error) throw error;

      const stats = data.reduce((acc, curr) => {
        acc[curr.job_type] = (acc[curr.job_type] || 0) + 1;
        return acc;
      }, {});

      setJobStats(Object.entries(stats).map(([job_type, count]) => ({ job_type, count })));
    } catch (error) {
      console.error('Error fetching job stats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch job statistics. Please try again later.'
      });
    }
  }

  const chartData = {
    labels: jobStats.map(stat => stat.job_type || 'Unspecified'),
    datasets: [
      {
        label: 'Number of Job Openings',
        data: jobStats.map(stat => stat.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f8f9fa'
        }
      },
      title: {
        display: true,
        text: 'Job Openings by Type',
        color: '#f8f9fa'
      },
    },
    scales: {
      x: {
        ticks: { color: '#f8f9fa' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#f8f9fa' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="container mt-5 text-light">Access Denied</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-light">Reports</h2>
      <div className="mt-4">
        {jobStats.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p className="text-light">No job data available.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;

