import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../services/api';
import Navbar from '../Navigation/Navbar';
import Modal from '../common/Modal';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newClass, setNewClass] = useState({
    name: '',
    school: '',
    academicYear: new Date().getFullYear().toString(),
  });

  const [newStudent, setNewStudent] = useState({ name: '', dateOfBirth: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getClasses();
      setClasses(response.data.classes);

      if (response.data.classes.length > 0) {
        setSelectedClass(response.data.classes[0]._id);
        fetchStudents(response.data.classes[0]._id);
      }
    } catch (err) {
      setError('We couldn’t load your classes. Please try again.');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await studentsAPI.getStudentsByClass(classId);
      setStudents(response.data.students);
    } catch (err) {
      setError('We couldn’t load students for this class. Please try again.');
      console.error('Error fetching students:', err);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (classId) {
      fetchStudents(classId);
    } else {
      setStudents([]);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await studentsAPI.createClass(newClass);
      setShowAddClassModal(false);
      setNewClass({ name: '', school: '', academicYear: new Date().getFullYear().toString() });
      fetchClasses();
    } catch (err) {
      setError('We couldn’t create the class. Please try again.');
      console.error('Error creating class:', err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await studentsAPI.addStudent({ ...newStudent, classId: selectedClass });
      setShowAddStudentModal(false);
      setNewStudent({ name: '', dateOfBirth: '' });
      fetchStudents(selectedClass);
    } catch (err) {
      setError('We couldn’t add the student. Please try again.');
      console.error('Error adding student:', err);
    }
  };

  const handleAddLog = (studentId) => {
    navigate(`/teacher/observation-log/${studentId}`);
  };

  const activeClass = classes.find((c) => c._id === selectedClass);
  const totalObservations = students.reduce((sum, s) => sum + (s.observationsCount || 0), 0);

  return (
    <div className="min-h-screen bg-page">
      <Navbar title="Dashboard" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Teacher workspace</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink dark:text-sand-50">
              Your classes
            </h2>
            <p className="mt-1 text-ink-soft dark:text-sand-200/70">
              Manage classes and keep a gentle record of what you notice.
            </p>
          </div>
          <button type="button" onClick={() => setShowAddClassModal(true)} className="btn-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New class
          </button>
        </header>

        {error && (
          <div className="mt-6 rounded-xl border border-stress/20 bg-stress-soft px-4 py-3 text-sm text-stress-softText animate-fade-in" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-sand-200 border-t-brand-600" />
          </div>
        ) : classes.length === 0 ? (
          <EmptyState
            title="No classes yet"
            body="Create your first class to start adding students and logging observations."
            actionLabel="Create a class"
            onAction={() => setShowAddClassModal(true)}
          />
        ) : (
          <>
            {/* Summary stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatTile label="Classes" value={classes.length} />
              <StatTile label="Students in view" value={students.length} />
              <StatTile label="Observations logged" value={totalObservations} className="col-span-2 sm:col-span-1" />
            </div>

            {/* Class selector */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-sm flex-1">
                <label htmlFor="class-select" className="label">Viewing class</label>
                <select id="class-select" value={selectedClass || ''} onChange={handleClassChange} className="input">
                  <option value="">Select a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name} — {classItem.school} ({classItem.academicYear})
                    </option>
                  ))}
                </select>
              </div>
              {selectedClass && (
                <button type="button" onClick={() => setShowAddStudentModal(true)} className="btn-secondary sm:self-end">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add student
                </button>
              )}
            </div>

            {/* Students */}
            {selectedClass && (
              <div className="mt-6">
                {students.length === 0 ? (
                  <EmptyState
                    title="No students in this class"
                    body={`Add a student to ${activeClass?.name || 'this class'} to begin tracking observations.`}
                    actionLabel="Add a student"
                    onAction={() => setShowAddStudentModal(true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => (
                      <article key={student.id} className="card-hover flex flex-col p-5 group">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-base font-bold text-white shadow-sm">
                            {student.name?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-base font-bold text-ink dark:text-sand-50">{student.name}</h3>
                            <p className="font-mono text-xs text-ink-muted">ID {student.studentId}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-4 dark:border-night-700">
                          <span className="text-sm text-ink-soft dark:text-sand-200/70">
                            <span className="font-semibold text-ink dark:text-sand-100">{student.observationsCount}</span>{' '}
                            {student.observationsCount === 1 ? 'note' : 'notes'}
                          </span>
                          <button type="button" onClick={() => handleAddLog(student.studentId)} className="btn-primary px-3 py-1.5 text-xs">
                            Log observation
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create class modal */}
      <Modal
        open={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        title="Create a new class"
        description="Group your students by the class you teach."
        footer={
          <>
            <button type="button" onClick={() => setShowAddClassModal(false)} className="btn-ghost">Cancel</button>
            <button type="button" onClick={handleCreateClass} className="btn-primary">Create class</button>
          </>
        }
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label htmlFor="className" className="label">Class name</label>
            <input id="className" required value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} className="input" placeholder="e.g. 4ème Sc Exp" />
          </div>
          <div>
            <label htmlFor="school" className="label">School</label>
            <input id="school" required value={newClass.school} onChange={(e) => setNewClass({ ...newClass, school: e.target.value })} className="input" placeholder="e.g. Primary School Tunis" />
          </div>
          <div>
            <label htmlFor="academicYear" className="label">Academic year</label>
            <input id="academicYear" required value={newClass.academicYear} onChange={(e) => setNewClass({ ...newClass, academicYear: e.target.value })} className="input" placeholder="e.g. 2023–2024" />
          </div>
          <button type="submit" className="sr-only">Create class</button>
        </form>
      </Modal>

      {/* Add student modal */}
      <Modal
        open={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="Add a student"
        description={activeClass ? `Adding to ${activeClass.name}.` : undefined}
        footer={
          <>
            <button type="button" onClick={() => setShowAddStudentModal(false)} className="btn-ghost">Cancel</button>
            <button type="button" onClick={handleAddStudent} className="btn-primary">Add student</button>
          </>
        }
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label htmlFor="studentName" className="label">Student name</label>
            <input id="studentName" required value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="input" placeholder="Student’s full name" />
            <p className="mt-1.5 text-xs text-ink-muted">Names are encrypted before they’re stored.</p>
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="label">Date of birth</label>
            <input id="dateOfBirth" type="date" required value={newStudent.dateOfBirth} onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })} className="input" />
          </div>
          <button type="submit" className="sr-only">Add student</button>
        </form>
      </Modal>
    </div>
  );
};

const StatTile = ({ label, value, className = '' }) => (
  <div className={`card-hover p-5 ${className}`}>
    <p className="font-display text-3xl font-bold text-ink dark:text-sand-50">{value}</p>
    <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">{label}</p>
  </div>
);

const EmptyState = ({ title, body, actionLabel, onAction }) => (
  <div className="card mt-8 flex flex-col items-center px-6 py-14 text-center animate-rise">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 dark:from-brand-900/50 dark:to-night-700 dark:text-brand-200 shadow-sm">
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-sand-50">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-ink-soft dark:text-sand-200/70">{body}</p>
    <button type="button" onClick={onAction} className="btn-primary mt-6">{actionLabel}</button>
  </div>
);

export default TeacherDashboard;
