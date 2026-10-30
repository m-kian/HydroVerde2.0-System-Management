const DB_KEY = 'hydroverde_users';

function getUsers() {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

async function hashPassword(salt, password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function registerUser({ name, email, password }) {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();
  
  const existing = users.find(u => u.email === cleanEmail);
  if (existing) throw new Error('An account with this email already exists.');

  const salt = generateUUID();
  const passwordHash = await hashPassword(salt, password);
  
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name: name.trim(),
    email: cleanEmail,
    salt,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

export async function loginUser({ email, password }) {
  const users = getUsers();
  const input = email.trim().toLowerCase();
  const row = users.find(u => u.email === input || u.name.toLowerCase() === input);
  
  if (!row) throw new Error('Email or password is incorrect.');
  
  const attempt = await hashPassword(row.salt, password);
  if (attempt !== row.password_hash) throw new Error('Email or password is incorrect.');
  
  return { id: row.id, name: row.name, email: row.email };
}

export async function getUserById(id) {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}
