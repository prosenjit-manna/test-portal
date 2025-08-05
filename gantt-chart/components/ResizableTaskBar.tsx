'use client';

import { useRef, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { Task, TeamMember } from '@/types';

interface ResizableTaskBarProps {
  task: Task;
  position: { left: number; width: number };
  assignee: TeamMember | undefined;
  isSelected: boolean;
  getTaskColor: (status: Task['status'], priority: Task['priority']) => string;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskSelect: (taskId: string | null) => void;
  timelineStart: Date;
  timelineEnd: Date;
  containerWidth: number;
}

const ITEM_TYPE = 'TASK_RESIZE';

export default function ResizableTaskBar({
  task,
  position,
  assignee,
  isSelected,
  getTaskColor,
  onTaskUpdate,
  onTaskSelect,
  timelineStart,
  timelineEnd,
  containerWidth
}: ResizableTaskBarProps) {
  const taskRef = useRef<HTMLDivElement>(null);
  const startHandleRef = useRef<HTMLDivElement>(null);
  const endHandleRef = useRef<HTMLDivElement>(null);

  // Calculate pixels per day for resize calculations
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const pixelsPerDay = containerWidth / totalDays;

  // Convert pixel movement to date change
  const pixelsToDays = useCallback((pixels: number) => {
    return Math.round(pixels / pixelsPerDay);
  }, [pixelsPerDay]);

  // Handle resize operations
  const handleResize = useCallback((mode: 'start' | 'end', deltaX: number) => {
    const daysDelta = pixelsToDays(deltaX);
    
    console.log('ResizableTaskBar handleResize:', {
      taskId: task.id,
      mode,
      deltaX,
      daysDelta,
      pixelsPerDay,
      originalDates: { startDate: task.startDate, endDate: task.endDate }
    });
    
    if (daysDelta === 0) return;

    const originalStart = new Date(task.startDate + 'T00:00:00');
    const originalEnd = new Date(task.endDate + 'T00:00:00');
    
    let newStartDate = new Date(originalStart);
    let newEndDate = new Date(originalEnd);
    
    if (mode === 'start') {
      // When dragging start handle, only modify start date
      newStartDate.setDate(originalStart.getDate() + daysDelta);
      
      console.log('Start handle drag:', {
        originalStartDate: originalStart.toISOString().split('T')[0],
        daysDelta,
        newStartDate: newStartDate.toISOString().split('T')[0],
        endDateShouldStayTheSame: originalEnd.toISOString().split('T')[0]
      });
      
      // Ensure start date is not after end date (minimum 1 day duration)
      if (newStartDate >= originalEnd) {
        console.log('Start date would be >= end date, adjusting...');
        newStartDate = new Date(originalEnd);
        newStartDate.setDate(originalEnd.getDate() - 1);
      }
      // Keep end date unchanged when resizing start
      newEndDate = new Date(originalEnd);
    } else if (mode === 'end') {
      // When dragging end handle, only modify end date
      newEndDate.setDate(originalEnd.getDate() + daysDelta);
      
      console.log('End handle drag:', {
        originalEndDate: originalEnd.toISOString().split('T')[0],
        daysDelta,
        newEndDate: newEndDate.toISOString().split('T')[0],
        startDateShouldStayTheSame: originalStart.toISOString().split('T')[0]
      });
      
      // Ensure end date is not before start date (minimum 1 day duration)
      if (newEndDate <= originalStart) {
        console.log('End date would be <= start date, adjusting...');
        newEndDate = new Date(originalStart);
        newEndDate.setDate(originalStart.getDate() + 1);
      }
      // Keep start date unchanged when resizing end
      newStartDate = new Date(originalStart);
    }
    
    const newStartDateStr = newStartDate.toISOString().split('T')[0];
    const newEndDateStr = newEndDate.toISOString().split('T')[0];
    
    console.log('Date calculation result:', {
      taskId: task.id,
      mode,
      original: { startDate: task.startDate, endDate: task.endDate },
      calculated: { startDate: newStartDateStr, endDate: newEndDateStr },
      daysDelta
    });
    
    // Only update if dates actually changed
    const startChanged = newStartDateStr !== task.startDate;
    const endChanged = newEndDateStr !== task.endDate;
    
    if (startChanged || endChanged) {
      console.log('Updating task via React DnD:', {
        taskId: task.id,
        mode,
        daysDelta,
        from: { startDate: task.startDate, endDate: task.endDate },
        to: { startDate: newStartDateStr, endDate: newEndDateStr },
        changedFields: { startChanged, endChanged }
      });
      
      // CRITICAL: Only send the fields that should change based on mode
      const updates: Partial<Task> = {};
      if (mode === 'start' && startChanged) {
        updates.startDate = newStartDateStr;
        // Explicitly ensure we DON'T send endDate for start handle
        console.log('Start handle: Only updating startDate to:', newStartDateStr);
      } else if (mode === 'end' && endChanged) {
        updates.endDate = newEndDateStr;
        // Explicitly ensure we DON'T send startDate for end handle
        console.log('End handle: Only updating endDate to:', newEndDateStr);
      } else {
        console.log('No valid changes to send for mode:', mode);
        return;
      }
      
      console.log('Final updates payload:', updates);
      onTaskUpdate(task.id, updates);
    } else {
      console.log('No changes detected for task:', task.id, 'mode:', mode);
    }
  }, [task, pixelsToDays, onTaskUpdate]);

  // Drag source for start handle
  const [{ isDraggingStart }, dragStartRef, previewStart] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { taskId: task.id, mode: 'start' },
    collect: (monitor) => ({
      isDraggingStart: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      console.log('Start handle drag end:', { item, didDrop: monitor.didDrop() });
      if (!monitor.didDrop()) {
        const delta = monitor.getDifferenceFromInitialOffset();
        console.log('Start handle delta:', delta);
        if (delta) {
          console.log('Calling handleResize for START with delta.x:', delta.x);
          handleResize('start', delta.x);
        }
      }
    },
  }), [task.id, handleResize]);

  // Drag source for end handle
  const [{ isDraggingEnd }, dragEndRef, previewEnd] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { taskId: task.id, mode: 'end' },
    collect: (monitor) => ({
      isDraggingEnd: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      console.log('End handle drag end:', { item, didDrop: monitor.didDrop() });
      if (!monitor.didDrop()) {
        const delta = monitor.getDifferenceFromInitialOffset();
        console.log('End handle delta:', delta);
        if (delta) {
          console.log('Calling handleResize for END with delta.x:', delta.x);
          handleResize('end', delta.x);
        }
      }
    },
  }), [task.id, handleResize]);

  // Combine refs
  const combinedStartRef = useCallback((node: HTMLDivElement | null) => {
    if (startHandleRef.current !== node) {
      (startHandleRef as any).current = node;
    }
    dragStartRef(node);
  }, [dragStartRef]);

  const combinedEndRef = useCallback((node: HTMLDivElement | null) => {
    if (endHandleRef.current !== node) {
      (endHandleRef as any).current = node;
    }
    dragEndRef(node);
  }, [dragEndRef]);

  const isDragging = isDraggingStart || isDraggingEnd;

  return (
    <div
      ref={taskRef}
      className="relative mb-2"
      style={{ height: '40px' }}
    >
      <div
        className={`absolute top-0 h-8 flex items-center group cursor-pointer transition-all duration-200 hover:shadow-md ${
          getTaskColor(task.status, task.priority)
        } ${isDragging ? 'opacity-80 scale-105' : ''} ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
        }`}
        style={{
          left: `${position.left}%`,
          width: `${position.width}%`,
          minWidth: '60px'
        }}
        onClick={() => onTaskSelect(isSelected ? null : task.id)}
        title={`${task.name} - ${assignee?.name || 'Unassigned'} (${task.progress}%)`}
      >
        {/* Start Resize Handle */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white hover:bg-opacity-30 transition-opacity z-10 ${
            isDraggingStart ? 'opacity-100 bg-orange-500' : ''
          }`}
          title="Drag to adjust start date"
          ref={combinedStartRef}
        >
          <div className="w-1 h-full bg-white bg-opacity-50 ml-0.5 rounded-r"></div>
        </div>

        {/* Task Content */}
        <div className="flex-1 flex items-center px-2 pointer-events-none">
          <span className="text-xs font-medium truncate">
            {task.name}
          </span>
        </div>

        {/* End Resize Handle */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white hover:bg-opacity-30 transition-opacity z-10 ${
            isDraggingEnd ? 'opacity-100 bg-orange-500' : ''
          }`}
          title="Drag to adjust end date"
          ref={combinedEndRef}
        >
          <div className="w-1 h-full bg-white bg-opacity-50 mr-0.5 rounded-l"></div>
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 rounded-b pointer-events-none">
          <div
            className="h-full bg-white bg-opacity-50 rounded-b transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>

        {/* Resize Indicator */}
        {isDragging && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            Resizing {isDraggingStart ? 'start' : 'end'} date
          </div>
        )}
      </div>
    </div>
  );
}
