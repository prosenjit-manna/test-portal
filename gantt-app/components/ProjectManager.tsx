'use client';

import { useState } from 'react';
import { Project, TeamMember } from '@/types';
import { Edit, Trash2, Calendar, Users, MoreVertical, FolderPlus } from 'lucide-react';
import ProjectForm from './ProjectForm';

interface ProjectManagerProps {
  projects: Project[];
  teamMembers: TeamMember[];
  selectedProject: string;
  onProjectUpdate: (projects: Project[]) => void;
  onProjectSelect: (projectId: string) => void;
}

export default function ProjectManager({ 
  projects, 
  teamMembers, 
  selectedProject, 
  onProjectUpdate, 
  onProjectSelect 
}: ProjectManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        const newProject = await response.json();
        const updatedProjects = [...projects, newProject];
        onProjectUpdate(updatedProjects);
        onProjectSelect(newProject.id);
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const handleUpdateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        const updatedProject = await response.json();
        const updatedProjects = projects.map(p => 
          p.id === editingProject.id ? updatedProject : p
        );
        onProjectUpdate(updatedProjects);
        setEditingProject(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        onProjectUpdate(updatedProjects);
        
        // If the deleted project was selected, select the first available project
        if (selectedProject === projectId && updatedProjects.length > 0) {
          onProjectSelect(updatedProjects[0].id);
        } else if (selectedProject === projectId) {
          onProjectSelect('');
        }
        
        setShowDeleteConfirm(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const getProjectStatus = (status: Project['status']) => {
    const statusClasses = {
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800', 
      'on-hold': 'bg-yellow-100 text-yellow-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getTeamMemberNames = (memberIds: string[]) => {
    return memberIds
      .map(id => teamMembers.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-gray-600">Manage your projects and their settings</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`bg-white rounded-lg border-2 transition-all hover:shadow-md ${
              selectedProject === project.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => onProjectSelect(project.id)}
                  >
                    {project.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getProjectStatus(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                
                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {expandedProject === project.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setExpandedProject(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(project.id);
                          setExpandedProject(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {project.teamMembers.length} members
                </div>
              </div>

              {/* Team Members Preview */}
              {project.teamMembers.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {project.teamMembers.slice(0, 3).map(memberId => {
                        const member = teamMembers.find(m => m.id === memberId);
                        return member ? (
                          <div
                            key={member.id}
                            className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white"
                            title={member.name}
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ) : null;
                      })}
                    </div>
                    {project.teamMembers.length > 3 && (
                      <span className="text-xs text-gray-500">+{project.teamMembers.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first project</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Create Project
          </button>
        </div>
      )}

      {/* Create Project Form */}
      {showCreateForm && (
        <ProjectForm
          teamMembers={teamMembers}
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Project Form */}
      {editingProject && (
        <ProjectForm
          teamMembers={teamMembers}
          initialData={editingProject}
          onSubmit={handleUpdateProject}
          onCancel={() => setEditingProject(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone and will also delete all associated tasks.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
