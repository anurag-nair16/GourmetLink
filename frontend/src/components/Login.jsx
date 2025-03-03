import React, { useState, useEffect, useCallback } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; 
import { Link, useLocation } from 'react-router-dom';
import PopupMessage from './forms/PopMessage';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromProtected) {
      setPopupMessage("Please login to access this feature.");
    }
  }, [location]);

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

  useEffect(() => validateEmail(), [email, validateEmail]);
  useEffect(() => validatePassword(), [password, validatePassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailError && !passwordError && email && password) {
      setIsLoading(true);
      const loginData = { email, password };
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.access);
          setPopupMessage("Logged in successfully!");
          setTimeout(() => (window.location.href = '/'), 1500);
        } else {
          const errorData = await response.json();
          setPopupMessage(errorData.detail || "Login failed. Please try again.");
        }
      } catch (error) {
        setPopupMessage("An error occurred. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = () => {
    setPopupMessage("Logged in with Google!");
    setTimeout(() => (window.location.href = '/'), 1500);
  };

  const handleGoogleFailure = () => {
    setPopupMessage("Google login failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
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

        {/* Login Form */}
        <div className="flex-grow flex items-center justify-center p-4 relative z-20">
          <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Welcome Back
            </h2>

            {popupMessage && (
              <PopupMessage message={popupMessage} onClose={() => setPopupMessage("")} />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 text-teal-500 rounded focus:ring-teal-500 bg-gray-700 border-gray-600"
                  />
                  Remember me
                </label>
                <a
                  href="www.google.com"
                  className="text-teal-400 hover:underline transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-all duration-200 disabled:bg-teal-400 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-600" />
              <span className="px-3 text-gray-400 text-sm">OR</span>
              <hr className="flex-grow border-gray-600" />
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              buttonText="Continue with Google"
              className="w-full bg-gray-700 text-white py-3 rounded-lg flex justify-center items-center hover:bg-gray-600 transition-all duration-200"
            />

            <p className="text-center text-sm text-gray-300 mt-6">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-teal-400 hover:underline transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 py-4 text-center">
          <p className="text-sm">&copy; 2025 Gourmet Link. All rights reserved.</p>
        </footer>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;