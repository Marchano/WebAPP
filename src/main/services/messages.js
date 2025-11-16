const { v4: uuidv4 } = require('uuid');

class MessageService {
  constructor(db) {
    this.db = db;
  }

  createConversation(participants) {
    try {
      const id = uuidv4();
      const { name = '', type = 'direct', userIds } = participants;

      const stmt = this.db.prepare(`
        INSERT INTO conversations (id, name, type)
        VALUES (?, ?, ?)
      `);

      stmt.run(id, name, type);

      // Add participants
      const participantStmt = this.db.prepare(`
        INSERT INTO conversation_participants (id, conversation_id, user_id)
        VALUES (?, ?, ?)
      `);

      for (const userId of userIds) {
        participantStmt.run(uuidv4(), id, userId);
      }

      return {
        success: true,
        conversationId: id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getConversations(userId) {
    return this.db.prepare(`
      SELECT c.*,
             (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_id != ?) as unread_count,
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ?
      ORDER BY c.updated_at DESC
    `).all(userId, userId);
  }

  getConversationById(conversationId) {
    return this.db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
  }

  getConversationParticipants(conversationId) {
    return this.db.prepare(`
      SELECT u.id, u.username, u.full_name, u.email
      FROM conversation_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.conversation_id = ?
    `).all(conversationId);
  }

  getMessages(conversationId) {
    return this.db.prepare(`
      SELECT m.*, u.username as sender_username, u.full_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(conversationId);
  }

  sendMessage(message) {
    try {
      const id = uuidv4();
      const { conversationId, senderId, content, type = 'text' } = message;

      const stmt = this.db.prepare(`
        INSERT INTO messages (id, conversation_id, sender_id, content, type)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(id, conversationId, senderId, content, type);

      // Update conversation timestamp
      this.db.prepare(`
        UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(conversationId);

      const newMessage = this.db.prepare(`
        SELECT m.*, u.username as sender_username, u.full_name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `).get(id);

      return {
        success: true,
        message: newMessage
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  markAsRead(messageId) {
    try {
      const stmt = this.db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?');
      stmt.run(messageId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  markConversationAsRead(conversationId, userId) {
    try {
      const stmt = this.db.prepare(`
        UPDATE messages
        SET is_read = 1
        WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
      `);
      stmt.run(conversationId, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteMessage(messageId) {
    try {
      const stmt = this.db.prepare('DELETE FROM messages WHERE id = ?');
      const result = stmt.run(messageId);

      if (result.changes === 0) {
        return { success: false, error: 'Message not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  searchMessages(conversationId, query) {
    const searchTerm = `%${query}%`;
    return this.db.prepare(`
      SELECT m.*, u.username as sender_username, u.full_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ? AND m.content LIKE ?
      ORDER BY m.created_at DESC
    `).all(conversationId, searchTerm);
  }
}

module.exports = MessageService;
