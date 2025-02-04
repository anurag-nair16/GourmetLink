import React, { useState, useEffect, useCallback } from "react";
import {FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = useCallback(() => {
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
    } else {
      setUsernameError("");
    }
  }, [username]); // Only recreate when 'username' changes

  const validateEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  }, [email]); // Only recreate when 'email' changes

  const validatePassword = useCallback(() => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }
  }, [password]); // Only recreate when 'password' changes

  const validateConfirmPassword = useCallback(() => {
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  }, [confirmPassword, password]);

  useEffect(() => {
    validateUsername();
  }, [username, validateUsername]);

  useEffect(() => {
    validateEmail();
  }, [email, validateEmail]);

  useEffect(() => {
    validatePassword();
  }, [password, validatePassword]);

  useEffect(() => {
    validateConfirmPassword();
  }, [confirmPassword, validateConfirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure no errors in the form inputs and that required fields are filled
    if (
      !usernameError &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError &&
      username &&
      email &&
      password &&
      confirmPassword
    ) {
      setIsLoading(true);

      // Prepare the user data to send to the backend
      const userData = {
        username,
        email,
        password,
      };

      try {
        const response = await fetch('http://127.0.0.1:8000/signup/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          // Optionally redirect to login or another page
        } else {
          // Handle error response
          alert(data.detail || "An error occurred");
        }
      } catch (error) {
        alert("An error occurred: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const backgroundImageStyle = {
    backgroundImage: `url('https://media.istockphoto.com/id/1152493500/photo/authentic-indian-dishes-and-snacks.webp?a=1&b=1&s=612x612&w=0&k=20&c=vy1KDx5reosJ4LEYRq_QLBSYyMdGdSYHoqFGW0-CLFM=')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(2px)',  // Adjust the blur as needed
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white p-4">
      <div style={backgroundImageStyle} className="absolute inset-0" /> {/* Background image */}
      <div className="absolute inset-0 bg-black opacity-50" /> {/* Dark overlay */}
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 backdrop-blur-sm bg-opacity-75 relative z-10"> {/* Relative z-10 for the signup form */}
        <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 ${
                usernameError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
              placeholder="Enter your username"
              required
              aria-invalid={usernameError ? "true" : "false"}
              aria-describedby="username-error"
            />
            {usernameError && (
              <p id="username-error" className="mt-2 text-sm text-red-500">
                {usernameError}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 ${
                emailError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
              placeholder="Enter your email"
              required
              aria-invalid={emailError ? "true" : "false"}
              aria-describedby="email-error"
            />
            {emailError && (
              <p id="email-error" className="mt-2 text-sm text-red-500">
                {emailError}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 rounded-md pl-10 focus:outline-none focus:ring-2 ${
                  passwordError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                placeholder="Enter your password"
                required
                minLength="8"
                aria-invalid={passwordError ? "true" : "false"}
                aria-describedby="password-error"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="mt-2 text-sm text-red-500">
                {passwordError}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 rounded-md pl-10 focus:outline-none focus:ring-2 ${
                  confirmPasswordError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                placeholder="Confirm your password"
                required
                minLength="8"
                aria-invalid={confirmPasswordError ? "true" : "false"}
                aria-describedby="confirmPassword-error"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {confirmPasswordError && (
              <p id="confirmPassword-error" className="mt-2 text-sm text-red-500">
                {confirmPasswordError}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full flex justify-center items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin mr-2" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <a href="login" className="text-blue-400 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
