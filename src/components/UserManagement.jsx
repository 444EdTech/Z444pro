import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';
import { UserContext } from '../contexts/UserContext';
import Swal from 'sweetalert2';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data: learners, error: learnersError } = await supabase
        .from('learnersDB')
        .select('id, user_name, email, name')
        .order('name');

      const { data: guides, error: guidesError } = await supabase
        .from('guidesDB')
        .select('id, user_name, email, name')
        .order('name');

      if (learnersError) throw learnersError;
      if (guidesError) throw guidesError;

      const allUsers = [
        ...learners.map(l => ({ ...l, role: 'learner' })),
        ...guides.map(g => ({ ...g, role: 'guide' }))
      ];

      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire('Error', 'Failed to fetch users', 'error');
    }
  }

  async function handleDeleteUser(id, role) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from(role === 'learner' ? 'learnersDB' : 'guidesDB')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setUsers(users.filter(user => user.id !== id));
        Swal.fire('Deleted!', 'The user has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire('Error', 'Failed to delete user', 'error');
      }
    }
  }

  if (!user || user.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="container mt-5">
      <h2>User Management</h2>
      <table className="table table-striped table-dark mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.user_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteUser(user.id, user.role)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;

