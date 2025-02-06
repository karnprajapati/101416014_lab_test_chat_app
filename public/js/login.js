$(document).ready(function() {
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            username: $('#username').val(),
            password: $('#password').val()
        };
        
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = '/chat.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login');
        });
    });
});