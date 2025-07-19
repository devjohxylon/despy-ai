import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  Mail, 
  Lock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import getApiUrl from '../utils/api';

const AdminSettings = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('admins');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: 'all'
  });

  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: 'admin',
    is_active: true,
    permissions: 'all'
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('admin/admins'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
    }
  }, [isOpen]);

  // Create admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('admin/admins'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin');
      }

      toast.success('Admin created successfully');
      setShowCreateForm(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: 'all'
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin');
    }
  };

  // Update admin
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl(`admin/admins/${editingAdmin.id}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update admin');
      }

      toast.success('Admin updated successfully');
      setEditingAdmin(null);
      setEditFormData({
        username: '',
        email: '',
        role: 'admin',
        is_active: true,
        permissions: 'all'
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error(error.message || 'Failed to update admin');
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl(`admin/admins/${adminId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete admin');
      }

      toast.success('Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl(`admin/admins/${editingAdmin.id}/reset-password`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: passwordData.newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      toast.success('Password reset successfully');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowNewPassword(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    }
  };

  // Start editing admin
  const startEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      username: admin.username,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
      permissions: admin.permissions
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-emerald-400' : 'text-red-400';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
            <p className="text-gray-400">Manage admin accounts and system settings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAdmins}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'admins' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Management
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'system' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Key className="w-4 h-4" />
            System Settings
          </button>
        </div>

        {/* Admin Management Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {/* Create Admin Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Admin Accounts</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Add Admin
              </button>
            </div>

            {/* Admins List */}
            <div className="bg-gray-800/50 rounded-xl overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-gray-400 mt-2">Loading admins...</p>
                </div>
              ) : admins.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No admins found</h3>
                  <p className="text-gray-400">Create your first admin account to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-800/70 border-b border-gray-700">
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Admin</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-white">{admin.username}</div>
                              <div className="text-sm text-gray-400">{admin.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-600/20 text-blue-400 rounded-full">
                              {admin.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(admin.is_active)}
                              <span className={`text-sm font-medium ${getStatusColor(admin.is_active)}`}>
                                {admin.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditAdmin(admin)}
                                className="p-2 hover:bg-blue-600/20 rounded-lg transition-colors"
                                title="Edit Admin"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(admin.id)}
                                className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                                title="Delete Admin"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">System Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-600">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Security Settings</h4>
                    <p className="text-sm text-gray-400">Configure security policies</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue="60"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="require2fa"
                      className="rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <label htmlFor="require2fa" className="text-sm text-gray-300">
                      Require Two-Factor Authentication
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-purple-600">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Email Settings</h4>
                    <p className="text-sm text-gray-400">Configure email notifications</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@despy.io"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      defaultChecked
                      className="rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <label htmlFor="emailNotifications" className="text-sm text-gray-300">
                      Enable Email Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="bulkEmailNotifications"
                      defaultChecked
                      className="rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <label htmlFor="bulkEmailNotifications" className="text-sm text-gray-300">
                      Notify on Bulk Actions
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Admin Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Admin</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {editingAdmin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Edit Admin</h3>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300">
                    Active Account
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(true)}
                    className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    Reset Password
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Update Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showNewPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Reset Password</h3>
                <button
                  onClick={() => setShowNewPassword(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSettings; 