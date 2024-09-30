import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const loginData = {
            email: email,
            password: password,
        };

        console.log('Login data:', loginData); // Log the login data

        try {
            const response = await axios.post('http://127.0.0.1:8000/login/', loginData);
            console.log(response.data);
            setMessage('Login successful!');
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error); // Log the error details
            setMessage('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
            <p>
                Don't have an account? <a href="/signup">Sign up here</a>
            </p>
        </div>
    );
};

export default Login;
