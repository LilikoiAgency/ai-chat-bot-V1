// InquiryForm.js
import React, { useState } from 'react';


const InquiryForm = ({ onCloseForm, onChatClosed  }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        message: '',
        });

        const [formSubmitted, setFormSubmitted] = useState(false);

        const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        };

        const handleSubmit = (e) => {
        e.preventDefault();

        // You can add your form submission logic here
        console.log('Form submitted:', formData);

        // Redirect to thank you page with query parameters
        const queryParams = new URLSearchParams(formData).toString();
        window.location.href = `/thank-you?${queryParams}`;

        // Close the form after submission
        setFormSubmitted(true);
        onCloseForm();
        onChatClosed();
      
        };

  return (
    <div className="chat-bot-ai-form-container">
      <h2>Let's talk</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Full name*"
          />
        </label>

        <label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="Phone Number*"
          />
        </label>

        <label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email*"

          />
        </label>

        {/* <label>
          <input
            type="text"
            name="currentWebsite"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Website URL or name"
          />
        </label> */}

        <label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Message: Interests"
          />
        </label>

        <button aria-label="submit form inquiry button" className='form-sbt-btn' type="submit">Submit</button>
      </form>
        <div className='fm-cl-btn'>
            <button aria-label="Go back to Chat button" className="close-btn-chat-ai" onClick={onCloseForm}>Back to chat</button>
            <p className='disclaimer-chat-ai-p'>
                By clicking, you agree to receive marketing emails, text messages, and phone calls and chats are recorded. You may opt-out at anytime.
            </p>
        </div>
    </div>
  );
};

export default InquiryForm;