import React, { useContext, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from "react-router-dom"
import { UserProvider, UserContext } from "./contexts/UserContext"
import { ThemeProvider, ThemeContext } from "./contexts/ThemeContext"
import LearnerLogin from "./components/LearnerLogin"
import GuideLogin from "./components/GuideLogin"
import AdminLogin from "./components/AdminLogin"
import LearnerRegister from "./components/LearnerRegister"
import GuideRegister from "./components/GuideRegister"
import UserProfile from "./components/UserProfile"
import JobOpeningsForm from "./components/JobOpeningsForm"
import JobOpeningsList from "./components/JobOpeningsList"
import EditJobOpeningForm from "./components/EditJobOpeningForm"
import AdminDashboard from "./components/AdminDashboard"
import UserManagement from "./components/UserManagement"
import Reports from "./components/Reports"
import GuidesList from "./components/GuidesList"
import GuideProfile from "./components/GuideProfile"
import ChatWindow from "./components/ChatWindow"
import ChatsList from "./components/ChatsList"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min"
import Home from "./Home"
import "./custom.css"
import { loadFonts } from "./fonts"
import { FaSun, FaMoon, FaUser, FaSignOutAlt } from "react-icons/fa"
import CommunitiesList from "./components/CommunitiesList"
import CommunityView from "./components/CommunityView"
import CreateCommunity from "./components/CreateCommunity"
import CreateGroup from "./components/CreateGroup"
import JoinGroup from "./components/JoinGroup"
import GroupsList from "./components/GroupsList"
import QuoteComponent from "./components/QuoteComponent"

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useContext(UserContext)

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}

function Navbar() {
  const { user, logout } = useContext(UserContext)
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  const { pathname } = useLocation()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="gradient-text font-weight-bold">Z444++</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link animated-underline">
                Home
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link to="/job-openings" className="nav-link animated-underline">
                    Job Openings
                  </Link>
                </li>
                {user.role === "learner" && (
                  <li className="nav-item">
                    <Link to="/guides" className="nav-link animated-underline">
                      Guides
                    </Link>
                  </li>
                )}
                {(user.role === "learner" || user.role === "guide") && (
                  <>
                    <li className="nav-item">
                      <Link to="/chats" className="nav-link animated-underline">
                        Chats
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/groups" className="nav-link animated-underline">
                        Groups
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <Link to="/communities" className="nav-link animated-underline">
                    Communities
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {!user && (
              <>
                <li className="nav-item">
                  <Link to="/login/learner" className="nav-link btn btn-cool btn-sm me-2">
                    Learner Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login/guide" className="nav-link btn btn-cool btn-sm me-2">
                    Guide Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login/admin" className="nav-link btn btn-cool btn-sm me-2">
                    Admin Login
                  </Link>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link btn btn-cool btn-sm me-2">
                    <FaUser className="me-1" /> Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button onClick={logout} className="nav-link btn btn-cool btn-sm me-2">
                    <FaSignOutAlt className="me-1" /> Logout
                  </button>
                </li>
              </>
            )}
            <li className="nav-item">
              <button onClick={toggleTheme} className={`btn btn-cool btn-sm ${isDarkMode ? "btn-light" : "btn-dark"}`}>
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

function App() {
  const { theme } = useContext(ThemeContext)
  const { isDarkMode } = useContext(ThemeContext)

  useEffect(() => {
    loadFonts()
  }, [])

  return (
    <div
      className={`min-vh-100 ${isDarkMode ? "dark-mode" : ""}`}
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quote" element={<QuoteComponent />} />
          <Route path="/login/learner" element={<LearnerLogin />} />
          <Route path="/login/guide" element={<GuideLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/register/learner" element={<LearnerRegister />} />
          <Route path="/register/guide" element={<GuideRegister />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={["learner", "guide", "admin"]}>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route path="/job-openings" element={<JobOpeningsList />} />
          <Route
            path="/post-job"
            element={
              <PrivateRoute allowedRoles={["guide", "admin"]}>
                <JobOpeningsForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-job/:id"
            element={
              <PrivateRoute allowedRoles={["guide", "admin"]}>
                <EditJobOpeningForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/guides"
            element={
              <PrivateRoute allowedRoles={["learner"]}>
                <GuidesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/guide/:id"
            element={
              <PrivateRoute allowedRoles={["learner"]}>
                <GuideProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <PrivateRoute allowedRoles={["learner", "guide"]}>
                <ChatsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats/:id"
            element={
              <PrivateRoute allowedRoles={["learner", "guide"]}>
                <ChatsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <PrivateRoute allowedRoles={["learner", "guide"]}>
                <GroupsList />
              </PrivateRoute>
            }
          />
          <Route path="/communities" element={<CommunitiesList />} />
          <Route path="/community/:id" element={<CommunityView />} />
          <Route
            path="/create-community"
            element={
              <PrivateRoute allowedRoles={["guide", "admin"]}>
                <CreateCommunity />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-group"
            element={
              <PrivateRoute allowedRoles={["guide"]}>
                <CreateGroup />
              </PrivateRoute>
            }
          />
          <Route
            path="/join-group"
            element={
              <PrivateRoute allowedRoles={["learner"]}>
                <JoinGroup />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  )
}

function AppWithProviders() {
  return (
    <Router>
      <UserProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </UserProvider>
    </Router>
  )
}

export default AppWithProviders

