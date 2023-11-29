import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css' 
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'
import nlp from 'compromise';



function App() {

  const [typing, setTyping] = useState(false)

  const [messages, setMessages] = useState([
    {
      message: "Hey there, I'm Gary. If you are looking to set an appointment please click this link and <a href='https://appointment.sempersolaris.com/' target='_blank' rel='noopener noreferrer'>schedule today!</a>",
      sender: "Gregory the great ",

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

    // typing indecator
    setTyping(true);

    // process messages
    await processMessageToChatGpt(newMessages);
  }
//
  async function processMessageToChatGpt(chatMessages) {
    try {
      const apiMessages = chatMessages.map((messageObject) => {
        const role = messageObject.sender === "Gregory the great " ? "assistant" : "user";
        return { role, content: messageObject.message };
      });
  
      // Check if the user's message mentions setting an appointment
      const userMessage = chatMessages[chatMessages.length - 1].message.toLowerCase();
      if (containsAppointmentTrigger(userMessage)) {
        // If the user mentions setting an appointment, generate and send the appointment link
        const appointmentLink = generateAppointmentLink();
        const appointmentResponse = `You can schedule your appointment using this link: ${appointmentLink}`;
  
        setMessages([...chatMessages, { message: appointmentResponse, sender: "Gregory the great " }]);
        setTyping(false);
        return;
      }
  
      const systemMessage = {
        role: "system",
        content: "Your name is Gary, a semper solaris employee who is friendly and nice! you are short and accurate with your responses and you are always looking to help educate people on how solar can help them save money and become energy independent. You want them to book an appointment, also once a user provides you with there name, email, and phone number please reiterate it back in this format: Name: , Email: , Phone: . but only if you have all the informmation at once. Make sure you do not tell them you will reiterate back just sound natural but tell them to confirm it is correct"
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
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "Gregory the great "
      }]);
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

//
  return (
    <>
      <div className="App">
      <div style={{position: "relative", height:"800px", width: "400px", textAlign: 'left', maxWidth: "100vw", maxHeight: '100vh'}}>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={typing ? <TypingIndicator content="Gregory the great is typing "/> : null }>
              {messages.map((message, i) => {
                  return <Message key={i} model={message}/>
              })}
            </MessageList>
            <MessageInput attachButton={false} placeholder='Type Message' onSend={handleSend}/>
          </ChatContainer>
        </MainContainer>

      </div>
      
      </div>
    </>
  )
}



export default App
 