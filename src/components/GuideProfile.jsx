import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { UserContext } from "../contexts/UserContext";
import Swal from "sweetalert2";
import { FaEnvelope, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

function GuideProfile() {
  const [profile, setProfile] = useState(null);
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [id]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from(user.role === "learner" ? "guidesDB" : "learnersDB")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire("Error", "Failed to fetch profile details. Please try again later.", "error");
    }
  }

  function handleChatClick() {
    if (!user) {
      Swal.fire("Error", "You must be logged in to chat.", "error");
      return;
    }
    const conversationId =
      user.role === "learner" ? `${user.username}-${profile.user_name}` : `${profile.user_name}-${user.username}`;
    navigate(`/chats/${conversationId}`);
  }

  if (!profile) return <div className="text-center fs-4">Loading...</div>;

  // Split skillSet into an array
  const skillsArray = profile.skillSet ? profile.skillSet.split(",") : [];

  return (
    <div className="container mt-4">
      <div className="card bg-dark text-white rounded shadow-lg overflow-hidden">
        <div className="row g-0">
          {/* Image Section */}
          <div className="col-md-4 col-12 text-center p-3">
            <img
              src={profile.image ? `data:image/jpeg;base64,${profile.image}` : "/placeholder.svg"}
              className="img-fluid rounded"
              alt={profile.name}
              style={{ transition: "transform 0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
          {/* Content Section */}
          <div className="col-md-8 col-12 p-4">
            <h2 className="mb-3">{profile.name}</h2>
            {user.role === "learner" && <h4 className="text-muted">{profile.title}</h4>}

            {/* Skillset Section */}
            <h5 className="mt-4">Skillset:</h5>
            <div>
              {skillsArray.map((skill, index) => (
                <span key={index} className="badge bg-primary me-1 mb-1">
                  {skill.trim()} {/* Trim to remove any leading/trailing spaces */}
                </span>
              ))}
            </div>

            <br />

            {/* Work Experience Section */}
            {user.role === "learner" && profile.workExperience && (
              <div>
                <h5>Experience:</h5>
                {JSON.parse(profile.workExperience).map((exp, index) => (
                  <div key={index} 
                       className="bg-secondary text-white p-2 rounded mb-2"
                  >
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="me-2" />
                      <strong>{exp.company}</strong> - {exp.role}
                    </div>
                    <p>{exp.startDate} - {exp.isPresent ? "Present" : exp.endDate}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Location and Email Section */}
            <div className="d-flex align-items-center my-2">
              <FaMapMarkerAlt className="me-2" />
              <p className="mb-0">Location: {profile.currentLocation}</p>
            </div>
            <div className="d-flex align-items-center mb-4">
              <FaEnvelope className="me-2" />
              <p className="mb-0">Email: {profile.email}</p>
            </div>

            {/* Chat Button */}
            <button
              onClick={handleChatClick}
              className="btn btn-primary w-100"
            >
              Chat with {profile.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideProfile;
