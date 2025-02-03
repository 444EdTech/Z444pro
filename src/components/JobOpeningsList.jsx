import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import Swal from "sweetalert2"
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

function JobOpeningsList() {
  const [jobOpenings, setJobOpenings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [jobType, setJobType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { user } = useContext(UserContext)
  const { isDarkMode } = useContext(ThemeContext)
 const now = new Date();
  const itemsPerPage = 9

  useEffect(() => {
    fetchJobOpenings()
  }, [currentPage, searchTerm, jobType, startDate, endDate])

  async function fetchJobOpenings() {
    try {
        setIsLoading(true);
        let query = supabase.from("job_openings").select(
            `*, guides:guidesDB(name)`,
            { count: "exact" },
        );

        if (searchTerm) {
            query = query.or(
                `jobRole.ilike.%${searchTerm}%,companyName.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`,
            );
        }

        if (jobType) {
            query = query.eq("jobType", jobType);
        }

        const { data, error, count } = await query
            .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const now = new Date("2025-01-29T00:00:00Z"); // Set current date to January 29, 2025
        const sortedJobs = data.filter(job => {
            const deadline = job.applicationDeadline ? new Date(job.applicationDeadline) : now;
            return deadline >= now; // Include jobs with today or future deadlines
        }).sort((a, b) => {
            const aDeadline = a.applicationDeadline ? new Date(a.applicationDeadline) : now;
            const bDeadline = b.applicationDeadline ? new Date(b.applicationDeadline) : now;

            // Normalize time to only consider the date
            aDeadline.setHours(0, 0, 0, 0);
            bDeadline.setHours(0, 0, 0, 0);

            // Check for today’s date
            const isADateToday = aDeadline.getTime() === now.getTime();
            const isBDateToday = bDeadline.getTime() === now.getTime();

            if (isADateToday && !isBDateToday) return -1; // a is today -> comes first
            if (!isADateToday && isBDateToday) return 1; // b is today -> comes first

            return aDeadline - bDeadline; // Sort by deadline date
        });

        setJobOpenings(sortedJobs);
        setTotalPages(Math.ceil(count / itemsPerPage));
    } catch (error) {
        console.error("Error fetching job openings:", error);
        Swal.fire("Error", "Failed to fetch job openings. Please try again.", "error");
    } finally {
        setIsLoading(false);
    }
}



  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  async function handleDelete(id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    })

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from("job_openings").delete().eq("id", id)

        if (error) throw error

        setJobOpenings(jobOpenings.filter((job) => job.id !== id))
        Swal.fire("Deleted!", "The job posting has been deleted.", "success")
      } catch (error) {
        console.error("Error deleting job opening:", error)
        Swal.fire("Error", "There was an error deleting the job posting.", "error")
      }
    }
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Job Openings</h2>
        {(user && user.role === "guide") || (user && user.role === "admin") ? (
          <Link to="/post-job" className="btn btn-primary">
            <FaPlus className="me-2" />
            Post New Job Opening
          </Link>
        ) : null}
      </div>

      {/* Filters Card */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={(e) => e.preventDefault()} className="mb-4">
            <div className="row mb-3 align-items-end">
              <div className="col-md-8">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search job openings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button" className="btn btn-primary" onClick={fetchJobOpenings}>
                    <FaSearch className="me-2" />
                    Search
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                  <option value="">Filter by Job Type</option>
                  <option value="Internship">Internship</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Date Filter Section */}
            <h5>Filter by Date Range:</h5>
            <div className="row">
              <div className="col-md-6 mb-2">
                <label htmlFor="start-date" className="form-label">Start Date:</label>
                <input
                  type="date"
                  id="start-date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-2">
                <label htmlFor="end-date" className="form-label">End Date:</label>
                <input
                  type="date"
                  id="end-date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button type="button" className="btn btn-secondary" onClick={fetchJobOpenings}>
              Apply Filters
            </button>
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">
          <FaSpinner className="fa-spin fa-3x" />
          <p className="mt-3">Loading job openings...</p>
        </div>
      ) : (
        <>
          <div className="row">
            {jobOpenings.map((job) => (
              <div key={job.id} className={`col-md-4 mb-4`}>
                <div className={`card h-100 ${isDarkMode ? "bg-dark text-light" : ""}`}>
                  <div className={`card-body`}>
                    <h5 className={`card-title`}>
                      {job.jobRole || "Untitled Position"} {job.companyName && `at ${job.companyName}`}
                    </h5>
                    <div className={`mb-2`}>
                      {job.jobType && (
                        <span className={`badge bg-secondary me-2`}>{job.jobType}</span>
                      )}
                      {job.location && (
                        <span className={`badge bg-info text-dark`}>
                          <FaMapMarkerAlt className={`me-1`} />
                          {job.location}
                        </span>
                      )}
                    </div>
                    <p className={`card-text`}>{job.content.substring(0, 150)}...</p>

                    {/* Application Deadline */}
                    {(job.applicationDeadline ? new Date(job.applicationDeadline).toISOString() : new Date().toISOString()) && (
                      <div 
                        className={`small ${new Date(job.applicationDeadline || new Date()).toDateString() === now.toDateString() ? 'bg-danger text-white' : 'text-muted'}`}>
                        Deadline: {formatDate(job.applicationDeadline || new Date())}
                      </div>
                    )}
                  </div>
                  <div className={`card-footer`}>
                    <div className={`d-flex justify-content-between align-items-center`}>
                      <small className={`text-muted`}>
                        Posted by {job.guides.name} on {formatDate(job.created_at)}
                      </small>

                      {/* Action Buttons */}
                      <div>
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-primary btn-sm me-2 ${new Date(job.applicationDeadline || new Date()) - new Date() <= 86400000 ? 'btn-danger' : ''}`}
                        >
                          Apply Now
                        </a>
                        {((user && user.role === "guide" && user.id === job.guide_id) ||
                          (user && user.role === "admin")) && (
                          <>
                            <Link to={`/edit-job/${job.id}`} 
                                  className={`btn btn-outline-secondary btn-sm me-2`}>
                              <FaEdit className={`me-1`} /> Edit
                            </Link>
                            <button 
                              className={`btn btn-outline-danger btn-sm`} 
                              onClick={() => handleDelete(job.id)}>
                              <FaTrash className={`me-1`} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Job openings pagination">
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button 
                      className={`page-link`} 
                      onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav> 
          )}
        </>
      )}
    </div>
  )
}

export default JobOpeningsList
