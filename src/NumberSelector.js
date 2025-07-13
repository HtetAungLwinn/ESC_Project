import React, { useState, useRef, useEffect } from "react";
import "./index.css";


export default function RoomGuestDropdown({
  rooms,
  setRooms,
  adults,
  setAdults,
  children,
  setChildren
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inc = (fn, max) => () => fn(prev => Math.min(prev + 1, max));
  const dec = (fn, min) => () => fn(prev => Math.max(prev - 1, min));

  return (
    <div className="rg-dropdown" ref={ref}>
      <button
        type="button"
        className="rg-toggle"
        onClick={() => setOpen(o => !o)}
      >
        {rooms} Room{rooms > 1 ? "s" : ""} &nbsp;|&nbsp; 
        {adults} Adult{adults > 1 ? "s" : ""}, 
        {children} Child{children > 1 ? "ren" : ""}
      </button>

      {open && (
        <div className="rg-panel">
          <div className="rg-row">
            <span>Rooms</span>
            <div className="rg-controls">
              <button onClick={dec(setRooms, 1)}>-</button>
              <span>{rooms}</span>
              <button onClick={inc(setRooms, 10)}>+</button>
            </div>
          </div>

          <div className="rg-row">
            <span>Adults</span>
            <div className="rg-controls">
              <button onClick={dec(setAdults, 1)}>-</button>
              <span>{adults}</span>
              <button onClick={inc(setAdults, 10)}>+</button>
            </div>
          </div>

          <div className="rg-row">
            <span>Children</span>
            <div className="rg-controls">
              <button onClick={dec(setChildren, 0)}>-</button>
              <span>{children}</span>
              <button onClick={inc(setChildren, 10)}>+</button>
            </div>
          </div>

          <button
            type="button"
            className="rg-done"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
