import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import API from '../api/axios';
import './ChatBot.css'; 

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your AI financial assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowWelcome(false);
      sessionStorage.setItem('aiWelcomeClosed', 'true');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  useEffect(() => {
    const isClosed = sessionStorage.getItem('aiWelcomeClosed');
    let showTimer;
    let hideTimer;
    
    if (!isClosed && !isOpen) {
      showTimer = setTimeout(() => {
        setShowWelcome(true);
        // auto-disappear after 5 seconds
        hideTimer = setTimeout(() => {
          setShowWelcome(false);
          sessionStorage.setItem('aiWelcomeClosed', 'true');
        }, 5000);
      }, 1500);
    }
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  const closeWelcome = (e) => {
    e.stopPropagation();
    setShowWelcome(false);
    sessionStorage.setItem('aiWelcomeClosed', 'true');
  };
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message immediately
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const response = await API.post('/ai/', { query: userMessage });
      
      setMessages(prev => [...prev, { 
        text: response.data.response, 
        isBot: true 
      }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      if (error.response && error.response.status === 401) {
          errorMessage = "Please log in to chat with the assistant.";
      }
      
      setMessages(prev => [...prev, { 
        text: errorMessage, 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Floating Button & Welcome Tooltip */}
      <div className={`chatbot-toggle-wrapper ${isOpen ? 'hidden' : ''}`}>
        {showWelcome && (
          <div className="chatbot-welcome-tooltip">
            <button className="welcome-close-btn" onClick={closeWelcome}>
              <X size={14} />
            </button>
            <div className="welcome-title">Need Help</div>
            <div className="welcome-subtitle">Chat with AI Assistant</div>
          </div>
        )}
        <button className="chatbot-toggle" onClick={toggleChat}>
          <Bot size={34} strokeWidth={1.5} />
        </button>
      </div>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="flex items-center gap-2">
            <div className="bot-avatar">
               <MessageSquare size={16} />
            </div>
            <span>AI Assistant</span>
          </div>
          <button onClick={toggleChat} className="close-btn"><X size={18} /></button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
              {msg.text}
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot typing-indicator">
              <Loader2 className="animate-spin" size={16} />
              <span>Thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chatbot-input">
          <input 
            type="text" 
            placeholder="Ask about your finances..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
