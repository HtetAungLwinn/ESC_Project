// src/Confirmation.js
import React from 'react';

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
              Thank you!
            </p>
          </div>
  );
}


export default Confirmation;
