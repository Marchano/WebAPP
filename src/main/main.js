const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Database = require('./database');
const AuthService = require('./services/auth');
const ContactService = require('./services/contacts');
const WebinarService = require('./services/webinars');
const TrainingService = require('./services/training');
const MessageService = require('./services/messages');

let mainWindow;
let db;
let authService;
let contactService;
let webinarService;
let trainingService;
let messageService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/pages/login.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Dashboard',
          click: () => mainWindow.webContents.send('navigate', 'dashboard')
        },
        { type: 'separator' },
        {
          label: 'Logout',
          click: () => mainWindow.webContents.send('logout')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About CRM Webinar & Training',
              message: 'CRM Webinar & Training v1.0.0',
              detail: 'A comprehensive CRM solution with webinar hosting, online training, and messaging capabilities.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function initializeServices() {
  const dbPath = path.join(app.getPath('userData'), 'crm_database.db');
  db = new Database(dbPath);

  authService = new AuthService(db);
  contactService = new ContactService(db);
  webinarService = new WebinarService(db);
  trainingService = new TrainingService(db);
  messageService = new MessageService(db);
}

function setupIpcHandlers() {
  // Auth handlers
  ipcMain.handle('auth:register', async (event, userData) => {
    return authService.register(userData);
  });

  ipcMain.handle('auth:login', async (event, credentials) => {
    return authService.login(credentials);
  });

  ipcMain.handle('auth:logout', async (event, userId) => {
    return authService.logout(userId);
  });

  ipcMain.handle('auth:getCurrentUser', async (event) => {
    return authService.getCurrentUser();
  });

  // Contact handlers
  ipcMain.handle('contacts:getAll', async (event) => {
    return contactService.getAll();
  });

  ipcMain.handle('contacts:create', async (event, contact) => {
    return contactService.create(contact);
  });

  ipcMain.handle('contacts:update', async (event, id, contact) => {
    return contactService.update(id, contact);
  });

  ipcMain.handle('contacts:delete', async (event, id) => {
    return contactService.delete(id);
  });

  ipcMain.handle('contacts:search', async (event, query) => {
    return contactService.search(query);
  });

  // Webinar handlers
  ipcMain.handle('webinars:getAll', async (event) => {
    return webinarService.getAll();
  });

  ipcMain.handle('webinars:create', async (event, webinar) => {
    return webinarService.create(webinar);
  });

  ipcMain.handle('webinars:update', async (event, id, webinar) => {
    return webinarService.update(id, webinar);
  });

  ipcMain.handle('webinars:delete', async (event, id) => {
    return webinarService.delete(id);
  });

  ipcMain.handle('webinars:addAttendee', async (event, webinarId, contactId) => {
    return webinarService.addAttendee(webinarId, contactId);
  });

  ipcMain.handle('webinars:removeAttendee', async (event, webinarId, contactId) => {
    return webinarService.removeAttendee(webinarId, contactId);
  });

  ipcMain.handle('webinars:getAttendees', async (event, webinarId) => {
    return webinarService.getAttendees(webinarId);
  });

  ipcMain.handle('webinars:startWebinar', async (event, webinarId) => {
    return webinarService.startWebinar(webinarId);
  });

  ipcMain.handle('webinars:endWebinar', async (event, webinarId) => {
    return webinarService.endWebinar(webinarId);
  });

  // Training handlers
  ipcMain.handle('training:getAllCourses', async (event) => {
    return trainingService.getAllCourses();
  });

  ipcMain.handle('training:createCourse', async (event, course) => {
    return trainingService.createCourse(course);
  });

  ipcMain.handle('training:updateCourse', async (event, id, course) => {
    return trainingService.updateCourse(id, course);
  });

  ipcMain.handle('training:deleteCourse', async (event, id) => {
    return trainingService.deleteCourse(id);
  });

  ipcMain.handle('training:addModule', async (event, courseId, module) => {
    return trainingService.addModule(courseId, module);
  });

  ipcMain.handle('training:updateModule', async (event, moduleId, module) => {
    return trainingService.updateModule(moduleId, module);
  });

  ipcMain.handle('training:deleteModule', async (event, moduleId) => {
    return trainingService.deleteModule(moduleId);
  });

  ipcMain.handle('training:getModules', async (event, courseId) => {
    return trainingService.getModules(courseId);
  });

  ipcMain.handle('training:enrollContact', async (event, courseId, contactId) => {
    return trainingService.enrollContact(courseId, contactId);
  });

  ipcMain.handle('training:updateProgress', async (event, enrollmentId, progress) => {
    return trainingService.updateProgress(enrollmentId, progress);
  });

  ipcMain.handle('training:getEnrollments', async (event, courseId) => {
    return trainingService.getEnrollments(courseId);
  });

  // Message handlers
  ipcMain.handle('messages:getConversations', async (event, userId) => {
    return messageService.getConversations(userId);
  });

  ipcMain.handle('messages:getMessages', async (event, conversationId) => {
    return messageService.getMessages(conversationId);
  });

  ipcMain.handle('messages:sendMessage', async (event, message) => {
    return messageService.sendMessage(message);
  });

  ipcMain.handle('messages:createConversation', async (event, participants) => {
    return messageService.createConversation(participants);
  });

  ipcMain.handle('messages:markAsRead', async (event, messageId) => {
    return messageService.markAsRead(messageId);
  });

  // Navigation handler
  ipcMain.on('navigate-to', (event, page) => {
    const pagePath = path.join(__dirname, `../renderer/pages/${page}.html`);
    mainWindow.loadFile(pagePath);
  });

  // Get app stats
  ipcMain.handle('stats:getDashboard', async (event) => {
    const contacts = contactService.getAll();
    const webinars = webinarService.getAll();
    const courses = trainingService.getAllCourses();

    return {
      totalContacts: contacts.length,
      activeWebinars: webinars.filter(w => w.status === 'live').length,
      upcomingWebinars: webinars.filter(w => w.status === 'scheduled').length,
      totalCourses: courses.length,
      totalWebinars: webinars.length
    };
  });
}

app.whenReady().then(() => {
  initializeServices();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});
