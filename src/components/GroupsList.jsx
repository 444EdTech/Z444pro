import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import Swal from "sweetalert2"
import { Search } from "lucide-react"
import image from '../group.jpg'
import { useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSpinner,
  FaSearch,
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa"

function GroupsList() {
  const [groups, setGroups] = useState([])
  const [newGroups, setNewGroups] = useState([])
  const [enrolledGroups, setEnrolledGroups] = useState([])
  const [guideCreatedGroups, setGuideCreatedGroups] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useContext(UserContext)
  const { theme, isDarkMode } = useContext(ThemeContext)
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const { data, error } = await supabase.from("groups").select("*")

      if (error) throw error

      const filteredGroups = data.filter(group => !group.members.includes(user.id));
      setNewGroups(filteredGroups);

      const filteredGroups1 = data.filter(group => group.members.includes(user.id));
      setEnrolledGroups(filteredGroups1);

      const filteredGroups2 = data.filter(group => (group.created_by == user.id));
      setGuideCreatedGroups(filteredGroups2);

      setGroups(data)
    } catch (error) {
      console.error("Error fetching groups:", error)
      Swal.fire("Error", "Failed to fetch groups. Please try again later.", "error")
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

  async function handleOpenGroup(groupId) {
    navigate(`/chats`, { state: { activeGroup: groupId } });
  }

  const filteredNewGroups = newGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrolledGroups = enrolledGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCreatedGroups = guideCreatedGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Join Our Groups</h2>
        {(user && user.role === "guide") || (user && user.role === "admin") ? (
          <Link to="/create-group" className="btn btn-primary">
            <FaPlus className="me-2" />
            Create New Group
          </Link>
        ) : null}
      </div>

      <div className="search-container mb-4">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search group by name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ backgroundColor: theme.background, color: theme.text }}
          />
        </div>
      </div>

      {(user && user.role === "guide") || (user && user.role === "admin") ? (
          <div className="row">
          <h3>Your Groups</h3>
          {filteredCreatedGroups.length == 0 ? (<p className="text-center text-muted">you haven't created any groups yet.</p>) : filteredCreatedGroups.map((group) => (
            <div key={group.id} className="col-md-4 mb-4">
              <div className="card h-100 modern-card" style={{ backgroundColor: theme.background, color: theme.text }}>
                <div className="card-body d-flex flex-column">
                  <div className="text-center mb-3">
                  <img
                    src={group.groupIcon ? `data:image/jpeg;base64,${group.groupIcon}` : "/placeholder.svg"}
                    className="rounded-circle guide-avatar"
                    alt={group.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  </div>
                  <h5 className="card-title text-center">Name: {group.name}</h5>
                  <p className="card-text text-center text-muted">Description: {group.description}</p>
                  <button className="btn btn-primary btn-sm" onClick={() => handleOpenGroup(group.id)}>Open Group</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : null}

        <hr />

      <div className="row">
        {(user && user.role === "guide") || (user && user.role === "admin") ? (<h3>Other new groups</h3>) : (<h3>New groups</h3>)}
        
        {filteredNewGroups.length == 0 ? (<p className="text-center text-muted">No new groups.</p>) : filteredNewGroups.map((group) => (
          <div key={group.id} className="col-md-4 mb-4">
            <div className="card h-100 modern-card" style={{ backgroundColor: theme.background, color: theme.text }}>
              <div className="card-body d-flex flex-column">
                <div className="text-center mb-3">
                <img
                    src={group.groupIcon ? `data:image/jpeg;base64,${group.groupIcon}` : "/placeholder.svg"}
                    className="rounded-circle guide-avatar"
                    alt={group.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
                <h5 className="card-title text-center">Name: {group.name}</h5>
                <p className="card-text text-center text-muted">Description: {group.description}</p>
                {/* <p className="card-text flex-grow-1">
                  <small>Skills: {guide.skillSet}</small>
                </p> */}
                <button className="btn btn-primary btn-sm" onClick={() => handleJoinGroup(group.id)}>Join</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <hr />

      <div className="row">
        <h3>Enrolled Groups</h3>
        {filteredEnrolledGroups.length == 0 ? (<p className="text-center text-muted">No enrolled groups.</p>) : filteredEnrolledGroups.map((group) => (
          <div key={group.id} className="col-md-4 mb-4">
            <div className="card h-100 modern-card" style={{ backgroundColor: theme.background, color: theme.text }}>
              <div className="card-body d-flex flex-column">
                <div className="text-center mb-3">
                <img
                    src={group.groupIcon ? `data:image/jpeg;base64,${group.groupIcon}` : "/placeholder.svg"}
                    className="rounded-circle guide-avatar"
                    alt={group.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
                <h5 className="card-title text-center">Name: {group.name}</h5>
                <p className="card-text text-center text-muted">Description: {group.description}</p>
                {/* <p className="card-text flex-grow-1">
                  <small>Skills: {guide.skillSet}</small>
                </p> */}
                <button className="btn btn-primary btn-sm" onClick={() => handleOpenGroup(group.id)}>Open Group</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupsList

