import React from 'react';

function ProfilePopup({ show, onHide, userData, theme }) {
  if (!show) return null;

  return (
    <div className="modal" tabIndex="-1" role="dialog" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog" role="document">
        <div className="modal-content" style={{ backgroundColor: theme.background, color: theme.text }}>
          <div className="modal-header">
            <h5 className="modal-title">User Profile</h5>
            {/* <button type="button" className="close" onClick={onHide} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button> */}
          </div>
          <div className="modal-body">
            {userData && (
              <>
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Username:</strong> {userData.user_name}</p>
                <p><strong>Current Location:</strong> {userData.currentLocation}</p>
                <p><strong>Branch:</strong> {userData.branch}</p>
                <p><strong>College:</strong> {userData.college}</p>
                <p><strong>Year of Passout:</strong> {userData.yearOfPassout}</p>
                <p><strong>Skill Set:</strong> {userData.skillSet}</p>
                {userData.title && <p><strong>Title:</strong> {userData.title}</p>}
                {userData.resume && (
                    <a
                      href={`data:application/pdf;base64,${userData.resume}`}
                      download="resume.pdf"
                      className="btn btn-cool btn-secondary"
                    >
                      Download Resume
                    </a>
                  )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePopup;

