'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TeamMember } from '@/types';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, X, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ResizableTaskBar from './ResizableTaskBar';
import TaskDetailsModal from './TaskDetailsModal';

type ViewType = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface GanttChartProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

interface TimelineConfig {
  unit: string;
  format: string;
  step: number;
  subGridLines: number;
}

const timelineConfigs: Record<ViewType, TimelineConfig> = {
  day: { unit: 'day', format: 'MMM dd', step: 1, subGridLines: 4 },
  week: { unit: 'week', format: 'MMM dd', step: 7, subGridLines: 7 },
  month: { unit: 'month', format: 'MMM yyyy', step: 30, subGridLines: 4 },
  quarter: { unit: 'quarter', format: 'QQQ yyyy', step: 90, subGridLines: 3 },
  year: { unit: 'year', format: 'yyyy', step: 365, subGridLines: 12 }
};

export default function GanttChart({ tasks, teamMembers, onTaskUpdate }: GanttChartProps) {
  const [currentView, setCurrentView] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sorting states
  const [sortBy, setSortBy] = useState<'startDate' | 'endDate' | 'name' | 'priority' | 'progress' | 'status'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Task details modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const config = timelineConfigs[currentView];

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesAssignee = assigneeFilter === 'all' || 
        (assigneeFilter === 'unassigned' ? !teamMembers.some(m => m.id === task.assignee) : task.assignee === assigneeFilter);
      
      return matchesSearch && matchesStatus && matchesAssignee;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'endDate':
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'status':
          const statusOrder = { 'completed': 4, 'in-progress': 3, 'not-started': 2, 'overdue': 1 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, assigneeFilter, sortBy, sortOrder]);

  // Calculate timeline range based on current view
  const { timelineStart, timelineEnd, timelineColumns } = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (currentView) {
      case 'day':
        start.setDate(start.getDate() - 3);
        end.setDate(end.getDate() + 10);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay() - 14);
        end.setDate(start.getDate() + 42);
        break;
      case 'month':
        start.setDate(1);
        start.setMonth(start.getMonth() - 1);
        end.setDate(1);
        end.setMonth(end.getMonth() + 4);
        break;
      case 'quarter':
        const quarterStart = Math.floor(start.getMonth() / 3) * 3;
        start.setMonth(quarterStart - 3);
        start.setDate(1);
        end.setMonth(quarterStart + 9);
        end.setDate(1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        start.setMonth(0, 1);
        end.setFullYear(end.getFullYear() + 2);
        end.setMonth(11, 31);
        break;
    }

    const columns: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      columns.push(new Date(current));
      current.setDate(current.getDate() + config.step);
    }

    return {
      timelineStart: start,
      timelineEnd: end,
      timelineColumns: columns
    };
  }, [currentDate, currentView, config.step]);

  // Format date based on view type
  const formatDate = (date: Date): string => {
    switch (currentView) {
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case 'year':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  // Calculate task position and width
  const getTaskPosition = (task: Task) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const startOffset = Math.ceil((startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const leftPercent = Math.max(0, (startOffset / totalDays) * 100);
    const widthPercent = Math.min(100 - leftPercent, (duration / totalDays) * 100);
    
    return { left: leftPercent, width: Math.max(widthPercent, 1) };
  };

  // Get task status color
  const getTaskColor = (status: Task['status'], priority: Task['priority']) => {
    const baseClasses = "rounded-md border shadow-sm";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 border-green-600 text-white`;
      case 'in-progress':
        return priority === 'high' 
          ? `${baseClasses} bg-red-500 border-red-600 text-white`
          : priority === 'medium'
          ? `${baseClasses} bg-yellow-500 border-yellow-600 text-white`
          : `${baseClasses} bg-blue-500 border-blue-600 text-white`;
      case 'overdue':
        return `${baseClasses} bg-red-600 border-red-700 text-white`;
      default:
        return `${baseClasses} bg-gray-400 border-gray-500 text-white`;
    }
  };

  // Get team member by ID
  const getTeamMember = (id: string) => {
    return teamMembers.find(member => member.id === id);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAssigneeFilter('all');
  };

  // Handle sorting
  const handleSort = useCallback((newSortBy: typeof sortBy) => {
    // Determine new sort order
    const newSortOrder = sortBy === newSortBy ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
    
    // Update states
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, [sortBy, sortOrder]);

  // Handle task editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    if (onTaskUpdate) {
      await onTaskUpdate(taskId, updates);
    }
  };



  // Get status options for filter
  const statusOptions: { value: Task['status'] | 'all', label: string, count: number }[] = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'not-started', label: 'Not Started', count: tasks.filter(t => t.status === 'not-started').length },
    { value: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { value: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
    { value: 'overdue', label: 'Overdue', count: tasks.filter(t => t.status === 'overdue').length },
  ];

  // Get assignee options for filter
  const assigneeOptions: { value: string | 'all', label: string, count: number }[] = [
    { value: 'all', label: 'All Assignees', count: tasks.length },
    ...teamMembers.map(member => ({
      value: member.id,
      label: member.name,
      count: tasks.filter(t => t.assignee === member.id).length
    })),
    // Add unassigned option if there are any unassigned tasks
    ...(tasks.some(t => !teamMembers.some(m => m.id === t.assignee)) ? [{
      value: 'unassigned',
      label: 'Unassigned',
      count: tasks.filter(t => !teamMembers.some(m => m.id === t.assignee)).length
    }] : [])
  ];

  // Handle view navigation
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 21 : -21));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 12 : -12));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 3 : -3));
        break;
    }
    
    setCurrentDate(newDate);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full bg-white">
      {/* Header Controls */}
      <div className="flex flex-col space-y-4 p-4 border-b bg-gray-50">
        {/* Top Row - Title and View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Gantt Chart
            </h3>
            
            {/* View Type Selector */}
            <div className="flex bg-white rounded-lg border">
              {(['day', 'week', 'month', 'quarter', 'year'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-3 py-1 text-sm font-medium capitalize transition-colors ${
                    currentView === view
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateTimeline('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            >
              Today
            </button>
            
            <button
              onClick={() => navigateTimeline('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Second Row - Search and Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                showFilters || statusFilter !== 'all' || assigneeFilter !== 'all'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(statusFilter !== 'all' || assigneeFilter !== 'all') && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {(statusFilter !== 'all' ? 1 : 0) + (assigneeFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>



            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || assigneeFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500">
            {filteredTasks.length === tasks.length 
              ? `${tasks.length} tasks`
              : `${filteredTasks.length} of ${tasks.length} tasks`
            }
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="space-y-6">
              {/* Status Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors text-left ${
                        statusFilter === option.value
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{option.label}</span>
                        <span className="text-xs text-gray-500">({option.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Assignee</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {assigneeOptions.filter(option => option.count > 0).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAssigneeFilter(option.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors text-left ${
                        assigneeFilter === option.value
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{option.label}</span>
                        <span className="text-xs text-gray-500 ml-1">({option.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gantt Chart Content */}
      <div className="flex h-96 overflow-hidden">
        {/* Task List Sidebar */}
        <div className="w-64 bg-gray-50 border-r flex-shrink-0">
          <div className="h-12 bg-gray-100 border-b flex items-center justify-between px-4">
            <span className="font-medium text-gray-700">Tasks ({filteredTasks.length})</span>
            <div className="flex items-center space-x-1">
              {/* Quick sort buttons */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSort('startDate');
                }}
                className={`p-1 text-xs rounded hover:bg-gray-200 transition-colors ${
                  sortBy === 'startDate' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                }`}
                title="Sort by start date"
              >
                Start {sortBy === 'startDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSort('endDate');
                }}
                className={`p-1 text-xs rounded hover:bg-gray-200 transition-colors ${
                  sortBy === 'endDate' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                }`}
                title="Sort by end date"
              >
                End {sortBy === 'endDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 3rem)' }}>
            {/* Sort Info */}
            {(sortBy === 'startDate' || sortBy === 'endDate') && filteredTasks.length > 0 && (
              <div className="px-3 py-2 bg-blue-50 border-b text-xs text-blue-700">
                Sorted by {sortBy === 'startDate' ? 'start date' : 'end date'} ({sortOrder === 'asc' ? 'earliest first' : 'latest first'})
              </div>
            )}
            
            {filteredTasks.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-sm">
                  {searchTerm || statusFilter !== 'all' || assigneeFilter !== 'all'
                    ? 'No tasks match your filters'
                    : 'No tasks available'
                  }
                </div>
                {(searchTerm || statusFilter !== 'all' || assigneeFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => {
                const assignee = getTeamMember(task.assignee);
                return (
                  <div
                    key={task.id}
                    className={`group p-3 border-b hover:bg-gray-100 ${
                      selectedTask === task.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      >
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {task.name}
                          {searchTerm && task.name.toLowerCase().includes(searchTerm.toLowerCase()) && (
                            <span className="ml-1 text-xs text-blue-600">●</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {assignee?.name || 'Unassigned'}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className={`text-xs px-2 py-0.5 rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status.replace('-', ' ')}
                          </div>
                          <div className="ml-2 text-xs text-gray-500">
                            {task.progress}%
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit task"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-x-auto" data-timeline-container>
          {/* Timeline Header */}
          <div className="h-12 bg-gray-100 border-b flex">
            {timelineColumns.map((date, index) => (
              <div
                key={index}
                className="flex-shrink-0 border-r border-gray-200 px-2 py-2 text-xs font-medium text-gray-700 text-center"
                style={{ minWidth: `${100 / timelineColumns.length}%` }}
              >
                {formatDate(date)}
              </div>
            ))}
          </div>

          {/* Timeline Grid and Tasks */}
          <div className="relative" style={{ height: 'calc(100% - 3rem)' }}>
            {/* Grid Lines */}
            <div className="absolute inset-0 flex">
              {timelineColumns.map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 border-r border-gray-100"
                  style={{ minWidth: `${100 / timelineColumns.length}%` }}
                />
              ))}
            </div>

            {/* Task Bars */}
            <div className="relative z-10 p-2">
              {filteredTasks.map((task, index) => {
                const position = getTaskPosition(task);
                const assignee = getTeamMember(task.assignee);
                
                // Calculate container width for pixel calculations
                const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
                const containerWidth = 800; // Approximate width, will be refined by component
                
                return (
                  <div
                    key={task.id}
                    className="relative mb-2"
                    style={{ height: '40px' }}
                  >
                    <ResizableTaskBar
                      task={task}
                      position={position}
                      assignee={assignee}
                      timelineStart={timelineStart}
                      timelineEnd={timelineEnd}
                      containerWidth={containerWidth}
                      getTaskColor={getTaskColor}
                      onTaskUpdate={onTaskUpdate || (() => {})}
                      isSelected={selectedTask === task.id}
                      onTaskSelect={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      onTaskEdit={handleEditTask}
                    />
                  </div>
                );
              })}
            </div>

            {/* Current Date Indicator */}
            <div className="absolute inset-y-0 pointer-events-none">
              {(() => {
                const now = new Date();
                const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
                const nowOffset = Math.ceil((now.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
                const nowPercent = (nowOffset / totalDays) * 100;
                
                if (nowPercent >= 0 && nowPercent <= 100) {
                  return (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                      style={{ left: `${nowPercent}%` }}
                    >
                      <div className="absolute top-0 -left-1 w-3 h-3 bg-red-500 rounded-full" />
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Panel */}
      {selectedTask && (() => {
        const task = filteredTasks.find(t => t.id === selectedTask);
        const assignee = task ? getTeamMember(task.assignee) : null;
        
        return task ? (
          <div className="border-t bg-gray-50 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">{task.name}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Assignee:</span>
                    <div className="text-gray-600">{assignee?.name || 'Unassigned'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className="text-gray-600 capitalize">{task.status.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Priority:</span>
                    <div className="text-gray-600 capitalize">{task.priority}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Progress:</span>
                    <div className="text-gray-600">{task.progress}%</div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Start Date:</span>
                    <div className="text-gray-600">{new Date(task.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">End Date:</span>
                    <div className="text-gray-600">{new Date(task.endDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit task"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={editingTask}
        isOpen={showTaskModal}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        teamMembers={teamMembers}
      />
      </div>
    </DndProvider>
  );
}
