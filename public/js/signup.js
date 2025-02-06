$(document).ready(function() {
    $('#signup-form').on('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            username: $('#username').val(),
            firstname: $('#firstname').val(),
            lastname: $('#lastname').val(),
            password: $('#password').val()
        };
        
        fetch('/api/signup', {
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
                window.location.href = '/login.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during signup');
        });
    });
});
