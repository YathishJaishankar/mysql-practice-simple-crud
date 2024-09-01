const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'user_auth',
  port: 3309
});

// Connect to Database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Register Endpoint
app.post('/register', async (req, res) => {
  const { firstName, lastName, dob, email, password, age } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      res.status(500).send('Error checking email');
      return;
    }

    if (results.length > 0) {
      res.status(400).send('Email already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (first_name, last_name, dob, email, password, age) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, dob, email, hashedPassword, age],
      (err, result) => {
        if (err) {
          res.status(500).send('Error registering user');
          return;
        }
        res.redirect('/login.html');
      }
    );
  });
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }

    if (results.length === 0) {
      res.status(400).send('User not found');
      return;
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).send('Incorrect password');
      return;
    }

    req.session.user = user; // Save user to session
    res.redirect('/landing'); // Redirect to landing page
  });
});

// Logout Endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login.html'); // Redirect to login page after logout
  });
});

// User Details Endpoint
app.get('/user-details', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }
  res.json(req.session.user);
});

// Update User Details Endpoint
app.post('/update-user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  const { firstName, lastName, dob, age } = req.body;
  const userId = req.session.user.id; // Assuming user ID is stored in the session

  const query = 'UPDATE users SET first_name = ?, last_name = ?, dob = ?, age = ? WHERE id = ?';
  db.query(query, [firstName, lastName, dob, age, userId], (err, result) => {
    if (err) {
      return res.status(500).send('Error updating user details');
    }

    // Update session data
    req.session.user = { ...req.session.user, first_name: firstName, last_name: lastName, dob: dob, age: age };
    res.sendStatus(200); // Success
  });
});

// Serve the landing page after login
app.get('/landing', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Serve static files like HTML, CSS, JS
app.use(express.static(__dirname));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
