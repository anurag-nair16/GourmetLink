import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Add Google login

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("");
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }
  };

  useEffect(() => {
    validateEmail();
  }, [email]);

  useEffect(() => {
    validatePassword();
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!emailError && !passwordError && email && password) {
      setIsLoading(true);
  
      const loginData = { email, password };
  
      try {
        const response = await fetch('http://127.0.0.1:8000/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });
  
        if (response.ok) {
          const data = await response.json();
          // Store the token in localStorage or cookies
          localStorage.setItem("token", data.access);
          alert("Login successful");
          
          // Redirect to home or dashboard page
          window.location.href = '/home'; // or use react-router: navigate('/home')
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
    window.location.href = '/home'; // Redirect to home after successful Google login
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
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID"> {/* Google OAuth Provider */}
      <div className="relative min-h-screen flex items-center justify-center text-white p-4">
        <div style={backgroundImageStyle} className="absolute inset-0" />
        <div className="absolute inset-0 bg-black opacity-50" /> {/* Dark overlay */}
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 backdrop-blur-sm bg-opacity-75 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-2 text-black rounded-md"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 py-2 text-black rounded-md"
                  placeholder="Enter your password"
                  required
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="text-red-600"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-400 hover:underline">Forgot password?</a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold transition-colors hover:bg-blue-700"
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Login"
              )}
            </button>
          </form>
          
          <div className="flex items-center justify-center my-6">
            <hr className="w-full border-gray-400" />
            <span className="px-4 text-gray-400">OR</span>
            <hr className="w-full border-gray-400" />
          </div>
          {/* Google Login */}
          <div className="mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              buttonText="Continue with Google"
              className="w-full flex justify-center bg-red-600 text-white py-2 px-4 rounded-md font-semibold transition-colors hover:bg-red-700"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm">
              Don't have an account?{" "}
              <a href="signup" className="text-blue-400 hover:underline">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
