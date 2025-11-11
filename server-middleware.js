const fs = require('fs');
const path = require('path');

const DB_FILE_PATH = path.join(__dirname, 'db.json');

const readDb = () => {
  const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
  return JSON.parse(data);
};

const writeDb = (db) => {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf8');
};

const extractUserIdFromToken = (authorization) => {
  if (!authorization) return null;
  const token = authorization.replace('Bearer ', '');
  const parts = token.split('_');
  return parts.length > 1 ? parts[1] : null;
};

module.exports = (req, res, next) => {
  const path = req.path || req.url || '';
  
  console.log('Middleware intercepted:', req.method, path);
  console.log('Request body:', req.body);
  
  if (req.method === 'POST' && (path === '/auth/login' || path.includes('/auth/login'))) {
    const { email, password } = req.body;
    
    console.log('Processing login for:', email);
    
    const db = readDb();
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      return res.status(200).json({
        access_token: `token_${user.id}_${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } else {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
  } 
  
  if (req.method === 'POST' && (path === '/auth/signup' || path.includes('/auth/signup'))) {
    const { name, email, password } = req.body;
    
    console.log('Processing signup for:', email);
    console.log('Signup data:', { name, email, password: '***' });
    
    const db = readDb();
    const existingUser = db.users.find(u => u.email === email);
    
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists'
      });
    }
    
    const newUser = {
      id: String(db.users.length + 1),
      name,
      email,
      password
    };
    
    db.users.push(newUser);
    writeDb(db);
    
    console.log('Signup successful, user added to database');
    
    return res.status(201).json({
      access_token: `token_${newUser.id}_${Date.now()}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  }

  if (req.method === 'GET' && (path === '/api/tasks' || path.startsWith('/api/tasks?'))) {
    const userId = extractUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = readDb();
    let filtered = db.tasks.filter(t => t.owner_id === userId);

    const { page = 1, limit = 100, status, search, tags } = req.query;

    if (status && status !== 'all') {
      filtered = filtered.filter(t => t.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }

    if (tags) {
      const tagArray = tags.split(',');
      filtered = filtered.filter(t =>
        t.tags.some(tag => tagArray.includes(tag))
      );
    }

    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    const paginated = filtered.slice(start, end);

    return res.json({
      tasks: paginated,
      total: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: end < filtered.length
    });
  }

  if (req.method === 'POST' && path === '/api/tasks') {
    const userId = extractUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = readDb();
    const newTask = {
      id: String(Date.now()),
      ...req.body,
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.tasks.push(newTask);
    writeDb(db);

    console.log('Task created:', newTask.id);
    return res.status(201).json(newTask);
  }

  if (req.method === 'PUT' && path.startsWith('/api/tasks/')) {
    const taskId = path.split('/')[3];
    const userId = extractUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = readDb();
    const taskIndex = db.tasks.findIndex(t => t.id === taskId && t.owner_id === userId);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    db.tasks[taskIndex] = {
      ...db.tasks[taskIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };

    writeDb(db);
    console.log('Task updated:', taskId);
    return res.json(db.tasks[taskIndex]);
  }

  if (req.method === 'DELETE' && path.startsWith('/api/tasks/')) {
    const taskId = path.split('/')[3];
    const userId = extractUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = readDb();
    const taskIndex = db.tasks.findIndex(t => t.id === taskId && t.owner_id === userId);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    db.tasks.splice(taskIndex, 1);
    writeDb(db);

    console.log('Task deleted:', taskId);
    return res.status(204).send();
  }

  if (req.method === 'POST' && path === '/api/images/upload') {
    const { image, taskId } = req.body;
    
    const imageUrl = `https://example.com/images/${taskId}_${Date.now()}.jpg`;
    
    console.log('Image uploaded for task:', taskId);
    return res.json({ url: imageUrl });
  }
  
  next();
};

