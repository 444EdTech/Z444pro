import React, { useState, useContext, useEffect } from "react"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import { supabase } from "../supabase"
import Swal from "sweetalert2"
import { FaLinkedin, FaInstagram, FaFacebook, FaCode, FaEdit, FaSave, FaGithub } from "react-icons/fa"
import { SiCodechef, SiCodeforces } from "react-icons/si"
import "../styles/UserProfile.css"

function UserProfile() {
  const { user, login } = useContext(UserContext)
  const { theme, isDarkMode } = useContext(ThemeContext)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    currentLocation: "",
    skillSet: "",
    username: "",
    branch: "",
    college: "",
    yearOfPassout: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    leetcode: "",
    codechef: "",
    codeforces: "",
    gfg: "",
    github: "",
  })
  const [resume, setResume] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from(user.role === "learner" ? "learnersDB" : "guidesDB")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) throw error

      setFormData({
        name: data.name || "",
        email: data.email || "",
        mobileNumber: data.mobileNumber || "",
        currentLocation: data.currentLocation || "",
        skillSet: data.skillSet || "",
        username: data.user_name || "",
        branch: data.branch || "",
        college: data.college || "",
        yearOfPassout: data.yearOfPassout || "",
        linkedin: data.profiles ? JSON.parse(data.profiles).linkedin || "" : "",
        instagram: data.profiles ? JSON.parse(data.profiles).instagram || "" : "",
        facebook: data.profiles ? JSON.parse(data.profiles).facebook || "" : "",
        leetcode: data.profiles ? JSON.parse(data.profiles).leetcode || "" : "",
        codechef: data.profiles ? JSON.parse(data.profiles).codechef || "" : "",
        codeforces: data.profiles ? JSON.parse(data.profiles).codeforces || "" : "",
        gfg: data.profiles ? JSON.parse(data.profiles).gfg || "" : "",
        github: data.profiles ? JSON.parse(data.profiles).github || "" : "",
      })
      setResume(data.resume || null)
      setPhoto(data.image || null)
    } catch (error) {
      console.error("Error fetching user data:", error)
      Swal.fire("Error", "Failed to fetch user data. Please try again.", "error")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === "resume") {
          setResume(reader.result.split(",")[1])
        } else if (type === "photo") {
          setPhoto(reader.result.split(",")[1])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const profiles = {
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        facebook: formData.facebook,
        leetcode: formData.leetcode,
        codechef: formData.codechef,
        codeforces: formData.codeforces,
        gfg: formData.gfg,
        github: formData.github,
      }

      const { data, error } = await supabase
        .from(user.role === "learner" ? "learnersDB" : "guidesDB")
        .update({
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          currentLocation: formData.currentLocation,
          skillSet: formData.skillSet,
          user_name: formData.username,
          branch: formData.branch,
          college: formData.college,
          yearOfPassout: formData.yearOfPassout,
          profiles: JSON.stringify(profiles),
          resume: resume,
          image: photo,
        })
        .eq("id", user.id)

      if (error) throw error

      login({ ...user, ...formData })
      setIsEditing(false)
      Swal.fire("Success", "Profile updated successfully!", "success")
    } catch (error) {
      console.error("Error updating profile:", error)
      Swal.fire("Error", "Failed to update profile. Please try again.", "error")
    }
  }

  if (!user) {
    return <div style={{ color: theme.text }}>Please log in to view your profile.</div>
  }

  return (
    <div className="container mt-5">
      <div
        className="card shadow-lg user-profile-card glassmorphism"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <div className="card-body">
          <h2 className="card-title text-center mb-4 gradient-text">User Profile</h2>
          <div className="row">
            <div className="col-md-4 text-center">
              <div className="mb-4 position-relative">
                {photo ? (
                  <img src={`data:image/jpeg;base64,${photo}`} alt="Profile" className="rounded-circle profile-photo" />
                ) : (
                  <div className="profile-photo-placeholder">
                    <span>{formData.name.charAt(0)}</span>
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="photo" className="btn btn-sm btn-primary photo-edit-button">
                    <FaEdit /> Edit
                  </label>
                )}
              </div>
              {!isEditing && (
                <div className="d-grid gap-2">
                  <button className="btn btn-cool btn-primary" onClick={() => setIsEditing(true)}>
                    <FaEdit className="me-2" /> Edit Profile
                  </button>
                  {resume && (
                    <a
                      href={`data:application/pdf;base64,${resume}`}
                      download="resume.pdf"
                      className="btn btn-cool btn-secondary"
                    >
                      Download Resume
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="col-md-8">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="mobileNumber" className="form-label">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="currentLocation" className="form-label">
                      Current Location
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="currentLocation"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="branch" className="form-label">
                      Branch
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="college" className="form-label">
                      College
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="yearOfPassout" className="form-label">
                      Year of Passout
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="yearOfPassout"
                      name="yearOfPassout"
                      value={formData.yearOfPassout}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="skillSet" className="form-label">
                      Skill Set
                    </label>
                    <textarea
                      className="form-control"
                      id="skillSet"
                      name="skillSet"
                      value={formData.skillSet}
                      onChange={handleChange}
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="photo" className="form-label">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="photo"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "photo")}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="resume" className="form-label">
                      Resume (PDF)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="resume"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "resume")}
                    />
                  </div>
                  <h5 className="mt-4 mb-3">Social Profiles</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="linkedin" className="form-label">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="github" className="form-label">
                        GitHub
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="github"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="leetcode" className="form-label">
                        LeetCode
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="leetcode"
                        name="leetcode"
                        value={formData.leetcode}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="codechef" className="form-label">
                        CodeChef
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="codechef"
                        name="codechef"
                        value={formData.codechef}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="codeforces" className="form-label">
                        Codeforces
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="codeforces"
                        name="codeforces"
                        value={formData.codeforces}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="gfg" className="form-label">
                        GeeksforGeeks
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="gfg"
                        name="gfg"
                        value={formData.gfg}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <button type="submit" className="btn btn-cool btn-primary me-2">
                      <FaSave className="me-2" /> Save Changes
                    </button>
                    <button type="button" className="btn btn-cool btn-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h4 className="mb-3">Personal Information</h4>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Name:</strong> {formData.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Username:</strong> {formData.username}
                      </p>
                      <p>
                        <strong>Mobile Number:</strong> {formData.mobileNumber}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Current Location:</strong> {formData.currentLocation}
                      </p>
                      <p>
                        <strong>Branch:</strong> {formData.branch}
                      </p>
                      <p>
                        <strong>College:</strong> {formData.college}
                      </p>
                      <p>
                        <strong>Year of Passout:</strong> {formData.yearOfPassout}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h5>Skills</h5>
                    <p>{formData.skillSet}</p>
                  </div>
                  <div className="mt-4">
                    <h5>Social Profiles</h5>
                    <div className="d-flex flex-wrap">
                      {formData.linkedin && (
                        <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="me-3 mb-2">
                          <FaLinkedin size={24} />
                        </a>
                      )}
                      {formData.github && (
                        <a href={formData.github} target="_blank" rel="noopener noreferrer" className="me-3 mb-2">
                          <FaGithub size={24} />
                        </a>
                      )}
                      {formData.leetcode && (
                        <a href={formData.leetcode} target="_blank" rel="noopener noreferrer" className="me-3 mb-2">
                          {/* <FaLeetcode size={24} /> */}
                        </a>
                      )}
                      {formData.codechef && (
                        <a href={formData.codechef} target="_blank" rel="noopener noreferrer" className="me-3 mb-2">
                          <SiCodechef size={24} />
                        </a>
                      )}
                      {formData.codeforces && (
                        <a href={formData.codeforces} target="_blank" rel="noopener noreferrer" className="me-3 mb-2">
                          <SiCodeforces size={24} />
                        </a>
                      )}
                      {formData.gfg && (
                        <a href={formData.gfg} target="_blank" rel="noopener noreferrer" className="me-3 mb-2">
                          <FaCode size={24} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile

