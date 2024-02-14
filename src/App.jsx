import { useState, useEffect } from 'react'
import './App.css' 
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'
import nlp from 'compromise';




function App() {
  const [showChat, setShowChat] = useState(() => {
    const storedValue = localStorage.getItem('showChat');
    // If storedValue is null (first visit), default to true, else parse the stored value
    return storedValue === null ? true : storedValue === 'true';
  });  const [typing, setTyping] = useState(false);
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

      console.log('todays date is:', currentDate);

      const systemMessage = {
          role: "system",
          content: `Hey there! Today's date is ${currentDate}, and you're Alex, the friendly Appointment Setting Assistant. Please be nice and helpful to our users`
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
      console.log(data);
      console.log(data.choices[0].message.content);
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
    return '<a href="https://appointment.sempersolaris.com/" target="_blank" rel="noopener noreferrer">Schedule your appointment</a>';
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

    console.log('Message:', botMessage);
    console.log('Match:', match);
    console.log('Match2:', match2);
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

  useEffect(() => {
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
        <div style={{ position: "relative", height: "800px", width: "400px", textAlign: 'left', maxWidth: "100vw", maxHeight: '100vh' }}>
          {!showChat ? (
            <button className='open-chat-button' onClick={handleOpenChat}>
              <img style={{marginTop: 'auto', marginBottom: 'auto', borderRadius: '100%'}} width={60} height={60}  src='https://www.pngfind.com/pngs/m/126-1269385_chatbots-builder-pricing-crozdesk-chat-bot-png-transparent.png'/>

            </button>
          ) : (
            <>
            
              <div style={{backgroundColor:"white", display: "flex", justifyContent: 'space-between', padding: '7px 10px'} }>
                <img style={{marginTop: 'auto', marginBottom: 'auto'}} width={30} height={30}  src='https://cdn-icons-png.flaticon.com/512/147/147140.png'/>
                <button className="close-chat-button" onClick={handleCloseChat}>
                  <span>X</span>
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
 