import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo or Brand Name */}
          <div className="text-primary-main font-semibold text-lg">
            Dishcovery
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-600">
            <Link 
              to="/about" 
              className="hover:text-primary-main transition-colors duration-200"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="hover:text-primary-main transition-colors duration-200"
            >
              Contact
            </Link>
            <a 
              href="/privacy-policy" 
              className="hover:text-primary-main transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="hover:text-primary-main transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Dishcovery. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;