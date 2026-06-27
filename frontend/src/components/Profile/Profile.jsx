import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navigation/Navbar';
import { authAPI } from '../../services/api';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const flash = (type, text) => {
    setMessage({ type, text });
    if (type === 'success') setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      updateUser(response.data.user);
      flash('success', 'Profile updated.');
    } catch (error) {
      flash('error', error.response?.data?.message || 'We couldn’t update your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      flash('error', 'Please fill in all password fields.');
      setLoading(false);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      flash('error', 'Your new passwords don’t match.');
      setLoading(false);
      return;
    }
    if (formData.newPassword.length < 6) {
      flash('error', 'New password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      flash('success', 'Password changed.');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      flash('error', error.response?.data?.message || 'We couldn’t change your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account? This permanently removes your data and can’t be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/login');
    } catch (error) {
      flash('error', error.response?.data?.message || 'We couldn’t delete your account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <Navbar title="Profile & settings" showBackButton onBack={() => navigate(-1)} />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="eyebrow">Account</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink dark:text-sand-50">Profile &amp; settings</h2>
        </header>

        <div aria-live="polite">
          {message.text && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm animate-fade-in ${
                message.type === 'success'
                  ? 'border-energy/20 bg-energy-soft text-energy-softText'
                  : 'border-stress/20 bg-stress-soft text-stress-softText'
              }`}
              role={message.type === 'error' ? 'alert' : 'status'}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Profile info */}
        <section className="card-hover p-6">
          <h3 className="font-display text-lg font-bold text-ink dark:text-sand-50">Profile information</h3>
          <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">Update your name and contact details.</p>
          <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="input" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="input" />
              </div>
              <div>
                <label htmlFor="phone" className="label">Phone</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="input" />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        {/* Change password */}
        <section className="card-hover mt-6 p-6">
          <h3 className="font-display text-lg font-bold text-ink dark:text-sand-50">Change password</h3>
          <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">Use at least 6 characters.</p>
          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="label">Current password</label>
              <input type="password" name="currentPassword" id="currentPassword" autoComplete="current-password" value={formData.currentPassword} onChange={handleChange} className="input" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="newPassword" className="label">New password</label>
                <input type="password" name="newPassword" id="newPassword" autoComplete="new-password" value={formData.newPassword} onChange={handleChange} className="input" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">Confirm new password</label>
                <input type="password" name="confirmPassword" id="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} className="input" />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </form>
        </section>

        {/* Danger zone */}
        <section className="mt-6 rounded-2xl border border-stress/25 bg-stress-soft/40 p-6 dark:bg-stress/5">
          <h3 className="font-display text-lg font-bold text-stress-softText">Delete account</h3>
          <p className="mt-1 text-sm text-ink-soft dark:text-sand-200/70">
            This permanently removes your account and data. This can’t be undone.
          </p>
          <button onClick={handleDeleteAccount} disabled={loading} className="btn-danger mt-4">
            {loading ? 'Deleting…' : 'Delete my account'}
          </button>
        </section>
      </div>
    </div>
  );
};

export default Profile;
