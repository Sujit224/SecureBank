import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import './ChatBot.css'; // We'll need a small CSS file for this or add to Dashboard.css

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // User message
    const newMessages = [...messages, { text: input, isBot: false }];
    setMessages(newMessages);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I'm just a demo bot right now, but I'll be smart soon!", 
        isBot: true 
      }]);
    }, 1000);
  };

  return (
    <div className="chatbot-container">
      {/* Floating Button */}
      <button className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`} onClick={toggleChat}>
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="flex items-center gap-2">
            <div className="bot-avatar">
               <MessageSquare size={16} />
            </div>
            <span>Support Bot</span>
          </div>
          <button onClick={toggleChat} className="close-btn"><X size={18} /></button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chatbot-input">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit"><Send size={16} /></button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
