import React, { useState, useEffect, useCallback  } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Add Google login
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

const message = 'Please login first to use the desired features';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  }, [email]);

  const validatePassword = useCallback(() => {
    if (!password) {
      setPasswordError("");
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }
  }, [password])

  useEffect(() => {
    validateEmail();
  }, [email, validateEmail]);

  useEffect(() => {
    validatePassword();
  }, [password, validatePassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!emailError && !passwordError && email && password) {
      setIsLoading(true);
  
      const loginData = { email, password };
      try {
        // const response = await fetch(`${process.env.REACT_APP_API_URL}/login/`, {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });
        console.log(response.data);
        if (response.ok) {
          const data = await response.json();
          // Store the token in localStorage or cookies
          localStorage.setItem("token", data.access);
          alert("Login successful");
          
          // Redirect to home or dashboard page
          window.location.href = '/'; // or use react-router: navigate('/home')
        } else {
          const errorData = await response.json();
          alert(errorData.detail || "An error occurred");
        }
      } catch (error) {
        alert("An error occurred: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = (response) => {
    console.log("Google login successful", response);
    window.location.href = '/'; // Redirect to home after successful Google login
  };

  const handleGoogleFailure = (error) => {
    console.error("Google login failed", error);
    alert("Google login failed. Please try again.");
  };

  const backgroundImageStyle = {
    backgroundImage: `url('https://media.istockphoto.com/id/1152493500/photo/authentic-indian-dishes-and-snacks.webp?a=1&b=1&s=612x612&w=0&k=20&c=vy1KDx5reosJ4LEYRq_QLBSYyMdGdSYHoqFGW0-CLFM=')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(2px)',  
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
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
  
        {/* Login Form */}
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
            Login
          </motion.h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-2 text-black rounded-md focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </motion.div>
  
            {/* Password input */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 py-2 text-black rounded-md focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </motion.div>
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            </motion.div>
  
            {/* Remember me checkbox */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="text-emerald-600 rounded transition-all duration-300"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href="www.google.com" 
                className="text-sm text-emerald-400 hover:underline"
              >
                Forgot password?
              </motion.a>
            </motion.div>
  
            {/* Submit button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:bg-emerald-700"
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
          
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center my-6"
          >
            <hr className="w-full border-gray-400" />
            <span className="px-4 text-gray-400">OR</span>
            <hr className="w-full border-gray-400" />
          </motion.div>
  
          {/* Google Login */}
          <motion.div 
            variants={itemVariants}
            className="mt-6"
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              buttonText="Continue with Google"
              className="w-full flex justify-center bg-red-600 text-white py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:bg-red-700 hover:scale-[1.02]"
            />
          </motion.div>
  
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p className="text-sm">
              Don't have an account?{" "}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link to="/signup" className="text-emerald-400 hover:underline">
                  Sign up here
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
