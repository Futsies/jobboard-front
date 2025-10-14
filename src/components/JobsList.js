import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobsList.css';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch jobs from Laravel API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/jobs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search term (title OR category)
  useEffect(() => {
    const filtered = jobs.filter(job => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = job.job_title && job.job_title.toLowerCase().includes(searchLower);
      const categoryMatch = job.category && job.category.toLowerCase().includes(searchLower);
      
      // Return true if either title OR category matches
      return titleMatch || categoryMatch;
    });
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  return (
    <div className="jobs-list-container">
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by job title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        <div className="results-count">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      </div>

      {/* Jobs List */}
      <div className="jobs-grid">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="job-card"
              onClick={() => handleJobClick(job.id)}
            >
              <div className="job-header">
                {job.company_logo && (
                  <img 
                    src={job.company_logo} 
                    alt={`${job.company_name} logo`}
                    className="company-logo"
                  />
                )}
                <div className="job-title-section">
                  <h3 className="job-title">{job.job_title}</h3>
                  <p className="company-name">{job.company_name}</p>
                </div>
              </div>
              
              <div className="job-details">
                <div className="job-meta">
                  <span className="job-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {job.job_location}
                  </span>
                  <span className="job-type">
                    <i className="fas fa-briefcase"></i>
                    {job.job_type}
                  </span>
                  {job.salary && (
                    <span className="job-salary">
                      <i className="fas fa-money-bill-wave"></i>
                      ${job.salary.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <p className="job-description">
                  {job.job_description && job.job_description.length > 150 
                    ? `${job.job_description.substring(0, 150)}...` 
                    : job.job_description
                  }
                </p>
                
                <div className="job-footer">
                  <span className="job-category">{job.category}</span>
                  <button className="view-job-btn">View Job</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-jobs">
            <h3>No jobs found</h3>
            <p>Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;