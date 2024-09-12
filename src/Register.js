// src/Register.js

import React, { useState } from 'react';
import './Login.css'; // You can create this CSS file to style your component
import axios from './httpClient';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
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
            const response = await axios.post('/register', { username: username, password: password });
            
            console.log(response)
            if (response.data.code === 201) {
                alert('Register successful');
                setError('');
                console.log(response.data.data)
                Navigate('/login')
            } else {
                setError('Username has been taken');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        }
};

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form sm:w-[20rem] w-[15rem]">
                <h2 class="text-3xl">Register</h2>
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
                <button type="submit" className="login-button">Register</button>
                <text class='text-xs'>Have an account already?</text> <Link to="/login" class='hover:underline text-sm'>Login</Link>

            </form>
        </div>
    );
};

export default Register;
