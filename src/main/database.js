const Database = require('better-sqlite3');

class DatabaseManager {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
  }

  initializeTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Contacts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        company TEXT,
        position TEXT,
        notes TEXT,
        tags TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Webinars table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS webinars (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        host_id TEXT NOT NULL,
        scheduled_date DATETIME NOT NULL,
        duration INTEGER DEFAULT 60,
        max_attendees INTEGER DEFAULT 100,
        status TEXT DEFAULT 'scheduled',
        meeting_link TEXT,
        recording_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        ended_at DATETIME,
        FOREIGN KEY (host_id) REFERENCES users(id)
      )
    `);

    // Webinar attendees table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS webinar_attendees (
        id TEXT PRIMARY KEY,
        webinar_id TEXT NOT NULL,
        contact_id TEXT NOT NULL,
        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        attended INTEGER DEFAULT 0,
        join_time DATETIME,
        leave_time DATETIME,
        FOREIGN KEY (webinar_id) REFERENCES webinars(id),
        FOREIGN KEY (contact_id) REFERENCES contacts(id),
        UNIQUE(webinar_id, contact_id)
      )
    `);

    // Training courses table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS training_courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        instructor_id TEXT NOT NULL,
        category TEXT,
        difficulty TEXT DEFAULT 'beginner',
        duration_hours INTEGER DEFAULT 1,
        is_published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id)
      )
    `);

    // Training modules table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS training_modules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        order_index INTEGER DEFAULT 0,
        duration_minutes INTEGER DEFAULT 30,
        video_url TEXT,
        resources TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES training_courses(id)
      )
    `);

    // Course enrollments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        contact_id TEXT NOT NULL,
        enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        progress INTEGER DEFAULT 0,
        completed_modules TEXT DEFAULT '[]',
        status TEXT DEFAULT 'enrolled',
        completion_date DATETIME,
        FOREIGN KEY (course_id) REFERENCES training_courses(id),
        FOREIGN KEY (contact_id) REFERENCES contacts(id),
        UNIQUE(course_id, contact_id)
      )
    `);

    // Conversations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT DEFAULT 'direct',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Conversation participants table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(conversation_id, user_id)
      )
    `);

    // Messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
      CREATE INDEX IF NOT EXISTS idx_webinars_status ON webinars(status);
      CREATE INDEX IF NOT EXISTS idx_webinars_date ON webinars(scheduled_date);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    `);
  }

  prepare(sql) {
    return this.db.prepare(sql);
  }

  exec(sql) {
    return this.db.exec(sql);
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;
