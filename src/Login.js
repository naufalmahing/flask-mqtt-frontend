// src/Login.js

import React, { useState } from 'react';
import './Login.css'; // You can create this CSS file to style your component
import { Link, useNavigate } from 'react-router-dom';
import httpClient from './httpClient';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const Navigate = useNavigate();

    // Replace the handleSubmit function with this
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (username === '' || password === '') {
            setError('Both fields are required.');
            return;
        }

        try {
            const response = await httpClient.post('/verify', { username: username, password: password }, {
                withCredentials: false
            });
            
            console.log(response)
            if (response.data.code === 200) {
                console.log('at is' + response.data.access_token)
                localStorage.setItem('access_token', response.data.access_token)
                alert('Login successful');
                setError('');
                console.log(response.data.data)
                Navigate('/')
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        }
};

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form sm:w-[20rem] w-[15rem]">
                <h2 class="text-3xl">Login</h2>
                {error && <p className="error">{error}</p>}
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        class='outline outline-1 rounded focus:outline-2'
                        name="username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        class='outline outline-1 rounded focus:outline-2'
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
                <text class='text-xs'>No account yet,</text> <Link to="/register" class='hover:underline text-sm'>Register</Link>
            </form>
        </div>
    );
};

export default Login;
