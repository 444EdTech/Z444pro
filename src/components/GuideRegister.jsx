import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { FaLinkedin, FaInstagram, FaFacebook, FaCode, FaPlus, FaTrash } from 'react-icons/fa';
import { SiLeetcode, SiCodechef, SiCodeforces } from 'react-icons/si';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';

function GuideRegister() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    mobile: '',
    branch: '',
    college: '',
    yearOfPassout: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    leetcode: '',
    codechef: '',
    codeforces: '',
    gfg: '',
    skillSet: '',
    workExperiences: [{
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      isPresent: true
    }],
    currentLocation: '',
    title: '',
    name: '',
    mobileNumber: ''
  });
  const [resume, setResume] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const navigate = useNavigate();

  const hashPassword = async (password) => {
    try {
      const salt = await bcrypt.genSalt(10); // Salt rounds (higher value = stronger)
      const hashedPassword = await bcrypt.hash(password, salt); // Hash password
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWorkExperienceChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedWorkExperiences = formData.workExperiences.map((exp, i) => {
      if (i === index) {
        if (name === 'isPresent') {
          return { ...exp, [name]: checked, endDate: checked ? '' : exp.endDate };
        }
        return { ...exp, [name]: type === 'checkbox' ? checked : value };
      }
      if (name === 'isPresent' && checked) {
        return { ...exp, isPresent: false, endDate: exp.endDate || '' };
      }
      return exp;
    });

    setFormData({ ...formData, workExperiences: updatedWorkExperiences });
  };

  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperiences: [
        { company: '', role: '', startDate: '', endDate: '', isPresent: false },
        ...formData.workExperiences.map(exp => ({ ...exp, isPresent: false }))
      ],
    });
  };

  const removeWorkExperience = (index) => {
    const updatedWorkExperiences = formData.workExperiences.filter((_, i) => i !== index);
    setFormData({ ...formData, workExperiences: updatedWorkExperiences });
  };

  const createProfileObject = () => {
    const profileObj = { linkedin: formData.linkedin, instagram: formData.instagram, facebook: formData.facebook, leetcode: formData.leetcode, codechef: formData.codechef, codeforces: formData.codeforces, gfg: formData.gfg };
    return profileObj;
  };

  const handleFileChange = async (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Extract the Base64 string
        if (type === 'resume') {
          setResume(base64String); // Store Base64 encoded resume
        } else {
          setProfileImage(base64String); // Store Base64 encoded image
        }
      };

      reader.readAsDataURL(file); // Convert file to Base64
    }
  };

  const validateDateFormat = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(date);
  };

  const checkEmailAndUsernameExist = async (email, username) => {
    const { data: emailData, error: emailError } = await supabase
      .from('guidesDB')
      .select('email')
      .eq('email', email);

    if (emailError) {
      console.error('Error checking email:', emailError);
      throw emailError;
    }

    const { data: usernameData, error: usernameError } = await supabase
      .from('guidesDB')
      .select('user_name')
      .eq('user_name', username);

    if (usernameError) {
      console.error('Error checking username:', usernameError);
      throw usernameError;
    }

    return {
      emailExists: emailData.length > 0,
      usernameExists: usernameData.length > 0
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.workExperiences.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'At least one work experience is required.'
      });
      return;
    }

    try {
      const { emailExists, usernameExists } = await checkEmailAndUsernameExist(formData.email, formData.username);

      if (emailExists) {
        Swal.fire({
          icon: 'error',
          title: 'Email Already Registered',
          text: 'This email is already registered. Please use a different email.'
        });
        return;
      }

      if (usernameExists) {
        Swal.fire({
          icon: 'error',
          title: 'Username Taken',
          text: 'This username is already taken. Please choose a different username.'
        });
        return;
      }

      await sendPinEmail(formData.email);
      setShowPinVerification(true);
    } catch (error) {
      console.error('Error during registration:', error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Error',
        text: 'An error occurred during registration. Please try again.'
      });
    }
  };

  const sendPinEmail = async (email) => {
    try {
      const emailvalue = email; 
      const BASE_URL = process.env.REACT_APP_APPSCRIPTS_BASE_URL;
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',  // Content-Type set as plain text
        },
        body: emailvalue,
      });
  
      // Extract plain text from the response
      const responseText = await response.text();
  
      if (responseText === 'SUCCESS') {
        console.log('PIN generated and sent successfully!');
        return true;
      } else {
        console.error('Error:', responseText);
        throw new Error(responseText);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  const verifyPin = async (email, enteredPin) => {
    try {
      const emailandpinvalue = `${email},${enteredPin}`;
      const BASE_URL = process.env.REACT_APP_APPSCRIPTS_BASE_URL;
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',  // Content-Type set as plain text
        },
        body: emailandpinvalue, 
      });
  
      // Extract plain text from the response
      const responseText = await response.text();
  
      if (responseText === 'SUCCESS') {
        console.log('PIN verified successfully!');
        return true;
      } else {
        console.error('Error:', responseText);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };
  
  const handlePinVerified = async () => {
    try {
      const hashedpassword = await hashPassword(formData.password);

      const supabaseInsertObject = {
        user_name: formData.username,
        email: formData.email,
        password: hashedpassword,
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        branch: formData.branch,
        college: formData.college,
        yearOfPassout: formData.yearOfPassout,
        resume: resume,
        image: profileImage,
        workExperience: JSON.stringify(formData.workExperiences),
        skillSet: formData.skillSet,
        currentLocation: formData.currentLocation,
        profiles: JSON.stringify(createProfileObject()),
        title: formData.title
      };

      const { error: uploadError } = await supabase.from('guidesDB').insert([supabaseInsertObject]);

      if (uploadError) throw uploadError;

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'You have been successfully registered!',
      }).then(() => {
        navigate('/dashboard/guide');
      });
    } catch (error) {
      console.error('Error registering:', error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'An error occurred while registering. Please try again.',
      });
    }
  };

  const PinVerification = ({ email, onVerified, onResend, onClose }) => {
    const [enteredPin, setEnteredPin] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            setCanResend(true);
            clearInterval(interval);
          }
          return prevTimer - 1;
        });
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);
  
    const handlePinChange = (index, value) => {
      const newPin = [...enteredPin];
      newPin[index] = value;
      setEnteredPin(newPin);
  
      // Focus on the next input field when a digit is entered
      if (value && index < 3) {
        document.getElementById(`pin-${index + 1}`).focus();
      }
    };
  
    const handleResend = () => {
      setTimer(30);
      setCanResend(false);
      onResend();
    };
  
    const handleVerify = () => {
      const pin = enteredPin.join('');
      verifyPin(email, pin).then((isValid) => {
        if (isValid) {
          onVerified();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid PIN',
            text: 'The entered PIN is incorrect. Please try again.',
          });
        }
      });
    };
  
    const handleClose = () => {
      onClose();
    };
  
    return (
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Email Verification</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleClose}
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-4">Enter the 4-digit PIN sent to {email}</p>
              <div className="d-flex justify-content-center mb-4">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="text"
                    className="form-control mx-1 text-center"
                    style={{ width: '40px' }}
                    maxLength="1"
                    value={enteredPin[index]}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResend}
                disabled={!canResend}
              >
                {canResend ? 'Resend PIN' : `Resend in ${timer}s`}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleVerify} // Call handleVerify on button click
                disabled={enteredPin.some(digit => digit === '')}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-lg bg-dark text-light">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-5 text-primary">Guide Registration</h2>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="username"
                        type="text"
                        className="form-control bg-dark text-light"
                        id="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="username">Username</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="name"
                        type="text"
                        className="form-control bg-dark text-light"
                        id="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="name">Full Name</label>
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-12">
                    <div className="form-floating mb-3">
                      <input
                        name="title"
                        type="text"
                        className="form-control bg-dark text-light"
                        id="title"
                        placeholder="Professional Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="title">Professional Title (e.g., Software Engineer at DigitalTrust)</label>
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="email"
                        type="email"
                        className="form-control bg-dark text-light"
                        id="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="email">Email</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="password"
                        type="password"
                        className="form-control bg-dark text-light"
                        id="password"
                        placeholder="Create Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="password">Password</label>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="mobileNumber"
                        type="tel"
                        className="form-control bg-dark text-light"
                        id="mobileNumber"
                        placeholder="Mobile Number"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="mobileNumber">Mobile Number</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="branch"
                        type="text"
                        className="form-control bg-dark text-light"
                        id="branch"
                        placeholder="Branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="branch">Branch</label>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="college"
                        type="text"
                        className="form-control bg-dark text-light"
                        id="college"
                        placeholder="College"
                        value={formData.college}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="college">College</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        name="yearOfPassout"
                        type="number"
                        className="form-control bg-dark text-light"
                        id="yearOfPassout"
                        placeholder="Year of Passout"
                        value={formData.yearOfPassout}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="yearOfPassout">Year of Passout</label>
                    </div>
                  </div>
                </div>

                <h4 className="mb-3 text-primary">Profile Links</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group mb-3 bg-dark">
                      <span className="input-group-text bg-dark text-light"><FaLinkedin /></span>
                      <input
                        name="linkedin"
                        type="url"
                        className="form-control bg-dark text-light"
                        placeholder="LinkedIn Profile"
                        value={formData.linkedin}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group mb-3 bg-dark">
                      <span className="input-group-text bg-dark text-light"><FaInstagram /></span>
                      <input
                        name="instagram"
                        type="url"
                        className="form-control bg-dark text-light"
                        placeholder="Instagram Profile"
                        value={formData.instagram}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group mb-3 bg-dark">
                      <span className="input-group-text bg-dark text-light"><FaFacebook /></span>
                      <input
                        name="facebook"
                        type="url"
                        className="form-control bg-dark text-light"
                        placeholder="Facebook Profile"
                        value={formData.facebook}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group mb-3 bg-dark">
                      <span className="input-group-text bg-dark text-light"><SiLeetcode /></span>
                      <input
                        name="leetcode"
                        type="url"
                        className="form-control bg-dark text-light"
                        placeholder="LeetCode Profile"
                        value={formData.leetcode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group mb-3 bg-dark">
                      <span className="input-group-text bg-dark text-light"><SiCodechef /></span>
                      <input
                        name="codechef"
                        type="url"
                        className="form-control bg-dark text-light"
                        placeholder="CodeChef Profile"
                        value={formData.codechef}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group mb-3 bg-dark">
                      <span className="input-group-text bg-dark text-light"><SiCodeforces /></span>
                      <input
                        name="codeforces"
                        type="url"
                        className="form-control bg-dark text-light"
                        placeholder="Codeforces Profile"
                        value={formData.codeforces}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group mb-3 bg-dark">
                      <span className="input-group-text bg-dark text-light"><FaCode /></span>
                      <input
                        name="gfg"
                        type="url"
                        className="form-control bg-dark text-light"
                        placeholder="GeeksforGeeks Profile"
                        value={formData.gfg}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-floating mb-3">
                  <textarea
                    name="skillSet"
                    className="form-control bg-dark text-light"
                    placeholder="Skill Set"
                    id="skillSet"
                    style={{ height: '100px' }}
                    value={formData.skillSet}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <label htmlFor="skillSet">Skill Set (comma-separated)</label>
                </div>

                <h4 className="mb-3 text-primary">Work Experience</h4>
                {formData.workExperiences.map((experience, index) => (
                  <div key={index} className="mb-4 p-4 border rounded bg-dark text-light">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            name="company"
                            type="text"
                            className="form-control bg-dark text-light"
                            id={`company${index}`}
                            placeholder="Company"
                            value={experience.company}
                            onChange={(e) => handleWorkExperienceChange(index, e)}
                            required
                          />
                          <label htmlFor={`company${index}`}>Company</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            name="role"
                            type="text"
                            className="form-control bg-dark text-light"
                            id={`role${index}`}
                            placeholder="Role"
                            value={experience.role}
                            onChange={(e) => handleWorkExperienceChange(index, e)}
                            required
                          />
                          <label htmlFor={`role${index}`}>Role</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            name="startDate"
                            type="text"
                            className="form-control bg-dark text-light"
                            id={`startDate${index}`}
                            placeholder="Start Date (MM/YYYY)"
                            value={experience.startDate}
                            onChange={(e) => handleWorkExperienceChange(index, e)}
                            required
                          />
                          <label htmlFor={`startDate${index}`}>Start Date (MM/YYYY)</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            name="endDate"
                            type="text"
                            className="form-control bg-dark text-light"
                            id={`endDate${index}`}
                            placeholder="End Date (MM/YYYY)"
                            value={experience.endDate}
                            onChange={(e) => handleWorkExperienceChange(index, e)}
                            required={!experience.isPresent}
                            disabled={experience.isPresent}
                          />
                          <label htmlFor={`endDate${index}`}>End Date (MM/YYYY)</label>
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`isPresent${index}`}
                          name="isPresent"
                          checked={experience.isPresent}
                          onChange={(e) => handleWorkExperienceChange(index, e)}
                        />
                        <label className="form-check-label text-light" htmlFor={`isPresent${index}`}>
                          This is my present company
                        </label>
                      </div>
                    )}
                    {index > 0 && (
                      <div className="text-end mt-2">
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeWorkExperience(index)}
                        >
                          <FaTrash className="me-2" /> Remove Experience
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="d-grid mb-3">
                  <button type="button" className="btn btn-outline-primary" onClick={addWorkExperience}>
                    <FaPlus className="me-2" /> Add Work Experience
                  </button>
                </div>

                <div className="form-floating mb-3">
                  <input
                    name="currentLocation"
                    type="text"
                    className="form-control bg-dark text-light"
                    id="currentLocation"
                    placeholder="Current Location"
                    value={formData.currentLocation}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="currentLocation">Current Location</label>
                </div>

                <div className="mb-3">
                  <label htmlFor="resume" className="form-label text-light">Resume (PDF)</label>
                  <input
                    type="file"
                    className="form-control bg-dark text-light"
                    id="resume"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'resume')}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="profileImage" className="form-label text-light">Profile Image</label>
                  <input
                    type="file"
                    className="form-control bg-dark text-light"
                    id="profileImage"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profileImage')}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showPinVerification && (
        <div className="modal-backdrop fade show"></div>
      )}
      {showPinVerification && (
        <PinVerification
          email={formData.email}
          onVerified={handlePinVerified}
          onResend={() => sendPinEmail(formData.email)}
          onClose={() => setShowPinVerification(false)}
        />
      )}
    </div>
  );
}

export default GuideRegister;

