import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import Swal from 'sweetalert2';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupIcon, setGroupIcon] = useState('');
  const [createdGroups, setCreatedGroups] = useState([]);
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCreatedGroups();
  }, []);

  const handleFileChange = async (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Extract the Base64 string
        setGroupIcon(base64String);
      };

      reader.readAsDataURL(file); // Convert file to Base64
    }
  };


  async function fetchCreatedGroups() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreatedGroups(data);
    } catch (error) {
      console.error('Error fetching created groups:', error);
      Swal.fire('Error', 'Failed to fetch created groups. Please try again later.', 'error');
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    if (!groupName.trim() || !groupDescription.trim()) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          description: groupDescription,
          groupIcon: groupIcon,
          created_by: user.id,
          members: [user.id]
        })
        .select()
        .single();

      if (error) throw error;

      Swal.fire('Success', 'Group created successfully!', 'success');
      setGroupName('');
      setGroupDescription('');
      fetchCreatedGroups();
      navigate('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
      Swal.fire('Error', 'Failed to create group. Please try again.', 'error');
    }
  }

  const handleRedirectToGroup = (groupId) => {
    navigate(`/chats?group=${groupId}`);
  };

  return (
    <div className="create-group container mt-4" style={{ backgroundColor: theme.background, color: theme.text }}>
      <h2>Create New Group</h2>
      <form onSubmit={handleCreateGroup}>
        <div className="mb-3">
          <label htmlFor="groupName" className="form-label">Group Name</label>
          <input
            type="text"
            className="form-control"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="groupIcon" className="form-label">Group Icon</label>
          <input
            type="file"
            className="form-control"
            id="groupIcon"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'groupIcon')}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="groupDescription" className="form-label">Group Description</label>
          <textarea
            className="form-control"
            id="groupDescription"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            required
            style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Create Group</button>
      </form>

      {/* <h3 className="mt-5">Your Created Groups</h3>
      {createdGroups.length === 0 ? (
        <p>You haven't created any groups yet.</p>
      ) : (
        <ul className="list-group mt-3">
          {createdGroups.map(group => (
            <li key={group.id} className="list-group-item d-flex justify-content-between align-items-center" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}>
              <div>
                <h5>{group.name}</h5>
                <p>{group.description}</p>
              </div>
              <button onClick={() => handleRedirectToGroup(group.id)} className="btn btn-primary">
                Go to Group Chat
              </button>
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
}

export default CreateGroup;

