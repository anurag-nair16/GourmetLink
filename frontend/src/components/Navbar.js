 
  
import {Link} from 'react-router-dom';
import * as React from 'react';
import '.././index.css'

export default function Navbar() {
  return (
    <div>
    <header>
        <h1>Gourmet Link</h1>
        <nav>
          <ul>
            <li><Link to="">Home</Link></li>
            <li><Link to="/submit-recipe">Submit Recipe</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">SignUp</Link></li>
          </ul>
        </nav>
      </header>
      <br></br>
      </div>
  );
}
