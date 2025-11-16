const { v4: uuidv4 } = require('uuid');

class ContactService {
  constructor(db) {
    this.db = db;
  }

  getAll() {
    return this.db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  }

  getById(id) {
    return this.db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
  }

  create(contact) {
    try {
      const id = uuidv4();
      const {
        firstName,
        lastName,
        email,
        phone = '',
        company = '',
        position = '',
        notes = '',
        tags = '[]',
        status = 'active'
      } = contact;

      const stmt = this.db.prepare(`
        INSERT INTO contacts (id, first_name, last_name, email, phone, company, position, notes, tags, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(id, firstName, lastName, email, phone, company, position, notes, tags, status);

      return {
        success: true,
        contact: this.getById(id)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  update(id, contact) {
    try {
      const existing = this.getById(id);
      if (!existing) {
        return { success: false, error: 'Contact not found' };
      }

      const {
        firstName = existing.first_name,
        lastName = existing.last_name,
        email = existing.email,
        phone = existing.phone,
        company = existing.company,
        position = existing.position,
        notes = existing.notes,
        tags = existing.tags,
        status = existing.status
      } = contact;

      const stmt = this.db.prepare(`
        UPDATE contacts
        SET first_name = ?, last_name = ?, email = ?, phone = ?,
            company = ?, position = ?, notes = ?, tags = ?, status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(firstName, lastName, email, phone, company, position, notes, tags, status, id);

      return {
        success: true,
        contact: this.getById(id)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  delete(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM contacts WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return { success: false, error: 'Contact not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  search(query) {
    const searchTerm = `%${query}%`;
    return this.db.prepare(`
      SELECT * FROM contacts
      WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
            OR company LIKE ? OR position LIKE ?
      ORDER BY created_at DESC
    `).all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  getByTag(tag) {
    return this.db.prepare(`
      SELECT * FROM contacts WHERE tags LIKE ?
    `).all(`%${tag}%`);
  }

  getByStatus(status) {
    return this.db.prepare('SELECT * FROM contacts WHERE status = ?').all(status);
  }
}

module.exports = ContactService;
