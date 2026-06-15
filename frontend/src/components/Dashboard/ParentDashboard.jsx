import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { observationsAPI, authAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../Navigation/Navbar';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linked, setLinked] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Check if parent has already linked a child
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.linkedStudentId) {
      setStudentId(user.linkedStudentId);
      setLinked(true);
      fetchStudentData(user.linkedStudentId);
    }
  }, []);

  const fetchStudentData = async (id) => {
    try {
      setLoading(true);
      const response = await observationsAPI.getParentObservations(id);
      setStudentData(response.data);
      setChartData(response.data.dailyAverages);
    } catch (err) {
      setError('Failed to fetch student data. Please try again.');
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('Please enter a valid Student ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Link student on the server
      const linkResponse = await authAPI.linkStudent(studentId);
      
      // Update user in local storage
      localStorage.setItem('user', JSON.stringify(linkResponse.data.user));
      
      // Fetch student data
      const response = await observationsAPI.getParentObservations(studentId);
      setStudentData(response.data);
      setChartData(response.data.dailyAverages);
      setLinked(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Student ID. Please check and try again.');
      console.error('Error linking child:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    try {
      // Unlink student on the server
      const unlinkResponse = await authAPI.unlinkStudent();
      
      // Update user in local storage
      localStorage.setItem('user', JSON.stringify(unlinkResponse.data.user));
      
      // Clear local state
      setStudentId('');
      setStudentData(null);
      setLinked(false);
      setChartData([]);
    } catch (err) {
      setError('Failed to unlink student. Please try again.');
      console.error('Error unlinking child:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar title="Parent Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Parent Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor your child's progress and behavior patterns
            </p>
          </div>
        </div>

        {!linked ? (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Link Your Child
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Enter the Student ID provided by your child's teacher to view their progress
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleLinkChild}>
                <div className="mb-4">
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="e.g., A1B2C3D4"
                  />
                </div>
                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.329 1.329a1 1 0 001.414-1.414L11.414 10l1.329-1.329a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
                >
                  {loading ? 'Linking...' : 'Link Child'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {studentData?.student?.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Student ID: {studentData?.student?.studentId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUnlink}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Unlink
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Focus vs. Stress Trend
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Track your child's focus and stress levels over time
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {chartData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate}
                            />
                            <YAxis domain={[0, 5]} />
                            <Tooltip 
                              labelFormatter={formatDate}
                              formatter={(value, name) => [value, name === 'focus' ? 'Focus' : 'Stress']}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="focus" 
                              stroke="#3b82f6" 
                              name="Focus"
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="stress" 
                              stroke="#ef4444" 
                              name="Stress"
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                        <p className="mt-1 text-sm text-gray-500">No observations have been logged yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Average Scores by Category
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Overall average scores for each behavior category
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {studentData?.averages ? (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-blue-500 truncate">Focus</dt>
                            <dd className="mt-1 text-3xl font-semibold text-blue-600">
                              {studentData.averages.Focus}/5
                            </dd>
                          </div>
                        </div>
                        <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-green-500 truncate">Physical Energy</dt>
                            <dd className="mt-1 text-3xl font-semibold text-green-600">
                              {studentData.averages['Physical Energy']}/5
                            </dd>
                          </div>
                        </div>
                        <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-yellow-500 truncate">Impulsivity</dt>
                            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                              {studentData.averages.Impulsivity}/5
                            </dd>
                          </div>
                        </div>
                        <div className="bg-red-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-red-500 truncate">Stress</dt>
                            <dd className="mt-1 text-3xl font-semibold text-red-600">
                              {studentData.averages.Stress}/5
                            </dd>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                        <p className="mt-1 text-sm text-gray-500">No observations have been logged yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Observations
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Latest observations logged by the teacher
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {studentData?.observations && studentData.observations.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Intensity
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Note
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentData.observations.slice(0, 10).map((observation, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(observation.timestamp).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {observation.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    observation.intensity <= 2 ? 'bg-green-100 text-green-800' :
                                    observation.intensity === 3 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {observation.intensity}/5
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {observation.note || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No observations yet</h3>
                        <p className="mt-1 text-sm text-gray-500">The teacher hasn't logged any observations for this student yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
