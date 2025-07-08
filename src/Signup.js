import React from "react";

export default function Signup() {
  return (
  
    
    <div className="centered">
      <h2 style={{ padding:"50px"}}>Sign Up</h2>
      <form>
        <h3 style={{ backgroundColor: "#dbdbdb", paddingLeft:"100px", textAlign: "left"}}>1. Identification details</h3>
        <div className="flex-container">
        <div className="input-group">
        <label htmlFor="salutation">Salutation:</label>
        <input type="salutation" id="salutation" name="salutation" />
        </div>
        <div className="input-group">
        <label htmlFor="fname">First name:</label>
        <input type="fname" id="fname" name="fname" />
        </div>
        <div className="input-group">
        <label htmlFor="lname">Last name:</label>
        <input type="lname" id="lname" name="lname" />
        </div>
        </div>
        
        <h3 style={{ backgroundColor: "#dbdbdb", paddingLeft:"100px", textAlign: "left"}}>2. Contact details</h3>
        <div className="flex-container">
        <div className="input-group">
        <label htmlFor="contact">Contact:</label>
        <input type="contact" id="contact" name="contact" />
        </div>
        </div>


        <h3 style={{ backgroundColor: "#dbdbdb", paddingLeft:"100px", textAlign: "left" }}>3. Login details</h3>
        <div className="flex-container">
        <div className="input-group">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" />
        </div>
        <div className="input-group">
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" />
        </div>
        <div className="input-group">
        <label htmlFor="confirm">Confirm Password:</label>
        <input type="password" id="confirm" name="confirm" />
        </div>
        </div>
        <h3><button type="submit">Create Account</button></h3>
      </form>
    </div>
  );
}
