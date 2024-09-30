import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // New state for Remember Me

  const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

  useEffect(() => {
    validateEmail();
  }, [email]);

  useEffect(() => {
    validatePassword();
  }, [password]);

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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     if (!emailError && !passwordError && email && password) {
//       setIsLoading(true);
  
//       const loginData = {
//         email,
//         password,
//       };
  
//       try {
//         const response = await fetch('http://127.0.0.1:8000/login/', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(loginData),
//         });
  
//         const contentType = response.headers.get("content-type");
        
//         if (contentType && contentType.includes("application/json")) {
//           const data = await response.json();
//           if (response.ok) {
//             // Save the token to localStorage or state
//             localStorage.setItem("token", data.access);
//             alert(data.message);
//           } else {
//             alert(data.detail || "An error occurred");
//           }
//         } else {
//           const text = await response.text();
//           console.error('Response was not JSON:', text);
//           alert("Received a non-JSON response from the server. Check the console for details.");
//         }
//       } catch (error) {
//         alert("An error occurred: " + error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailError && !passwordError && email && password) {
        setIsLoading(true);

        const loginData = {
            email,
            password,
        };

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
                localStorage.setItem("token", data.access); // Store the access token
                alert("Login occurred");
                window.location.href = '/home';
                // Redirect to a protected route or update the UI accordingly
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
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4"> {/* Centering added here */}
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 rounded-md pl-10 focus:outline-none focus:ring-2 ${
                  emailError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                placeholder="Enter your email"
                autoComplete="email"
                required
                aria-invalid={emailError ? "true" : "false"}
                aria-describedby="email-error"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {emailError && (
              <p id="email-error" className="mt-2 text-sm text-red-500">
                {emailError}
              </p>
            )}
            <datalist id="email-suggestions">
              {commonDomains.map((domain) => (
                <option key={domain} value={`${email.split("@")[0]}@${domain}`} />
              ))}
            </datalist>
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
                className={`w-full px-4 py-2 bg-gray-700 rounded-md pl-10 pr-10 focus:outline-none focus:ring-2 ${
                  passwordError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="text-sm">
              Remember Me
            </label>
          </div>
          <div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold transition-colors ${isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-blue-700"}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <a href="#" className="text-blue-400 hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
