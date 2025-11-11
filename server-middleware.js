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
  
  next();
};

