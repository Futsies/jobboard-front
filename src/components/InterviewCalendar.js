import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './InterviewCalendar.css';

// Setup the localizer by providing the date functions we want R-B-C to use.
const locales = {
    'en-US': enUS,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const InterviewCalendar = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth();

    // --- State for Modal ---
    const [selectedInterview, setSelectedInterview] = useState(null); // Holds data for modal
    const [showModal, setShowModal] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date()); // Controls the date (month/week/day) being shown
    const [currentView, setCurrentView] = useState('month'); // Controls the view (month/week/day)

    // --- Fetch Scheduled Interviews ---
    const fetchInterviews = useCallback(async () => {
        if (!user || !token) return;
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `http://localhost:8000/api/interviews/scheduled`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Transform the data into the format react-big-calendar expects
            const formattedEvents = response.data.map(interview => ({
                id: interview.id,
                title: `${interview.title} - ${interview.job_application?.user?.name || 'Applicant'} for ${interview.job_application?.job?.job_title || 'Job'}`,
                start: new Date(interview.scheduled_at), // Convert string to Date object
                end: new Date(interview.scheduled_at), // Assuming interviews are points in time, not ranges. Adjust if needed.
                // Store original data if needed for modal
                applicantName: interview.job_application?.user?.name,
                jobTitle: interview.job_application?.job?.job_title,
                applicationId: interview.job_application_id,
                fullDetails: interview // Store the full object if needed
            }));
            setInterviews(formattedEvents);
        } catch (err) {
            setError('Failed to load scheduled interviews.');
            console.error("Error fetching interviews:", err);
        } finally {
            setLoading(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]); // Run fetchInterviews when it's available

    // --- Event Handling ---
    const handleSelectEvent = (event) => {
        setSelectedInterview(event); // 'event' here is the formatted event object
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedInterview(null);
    };

    // Called when user clicks "Back", "Next", or "Today"
    const handleNavigate = (newDate) => {
        setCurrentDate(newDate);
    };

    // Called when user clicks "Month", "Week", or "Day"
    const handleView = (newView) => {
        setCurrentView(newView);
    };

    if (loading) {return <p>Loading interviews...</p>;}
    if (error) {return <p className="error-message">{error}</p>;}

    return (
        <div className="interview-calendar-container">
            <Calendar
                localizer={localizer}
                events={interviews}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }} // Adjust height as needed
                onSelectEvent={handleSelectEvent} // Handle click on an event
                views={['month', 'week', 'day']} // 1. Remove "Agenda" button
                
                // 2. Add props to control the calendar state
                view={currentView} // Tell calendar what view to show
                date={currentDate} // Tell calendar what date to show
                onNavigate={handleNavigate} // Tell calendar what to do when "Next/Back" is clicked
                onView={handleView} // Tell calendar what to do when "Month/Week" is clicked
            />

            {/* --- Simple Modal Implementation --- */}
            {showModal && selectedInterview && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
                        <h2>Interview Details</h2>
                        <p><strong>Title:</strong> {selectedInterview.fullDetails.title}</p>
                        <p><strong>Applicant:</strong> {selectedInterview.applicantName || 'N/A'}</p>
                        <p><strong>Job:</strong> {selectedInterview.jobTitle || 'N/A'}</p>
                        <p><strong>Scheduled:</strong> {format(selectedInterview.start, 'PPP p', { locale: enUS })}</p> {/* Format date nicely */}
                        <button onClick={closeModal} className="modal-close-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewCalendar;