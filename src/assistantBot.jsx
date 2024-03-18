import React, { useState, useEffect } from 'react';
import './App.css' ;
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, Button} from '@chatscope/chat-ui-kit-react';
import OpenAI from 'openai';

export class MessageDto {
  constructor(content, sender, direction) {
    this.message = content;
    this.sender = sender;
    this.direction = direction;
  }
}

function AssistantBot() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hi, I am the Big Bully Turf Ai Assistant. How can I help you?",
      sender: "Assistant",
      direction: "incoming"
    }
  ]);
  const [openai, setOpenai] = useState(null);
  const [thread, setThread] = useState(null);
  const [assistant, setAssistant] = useState(null);
  const [input, setInput] = useState("");

  
  useEffect(() => {
    initChatBot();
  }, []);

  useEffect(() => {
    if (assistant) {
      console.log("Assistant is live");
    }
  }, [assistant]);

  const initChatBot = async () => {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_REACT_APP_APP_KEY_TOKEN,
      dangerouslyAllowBrowser: true,
    });

    // Create an assistant
    const assistant = await openai.beta.assistants.retrieve(`${import.meta.env.VITE_REACT_APP_ASST_API_ID}`);
    // await openai.beta.assistants.create({
    //   name: "Hockey Expert",
    //   instructions: "You are a hockey expert. You specialize in helping others learn about hockey.",
    //   tools: [{ type: "code_interpreter" }],
    //   model: "gpt-3.5-turbo",
    // });

    // Create a thread
    const thread = await openai.beta.threads.create();
    setOpenai(openai);
    setAssistant(assistant);
    setThread(thread);
  };

  const createNewMessage = (content, isUser) => {
    
    const direction = isUser ? "outgoing" : "incoming";
    const sender = direction === "outgoing" ? "user" : "Assistant";
    return new MessageDto(content, sender, direction);
  };

  const handleSend = async (element) => {

    console.log(element);

  
    // Add the user message to the messages array
    const userMessage = createNewMessage(element, true);
    setMessages(prevMessages => [...prevMessages, userMessage]);
  
    // Clear the input field
    setInput("");
  
    // Send a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: element,
    });
  
    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });
  
    // Create a response
    let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  
    // Wait for the response to be ready
    while (response.status === "in_progress" || response.status === "queued") {
      console.log("waiting...");
      setTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
  
    setTyping(false);
  
    // Get the messages for the thread
    const messageList = await openai.beta.threads.messages.list(thread.id);
  
    // Find the last message for the current run
    const lastMessage = messageList.data
      .filter((message) => message.run_id === run.id && message.role === "assistant")
      .pop();
  
    // Print the last message coming from the assistant
    if (lastMessage) {
      console.log(messages);
      setMessages(prevMessages => [...prevMessages, createNewMessage(lastMessage.content[0]["text"].value, false)]);
    }
  };

  return (
    <>
    <a href='/'> OpenAi API Chat </a>
    <div className="App assistant-wrap">
      <h1 style={{textAlign:'center'}}> BBT Assistant Ai </h1>
      <MainContainer>
        <ChatContainer>
            <MessageList typingIndicator={typing ? <TypingIndicator content="Big Bully Turf AI Assistant" /> : null}>
              {messages.map((message, i) => (
                <Message key={i} model={message} content={message.content} />
              ))}
            </MessageList>
            <MessageInput attachButton={false} placeholder='Type Message' onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
    </>
  );
}

export default AssistantBot;