const { v4: uuidv4 } = require('uuid');

class WebinarService {
  constructor(db) {
    this.db = db;
  }

  getAll() {
    return this.db.prepare(`
      SELECT w.*, u.full_name as host_name
      FROM webinars w
      LEFT JOIN users u ON w.host_id = u.id
      ORDER BY w.scheduled_date DESC
    `).all();
  }

  getById(id) {
    return this.db.prepare(`
      SELECT w.*, u.full_name as host_name
      FROM webinars w
      LEFT JOIN users u ON w.host_id = u.id
      WHERE w.id = ?
    `).get(id);
  }

  create(webinar) {
    try {
      const id = uuidv4();
      const {
        title,
        description = '',
        hostId,
        scheduledDate,
        duration = 60,
        maxAttendees = 100,
        meetingLink = ''
      } = webinar;

      const stmt = this.db.prepare(`
        INSERT INTO webinars (id, title, description, host_id, scheduled_date, duration, max_attendees, meeting_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(id, title, description, hostId, scheduledDate, duration, maxAttendees, meetingLink);

      return {
        success: true,
        webinar: this.getById(id)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  update(id, webinar) {
    try {
      const existing = this.getById(id);
      if (!existing) {
        return { success: false, error: 'Webinar not found' };
      }

      const {
        title = existing.title,
        description = existing.description,
        scheduledDate = existing.scheduled_date,
        duration = existing.duration,
        maxAttendees = existing.max_attendees,
        meetingLink = existing.meeting_link,
        status = existing.status,
        recordingUrl = existing.recording_url
      } = webinar;

      const stmt = this.db.prepare(`
        UPDATE webinars
        SET title = ?, description = ?, scheduled_date = ?, duration = ?,
            max_attendees = ?, meeting_link = ?, status = ?, recording_url = ?
        WHERE id = ?
      `);

      stmt.run(title, description, scheduledDate, duration, maxAttendees, meetingLink, status, recordingUrl, id);

      return {
        success: true,
        webinar: this.getById(id)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  delete(id) {
    try {
      // Delete attendees first
      this.db.prepare('DELETE FROM webinar_attendees WHERE webinar_id = ?').run(id);

      const stmt = this.db.prepare('DELETE FROM webinars WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return { success: false, error: 'Webinar not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addAttendee(webinarId, contactId) {
    try {
      const id = uuidv4();
      const stmt = this.db.prepare(`
        INSERT INTO webinar_attendees (id, webinar_id, contact_id)
        VALUES (?, ?, ?)
      `);

      stmt.run(id, webinarId, contactId);

      return { success: true, attendeeId: id };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return { success: false, error: 'Contact already registered' };
      }
      return { success: false, error: error.message };
    }
  }

  removeAttendee(webinarId, contactId) {
    try {
      const stmt = this.db.prepare(
        'DELETE FROM webinar_attendees WHERE webinar_id = ? AND contact_id = ?'
      );
      const result = stmt.run(webinarId, contactId);

      if (result.changes === 0) {
        return { success: false, error: 'Attendee not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getAttendees(webinarId) {
    return this.db.prepare(`
      SELECT c.*, wa.registration_date, wa.attended, wa.join_time, wa.leave_time
      FROM webinar_attendees wa
      JOIN contacts c ON wa.contact_id = c.id
      WHERE wa.webinar_id = ?
      ORDER BY wa.registration_date DESC
    `).all(webinarId);
  }

  startWebinar(webinarId) {
    try {
      const stmt = this.db.prepare(`
        UPDATE webinars
        SET status = 'live', started_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(webinarId);

      return {
        success: true,
        webinar: this.getById(webinarId)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  endWebinar(webinarId) {
    try {
      const stmt = this.db.prepare(`
        UPDATE webinars
        SET status = 'completed', ended_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(webinarId);

      return {
        success: true,
        webinar: this.getById(webinarId)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getUpcoming() {
    return this.db.prepare(`
      SELECT w.*, u.full_name as host_name
      FROM webinars w
      LEFT JOIN users u ON w.host_id = u.id
      WHERE w.status = 'scheduled' AND w.scheduled_date > CURRENT_TIMESTAMP
      ORDER BY w.scheduled_date ASC
    `).all();
  }

  getLive() {
    return this.db.prepare(`
      SELECT w.*, u.full_name as host_name
      FROM webinars w
      LEFT JOIN users u ON w.host_id = u.id
      WHERE w.status = 'live'
    `).all();
  }

  getCompleted() {
    return this.db.prepare(`
      SELECT w.*, u.full_name as host_name
      FROM webinars w
      LEFT JOIN users u ON w.host_id = u.id
      WHERE w.status = 'completed'
      ORDER BY w.ended_at DESC
    `).all();
  }
}

module.exports = WebinarService;
