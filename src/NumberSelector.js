// src/NumberSelector.js
import React, { useState } from "react";

export default function NumberSelector({  
  id = "numberOfGuest",  
  label = "No. of Guests:",  
  min = 1,  
  max = 5,  
  onChange,  
  value  
}) {
  const [count, setCount] = useState(value ?? min);

  const handleChange = (e) => {
    const v = Number(e.target.value);
    setCount(v);
    if (onChange) onChange(v);
  };

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} value={count} onChange={handleChange}>
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
