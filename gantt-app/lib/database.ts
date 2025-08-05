import { JSONFileSync } from 'lowdb/node';
import { LowSync } from 'lowdb';
import { DatabaseSchema, Project, Task, TeamMember } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class Database {
  private db: LowSync<DatabaseSchema>;

  constructor() {
    const file = path.join(process.cwd(), 'data', 'db.json');
    const adapter = new JSONFileSync<DatabaseSchema>(file);
    this.db = new LowSync(adapter, {
      projects: [],
      tasks: [],
      teamMembers: []
    });
    
    // Initialize the database
    this.db.read();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default team members if none exist
    if (this.db.data.teamMembers.length === 0) {
      const defaultMembers: TeamMember[] = [
        {
          id: uuidv4(),
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Project Manager'
        },
        {
          id: uuidv4(),
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Developer'
        },
        {
          id: uuidv4(),
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'Designer'
        }
      ];
      this.db.data.teamMembers = defaultMembers;
      this.db.write();
    }

    // Add sample project if none exist
    if (this.db.data.projects.length === 0) {
      const sampleProject: Project = {
        id: uuidv4(),
        name: 'Sample Project',
        description: 'A sample project to demonstrate the Gantt chart functionality',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        status: 'active',
        teamMembers: this.db.data.teamMembers.map(m => m.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.db.data.projects.push(sampleProject);

      // Add sample tasks
      const sampleTasks: Task[] = [
        {
          id: uuidv4(),
          name: 'Project Planning',
          description: 'Initial project planning and requirements gathering',
          startDate: '2024-01-01',
          endDate: '2024-01-15',
          status: 'completed',
          assignee: this.db.data.teamMembers[0].id,
          dependencies: [],
          progress: 100,
          priority: 'high',
          projectId: sampleProject.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'UI Design',
          description: 'Create user interface designs and mockups',
          startDate: '2024-01-16',
          endDate: '2024-02-15',
          status: 'in-progress',
          assignee: this.db.data.teamMembers[2].id,
          dependencies: [],
          progress: 60,
          priority: 'medium',
          projectId: sampleProject.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'Development',
          description: 'Implement the application features',
          startDate: '2024-02-01',
          endDate: '2024-03-15',
          status: 'in-progress',
          assignee: this.db.data.teamMembers[1].id,
          dependencies: [],
          progress: 30,
          priority: 'high',
          projectId: sampleProject.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'Testing',
          description: 'Quality assurance and testing',
          startDate: '2024-03-01',
          endDate: '2024-03-25',
          status: 'not-started',
          assignee: this.db.data.teamMembers[1].id,
          dependencies: [],
          progress: 0,
          priority: 'medium',
          projectId: sampleProject.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.db.data.tasks.push(...sampleTasks);
      this.db.write();
    }
  }

  // Projects
  getProjects(): Project[] {
    this.db.read();
    return this.db.data.projects;
  }

  getProject(id: string): Project | undefined {
    this.db.read();
    return this.db.data.projects.find(p => p.id === id);
  }

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.db.data.projects.push(newProject);
    this.db.write();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    this.db.read();
    const projectIndex = this.db.data.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    this.db.data.projects[projectIndex] = {
      ...this.db.data.projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.db.write();
    return this.db.data.projects[projectIndex];
  }

  deleteProject(id: string): boolean {
    this.db.read();
    const initialLength = this.db.data.projects.length;
    this.db.data.projects = this.db.data.projects.filter(p => p.id !== id);
    // Also delete related tasks
    this.db.data.tasks = this.db.data.tasks.filter(t => t.projectId !== id);
    this.db.write();
    return this.db.data.projects.length < initialLength;
  }

  // Tasks
  getTasks(projectId?: string): Task[] {
    this.db.read();
    if (projectId) {
      return this.db.data.tasks.filter(t => t.projectId === projectId);
    }
    return this.db.data.tasks;
  }

  getTask(id: string): Task | undefined {
    this.db.read();
    return this.db.data.tasks.find(t => t.id === id);
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.db.data.tasks.push(newTask);
    this.db.write();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    this.db.read();
    const taskIndex = this.db.data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    this.db.data.tasks[taskIndex] = {
      ...this.db.data.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.db.write();
    return this.db.data.tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    this.db.read();
    const initialLength = this.db.data.tasks.length;
    this.db.data.tasks = this.db.data.tasks.filter(t => t.id !== id);
    this.db.write();
    return this.db.data.tasks.length < initialLength;
  }

  // Team Members
  getTeamMembers(): TeamMember[] {
    this.db.read();
    return this.db.data.teamMembers;
  }

  getTeamMember(id: string): TeamMember | undefined {
    this.db.read();
    return this.db.data.teamMembers.find(m => m.id === id);
  }

  createTeamMember(member: Omit<TeamMember, 'id'>): TeamMember {
    const newMember: TeamMember = {
      ...member,
      id: uuidv4()
    };
    this.db.data.teamMembers.push(newMember);
    this.db.write();
    return newMember;
  }

  updateTeamMember(id: string, updates: Partial<TeamMember>): TeamMember | null {
    this.db.read();
    const memberIndex = this.db.data.teamMembers.findIndex(m => m.id === id);
    if (memberIndex === -1) return null;

    this.db.data.teamMembers[memberIndex] = {
      ...this.db.data.teamMembers[memberIndex],
      ...updates
    };
    this.db.write();
    return this.db.data.teamMembers[memberIndex];
  }

  deleteTeamMember(id: string): boolean {
    this.db.read();
    const initialLength = this.db.data.teamMembers.length;
    this.db.data.teamMembers = this.db.data.teamMembers.filter(m => m.id !== id);
    this.db.write();
    return this.db.data.teamMembers.length < initialLength;
  }

  // Database Management Methods
  cleanDatabase(): void {
    this.db.data = {
      projects: [],
      tasks: [],
      teamMembers: []
    };
    this.db.write();
  }

  seedDatabase(): void {
    // Clear existing data first
    this.db.data = {
      projects: [],
      tasks: [],
      teamMembers: []
    };

    // Create sample team members
    const sampleMembers: TeamMember[] = [
      {
        id: uuidv4(),
        name: 'Alice Johnson',
        email: 'alice@company.com',
        role: 'Project Manager'
      },
      {
        id: uuidv4(),
        name: 'Bob Smith',
        email: 'bob@company.com',
        role: 'Senior Developer'
      },
      {
        id: uuidv4(),
        name: 'Carol Williams',
        email: 'carol@company.com',
        role: 'UI/UX Designer'
      },
      {
        id: uuidv4(),
        name: 'David Brown',
        email: 'david@company.com',
        role: 'Backend Developer'
      },
      {
        id: uuidv4(),
        name: 'Eva Davis',
        email: 'eva@company.com',
        role: 'QA Engineer'
      }
    ];
    
    this.db.data.teamMembers = sampleMembers;

    // Create sample projects
    const sampleProjects: Project[] = [
      {
        id: uuidv4(),
        name: 'E-commerce Platform Development',
        description: 'Complete overhaul of the company e-commerce platform with modern tech stack',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        status: 'active',
        teamMembers: sampleMembers.map(m => m.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Mobile App Launch',
        description: 'Development and launch of iOS and Android mobile applications',
        startDate: '2024-03-01',
        endDate: '2024-09-30',
        status: 'active',
        teamMembers: [sampleMembers[0].id, sampleMembers[1].id, sampleMembers[2].id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Data Migration Project',
        description: 'Migrate legacy data to new cloud infrastructure',
        startDate: '2024-02-15',
        endDate: '2024-05-15',
        status: 'completed',
        teamMembers: [sampleMembers[1].id, sampleMembers[3].id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.db.data.projects = sampleProjects;

    // Create sample tasks for the first project
    const firstProject = sampleProjects[0];
    const sampleTasks: Task[] = [
      {
        id: uuidv4(),
        name: 'Project Planning & Requirements',
        description: 'Define project scope, requirements, and create project roadmap',
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        status: 'completed',
        assignee: sampleMembers[0].id, // Alice (PM)
        dependencies: [],
        progress: 100,
        priority: 'high',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'System Architecture Design',
        description: 'Design the overall system architecture and technology stack',
        startDate: '2024-01-10',
        endDate: '2024-01-25',
        status: 'completed',
        assignee: sampleMembers[1].id, // Bob (Senior Dev)
        dependencies: [],
        progress: 100,
        priority: 'high',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'UI/UX Design & Wireframes',
        description: 'Create user interface designs, wireframes, and user experience flow',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        status: 'completed',
        assignee: sampleMembers[2].id, // Carol (Designer)
        dependencies: [],
        progress: 100,
        priority: 'medium',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Frontend Development',
        description: 'Implement the user interface using React and modern frontend technologies',
        startDate: '2024-02-01',
        endDate: '2024-04-15',
        status: 'in-progress',
        assignee: sampleMembers[1].id, // Bob
        dependencies: [],
        progress: 65,
        priority: 'high',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Backend API Development',
        description: 'Develop RESTful APIs and database integration',
        startDate: '2024-02-15',
        endDate: '2024-05-01',
        status: 'in-progress',
        assignee: sampleMembers[3].id, // David (Backend Dev)
        dependencies: [],
        progress: 45,
        priority: 'high',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Payment Integration',
        description: 'Integrate payment gateways and implement secure payment processing',
        startDate: '2024-03-01',
        endDate: '2024-04-01',
        status: 'in-progress',
        assignee: sampleMembers[3].id, // David
        dependencies: [],
        progress: 25,
        priority: 'high',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Testing & Quality Assurance',
        description: 'Comprehensive testing including unit tests, integration tests, and user acceptance testing',
        startDate: '2024-04-01',
        endDate: '2024-05-15',
        status: 'not-started',
        assignee: sampleMembers[4].id, // Eva (QA)
        dependencies: [],
        progress: 0,
        priority: 'medium',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Performance Optimization',
        description: 'Optimize application performance, loading times, and user experience',
        startDate: '2024-05-01',
        endDate: '2024-05-30',
        status: 'not-started',
        assignee: sampleMembers[1].id, // Bob
        dependencies: [],
        progress: 0,
        priority: 'medium',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Security Audit & Implementation',
        description: 'Conduct security audit and implement necessary security measures',
        startDate: '2024-05-15',
        endDate: '2024-06-15',
        status: 'not-started',
        assignee: sampleMembers[3].id, // David
        dependencies: [],
        progress: 0,
        priority: 'high',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Deployment & Launch',
        description: 'Deploy to production environment and coordinate launch activities',
        startDate: '2024-06-15',
        endDate: '2024-06-30',
        status: 'not-started',
        assignee: sampleMembers[0].id, // Alice (PM)
        dependencies: [],
        progress: 0,
        priority: 'high',
        projectId: firstProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Add some tasks for the second project (Mobile App)
    const secondProject = sampleProjects[1];
    const mobileAppTasks: Task[] = [
      {
        id: uuidv4(),
        name: 'Mobile App Concept & Planning',
        description: 'Define mobile app features, target platforms, and development strategy',
        startDate: '2024-03-01',
        endDate: '2024-03-15',
        status: 'completed',
        assignee: sampleMembers[0].id, // Alice
        dependencies: [],
        progress: 100,
        priority: 'high',
        projectId: secondProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Mobile UI/UX Design',
        description: 'Create mobile-specific designs and user experience flows',
        startDate: '2024-03-15',
        endDate: '2024-04-30',
        status: 'in-progress',
        assignee: sampleMembers[2].id, // Carol
        dependencies: [],
        progress: 70,
        priority: 'medium',
        projectId: secondProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'React Native Development',
        description: 'Develop cross-platform mobile application using React Native',
        startDate: '2024-05-01',
        endDate: '2024-08-15',
        status: 'not-started',
        assignee: sampleMembers[1].id, // Bob
        dependencies: [],
        progress: 0,
        priority: 'high',
        projectId: secondProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.db.data.tasks = [...sampleTasks, ...mobileAppTasks];
    this.db.write();
  }

  getDatabaseStats() {
    this.db.read();
    return {
      projects: this.db.data.projects.length,
      tasks: this.db.data.tasks.length,
      teamMembers: this.db.data.teamMembers.length,
      completedTasks: this.db.data.tasks.filter(t => t.status === 'completed').length,
      inProgressTasks: this.db.data.tasks.filter(t => t.status === 'in-progress').length,
      notStartedTasks: this.db.data.tasks.filter(t => t.status === 'not-started').length
    };
  }
}

export const database = new Database();
