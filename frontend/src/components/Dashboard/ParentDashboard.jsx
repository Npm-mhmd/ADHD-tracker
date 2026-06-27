import React, { useState, useEffect } from 'react';
import { observationsAPI, authAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, CATEGORY_BY_KEY, styleFor } from '../../constants/categories';
import Navbar from '../Navigation/Navbar';
import IntensityMeter from '../common/IntensityMeter';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm shadow-lift dark:border-night-700 dark:bg-night-800">
      <p className="mb-1 font-semibold text-ink dark:text-sand-50">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-ink-soft dark:text-sand-200">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold text-ink dark:text-sand-50">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const ParentDashboard = () => {
  const { user, updateUser } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linked, setLinked] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (user?.linkedStudentId) {
      setStudentId(user.linkedStudentId);
      setLinked(true);
      fetchStudentData(user.linkedStudentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.linkedStudentId]);

  const fetchStudentData = async (id) => {
    try {
      setLoading(true);
      const response = await observationsAPI.getParentObservations(id);
      setStudentData(response.data);
      setChartData(response.data.dailyAverages);
    } catch (err) {
      setError('We couldn’t load your child’s data. Please try again.');
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('Please enter the Student ID from your child’s teacher.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const linkResponse = await authAPI.linkStudent(studentId);
      updateUser(linkResponse.data.user);
      const response = await observationsAPI.getParentObservations(studentId);
      setStudentData(response.data);
      setChartData(response.data.dailyAverages);
      setLinked(true);
    } catch (err) {
      setError(err.response?.data?.message || 'That Student ID didn’t match. Please check and try again.');
      console.error('Error linking child:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    try {
      const unlinkResponse = await authAPI.unlinkStudent();
      updateUser(unlinkResponse.data.user);
      setStudentId('');
      setStudentData(null);
      setLinked(false);
      setChartData([]);
    } catch (err) {
      setError('We couldn’t unlink right now. Please try again.');
      console.error('Error unlinking child:', err);
    }
  };

  const focusCat = CATEGORY_BY_KEY.Focus;
  const stressCat = CATEGORY_BY_KEY.Stress;

  return (
    <div className="min-h-screen bg-page">
      <Navbar title="Dashboard" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {!linked ? (
          <div className="mx-auto max-w-md py-6">
            <div className="card-hover animate-rise p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 dark:from-brand-900/50 dark:to-night-700 dark:text-brand-200 shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 11-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 115.656 5.656l-1.5 1.5" />
                </svg>
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-ink dark:text-sand-50">Link your child</h2>
              <p className="mt-1.5 text-sm text-ink-soft dark:text-sand-200/70">
                Enter the Student ID your child’s teacher shared with you to follow their progress.
              </p>

              <form onSubmit={handleLinkChild} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="studentId" className="label">Student ID</label>
                  <input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="input font-mono uppercase tracking-wider"
                    placeholder="A1B2C3D4"
                  />
                </div>
                {error && (
                  <div className="rounded-xl border border-stress/20 bg-stress-soft px-4 py-3 text-sm text-stress-softText animate-fade-in" role="alert">
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Linking…' : 'Link child'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Following</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink dark:text-sand-50">{studentData?.student?.name}</h2>
                <p className="mt-1 font-mono text-sm text-ink-muted">ID {studentData?.student?.studentId}</p>
              </div>
              <button type="button" onClick={handleUnlink} className="btn-ghost self-start text-stress-softText hover:bg-stress-soft sm:self-auto">
                Unlink
              </button>
            </header>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-sand-200 border-t-brand-600" />
              </div>
            ) : (
              <>
                {/* Hero: the trend that matters most */}
                <section className="card-hover mt-8 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink dark:text-sand-50">Focus &amp; stress over time</h3>
                      <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">Daily averages, on a 1–5 scale.</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: focusCat.hex }} />Focus</span>
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stressCat.hex }} />Stress</span>
                    </div>
                  </div>

                  {chartData.length > 0 ? (
                    <div className="mt-6 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="currentColor" className="text-sand-200 dark:text-night-700" />
                          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-ink-muted" tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-ink-muted" tickLine={false} axisLine={false} />
                          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'currentColor', strokeOpacity: 0.15 }} />
                          <Line type="monotone" dataKey="focus" name="Focus" stroke={focusCat.hex} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                          <Line type="monotone" dataKey="stress" name="Stress" stroke={stressCat.hex} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="mt-8 py-10 text-center text-sm text-ink-muted">No observations have been logged yet.</p>
                  )}
                </section>

                {/* Category averages */}
                <section className="mt-6">
                  <h3 className="font-display text-lg font-bold text-ink dark:text-sand-50">Averages by dimension</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {CATEGORIES.map((category) => {
                      const value = studentData?.averages?.[category.key] ?? 0;
                      const styles = styleFor(category.key);
                      return (
                        <div key={category.key} className="card-hover p-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.soft}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                            {category.label}
                          </span>
                          <p className="mt-3 font-display text-3xl font-bold text-ink dark:text-sand-50">
                            {value}
                            <span className="text-base font-medium text-ink-muted">/5</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Recent observations */}
                <section className="card mt-6 overflow-hidden">
                  <div className="border-b border-sand-200 bg-sand-50/50 px-6 py-4 dark:border-night-700 dark:bg-night-800/50">
                    <h3 className="font-display text-lg font-bold text-ink dark:text-sand-50">Recent observations</h3>
                    <p className="mt-0.5 text-sm text-ink-soft dark:text-sand-200/70">The latest notes from the classroom.</p>
                  </div>

                  {studentData?.observations?.length > 0 ? (
                    <ul className="divide-y divide-sand-200 dark:divide-night-700">
                      {studentData.observations.slice(0, 10).map((obs, index) => {
                        const styles = styleFor(obs.category);
                        return (
                          <li key={index} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-sand-50/50 dark:hover:bg-night-700/30">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.soft}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                              {obs.category}
                            </span>
                            <IntensityMeter value={obs.intensity} category={obs.category} size="sm" />
                            <span className="ml-auto text-xs text-ink-muted">
                              {new Date(obs.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {obs.note && (
                              <p className="w-full text-sm text-ink-soft dark:text-sand-200/70">{obs.note}</p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="px-6 py-12 text-center text-sm text-ink-muted">No observations have been logged for your child yet.</p>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
