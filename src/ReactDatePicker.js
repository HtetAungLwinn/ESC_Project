import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useEffect } from "react";

export default function DateRangePicker({ onChange }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate]     = useState(null);

   useEffect(() => {
    if (onChange) {
      onChange({ startDate, endDate });
    }
  }, [startDate, endDate, onChange]);

  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
      <DatePicker
        selectsStart
        selected={startDate}
        onChange={setStartDate}
        startDate={startDate}
        endDate={endDate}
        placeholderText="Select start date"
      />
      <DatePicker
        selectsEnd
        selected={endDate}
        onChange={setEndDate}
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        placeholderText="Select end date"
      />
    </div>
  );
}
