// // ProtectedRoute.jsx
// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     // If there is no token, redirect to login
//     return <Navigate to="/login" />;
//   }

//   return children; // If token exists, render the children components
// };

// export default ProtectedRoute;


import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // If there is no token, redirect to login with state
    return <Navigate to="/login" state={{ fromProtected: true }} />;
  }

  return element; // If token exists, render the passed element
};

export default ProtectedRoute;