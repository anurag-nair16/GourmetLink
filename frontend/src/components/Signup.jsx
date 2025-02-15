import { motion } from 'framer-motion';
import React, { useState, useEffect, useCallback } from "react";
import { FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Link } from 'react-router-dom';

// Add animation variants
const containerVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.9
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

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
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <motion.video
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source 
            src="/videos/mixkit-preparing-a-bowl-with-yogurt-and-fruit-43925-full-hd.mp4" 
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </motion.video>
      </div>

      {/* Signup Form */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-8 relative z-20"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-8"
        >
          Sign Up
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <motion.div variants={itemVariants}>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 py-2 text-black rounded-md focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${
                  usernameError ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
                }`}
                placeholder="Enter your username"
                required
              />
            </div>
            {usernameError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500"
              >
                {usernameError}
              </motion.p>
            )}
          </motion.div>

          {/* Email Input */}
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 py-2 text-black rounded-md focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${
                  emailError ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
                }`}
                placeholder="Enter your email"
                required
              />
            </div>
            {emailError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500"
              >
                {emailError}
              </motion.p>
            )}
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 pl-10 bg-gray-700 rounded-md focus:outline-none focus:ring-2 transition-all duration-300 ${
                  passwordError ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
                }`}
                placeholder="Enter your password"
                required
                minLength="8"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </motion.button>
            </div>
            {passwordError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500"
              >
                {passwordError}
              </motion.p>
            )}
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 pl-10 bg-gray-700 rounded-md focus:outline-none focus:ring-2 transition-all duration-300 ${
                  confirmPasswordError ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
                }`}
                placeholder="Confirm your password"
                required
                minLength="8"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </motion.button>
            </div>
            {confirmPasswordError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500"
              >
                {confirmPasswordError}
              </motion.p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`w-full flex justify-center items-center px-4 py-2 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-all duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin mr-2" />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <motion.div 
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <p className="text-sm">
            Already have an account?{" "}
            <motion.span whileHover={{ scale: 1.05 }}>
              <Link to="/login" className="text-emerald-400 hover:underline">
                Log in
              </Link>
            </motion.span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;