// src/DateRangePicker.js
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";

export default function DateRangePicker({ startDate, endDate, onChange }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
      <DatePicker
        selectsStart
        selected={startDate}
        onChange={(date) => onChange({ startDate: date, endDate })}
        startDate={startDate}
        endDate={endDate}
        minDate={new Date()}
        placeholderText="Start date"
      />
      <DatePicker
        selectsEnd
        selected={endDate}
        onChange={(date) => onChange({ startDate, endDate: date })}
        startDate={startDate}
        endDate={endDate}
        minDate={startDate || new Date()}
        placeholderText="End date"
      />
    </div>
  );
}
