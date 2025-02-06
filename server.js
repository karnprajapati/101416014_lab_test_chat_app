// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

// Import models
const User = require('./models/User');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/chat_app');

// Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword
        });
        
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        res.json({ 
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/messages/:room', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room })
            .sort({ date_sent: -1 })
            .limit(50);
        
        res.json(messages.reverse()); // Return the messages in the correct order
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });
    
    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
    });
    
    socket.on('chat message', async (data) => {
        const message = new GroupMessage({
            from_user: data.username,
            room: data.room,
            message: data.message
        });
        await message.save();
        
        io.to(data.room).emit('chat message', {
            username: data.username,
            message: data.message,
            date_sent: new Date()
        });
    });
    
    socket.on('typing', (data) => {
        socket.to(data.room).emit('user typing', data.username);
    });
    
    socket.on('stop typing', (data) => {
        socket.to(data.room).emit('user stop typing', data.username);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});