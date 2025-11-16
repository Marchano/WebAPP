const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  constructor(db) {
    this.db = db;
    this.currentUser = null;
  }

  async register(userData) {
    try {
      const { username, email, password, fullName, role = 'user' } = userData;

      // Check if user already exists
      const existingUser = this.db.prepare(
        'SELECT id FROM users WHERE username = ? OR email = ?'
      ).get(username, email);

      if (existingUser) {
        return { success: false, error: 'Username or email already exists' };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const id = uuidv4();
      const stmt = this.db.prepare(`
        INSERT INTO users (id, username, email, password, full_name, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(id, username, email, hashedPassword, fullName, role);

      return {
        success: true,
        user: {
          id,
          username,
          email,
          fullName,
          role
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async login(credentials) {
    try {
      const { username, password } = credentials;

      const user = this.db.prepare(
        'SELECT * FROM users WHERE username = ? OR email = ?'
      ).get(username, username);

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Update last login
      this.db.prepare(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(user.id);

      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      };

      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  logout(userId) {
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = null;
    }
    return { success: true };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserById(userId) {
    const user = this.db.prepare(
      'SELECT id, username, email, full_name, role FROM users WHERE id = ?'
    ).get(userId);
    return user;
  }

  getAllUsers() {
    return this.db.prepare(
      'SELECT id, username, email, full_name, role, created_at, last_login FROM users WHERE is_active = 1'
    ).all();
  }
}

module.exports = AuthService;
