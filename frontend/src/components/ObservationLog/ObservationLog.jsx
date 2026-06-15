import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observationsAPI } from '../../services/api';
import Navbar from '../Navigation/Navbar';

const ObservationLog = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for the observation form
  const [observation, setObservation] = useState({
    category: 'Focus',
    intensity: 3,
    note: '',
  });

  // Quick action buttons for common behaviors
  const quickActions = [
    { label: 'Lost Focus', category: 'Focus', intensity: 2, note: 'Lost focus during lesson' },
    { label: 'Interrupted', category: 'Impulsivity', intensity: 3, note: 'Interrupted class' },
    { label: 'Fidgeting', category: 'Physical Energy', intensity: 4, note: 'Excessive fidgeting' },
    { label: 'Stressed', category: 'Stress', intensity: 4, note: 'Showing signs of stress' },
    { label: 'Great Focus', category: 'Focus', intensity: 5, note: 'Excellent focus and attention' },
    { label: 'Calm', category: 'Physical Energy', intensity: 1, note: 'Calm and composed' },
  ];

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await observationsAPI.getRecentObservations(studentId);
      setStudent(response.data.student);
    } catch (err) {
      setError('Failed to fetch student information. Please try again.');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    try {
      setError('');
      setSuccess('');

      await observationsAPI.logObservation({
        studentId,
        category: action.category,
        intensity: action.intensity,
        note: action.note,
      });

      setSuccess('Observation logged successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to log observation. Please try again.');
      console.error('Error logging observation:', err);
    }
  };

  const handleCustomLog = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      await observationsAPI.logObservation({
        studentId,
        category: observation.category,
        intensity: observation.intensity,
        note: observation.note,
      });

      setSuccess('Observation logged successfully!');
      setObservation({
        category: 'Focus',
        intensity: 3,
        note: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to log observation. Please try again.');
      console.error('Error logging observation:', err);
    }
  };

  const goBack = () => {
    navigate('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar 
        title="Observation Log" 
        showBackButton={true} 
        onBack={goBack}
      />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Observation Log
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Log behaviors for {student?.name} (ID: {studentId})
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.329 1.329a1 1 0 001.414-1.414L11.414 10l1.329-1.329a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  One-tap logging for common behaviors
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickAction(action)}
                      className="inline-flex items-center justify-center px-4 py-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: 
                          action.category === 'Focus' ? '#3b82f6' :
                          action.category === 'Impulsivity' ? '#f59e0b' :
                          action.category === 'Physical Energy' ? '#10b981' :
                          action.category === 'Stress' ? '#ef4444' : '#6b7280'
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Custom Observation
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Log a custom observation with specific details
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleCustomLog}>
                  <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      value={observation.category}
                      onChange={(e) => setObservation({ ...observation, category: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value="Focus">Focus</option>
                      <option value="Physical Energy">Physical Energy</option>
                      <option value="Impulsivity">Impulsivity</option>
                      <option value="Stress">Stress</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="intensity" className="block text-sm font-medium text-gray-700">
                      Intensity Level (1-5)
                    </label>
                    <div className="flex items-center mt-2">
                      <input
                        type="range"
                        id="intensity"
                        min="1"
                        max="5"
                        value={observation.intensity}
                        onChange={(e) => setObservation({ ...observation, intensity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-4 text-lg font-medium text-gray-900 w-8">{observation.intensity}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 (Low)</span>
                      <span>5 (High)</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                      Note (Optional)
                    </label>
                    <textarea
                      id="note"
                      rows="3"
                      value={observation.note}
                      onChange={(e) => setObservation({ ...observation, note: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Add any additional notes about this observation..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Log Observation
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
      
  );
};

export default ObservationLog;
