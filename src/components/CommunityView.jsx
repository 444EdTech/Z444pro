import React, { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import Swal from "sweetalert2"
import { Send, Users } from "lucide-react"

function CommunityView() {
  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState("")
  const { id } = useParams()
  const { user } = useContext(UserContext)
  const { theme, isDarkMode } = useContext(ThemeContext)

  useEffect(() => {
    fetchCommunity()
    fetchPosts()
  }, [id]) //Corrected dependency array

  async function fetchCommunity() {
    try {
      const { data, error } = await supabase.from("communities").select("*").eq("id", id).single()

      if (error) throw error
      setCommunity(data)
    } catch (error) {
      console.error("Error fetching community:", error)
      Swal.fire("Error", "Failed to fetch community details. Please try again later.", "error")
    }
  }

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*, users:user_id(*)")
        .eq("community_id", id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      Swal.fire("Error", "Failed to fetch posts. Please try again later.", "error")
    }
  }

  async function handleSubmitPost(e) {
    e.preventDefault()
    if (!newPost.trim()) return

    try {
      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          community_id: id,
          user_id: user.id,
          content: newPost,
        })
        .select()
        .single()

      if (error) throw error

      setPosts([data, ...posts])
      setNewPost("")
    } catch (error) {
      console.error("Error creating post:", error)
      Swal.fire("Error", "Failed to create post. Please try again.", "error")
    }
  }

  if (!community) return <div className="container mt-5">Loading...</div>

  return (
    <div className="container mt-5" style={{ color: theme.text }}>
      <div className="card mb-4" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="card-body">
          <h2 className="card-title gradient-text">{community.name}</h2>
          <p className="card-text">{community.description}</p>
          <div className="d-flex align-items-center">
            <Users size={18} className="me-2" />
            <span>{community.member_count || 0} members</span>
          </div>
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmitPost} className="mb-4">
          <div className="form-group">
            <textarea
              className="form-control"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Write a post..."
              rows="3"
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary mt-2">
            <Send size={18} className="me-2" />
            Post
          </button>
        </form>
      )}

      {posts.map((post) => (
        <div
          key={post.id}
          className="card mb-3"
          style={{ backgroundColor: theme.background, borderColor: theme.border }}
        >
          <div className="card-body">
            <div className="d-flex align-items-center mb-2">
              <img
                src={post.users.image ? `data:image/jpeg;base64,${post.users.image}` : "/placeholder.svg"}
                alt={post.users.name}
                className="rounded-circle me-2"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div>
                <h5 className="card-title mb-0">{post.users.name}</h5>
                <small className="text-muted">{new Date(post.created_at).toLocaleString()}</small>
              </div>
            </div>
            <p className="card-text">{post.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommunityView

