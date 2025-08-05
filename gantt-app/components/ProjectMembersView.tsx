'use client';

import { Project, TeamMember, Task } from '@/types';
import { Users, User, Mail, UserCheck, Clock, CheckCircle } from 'lucide-react';

interface ProjectMembersViewProps {
  projects: Project[];
  teamMembers: TeamMember[];
  tasks: Task[];
}

export default function ProjectMembersView({ projects, teamMembers, tasks }: ProjectMembersViewProps) {
  // Get members for a specific project
  const getProjectMembers = (project: Project) => {
    return teamMembers.filter(member => project.teamMembers.includes(member.id));
  };

  // Get task statistics for a member in a specific project
  const getMemberProjectStats = (memberId: string, projectId: string) => {
    const memberTasks = tasks.filter(task => 
      task.assignee === memberId && task.projectId === projectId
    );
    
    return {
      total: memberTasks.length,
      completed: memberTasks.filter(task => task.status === 'completed').length,
      inProgress: memberTasks.filter(task => task.status === 'in-progress').length,
      overdue: memberTasks.filter(task => task.status === 'overdue').length,
      avgProgress: memberTasks.length > 0 
        ? Math.round(memberTasks.reduce((sum, task) => sum + task.progress, 0) / memberTasks.length)
        : 0
    };
  };

  // Get unassigned members (not in any project)
  const getUnassignedMembers = () => {
    const assignedMemberIds = new Set();
    projects.forEach(project => {
      project.teamMembers.forEach(memberId => assignedMemberIds.add(memberId));
    });
    return teamMembers.filter(member => !assignedMemberIds.has(member.id));
  };

  const unassignedMembers = getUnassignedMembers();

  const getStatusColor = (status: 'active' | 'completed' | 'on-hold') => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMemberInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-6 w-6" />
            Team Members by Project
          </h2>
          <p className="text-gray-600 mt-1">
            View team member assignments and their progress across all projects
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Members</div>
          <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
        </div>
      </div>

      {/* Projects with Members */}
      <div className="space-y-6">
        {projects.map(project => {
          const projectMembers = getProjectMembers(project);
          
          return (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border">
              {/* Project Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{project.startDate} - {project.endDate}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Team Size</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {projectMembers.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Members */}
              <div className="p-6">
                {projectMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No team members assigned to this project</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectMembers.map(member => {
                      const stats = getMemberProjectStats(member.id, project.id);
                      
                      return (
                        <div key={member.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {getMemberInitials(member.name)}
                            </div>
                            
                            {/* Member Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {member.name}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {member.role}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 mb-3">
                                <Mail className="w-3 h-3 mr-1" />
                                <span className="truncate">{member.email}</span>
                              </div>
                              
                              {/* Task Statistics */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white rounded p-2 border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Tasks</span>
                                    <span className="font-semibold">{stats.total}</span>
                                  </div>
                                </div>
                                <div className="bg-white rounded p-2 border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Done</span>
                                    <span className="font-semibold text-green-600">{stats.completed}</span>
                                  </div>
                                </div>
                                <div className="bg-white rounded p-2 border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-blue-600">{stats.avgProgress}%</span>
                                  </div>
                                </div>
                                <div className="bg-white rounded p-2 border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Active</span>
                                    <span className="font-semibold text-orange-600">{stats.inProgress}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              {stats.total > 0 && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Overall Progress</span>
                                    <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Unassigned Members */}
        {unassignedMembers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-gray-500" />
                Unassigned Members
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Team members not currently assigned to any project
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedMembers.map(member => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {getMemberInitials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {member.role}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="w-3 h-3 mr-1" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          Available for assignment
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              Create your first project to start organizing team members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
