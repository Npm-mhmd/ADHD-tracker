import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observationsAPI } from '../../services/api';
import { CATEGORIES, styleFor } from '../../constants/categories';
import Navbar from '../Navigation/Navbar';

const QUICK_ACTIONS = [
  { label: 'Lost focus', category: 'Focus', intensity: 2, note: 'Lost focus during lesson' },
  { label: 'Great focus', category: 'Focus', intensity: 5, note: 'Excellent focus and attention' },
  { label: 'Interrupted', category: 'Impulsivity', intensity: 3, note: 'Interrupted class' },
  { label: 'Fidgeting', category: 'Physical Energy', intensity: 4, note: 'Excessive fidgeting' },
  { label: 'Calm', category: 'Physical Energy', intensity: 1, note: 'Calm and composed' },
  { label: 'Stressed', category: 'Stress', intensity: 4, note: 'Showing signs of stress' },
];

const ObservationLog = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [observation, setObservation] = useState({ category: 'Focus', intensity: 3, note: '' });

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await observationsAPI.getRecentObservations(studentId);
      setStudent(response.data.student);
    } catch (err) {
      setError('We couldn’t load this student. Please try again.');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const flashSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
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
      flashSuccess(`Logged “${action.label}”.`);
    } catch (err) {
      setError('We couldn’t log that observation. Please try again.');
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
      flashSuccess('Observation saved.');
      setObservation({ category: 'Focus', intensity: 3, note: '' });
    } catch (err) {
      setError('We couldn’t save the observation. Please try again.');
      console.error('Error logging observation:', err);
    }
  };

  const goBack = () => navigate('/teacher/dashboard');

  return (
    <div className="min-h-screen bg-page">
      <Navbar title="Log observation" showBackButton onBack={goBack} />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-sand-200 border-t-brand-600" />
          </div>
        ) : (
          <>
            <header>
              <p className="eyebrow">Logging for</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink dark:text-sand-50">
                {student?.name}
              </h2>
              <p className="mt-1 font-mono text-sm text-ink-muted">ID {studentId}</p>
            </header>

            {/* Live region for save feedback */}
            <div aria-live="polite">
              {success && (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-energy/20 bg-energy-soft px-4 py-3 text-sm font-medium text-energy-softText animate-fade-in">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  {success}
                </div>
              )}
              {error && (
                <div className="mt-6 rounded-xl border border-stress/20 bg-stress-soft px-4 py-3 text-sm text-stress-softText animate-fade-in" role="alert">
                  {error}
                </div>
              )}
            </div>

            {/* Quick actions — the fast path during class */}
            <section className="mt-8">
              <h3 className="font-display text-lg font-bold text-ink dark:text-sand-50">Quick log</h3>
              <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">One tap records a common moment.</p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {QUICK_ACTIONS.map((action) => {
                  const styles = styleFor(action.category);
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleQuickAction(action)}
                      className="group card-hover flex flex-col gap-3 p-4 text-left"
                    >
                      <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.soft}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                        {action.category}
                      </span>
                      <span className="font-display text-base font-bold text-ink dark:text-sand-50">{action.label}</span>
                      <span className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((seg) => (
                          <span key={seg} className={`h-1.5 w-full rounded-full ${seg <= action.intensity ? styles.dot : 'bg-sand-200 dark:bg-night-600'}`} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Custom observation */}
            <section className="card-hover mt-8 p-6">
              <h3 className="font-display text-lg font-bold text-ink dark:text-sand-50">Custom observation</h3>
              <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">Capture something specific, with your own note.</p>

              <form onSubmit={handleCustomLog} className="mt-5 space-y-6">
                <div>
                  <span className="label">Category</span>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {CATEGORIES.map((category) => {
                      const active = observation.category === category.key;
                      const styles = styleFor(category.key);
                      return (
                        <button
                          key={category.key}
                          type="button"
                          onClick={() => setObservation({ ...observation, category: category.key })}
                          className={`rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                            active
                              ? `${styles.soft} border-transparent ring-2`
                              : 'border-sand-200 text-ink-soft hover:border-sand-300 dark:border-night-600 dark:text-sand-200'
                          }`}
                          style={active ? { '--tw-ring-color': category.hex } : undefined}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                            {category.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="label mb-0">Intensity</span>
                    <span className="text-sm text-ink-muted">{observation.intensity} of 5</span>
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const reached = level <= observation.intensity;
                      const styles = styleFor(observation.category);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setObservation({ ...observation, intensity: level })}
                          aria-label={`Intensity ${level}`}
                          aria-pressed={observation.intensity === level}
                          className={`h-10 rounded-lg text-sm font-bold transition-all ${
                            reached ? `${styles.dot} text-white` : 'bg-sand-100 text-ink-muted hover:bg-sand-200 dark:bg-night-700 dark:hover:bg-night-600'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs text-ink-muted">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="note" className="label">Note <span className="font-normal text-ink-muted">(optional)</span></label>
                  <textarea
                    id="note"
                    rows="3"
                    value={observation.note}
                    onChange={(e) => setObservation({ ...observation, note: e.target.value })}
                    className="input resize-none"
                    placeholder="What did you notice? Context helps spot patterns later."
                  />
                </div>

                <button type="submit" className="btn-primary w-full">Save observation</button>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ObservationLog;
