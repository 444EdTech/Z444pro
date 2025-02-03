import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import Swal from "sweetalert2"
import { Search } from "lucide-react"

function GuidesList() {
  const [guides, setGuides] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useContext(UserContext)
  const { theme, isDarkMode } = useContext(ThemeContext)

  useEffect(() => {
    fetchGuides()
  }, [])

  async function fetchGuides() {
    try {
      const { data, error } = await supabase.from("guidesDB").select("id, name, title, image, skillSet").order("name")

      if (error) throw error
      setGuides(data)
    } catch (error) {
      console.error("Error fetching guides:", error)
      Swal.fire("Error", "Failed to fetch guides. Please try again later.", "error")
    }
  }

  const filteredGuides = guides.filter(
    (guide) =>
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.skillSet.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mt-5">
      <h2 className="mb-4 gradient-text">Discover Our Guides</h2>
      <div className="search-container mb-4">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search guides by name, title, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ backgroundColor: theme.background, color: theme.text }}
          />
        </div>
      </div>
      <div className="row">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="col-md-4 mb-4">
            <div className={`card h-100 ${isDarkMode ? "bg-dark text-light" : "bg-light text-dark"} modern-card`} style={{ backgroundColor: theme.background, color: theme.text }}>
              <div className="card-body d-flex flex-column">
                <div className="text-center mb-3">
                  <img
                    src={guide.image ? `data:image/jpeg;base64,${guide.image}` : "/placeholder.svg"}
                    className="rounded-circle guide-avatar"
                    alt={guide.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
                <h5 className="card-title text-center">{guide.name}</h5>
                <p className="card-text text-center text-muted">{guide.title}</p>
                {/* <p className="card-text flex-grow-1">
                  <small>Skills: {guide.skillSet}</small>
                </p> */}
                <Link to={`/guide/${guide.id}`} className="btn btn-primary btn-block mt-auto">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GuidesList

