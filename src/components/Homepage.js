import React from 'react';
import JobsList from './JobsList';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <main className="main-content">
        <JobsList />
      </main>
    </div>
  );
};

export default Homepage;