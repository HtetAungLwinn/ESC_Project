// src/DateRangePicker.js
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,      
  minCheckoutDate, 
}) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
      {/* Check‑in */}
      <DatePicker
        selectsStart
        selected={startDate}
        onChange={date => onChange({ startDate: date, endDate })}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        placeholderText="Check‑in"
        dateFormat="yyyy-MM-dd"
      />

      {/* Check‑out */}
      <DatePicker
        selectsEnd
        selected={endDate}
        onChange={date => onChange({ startDate, endDate: date })}
        startDate={startDate}
        endDate={endDate}
        minDate={minCheckoutDate}
        placeholderText="Check‑out"
        dateFormat="yyyy-MM-dd"
        disabled={!startDate}
      />
    </div>
  );
}
