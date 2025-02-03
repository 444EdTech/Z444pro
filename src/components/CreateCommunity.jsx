import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import Swal from 'sweetalert2';

function CreateCommunity() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      Swal.fire('Success', 'Community created successfully!', 'success');
      navigate(`/community/${data.id}`);
    } catch (error) {
      console.error('Error creating community:', error);
      Swal.fire('Error', 'Failed to create community. Please try again.', 'error');
    }
  }

  return (
    <div className="container mt-5" style={{ color: theme.text }}>
      <h2>Create New Community</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="name">Community Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Create Community</button>
      </form>
    </div>
  );
}

export default CreateCommunity;

