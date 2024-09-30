import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
        <div className="mt-2">
          <a href="#" className="text-blue-400 hover:underline mx-2">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="#" className="text-blue-400 hover:underline mx-2">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
