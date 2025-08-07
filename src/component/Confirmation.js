// src/Confirmation.js
import React from 'react';
import HeaderBanner from './HeaderBanner';


function Confirmation() {
  return (    
      <div>
            {/* Banner */}
            <div className="img">
              <img
                src={process.env.PUBLIC_URL + "/photos/headliner.jpg"}
                alt="Banner"
              />
            </div>
      
            {/* Title */}
            <h1 className="centered">Booking Confirmed</h1>
            <p className="subheading">
              Thank you! <br></br>
              You may view and edit your booking under your profile page.
            </p>
          </div>
  );
}


export default Confirmation;
