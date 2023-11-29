import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css' 
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'



function App() {

  const [typing, setTyping] = useState(false)

  const [messages, setMessages] = useState([
    {
      message: "Hello world",
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
      let apiMessages = chatMessages.map((messageObject) => {
        let role = "";
        if (messageObject.sender === "Gregory the great ") {
          role = "assistant";
        } else {
          role = "user";
        }
        return { role: role, content: messageObject.message };
      });
  
      // Check if the user's message mentions setting an appointment
      const userMessage = chatMessages[chatMessages.length - 1].message.toLowerCase();
      if (userMessage.includes('schedule appointment') || userMessage.includes('set appointment')) {
        // Replace this function with your logic to generate the actual appointment link
          function generateAppointmentLink() {
            // Example: Generating a static hyperlink to www.sempersolaris.com/appointment
            return '<a href="https://appointment.sempersolaris.com/" target="_blank" rel="noopener noreferrer">Schedule your appointment</a>';
          }
        // If the user mentions setting an appointment, generate and send the appointment link
        const appointmentLink = generateAppointmentLink();
        const appointmentResponse = `You can schedule your appointment using this link: ${appointmentLink}`;
  
        setMessages([...chatMessages, {
          message: appointmentResponse,
          sender: "Gregory the great "
        }]);
        setTyping(false);
        return;
      }
  
      const systemMessage = {
        role: "system",
        content: "Your name is Gary, a semper solaris employee who is friendly and nice! you are short and accurate with your responses and you are always looking to help educate people on how solar can help them save money and become energy independent. You want them to book an appointment"
      };
  
      const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
          systemMessage,
          ...apiMessages
        ]
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

//
  return (
    <>
      <div className="App">
      <div style={{position: "relative", height:"800px", width: "400px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={typing ? <TypingIndicator content="Gregory the great is typing "/> : null }>
              {messages.map((message, i) => {
                  return <Message key={i} model={message}/>
              })}
            </MessageList>
            <MessageInput placeholder='Type Message' onSend={handleSend}/>
          </ChatContainer>
        </MainContainer>

      </div>
      
      </div>
    </>
  )
}



export default App
 