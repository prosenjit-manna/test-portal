export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  assignee: string;
  dependencies: string[];
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-hold';
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface DatabaseSchema {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
}
