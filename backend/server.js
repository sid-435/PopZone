const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002; // Port for your backend

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the frontend
}));

app.use(bodyParser.json());

// Load user data
const userDataPath = path.join(__dirname, './data/user.json');
const bubbleDataPath = path.join(__dirname, './data/bubble.json');

app.get('/loginUser', (req, res) => {
  const { username, password } = req.query;

  // Load current users
  let users;
  try {
    users = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Could not read user data' });
  }

  // Check if the user exists
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    return res.status(200).json({ message: 'Login successful', user });
  } else {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Add User
app.post('/addUser', (req, res) => {
  const user = req.body;

  // Validate username and password
  if (!user.username || !user.password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  let users;
  try {
    const data = fs.readFileSync(userDataPath, 'utf8');
    users = data ? JSON.parse(data) : []; // Initialize with empty array if empty
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read user data' });
  }

  // Check for duplicate usernames
  const userExists = users.some(existingUser => existingUser.username === user.username);
  if (userExists) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  // Add default values for unspecified fields
  const newUser = {
    username: user.username,
    password: user.password,
    university: user.university || '',
    year: user.year || '',
    major: user.major || [],
    minor: user.minor || [],
    interest: user.interest || [],
    skills: user.skills || [],
    personalityVector: user.personalityVector || null,
    interestVector: user.interestVector || null,
  };

  // Load current users
  users.push(newUser);

  // Save updated users
  fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2));

  return res.status(201).json(newUser);
});

// Edit User 
app.post('/updateUser', (req, res) => {
  const updatedUser = req.body;

  // Validate if username exists in the updated user
  if (!updatedUser.username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  // Load current users
  let users;
  try {
    users = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read user data' });
  }

  // Find the user by username
  const userIndex = users.findIndex(user => user.username === updatedUser.username);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Update user fields
  users[userIndex] = { ...users[userIndex], ...updatedUser };

  // Save updated users
  try {
    fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2));
  } catch (writeError) {
    return res.status(500).json({ error: 'Failed to update user data' });
  }

  return res.status(200).json(users[userIndex]);
});

// Add Bubble
app.post('/addBubble', (req, res) => {
  const bubble = req.body;

  // Add default values for unspecified fields
  const newBubble = {
    title: bubble.title || '',
    time: bubble.time || '',
    location: bubble.location || '',
    numOfPeople: bubble.numOfPeople || 1,
    description: bubble.description || '',
    admin: bubble.admin || '',
    isOpen: bubble.isOpen || false,
  };

  // Load current bubbles
  let bubbles = JSON.parse(fs.readFileSync(bubbleDataPath, 'utf8'));
  bubbles.push(newBubble);

  // Save updated bubbles
  fs.writeFileSync(bubbleDataPath, JSON.stringify(bubbles, null, 2));

  return res.status(201).json(newBubble);
});

// Edit Bubble
app.post('/editBubble', (req, res) => {
  const { title, updates } = req.body;

  // Load current bubbles
  let bubbles = JSON.parse(fs.readFileSync(bubbleDataPath, 'utf8'));

  const bubbleIndex = bubbles.findIndex(bubble => bubble.title === title);
  if (bubbleIndex === -1) {
    return res.status(404).json({ error: 'Bubble not found.' });
  }

  // Update bubble fields
  bubbles[bubbleIndex] = { ...bubbles[bubbleIndex], ...updates };

  // Save updated bubbles
  fs.writeFileSync(bubbleDataPath, JSON.stringify(bubbles, null, 2));

  return res.status(200).json(bubbles[bubbleIndex]);
});

app.get('/getBubbles', (req, res) => {
  try {
    const data = fs.readFileSync(bubbleDataPath, 'utf8');
    const bubbles = data ? JSON.parse(data) : []; 

    return res.status(200).json(bubbles);
  } catch (err) {
    console.error('Cannot read:', err);
    return res.status(500).json({ error: 'Failed to read bubble data' });
  }
});

app.delete('/deleteBubble', (req, res) => {
  const { title } = req.body;

  // Load current bubbles
  let bubbles;
  try {
    bubbles = JSON.parse(fs.readFileSync(bubbleDataPath, 'utf8'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read bubble data' });
  }

  // Filter out the bubble to delete
  const updatedBubbles = bubbles.filter(bubble => bubble.title !== title);

  // Save updated bubbles
  try {
    fs.writeFileSync(bubbleDataPath, JSON.stringify(updatedBubbles, null, 2));
  } catch (writeError) {
    return res.status(500).json({ error: 'Failed to delete bubble data' });
  }

  return res.status(200).json({ message: 'Bubble deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

app.post('/joinEvent', (req, res) => {
    const { title } = req.body;
  
    // Load current bubbles
    let bubbles;
    try {
      bubbles = JSON.parse(fs.readFileSync(bubbleDataPath, 'utf8'));
    } catch (error) {
      return res.status(500).json({ error: 'Failed to read bubble data' });
    }
  
    // Find the bubble to update
    const bubbleIndex = bubbles.findIndex(bubble => bubble.title === title);
    if (bubbleIndex === -1) {
      return res.status(404).json({ error: 'Bubble not found.' });
    }
  
    // Check if the bubble is open for joining
    if (!bubbles[bubbleIndex].isOpen) {
      return res.status(400).json({ error: 'Event is closed for joining.' });
    }
  
    // Increment the number of people in the event
    bubbles[bubbleIndex].numOfPeople += 1;
  
    // Save updated bubbles
    try {
      fs.writeFileSync(bubbleDataPath, JSON.stringify(bubbles, null, 2));
    } catch (writeError) {
      return res.status(500).json({ error: 'Failed to update bubble data' });
    }
  
    return res.status(200).json(bubbles[bubbleIndex]);
  });