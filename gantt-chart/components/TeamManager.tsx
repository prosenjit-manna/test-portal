'use client';

import { useState } from 'react';
import { TeamMember } from '@/types';
import { Plus, Edit, Trash2, User, Mail, Briefcase, Users } from 'lucide-react';
import { inputClasses, textareaClasses, selectClasses, buttonClasses } from '@/lib/styles';

interface TeamMemberFormProps {
  member?: TeamMember;
  onSubmit: (member: Omit<TeamMember, 'id'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

function TeamMemberForm({ member, onSubmit, onCancel, isEdit = false }: TeamMemberFormProps) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    role: member?.role || '',
    avatar: member?.avatar || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const commonRoles = [
    'Project Manager',
    'Senior Developer',
    'Developer',
    'Junior Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Designer',
    'QA Engineer',
    'DevOps Engineer',
    'Data Analyst',
    'Business Analyst',
    'Product Manager',
    'Scrum Master',
    'Team Lead',
    'Architect'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            {isEdit ? <Edit className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
            {isEdit ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline h-4 w-4 mr-1" />
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses.base}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses.base}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              <Briefcase className="inline h-4 w-4 mr-1" />
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={selectClasses.base}
              required
            >
              <option value="">Select a role</option>
              {commonRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL (optional)
            </label>
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              className={inputClasses.base}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: URL to profile picture or avatar image
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={buttonClasses.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={buttonClasses.primary}
            >
              {isEdit ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TeamManagerProps {
  teamMembers: TeamMember[];
  onTeamMemberChange: () => void;
}

export default function TeamManager({ teamMembers, onTeamMemberChange }: TeamManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMember = async (memberData: Omit<TeamMember, 'id'>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        setShowForm(false);
        onTeamMemberChange();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create team member');
      }
    } catch (error) {
      console.error('Failed to create team member:', error);
      alert('Failed to create team member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (memberData: Omit<TeamMember, 'id'>) => {
    if (!editingMember) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/team/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        setEditingMember(null);
        onTeamMemberChange();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update team member');
      }
    } catch (error) {
      console.error('Failed to update team member:', error);
      alert('Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTeamMemberChange();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      alert('Failed to delete team member');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Project Manager': 'bg-purple-100 text-purple-800',
      'Senior Developer': 'bg-blue-100 text-blue-800',
      'Developer': 'bg-green-100 text-green-800',
      'Junior Developer': 'bg-green-50 text-green-700',
      'Frontend Developer': 'bg-cyan-100 text-cyan-800',
      'Backend Developer': 'bg-indigo-100 text-indigo-800',
      'Full Stack Developer': 'bg-violet-100 text-violet-800',
      'UI/UX Designer': 'bg-pink-100 text-pink-800',
      'Designer': 'bg-rose-100 text-rose-800',
      'QA Engineer': 'bg-yellow-100 text-yellow-800',
      'DevOps Engineer': 'bg-orange-100 text-orange-800',
      'Data Analyst': 'bg-teal-100 text-teal-800',
      'Business Analyst': 'bg-emerald-100 text-emerald-800',
      'Product Manager': 'bg-red-100 text-red-800',
      'Scrum Master': 'bg-amber-100 text-amber-800',
      'Team Lead': 'bg-slate-100 text-slate-800',
      'Architect': 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Team Management
          </h3>
          <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search team members by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClasses.base}
          />
        </div>

        {/* Team Members List */}
        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No team members found' : 'No team members'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Get started by adding your first team member.'
                }
              </p>
            </div>
          ) : (
            filteredMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.textContent = getInitials(member.name);
                        }}
                      />
                    ) : (
                      <span className="text-blue-700 font-medium">
                        {getInitials(member.name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingMember(member)}
                    disabled={loading}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    title="Edit member"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    title="Delete member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-gray-600">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {new Set(teamMembers.map(m => m.role)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {filteredMembers.length !== teamMembers.length ? filteredMembers.length : '—'}
              </div>
              <div className="text-sm text-gray-600">
                {filteredMembers.length !== teamMembers.length ? 'Search Results' : 'All Shown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Member Form */}
      {(showForm || editingMember) && (
        <TeamMemberForm
          member={editingMember || undefined}
          onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
          isEdit={!!editingMember}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-900">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
