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
      sender: "ChatGPT",

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

  async function processMessageToChatGpt(chatMessages){
    
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT") {
        role ="assistant"
      } else{
        role = "user"
      }
      return {role: role, content: messageObject.message}
    });
    
    const systemMessage ={
      role: "system",
      content: "Talk to me like a pirate, be fun and short with your answers."
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage, 
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_APP_KEY_TOKEN}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setTyping(false);
    }); 
  }

  return (
    <>
      <div className="App">
      <div style={{position: "relative", height:"800px", width: "400px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing "/> : null }>
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
 