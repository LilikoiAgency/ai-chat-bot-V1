// AppointmentForm.js
import React from 'react';

function AppointmentForm() {
  const handleSubmit = (event) => {
    // Handle form submission logic
    event.preventDefault();
    // ... (your logic for handling form data)
  };

  return (
    <form>
     
      <label>
        Full Name:
        <input type="text" name="fullName" />
      </label>
      <label>
        Email:
        <input type="email" name="email" />
      </label>
      <button type="submit">Submit Appointment</button>
    </form>
  );
}

export default AppointmentForm;