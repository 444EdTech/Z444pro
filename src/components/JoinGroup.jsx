import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import Swal from 'sweetalert2';

function JoinGroup() {
  const [availableGroups, setAvailableGroups] = useState([]);
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableGroups();
  }, []);

  async function fetchAvailableGroups() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*');

      if (error) throw error;

      const filteredGroups = data.filter(group => !group.members.includes(user.id));
      setAvailableGroups(filteredGroups);
    } catch (error) {
      console.error('Error fetching available groups:', error);
      Swal.fire('Error', 'Failed to fetch available groups. Please try again later.', 'error');
    }
  }

  async function handleJoinGroup(groupId) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('members')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      const updatedMembers = [...data.members, user.id];

      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: updatedMembers })
        .eq('id', groupId);

      if (updateError) throw updateError;

      Swal.fire('Success', 'You have joined the group!', 'success');
      navigate(`/chats`, { state: { activeGroup: groupId } });
    } catch (error) {
      console.error('Error joining group:', error);
      Swal.fire('Error', 'Failed to join group. Please try again.', 'error');
    }
  }

  return (
    <div className="join-group container mt-4" style={{ backgroundColor: theme.background, color: theme.text }}>
      <h2>Available Groups</h2>
      {availableGroups.length === 0 ? (
        <p>No available groups to join.</p>
      ) : (
        <ul className="list-group mt-3">
          {availableGroups.map(group => (
            <li key={group.id} className="list-group-item d-flex justify-content-between align-items-center" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}>
              <div>
                <h4>{group.name}</h4>
                <p>{group.description}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => handleJoinGroup(group.id)}>Join</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default JoinGroup;

