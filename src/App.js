import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Validation Schema using Yup
const loginSchema = yup.object({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
  password: yup.string().min(6, "Password should be at least 6 characters").required("Password is required")
});

const registerSchema = yup.object({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
  password: yup.string().min(6, "Password should be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], "Passwords must match")
    .required("Confirm Password is required")
});

const forgotPasswordSchema = yup.object({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
});

const App = () => {
  const [view, setView] = useState('login');  // can be 'login', 'register', 'forgot', 'todo'
  const [message, setMessage] = useState('');
  const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('todos')) || []);

  // React Hook Form: Login form handling
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  // React Hook Form: Register form handling
  const { register: registerRegister, handleSubmit: handleSubmitRegister, formState: { errors: errorsRegister } } = useForm({
    resolver: yupResolver(registerSchema)
  });

  // React Hook Form: Forgot Password form handling
  const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: errorsForgot } } = useForm({
    resolver: yupResolver(forgotPasswordSchema)
  });

  // Handle login
  const handleLogin = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', data);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));  // Store user info
        setView('todo');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Login failed');
    }
  };

  // Handle registration
  const handleRegister = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', data);
      if (response.data.success) {
        setView('login');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Registration failed');
    }
  };

  // Handle password reset
  const handleForgotPassword = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', data);
      if (response.data.success) {
        setMessage('Password reset link sent!');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Failed to send reset link');
    }
  };

  // Handle adding todo
  const handleAddTodo = (todoText) => {
    const newTodo = { text: todoText, id: Date.now() };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));  // Save to local storage
  };

  // Handle removing todo
  const handleRemoveTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));  // Save to local storage
  };

  const renderLogin = () => (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmitLogin(handleLogin)}>
        <input type="email" {...registerLogin("email")} placeholder="Email" />
        {errorsLogin.email && <p>{errorsLogin.email.message}</p>}

        <input type="password" {...registerLogin("password")} placeholder="Password" />
        {errorsLogin.password && <p>{errorsLogin.password.message}</p>}

        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <button onClick={() => setView('register')}>Register</button>
      <button onClick={() => setView('forgot')}>Forgot Password?</button>
    </div>
  );

  const renderRegister = () => (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmitRegister(handleRegister)}>
        <input type="email" {...registerRegister("email")} placeholder="Email" />
        {errorsRegister.email && <p>{errorsRegister.email.message}</p>}

        <input type="password" {...registerRegister("password")} placeholder="Password" />
        {errorsRegister.password && <p>{errorsRegister.password.message}</p>}

        <input type="password" {...registerRegister("confirmPassword")} placeholder="Confirm Password" />
        {errorsRegister.confirmPassword && <p>{errorsRegister.confirmPassword.message}</p>}

        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
      <button onClick={() => setView('login')}>Back to Login</button>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="form-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmitForgot(handleForgotPassword)}>
        <input type="email" {...registerForgot("email")} placeholder="Enter your email" />
        {errorsForgot.email && <p>{errorsForgot.email.message}</p>}
        <button type="submit">Send Reset Link</button>
      </form>
      <p>{message}</p>
      <button onClick={() => setView('login')}>Back to Login</button>
    </div>
  );

  const renderTodoList = () => (
    <div className="todo-container">
      <h2>Todo List</h2>
      <input type="text" id="todo-input" placeholder="Add a new todo" />
      <button onClick={() => {
        const todoInput = document.getElementById('todo-input').value;
        if (todoInput) {
          handleAddTodo(todoInput);
          document.getElementById('todo-input').value = '';
        }
      }}>Add Todo</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => handleRemoveTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => setView('login')}>Logout</button>
    </div>
  );

  // Display appropriate view
  return (
    <div className="App">
      {view === 'login' && renderLogin()}
      {view === 'register' && renderRegister()}
      {view === 'forgot' && renderForgotPassword()}
      {view === 'todo' && renderTodoList()}
    </div>
  );
};

export default App;
