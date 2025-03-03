import React, { useState, useEffect, useCallback } from "react";
import { FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Link } from 'react-router-dom';

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
    if (!username) {
      setUsernameError("Username is required");
    } else if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else {
      setUsernameError("");
    }
  }, [username]);

  const validateEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }
  }, [email]);

  const validatePassword = useCallback(() => {
    if (!password) {
      setPasswordError("Password is required");
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  }, [password]);

  const validateConfirmPassword = useCallback(() => {
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  }, [confirmPassword, password]);

  useEffect(() => validateUsername(), [username, validateUsername]);
  useEffect(() => validateEmail(), [email, validateEmail]);
  useEffect(() => validatePassword(), [password, validatePassword]);
  useEffect(() => validateConfirmPassword(), [confirmPassword, validateConfirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const userData = { username, email, password };
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/signup/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Sign up successful! Please log in.");
          setTimeout(() => (window.location.href = '/login'), 1500);
        } else {
          alert(data.error || "An error occurred during signup.");
        }
      } catch (error) {
        alert("An error occurred: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Video Background */}
      <div className="absolute inset-0 h-full w-full">
        <div className="absolute inset-0 bg-gray-900/70 z-10"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source
            src="/videos/mixkit-preparing-a-bowl-with-yogurt-and-fruit-43925-full-hd.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Signup Form */}
      <div className="flex-grow flex items-center justify-center p-4 relative z-20">
        <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                />
              </div>
              {usernameError && (
                <p className="text-red-400 text-xs mt-1">{usernameError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-400 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-400 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-400 transition-colors duration-200"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-red-400 text-xs mt-1">{confirmPasswordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-all duration-200 disabled:bg-teal-400 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-400 hover:underline transition-colors duration-200"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;