import React, { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import Swal from "sweetalert2"
import { FaBriefcase, FaBuilding, FaLink, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt } from "react-icons/fa"

function EditJobOpeningForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const [formData, setFormData] = useState({
    content: "",
    source: "",
    link: "",
    yearsOfExperience: "",
    jobType: "",
    jobRole: "",
    location: "",
    salary: "",
    applicationDeadline: "",
    companyName: "",
  })

  useEffect(() => {
    fetchJobOpening()
  }, []) // Removed unnecessary dependency 'id'

  async function fetchJobOpening() {
    try {
      const { data, error } = await supabase.from("job_openings").select("*").eq("id", id).single()

      if (error) throw error

      if (data.guide_id !== user.id && user.role !== "admin") {
        Swal.fire("Error", "You are not authorized to edit this job posting.", "error")
        navigate("/job-openings")
        return
      }

      setFormData(data)
    } catch (error) {
      console.error("Error fetching job opening:", error)
      Swal.fire("Error", "Failed to fetch job opening details.", "error")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.content || !formData.link) {
      Swal.fire("Error", "Content and Link are required", "error")
      return
    }

    const processedData = {
      ...formData,
      applicationDeadline: formData.applicationDeadline || null,
      yearsOfExperience: formData.yearsOfExperience || null,
    }

    try {
      const { data, error } = await supabase.from("job_openings").update(processedData).eq("id", id)

      if (error) throw error

      Swal.fire("Success", "Job opening updated successfully!", "success")
      navigate("/job-openings")
    } catch (error) {
      console.error("Error updating job opening:", error)
      Swal.fire("Error", "Failed to update job opening. Please try again.", "error")
    }
  }

  if (!user || (user.role !== "guide" && user.role !== "admin")) {
    return <div className="alert alert-danger">You must be logged in as a guide or admin to edit job openings.</div>
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Edit Job Opening</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="jobRole" className="form-label">
                    <FaBriefcase className="me-2" />
                    Job Role *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="jobRole"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="companyName" className="form-label">
                    <FaBuilding className="me-2" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">
                    Job Description *
                  </label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    rows="5"
                    value={formData.content}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="link" className="form-label">
                    <FaLink className="me-2" />
                    Application Link *
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="jobType" className="form-label">
                      Job Type
                    </label>
                    <select
                      className="form-select"
                      id="jobType"
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                    >
                      <option value="">Select Job Type</option>
                      <option value="Internship">Internship</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="yearsOfExperience" className="form-label">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    <FaMapMarkerAlt className="me-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="salary" className="form-label">
                    <FaMoneyBillWave className="me-2" />
                    Salary
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="applicationDeadline" className="form-label">
                    <FaCalendarAlt className="me-2" />
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="applicationDeadline"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="source" className="form-label">
                    Source
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Update Job Opening
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditJobOpeningForm

