import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ViewJob.css';

const ViewJob = () => {
  const { id } = useParams();

  return (
    <div className="view-job-container">
      <div className="back-nav">
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to Jobs
        </Link>
      </div>
      
      <div className="job-detail">
        <h1>Job Details Page</h1>
        <p>Viewing job ID: {id}</p>
        <p>This page will show complete details for the selected job.</p>
      </div>
    </div>
  );
};

export default ViewJob;