'use client';

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task, TeamMember } from '@/types';

interface DraggableTaskRowProps {
  task: Task;
  index: number;
  assignee: TeamMember | undefined;
  onMoveTask: (dragIndex: number, hoverIndex: number) => void;
  onSelectTask: (taskId: string | null) => void;
  selectedTask: string | null;
}

const TASK_ROW_TYPE = 'TASK_ROW';

interface DragItem {
  type: string;
  index: number;
  id: string;
}

export default function DraggableTaskRow({
  task,
  index,
  assignee,
  onMoveTask,
  onSelectTask,
  selectedTask
}: DraggableTaskRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: TASK_ROW_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMoveTask(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: TASK_ROW_TYPE,
    item: () => {
      return { id: task.id, index, type: TASK_ROW_TYPE };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`p-3 border-b border-gray-200 cursor-move hover:bg-gray-50 transition-colors ${
        selectedTask === task.id ? 'bg-blue-50 border-blue-200' : ''
      } ${isDragging ? 'bg-gray-100' : ''}`}
      onClick={() => onSelectTask(selectedTask === task.id ? null : task.id)}
      title="Drag to reorder tasks"
    >
      <div className="flex items-start space-x-2">
        {/* Priority Indicator */}
        <div
          className={`w-1 h-12 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`}
          title={`${task.priority} priority`}
        />
        
        <div className="flex-1 min-w-0">
          {/* Task Name */}
          <p className="text-sm font-medium text-gray-900 truncate" title={task.name}>
            {task.name}
          </p>
          
          {/* Task Details */}
          <div className="mt-1 flex flex-col space-y-1">
            {/* Status */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            
            {/* Assignee */}
            <p className="text-xs text-gray-500 truncate">
              {assignee?.name || 'Unassigned'}
            </p>
            
            {/* Dates */}
            <p className="text-xs text-gray-500">
              {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
            </p>
            
            {/* Progress */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">{task.progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
