'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { formatDate } from '../../services/api';
import { useNotification } from '../Notification';

export function ProfileScreen() {
  const { user, login } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fname: user.fname || '',
        lname: user.lname || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.memberNumber) {
      showNotification('User not found', 'error');
      return;
    }

    if (!formData.fname.trim() || !formData.lname.trim() || !formData.phoneNumber.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      
      await userService.updateUser(user.memberNumber, {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        email: formData.email.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim(),
      });

      // Refresh user data
      await login(user.memberNumber);
      
      showNotification('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (error: any) {
      showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fname: user.fname || '',
        lname: user.lname || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>
        
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card space-y-6">
          {editing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> You are currently editing your profile. 
                Make sure to save your changes before leaving this page.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="fname" className="form-label">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={!editing || loading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lname" className="form-label">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={!editing || loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                disabled={!editing || loading}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={!editing || loading}
              />
            </div>
          </div>

          {/* Read-only Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Member Number</label>
              <input
                type="text"
                value={user.memberNumber}
                className="form-input bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="form-label">Date Joined</label>
              <input
                type="text"
                value={user.dateJoined ? formatDate(user.dateJoined) : 'N/A'}
                className="form-input bg-gray-50"
                disabled
              />
            </div>
          </div>

          {/* Emergency Contacts Section */}
          {user.emergencyContacts && user.emergencyContacts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
              <div className="space-y-4">
                {user.emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <div>{contact.name}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Relationship:</span>
                        <div>{contact.relationship}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Phone:</span>
                        <div>{contact.phoneNumber}</div>
                      </div>
                      {contact.email && (
                        <div className="md:col-span-3">
                          <span className="font-medium text-gray-600">Email:</span>
                          <div>{contact.email}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {editing && (
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Profile Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Account Status</div>
                <div className="text-sm text-gray-600">
                  {user.isActive ? 'Active Member' : 'Inactive Member'}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}