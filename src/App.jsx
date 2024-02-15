import { useState, useEffect } from 'react'
import './App.css' 
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'
import nlp from 'compromise';




function App() {
  const [showChat, setShowChat] = useState(() => {
    const storedValue = localStorage.getItem('showChat');
    // If storedValue is null (first visit), default to false and update localStorage
    const initialValue = storedValue === null ? false : storedValue === 'true';
  
    if (storedValue === null) {
      localStorage.setItem('showChat', 'false');
    }
    return initialValue;
  });

  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hi, I'm Alex, your friendly Assistant! I can help you book a meeting or answer any questions you have regarding our services!",
      sender: "Alex",
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction : "outgoing"

    }
    const newMessages = [...messages, newMessage]
    // updeate message state
    setMessages(newMessages);

    localStorage.setItem('chatMessages', JSON.stringify(newMessages));


    // typing indecator
    setTyping(true);

    function getCurrentDateFormatted() {
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      const formattedDate = new Intl.DateTimeFormat('en-US', options).format(new Date());
      return formattedDate;
    }
    
    const currentDate = getCurrentDateFormatted();
    // process messages
    await processMessageToChatGpt(newMessages, currentDate);
  }

 
//
  // async function processMessageToChatGpt(chatMessages, currentDate) {
async function processMessageToChatGpt(chatMessages, currentDate) {
  try {
      const apiMessages = chatMessages.map((messageObject) => {
          const role = messageObject.sender === "Gregory the great" ? "assistant" : "user";
          return { role, content: messageObject.message };
      });

      // Check if the user's message mentions setting an appointment
      const userMessage = chatMessages[chatMessages.length - 1].message.toLowerCase();
      if (containsAppointmentTrigger(userMessage)) {
          // If the user mentions setting an appointment, generate and send the appointment link
          const appointmentLink = generateAppointmentLink();
          const appointmentResponse = `You can schedule your appointment using this link: ${appointmentLink}`;

          setMessages([...chatMessages, { message: appointmentResponse, sender: "Gregory the great" }]);
          setTyping(false);
          // setShowAppointmentForm(true);
          return;
      }

      const systemMessage = {
          role: "system",
          content: `Hello! It's ${currentDate}, and I'm Alex, your Appointment Setting Assistant. I'm here to help you schedule appointments and provide info on our chat services. Keep questions focused on appointments and chat services. If asked something random, politely guide them back to scheduling. Limit responses to 150 characters. You only know information about chatbot services and nothing else. So Do not answer questions on anything that does not involve chatbot services or an appointment for chatbots. If they want to schedule an appointment or book a meeting please give them this link: <a href="/contact-us/" target="_blank" rel="noopener noreferrer">Schedule your appointment</a>`
      };

      const apiRequestBody = {
          model: "gpt-3.5-turbo",
          messages: [systemMessage, ...apiMessages],
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${import.meta.env.VITE_REACT_APP_APP_KEY_TOKEN}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify(apiRequestBody)
      });

      const data = await response.json();
      const botMessageContent = data.choices[0].message.content;
      containsContactInfo(botMessageContent);

      // Save chatbot message to local storage
      const messagesWithBot = [...chatMessages, { message: botMessageContent, sender: "Alex" }];
      localStorage.setItem('chatMessages', JSON.stringify(messagesWithBot));

      setMessages(messagesWithBot);
      setTyping(false);
  } catch (error) {
      console.error('Error communicating with the chatbot:', error);
      setMessages([...chatMessages, {
          message: 'Error communicating with the chatbot',
          sender: "System"
      }]);
      setTyping(false);
  }
}

  function containsAppointmentTrigger(userMessage) {
    // Define keywords or phrases that indicate the intent to schedule an appointment
    const appointmentTriggers = ["appointment", "set appointment", "book appointment", "consultion"];
  
    // Tokenize the user's message
    const tokens = nlp(userMessage).out('array');
  
    // Check if any of the triggers are present in the tokens
    return appointmentTriggers.some(trigger =>
      tokens.some(token => token.toLowerCase().includes(trigger))
    );
  }

  function generateAppointmentLink() {
    // Example: Generating a static hyperlink to www.sempersolaris.com/appointment
    return '<a href="/contact-us/" target="_blank" rel="noopener noreferrer">Schedule your appointment</a>';
  }

  // function extractContactInfoMatch(userMessage) {
  //   // Define a regex pattern to match contact information, date, and time
  //   const contactInfoPattern = /name:\s*([\w\s]+),\s*email:\s*([\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,})\s*,\s*phone:\s*([\d\s-]+),\s*date:\s*([\w\s]+),\s*time:\s*([\w:]+)\./i;
  //   return userMessage.match(contactInfoPattern);
  // }

  function containsContactInfo(botMessage) {
    // Regular expression to match the contact information
    const regex = /Name:\s*(.*?),\s*Email:\s*(.*?),\s*Phone:\s*(.*?),\s*Date:\s*(.*?),\s*Time:\s*(.*?)\./i;
    const regex2 = /Name: (.*)\nEmail: (.*)\nPhone: (.*)\nDate: (.*)\nTime: (.*)/;
    // Attempt to match the regular expression
    const match = botMessage.match(regex);
    const match2 = botMessage.match(regex2);
    // Check if there's a match
    if (match) {
      const [, name, email, phone, date, time] = match; // Destructure the matched groups
      name.replace(/\n/g, '').trim();
      email.replace(/\n/g, '').trim();
      phone.replace(/\n/g, '').trim();
      date.replace(/\n/g, '').trim();
      time.replace(/\n/g, '').trim();
      
      const contactInfo = { name, email, phone, date, time };
      console.log('Contact Information:', {contactInfo });
      postToWebhook(contactInfo);
      return true;
    } else if (match2){
      const [, name, email, phone, date, time] = match2; // Destructure the matched groups
      name.replace(/\n/g, '').trim();
      email.replace(/\n/g, '').trim();
      phone.replace(/\n/g, '').trim();
      date.replace(/\n/g, '').trim();
      time.replace(/\n/g, '').trim();
      
      const contactInfo = { name, email, phone, date, time };
      console.log('Contact Information:', {contactInfo });
      postToWebhook(contactInfo);
      return true;
    }
    
    // No match found
    console.log("no match")
    return false;
  }

  async function postToWebhook(contactInfo) {
    // try {
    //   const webhookUrl = 'https://hooks.zapier.com/hooks/catch/807991/3fuqflw/'; // Replace with your actual webhook URL
    //   const response = await fetch(webhookUrl, {
    //     method: 'POST',
    //     mode: 'cors',
    //     body: JSON.stringify(contactInfo),
    //   });
  
    //   if (response.ok) {
    //     console.log('Contact information sent to webhook successfully.');
    //   } else {
    //     console.error('Failed to send contact information to webhook.');
    //   }
    // } catch (error) {
    //   console.error('Error posting to webhook:', error, JSON.stringify(contactInfo));
    // }

    console.error('postToWebhook function ran', JSON.stringify(contactInfo));

  }
  const handleCloseChat = () => {
    setShowChat(false);
    localStorage.setItem('showChat', 'false');
  };

  const handleOpenChat = () => {
    setShowChat(true);
    localStorage.setItem('showChat', 'true');

  };

  // useEffect(() => {
  //   const storedValue = localStorage.getItem('showChat');
  //   setShowChat(storedValue ? JSON.parse(storedValue) : true);
  
  //   const storedMessages = localStorage.getItem('chatMessages');
  //   if (storedMessages) {
  //     setMessages(JSON.parse(storedMessages));
  //   }
  // }, []);

  useEffect(() => {
    console.log("showChat from local storage:", localStorage.getItem('showChat'));
    console.log("Parsed showChat value:", JSON.parse(localStorage.getItem('showChat')));
    
    const storedValue = localStorage.getItem('showChat');
    setShowChat(storedValue ? JSON.parse(storedValue) : true);
    
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);



  return (
    <>
      <div className="App">
        <div className="chatOutterWrapper" style={{ padding: showChat ? '0' : '5px',height: showChat ? '100%' : 'fit-content',  boxShadow: showChat ? "0 0 10px rgba(0, 0, 0, 0.2)" : "none"}}>
          {!showChat ? (
            <button className='open-chat-button' style={{padding: '10px', backgroundColor: '#218aff', borderRadius: "100%", boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}} onClick={handleOpenChat}>
              <img style={{marginTop: 'auto', marginBottom: 'auto'}} width={45} height={45}  src='https://amazing-froyo-252e08.netlify.app/chatbot.png'/>
            </button>
          ) : (
            <>
              <div style={{backgroundColor:"white", display: "flex", justifyContent: 'space-between', padding: '5px 15px', borderBottom: 'solid 1px lightgray'} }>
                <img style={{padding: '2px',borderRadius: "100%",backgroundColor: '#218aff',marginTop: 'auto', marginBottom: 'auto'}} width={35} height={35}  src='https://amazing-froyo-252e08.netlify.app/chatbot.png'/>
                <button className="close-chat-button" onClick={handleCloseChat}>
                  <span>Close</span>
                </button> 
              </div>             
              <MainContainer>
                <ChatContainer>
                  <MessageList typingIndicator={typing ? <TypingIndicator content="Alex" /> : null}>
                    {messages.map((message, i) => (
                      <Message key={i} model={message} content={message.message} />
                    ))}
                  </MessageList>
                  <MessageInput attachButton={false} placeholder='Type Message' onSend={handleSend} />
                </ChatContainer>
              </MainContainer>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
 