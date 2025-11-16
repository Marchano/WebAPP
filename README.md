# CRM Webinar & Training Application

A comprehensive cross-platform CRM application built with Electron, featuring webinar hosting, online training management, and real-time messaging capabilities.

## Features

### Contact Management
- Create, edit, and delete contacts
- Search and filter contacts
- Tag-based organization
- Contact status tracking (active, inactive, lead, customer)
- Import/export capabilities

### Webinar Hosting
- Schedule webinars with date, time, and duration
- Manage webinar attendees
- Start and end live webinars
- Track webinar status (scheduled, live, completed)
- Meeting link integration
- Attendee registration management

### Online Training
- Create and manage training courses
- Organize content into modules
- Track course enrollments
- Monitor learner progress
- Support for multiple difficulty levels (beginner, intermediate, advanced)
- Course categories (sales, marketing, technical, leadership, compliance)
- Publish/draft course management

### Messaging System
- Real-time messaging between users
- Direct messages and group chats
- Conversation management
- Message search functionality
- Unread message indicators
- Auto-refresh for new messages

### User Management
- Secure user authentication
- User registration with validation
- Session management
- Role-based access (user, admin)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Electron.js (Node.js)
- **Database**: SQLite (better-sqlite3)
- **Security**: bcrypt.js for password hashing
- **Unique IDs**: UUID v4

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd WebAPP
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Building for Production

### Build for macOS:
```bash
npm run build:mac
```

### Build for Windows:
```bash
npm run build:win
```

### Build for both platforms:
```bash
npm run build:all
```

Build outputs will be available in the `dist/` directory.

## Project Structure

```
WebAPP/
├── src/
│   ├── main/                 # Main process (Electron)
│   │   ├── main.js          # Application entry point
│   │   ├── database.js      # SQLite database manager
│   │   └── services/        # Backend services
│   │       ├── auth.js      # Authentication service
│   │       ├── contacts.js  # Contact management
│   │       ├── webinars.js  # Webinar management
│   │       ├── training.js  # Training/courses management
│   │       └── messages.js  # Messaging service
│   ├── preload/
│   │   └── preload.js       # Secure bridge between main and renderer
│   └── renderer/            # Frontend (UI)
│       ├── css/
│       │   └── styles.css   # Application styles
│       ├── js/
│       │   └── app.js       # Shared utilities
│       └── pages/           # HTML pages
│           ├── login.html
│           ├── dashboard.html
│           ├── contacts.html
│           ├── webinars.html
│           ├── training.html
│           └── messages.html
├── assets/
│   ├── icons/               # Application icons
│   └── images/              # Static images
├── data/                    # Local data storage
├── package.json
├── .gitignore
└── README.md
```

## Security Features

- Context isolation enabled (secure IPC communication)
- Node integration disabled in renderer
- Content Security Policy implemented
- Password hashing with bcrypt
- SQL injection protection through prepared statements
- XSS protection through HTML escaping

## Database Schema

The application uses SQLite with the following main tables:
- **users** - User accounts and authentication
- **contacts** - CRM contacts
- **webinars** - Webinar events
- **webinar_attendees** - Webinar registrations
- **training_courses** - Training courses
- **training_modules** - Course modules/content
- **course_enrollments** - Student enrollments
- **conversations** - Chat conversations
- **messages** - Chat messages

## Usage

### First Time Setup
1. Launch the application
2. Click "Create one" to register a new account
3. Log in with your credentials
4. Start by adding contacts, scheduling webinars, or creating courses

### Managing Contacts
- Navigate to Contacts page
- Click "Add Contact" to create new contact
- Use search box to find specific contacts
- Edit or delete contacts using action buttons

### Scheduling Webinars
- Navigate to Webinars page
- Click "Schedule Webinar" to create new event
- Add attendees from your contacts
- Start webinar when ready to go live
- End webinar when finished

### Creating Training Courses
- Navigate to Training page
- Click "Create Course" to add new course
- Add modules to organize content
- Enroll contacts in courses
- Track their progress

### Messaging
- Navigate to Messages page
- Click "New Conversation" to start chatting
- Select contacts to add as participants
- Send and receive messages in real-time

## Platform Support

- **macOS**: 10.13 (High Sierra) or later
- **Windows**: Windows 10 or later (Windows 11 recommended)

## Future Enhancements

- Video conferencing integration
- Calendar synchronization
- Email notifications
- Advanced analytics and reporting
- Mobile companion app
- Cloud sync capabilities
- Third-party CRM integrations
- Document sharing
- Screen recording for webinars

## License

MIT License

## Support

For issues and feature requests, please create an issue in the repository.
