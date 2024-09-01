// Registration Form Validation
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    // Form Fields
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const age = document.getElementById('age').value.trim();
    const errorMessage = document.getElementById('error-message');

    // Email and Password Validation Patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email pattern
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/; // At least one digit, one lowercase, one uppercase, one special character, and minimum 8 characters

    // Validation Checks
    if (!firstName || !lastName || !dob || !email || !password || !age) {
        errorMessage.textContent = 'All fields are required.';
        return;
    } else if (!emailPattern.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address.';
        return;
    } else if (!passwordPattern.test(password)) {
        errorMessage.textContent = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.';
        return;
    }

    errorMessage.textContent = ''; // Clear any error messages

    // Perform form submission via fetch API
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstName,
            lastName,
            dob,
            email,
            password,
            age
        }),
    })
    .then(response => {
        if (response.ok) {
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            return response.text().then(text => {
                errorMessage.textContent = text;
            });
        }
    })
    .catch(error => {
        errorMessage.textContent = 'An error occurred. Please try again.';
    });
});

// Login Form Validation
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const loginEmail = document.getElementById('loginEmail').value.trim();
    const loginPassword = document.getElementById('loginPassword').value.trim();
    const loginErrorMessage = document.getElementById('login-error-message');

    // Simple login validation (You can extend this with actual authentication)
    if (!loginEmail || !loginPassword) {
        loginErrorMessage.textContent = 'Email and password are required.';
        return;
    }

    // Perform form submission via fetch API
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: loginEmail,
            password: loginPassword
        }),
    })
    .then(response => {
        if (response.ok) {
            window.location.href = 'landing.html'; // Redirect to landing page
        } else {
            return response.text().then(text => {
                loginErrorMessage.textContent = text;
            });
        }
    })
    .catch(error => {
        loginErrorMessage.textContent = 'An error occurred. Please try again.';
    });
});
