
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const users = [];  // In-memory users storage (replace with a database in real-world apps)

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  users.push({ email, password });
  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('user list: ', users)
  const user = users.find(user => user.email === email && user.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(400).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(user => user.email === email);
  if (user) {
    res.json({ success: true, message: 'Password reset link sent' });
  } else {
    res.status(400).json({ success: false, message: 'Email not found' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
