import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();

        const newUser = {
            username,
            password,
            email,
        };

        try {
            await axios.post('http://127.0.0.1:8000/signup/', newUser);
            setMessage('Signup successful! You can now log in.');
            setUsername('');
            setPassword('');
            setEmail('');
        } catch (error) {
            setMessage('There was an error signing up. Please try again.');
        }
    };

    return (
        <div className="login">
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

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

                <button type="submit">Signup</button>
            </form>
            {message && <p>{message}</p>}
            <p>
                Already have an account? <a href="/login">Login here</a>
            </p>
        </div>
    );
};

export default Signup;
