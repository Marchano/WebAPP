const { v4: uuidv4 } = require('uuid');

class TrainingService {
  constructor(db) {
    this.db = db;
  }

  // Course methods
  getAllCourses() {
    return this.db.prepare(`
      SELECT tc.*, u.full_name as instructor_name,
             (SELECT COUNT(*) FROM training_modules WHERE course_id = tc.id) as module_count,
             (SELECT COUNT(*) FROM course_enrollments WHERE course_id = tc.id) as enrollment_count
      FROM training_courses tc
      LEFT JOIN users u ON tc.instructor_id = u.id
      ORDER BY tc.created_at DESC
    `).all();
  }

  getCourseById(id) {
    return this.db.prepare(`
      SELECT tc.*, u.full_name as instructor_name
      FROM training_courses tc
      LEFT JOIN users u ON tc.instructor_id = u.id
      WHERE tc.id = ?
    `).get(id);
  }

  createCourse(course) {
    try {
      const id = uuidv4();
      const {
        title,
        description = '',
        instructorId,
        category = 'general',
        difficulty = 'beginner',
        durationHours = 1,
        isPublished = false
      } = course;

      const stmt = this.db.prepare(`
        INSERT INTO training_courses (id, title, description, instructor_id, category, difficulty, duration_hours, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(id, title, description, instructorId, category, difficulty, durationHours, isPublished ? 1 : 0);

      return {
        success: true,
        course: this.getCourseById(id)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateCourse(id, course) {
    try {
      const existing = this.getCourseById(id);
      if (!existing) {
        return { success: false, error: 'Course not found' };
      }

      const {
        title = existing.title,
        description = existing.description,
        category = existing.category,
        difficulty = existing.difficulty,
        durationHours = existing.duration_hours,
        isPublished = existing.is_published
      } = course;

      const stmt = this.db.prepare(`
        UPDATE training_courses
        SET title = ?, description = ?, category = ?, difficulty = ?,
            duration_hours = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(title, description, category, difficulty, durationHours, isPublished ? 1 : 0, id);

      return {
        success: true,
        course: this.getCourseById(id)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteCourse(id) {
    try {
      // Delete modules first
      this.db.prepare('DELETE FROM training_modules WHERE course_id = ?').run(id);
      // Delete enrollments
      this.db.prepare('DELETE FROM course_enrollments WHERE course_id = ?').run(id);

      const stmt = this.db.prepare('DELETE FROM training_courses WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return { success: false, error: 'Course not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Module methods
  getModules(courseId) {
    return this.db.prepare(`
      SELECT * FROM training_modules
      WHERE course_id = ?
      ORDER BY order_index ASC
    `).all(courseId);
  }

  getModuleById(moduleId) {
    return this.db.prepare('SELECT * FROM training_modules WHERE id = ?').get(moduleId);
  }

  addModule(courseId, module) {
    try {
      const id = uuidv4();
      const {
        title,
        content = '',
        orderIndex = 0,
        durationMinutes = 30,
        videoUrl = '',
        resources = '[]'
      } = module;

      const stmt = this.db.prepare(`
        INSERT INTO training_modules (id, course_id, title, content, order_index, duration_minutes, video_url, resources)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(id, courseId, title, content, orderIndex, durationMinutes, videoUrl, resources);

      return {
        success: true,
        module: this.getModuleById(id)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateModule(moduleId, module) {
    try {
      const existing = this.getModuleById(moduleId);
      if (!existing) {
        return { success: false, error: 'Module not found' };
      }

      const {
        title = existing.title,
        content = existing.content,
        orderIndex = existing.order_index,
        durationMinutes = existing.duration_minutes,
        videoUrl = existing.video_url,
        resources = existing.resources
      } = module;

      const stmt = this.db.prepare(`
        UPDATE training_modules
        SET title = ?, content = ?, order_index = ?, duration_minutes = ?,
            video_url = ?, resources = ?
        WHERE id = ?
      `);

      stmt.run(title, content, orderIndex, durationMinutes, videoUrl, resources, moduleId);

      return {
        success: true,
        module: this.getModuleById(moduleId)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteModule(moduleId) {
    try {
      const stmt = this.db.prepare('DELETE FROM training_modules WHERE id = ?');
      const result = stmt.run(moduleId);

      if (result.changes === 0) {
        return { success: false, error: 'Module not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Enrollment methods
  enrollContact(courseId, contactId) {
    try {
      const id = uuidv4();
      const stmt = this.db.prepare(`
        INSERT INTO course_enrollments (id, course_id, contact_id)
        VALUES (?, ?, ?)
      `);

      stmt.run(id, courseId, contactId);

      return { success: true, enrollmentId: id };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return { success: false, error: 'Contact already enrolled' };
      }
      return { success: false, error: error.message };
    }
  }

  updateProgress(enrollmentId, progress) {
    try {
      const { progressPercent, completedModules, status } = progress;

      let updateFields = [];
      let values = [];

      if (progressPercent !== undefined) {
        updateFields.push('progress = ?');
        values.push(progressPercent);
      }

      if (completedModules !== undefined) {
        updateFields.push('completed_modules = ?');
        values.push(JSON.stringify(completedModules));
      }

      if (status !== undefined) {
        updateFields.push('status = ?');
        values.push(status);

        if (status === 'completed') {
          updateFields.push('completion_date = CURRENT_TIMESTAMP');
        }
      }

      if (updateFields.length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      values.push(enrollmentId);

      const stmt = this.db.prepare(`
        UPDATE course_enrollments
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getEnrollments(courseId) {
    return this.db.prepare(`
      SELECT ce.*, c.first_name, c.last_name, c.email
      FROM course_enrollments ce
      JOIN contacts c ON ce.contact_id = c.id
      WHERE ce.course_id = ?
      ORDER BY ce.enrollment_date DESC
    `).all(courseId);
  }

  getContactEnrollments(contactId) {
    return this.db.prepare(`
      SELECT ce.*, tc.title as course_title, tc.category, tc.difficulty
      FROM course_enrollments ce
      JOIN training_courses tc ON ce.course_id = tc.id
      WHERE ce.contact_id = ?
      ORDER BY ce.enrollment_date DESC
    `).all(contactId);
  }
}

module.exports = TrainingService;
