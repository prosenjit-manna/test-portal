# Gantt Chart Application

A modern, interactive Gantt chart application built with Next.js 14 and TypeScript for project management and team progress tracking. Features JSON-based file storage using [lowdb](https://github.com/typicode/lowdb) for lightweight data persistence.

## 🚀 Features

- **Interactive Gantt Charts**: Visual timeline view of project tasks with drag-and-drop functionality
- **Team Dashboard**: Comprehensive team performance metrics and progress tracking
- **Task Management**: Create, edit, update, and delete tasks with detailed information
- **Team Member Management**: Full CRUD operations for team members with role management
- **Project Management**: Create, edit, and manage multiple projects with team assignments
- **Database Management**: Clean, seed, and reset database with sample data
- **Real-time Updates**: Instant progress updates and status changes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **JSON Database**: Lightweight file-based storage using lowdb
- **Search & Filter**: Search team members by name, email, or role
- **Role-based Color Coding**: Visual distinction between different team roles

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: LowDB (JSON file storage)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **UUID Generation**: uuid

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gantt-chart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
gantt-chart/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── projects/      # Project endpoints
│   │   ├── tasks/         # Task endpoints
│   │   └── team/          # Team member endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── GanttChart.tsx     # Main Gantt chart component
│   ├── TaskForm.tsx       # Task creation/editing form
│   └── TeamDashboard.tsx  # Team performance dashboard
├── lib/                   # Utility libraries
│   └── database.ts        # Database operations with lowdb
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared interfaces
├── data/                  # Database files
│   └── db.json            # JSON database file
└── public/                # Static assets
```

## 💾 Database Schema

The application uses a JSON-based database with the following structure:

### Projects
```typescript
interface Project {
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
```

### Tasks
```typescript
interface Task {
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
```

### Team Members
```typescript
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}
```

## 🎯 API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get a specific project
- `PUT /api/projects/[id]` - Update a project
- `DELETE /api/projects/[id]` - Delete a project

### Tasks
- `GET /api/tasks?projectId=<id>` - Get tasks for a project
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Team Members
- `GET /api/team` - Get all team members
- `POST /api/team` - Create a new team member
- `GET /api/team/[id]` - Get a specific team member
- `PUT /api/team/[id]` - Update a team member
- `DELETE /api/team/[id]` - Delete a team member

### Database Management
- `GET /api/database` - Get database statistics
- `POST /api/database` - Perform database operations (clean, seed, reset)

## 🔧 Usage

### Creating a Project
1. Projects are automatically created with sample data on first run
2. Use the project selector in the header to switch between projects

### Managing Tasks
1. Click "Add Task" to create a new task
2. Fill in the task details including name, dates, assignee, and priority
3. Tasks appear on the Gantt chart with visual progress indicators
4. Click on any task bar to view detailed information and update progress

### Team Member Management
1. Navigate to the "Settings" tab in the main navigation
2. Use the Team Management section to:
   - **Add new team members** with name, email, role, and optional avatar
   - **Edit existing members** by clicking the edit button
   - **Delete members** by clicking the delete button (with confirmation)
   - **Search members** by name, email, or role
   - **View role-based color coding** for easy identification

### Database Management
1. Go to the "Settings" tab
2. Use the Database Management section to:
   - **View database statistics** including project, task, and team member counts
   - **Seed sample data** to populate the database with comprehensive examples
   - **Clean database** to remove all data
   - **Reset database** to clean and repopulate with fresh sample data

### Project Creation
1. Click the "Project" button in the header to create new projects
2. Assign team members to projects during creation
3. Set project dates, description, and status

### Gantt Chart Features
- **Visual Timeline**: See all tasks plotted against time
- **Progress Tracking**: Visual progress bars show completion status
- **Status Colors**: Different colors indicate task status
- **Interactive Elements**: Click tasks to view details and update progress
- **Responsive Layout**: Horizontal scrolling for large timelines

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Global styles in `app/globals.css`
- Component-specific styles in individual components

### Database
The JSON database is stored in `data/db.json`. You can:
- Modify the initial data in `lib/database.ts`
- Add new fields to the interfaces in `types/index.ts`
- Extend the database class with new methods

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup
The application works out of the box with no additional environment variables needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **Database not found**: Ensure the `data` directory exists and contains `db.json`
2. **Tasks not showing**: Check that a project is selected in the dropdown
3. **Build errors**: Make sure all dependencies are installed with `npm install`

### Development Tips

- Use the browser developer tools to inspect API calls
- Check the console for any JavaScript errors
- The database file is automatically created with sample data on first run

## 🔄 Future Enhancements

- Drag and drop task scheduling
- Task dependencies visualization
- Export to PDF/Excel
- Email notifications
- Real-time collaboration
- Advanced filtering and search
- Custom themes
- Integration with external tools (GitHub, Jira, etc.)

---

Built with ❤️ using Next.js and TypeScript 