'use client';

import { useState, useEffect } from 'react';
import { Project, Task, TeamMember } from '@/types';
import GanttChart from '@/components/GanttChart';
import TeamDashboard from '@/components/TeamDashboard';
import TaskForm from '@/components/TaskForm';
import ProjectForm from '@/components/ProjectForm';
import DatabaseManager from '@/components/DatabaseManager';
import TeamManager from '@/components/TeamManager';
import { Plus, BarChart3, Users, Calendar, Menu, Settings, FolderPlus } from 'lucide-react';
import { selectClasses, buttonClasses } from '@/lib/styles';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [currentView, setCurrentView] = useState<'gantt' | 'dashboard' | 'settings'>('gantt');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      setProjects(projectsData);
      
      // Fetch team members
      const teamRes = await fetch('/api/team');
      const teamData = await teamRes.json();
      setTeamMembers(teamData);
      
      // Select first project by default
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [...prev, newTask]);
        setShowTaskForm(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

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
        setProjects(prev => [...prev, newProject]);
        setSelectedProject(newProject.id);
        setShowProjectForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => 
          task.id === taskId ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Project Gantt</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Project Selector */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className={selectClasses.base}
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('gantt')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'gantt'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Gantt
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-1" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'settings'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="h-4 w-4 inline mr-1" />
                  Settings
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {/* Create Project Button */}
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  Project
                </button>

                {/* Add Task Button */}
                {currentView !== 'settings' && (
                  <button
                    onClick={() => setShowTaskForm(true)}
                    disabled={!selectedProject}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedProject ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No project selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a project from the dropdown to view its tasks and progress.
            </p>
          </div>
        ) : (
          <>
            {/* Project Info */}
            {selectedProjectData && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedProjectData.name}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {selectedProjectData.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{selectedProjectData.startDate} - {selectedProjectData.endDate}</span>
                      <span className="mx-2">•</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProjectData.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : selectedProjectData.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedProjectData.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Team Members</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {selectedProjectData.teamMembers.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Based on View */}
            {currentView === 'gantt' ? (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <GanttChart
                  tasks={tasks}
                  teamMembers={teamMembers}
                  onTaskUpdate={handleTaskUpdate}
                />
              </div>
            ) : currentView === 'dashboard' ? (
              <TeamDashboard
                tasks={tasks}
                teamMembers={teamMembers}
              />
            ) : (
              <div className="space-y-6">
                <TeamManager 
                  teamMembers={teamMembers}
                  onTeamMemberChange={fetchData}
                />
                <DatabaseManager
                  onDataChange={fetchData}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Task Form Modal */}
      {showTaskForm && selectedProjectData && (
        <TaskForm
          project={selectedProjectData}
          teamMembers={teamMembers}
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          teamMembers={teamMembers}
          onSubmit={handleCreateProject}
          onCancel={() => setShowProjectForm(false)}
        />
      )}
    </div>
  );
}
