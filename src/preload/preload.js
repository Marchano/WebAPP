const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Auth
  auth: {
    register: (userData) => ipcRenderer.invoke('auth:register', userData),
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    logout: (userId) => ipcRenderer.invoke('auth:logout', userId),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser')
  },

  // Contacts
  contacts: {
    getAll: () => ipcRenderer.invoke('contacts:getAll'),
    create: (contact) => ipcRenderer.invoke('contacts:create', contact),
    update: (id, contact) => ipcRenderer.invoke('contacts:update', id, contact),
    delete: (id) => ipcRenderer.invoke('contacts:delete', id),
    search: (query) => ipcRenderer.invoke('contacts:search', query)
  },

  // Webinars
  webinars: {
    getAll: () => ipcRenderer.invoke('webinars:getAll'),
    create: (webinar) => ipcRenderer.invoke('webinars:create', webinar),
    update: (id, webinar) => ipcRenderer.invoke('webinars:update', id, webinar),
    delete: (id) => ipcRenderer.invoke('webinars:delete', id),
    addAttendee: (webinarId, contactId) => ipcRenderer.invoke('webinars:addAttendee', webinarId, contactId),
    removeAttendee: (webinarId, contactId) => ipcRenderer.invoke('webinars:removeAttendee', webinarId, contactId),
    getAttendees: (webinarId) => ipcRenderer.invoke('webinars:getAttendees', webinarId),
    startWebinar: (webinarId) => ipcRenderer.invoke('webinars:startWebinar', webinarId),
    endWebinar: (webinarId) => ipcRenderer.invoke('webinars:endWebinar', webinarId)
  },

  // Training
  training: {
    getAllCourses: () => ipcRenderer.invoke('training:getAllCourses'),
    createCourse: (course) => ipcRenderer.invoke('training:createCourse', course),
    updateCourse: (id, course) => ipcRenderer.invoke('training:updateCourse', id, course),
    deleteCourse: (id) => ipcRenderer.invoke('training:deleteCourse', id),
    addModule: (courseId, module) => ipcRenderer.invoke('training:addModule', courseId, module),
    updateModule: (moduleId, module) => ipcRenderer.invoke('training:updateModule', moduleId, module),
    deleteModule: (moduleId) => ipcRenderer.invoke('training:deleteModule', moduleId),
    getModules: (courseId) => ipcRenderer.invoke('training:getModules', courseId),
    enrollContact: (courseId, contactId) => ipcRenderer.invoke('training:enrollContact', courseId, contactId),
    updateProgress: (enrollmentId, progress) => ipcRenderer.invoke('training:updateProgress', enrollmentId, progress),
    getEnrollments: (courseId) => ipcRenderer.invoke('training:getEnrollments', courseId)
  },

  // Messages
  messages: {
    getConversations: (userId) => ipcRenderer.invoke('messages:getConversations', userId),
    getMessages: (conversationId) => ipcRenderer.invoke('messages:getMessages', conversationId),
    sendMessage: (message) => ipcRenderer.invoke('messages:sendMessage', message),
    createConversation: (participants) => ipcRenderer.invoke('messages:createConversation', participants),
    markAsRead: (messageId) => ipcRenderer.invoke('messages:markAsRead', messageId)
  },

  // Stats
  stats: {
    getDashboard: () => ipcRenderer.invoke('stats:getDashboard')
  },

  // Navigation
  navigate: (page) => ipcRenderer.send('navigate-to', page),

  // Event listeners
  on: (channel, callback) => {
    const validChannels = ['navigate', 'logout'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});
