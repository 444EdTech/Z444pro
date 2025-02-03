import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import Swal from "sweetalert2"
import { Search, Users, Plus } from "lucide-react"

function CommunitiesList() {
  const [communities, setCommunities] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useContext(UserContext)
  const { theme, isDarkMode } = useContext(ThemeContext)

  useEffect(() => {
    fetchCommunities()
  }, [])

  async function fetchCommunities() {
    try {
      const { data, error } = await supabase.from("communities").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCommunities(data)
    } catch (error) {
      console.error("Error fetching communities:", error)
      Swal.fire("Error", "Failed to fetch communities. Please try again later.", "error")
    }
  }

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="gradient-text">Communities</h2>
        {user && (user.role === "guide" || user.role === "admin") && (
          <Link to="/create-community" className="btn btn-primary btn-cool">
            <Plus size={18} className="me-2" />
            Create Community
          </Link>
        )}
      </div>
      <div className="search-container mb-4">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ backgroundColor: theme.background, color: theme.text }}
          />
        </div>
      </div>
      <div className="row">
        {filteredCommunities.map((community) => (
          <div key={community.id} className="col-md-4 mb-4">
            <div
              className="card h-100 modern-card"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              }}
            >
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{community.name}</h5>
                <p className="card-text flex-grow-1">{community.description}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <Users size={16} className="me-1" />
                    {community.member_count || 0} members
                  </small>
                  <Link to={`/community/${community.id}`} className="btn btn-primary btn-sm">
                    View Community
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredCommunities.length === 0 && (
        <div className="text-center mt-5">
          <h3>No communities found</h3>
          <p>Try adjusting your search or create a new community!</p>
        </div>
      )}
    </div>
  )
}

export default CommunitiesList

