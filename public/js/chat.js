


$(document).ready(function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    $('#user-welcome').text(`Welcome, ${user.firstname}`);

    const socket = io();
    let currentRoom = '';
    let typingTimeout = null;

    // Join room functionality
    $('.join-btn').on('click', function() {
        const newRoom = $(this).data('room');

        if (currentRoom) {
            socket.emit('leave room', currentRoom);
            $(`[data-room="${currentRoom}"]`).removeClass('active');
        }

        currentRoom = newRoom;
        socket.emit('join room', currentRoom);

        // Update UI
        $('.list-group-item').removeClass('active');
        $(this).prev().addClass('active');
        $('#current-room').text(currentRoom);
        $('#chat-messages').empty();
        $('#message-input').prop('disabled', false);
        $('button[type="submit"]').prop('disabled', false);

        // Load previous messages
        loadMessages(currentRoom);
    });

    // Load previous messages from the server
    function loadMessages(room) {
        fetch(`/api/messages/${room}`)
            .then(response => response.json())
            .then(messages => {
                messages.forEach(msg => displayMessage(msg));
            })
            .catch(error => console.error('Error loading messages:', error));
    }

    // Message sending
    $('#message-form').on('submit', function(e) {
        e.preventDefault();

        const messageInput = $('#message-input');
        const message = messageInput.val().trim();

        if (message && currentRoom) {
            socket.emit('chat message', {
                username: user.username,
                room: currentRoom,
                message: message
            });

            messageInput.val('');
        }
    });

    // Typing indicator
    let typingTimer;
    $('#message-input').on('input', function() {
        clearTimeout(typingTimer);

        socket.emit('typing', {
            username: user.username,
            room: currentRoom
        });

        typingTimer = setTimeout(() => {
            socket.emit('stop typing', {
                username: user.username,
                room: currentRoom
            });
        }, 1000);
    });

    // Socket event handlers
    socket.on('chat message', function(data) {
        displayMessage(data);
    });

    socket.on('user typing', function(username) {
        if (username !== user.username) {
            $('#typing-indicator').text(`${username} is typing...`).show();
        }
    });

    socket.on('user stop typing', function(username) {
        if (username !== user.username) {
            $('#typing-indicator').hide();
        }
    });

    // Display message in the chat
    function displayMessage(data) {
        if (!data || !data.username || !data.message) {
            console.error("Received invalid message:", data);
            return;
        }

        const isOwnMessage = data.username === user.username;
        const messageClass = isOwnMessage ? 'sent' : 'received';
        const time = data.date_sent ? new Date(data.date_sent).toLocaleTimeString() : 'N/A';

        const messageHtml = `
            <div class="message ${messageClass}">
                <div class="username">${data.username}</div>
                <div class="content">${data.message}</div>
                <div class="time">${time}</div>
            </div>
        `;

        $('#chat-messages').append(messageHtml);
        $('#chat-messages').scrollTop($('#chat-messages')[0].scrollHeight);
    }

    // Logout functionality
    $('#logout-btn').on('click', function() {
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });
});
