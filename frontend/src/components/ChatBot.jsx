import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import API from '../api/axios';
import './ChatBot.css'; 

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // New state for account selection
  const [user, setUser] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Fetch user details to get accounts and name
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user for chatbot", err);
        // Fallback static greeting if user fetch fails
        if (!hasGreeted) {
          setHasGreeted(true);
          setMessages([
            { text: "Hi there! I'm your AI financial assistant. How can I help you today?", isBot: true }
          ]);
        }
      }
    };
    fetchUser();
  }, []);

  // Greeting Logic when chat is opened
  useEffect(() => {
    if (isOpen && user && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      
      const accountOptions = user.accounts?.map(acc => ({
        label: `${acc.account_type} - ${acc.account_number}`,
        value: acc.account_number
      })) || [];

      if (accountOptions.length > 0) {
        setMessages([
          { 
            text: `Hi ${user.username}! I'm your AI financial assistant. You can ask me anything about your profile, or select an account below to analyze transactions:`, 
            isBot: true,
            options: accountOptions
          }
        ]);
      } else {
        // Fallback for users with no accounts
        setMessages([
          { text: `Hi ${user.username}! I'm your AI financial assistant. I noticed you don't have any accounts yet.`, isBot: true }
        ]);
      }
    }
  }, [isOpen, user, hasGreeted, messages.length]);


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

  const clearOptions = (msgs) => msgs.map(m => ({ ...m, options: null }));

  const handleAccountSelect = async (accountNumber) => {
    setSelectedAccount(accountNumber);
    
    // Clear previously shown buttons
    setMessages(prev => clearOptions(prev).concat({ text: `Selected account: ${accountNumber}`, isBot: false }));
    
    if (pendingQuery) {
        setIsLoading(true);
        try {
            const response = await API.post('/ai/', { 
                query: pendingQuery,
                account_number: accountNumber 
            });
            
            const newBotMessage = { text: response.data.response, isBot: true };
            if (response.data.requires_account_selection && user?.accounts) {
                newBotMessage.options = user.accounts.map(acc => ({
                    label: `${acc.account_type} - ${acc.account_number}`,
                    value: acc.account_number
                }));
            }
            setMessages(prev => [...prev, newBotMessage]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isBot: true }]);
        } finally {
            setIsLoading(false);
            setPendingQuery(null);
        }
    } else {
        setMessages(prev => [...prev, { text: `Great! How can I help you with your account (${accountNumber}) today?`, isBot: true }]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message immediately & clear old options so buttons don't pile up
    setMessages(prev => clearOptions(prev).concat({ text: userMessage, isBot: false }));
    setIsLoading(true);

    try {
      const response = await API.post('/ai/', { 
        query: userMessage,
        account_number: selectedAccount 
      });
      
      const newBotMessage = { text: response.data.response, isBot: true };
      
      if (response.data.requires_account_selection && user?.accounts) {
          newBotMessage.options = user.accounts.map(acc => ({
              label: `${acc.account_type} - ${acc.account_number}`,
              value: acc.account_number
          }));
          // Save the query so we can automatically replay it once they click an account
          setPendingQuery(userMessage);
      }
      
      setMessages(prev => [...prev, newBotMessage]);
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
            <div key={idx} className={`message-wrapper ${msg.isBot ? 'bot-wrapper' : 'user-wrapper'}`}>
              <div className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
              {msg.options && (
                <div className="message-options">
                  {msg.options.map((opt, i) => (
                    <button 
                      key={i} 
                      className="message-option-btn"
                      onClick={() => handleAccountSelect(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper bot-wrapper">
              <div className="message bot typing-indicator">
                <Loader2 className="animate-spin" size={16} />
                <span>Thinking...</span>
              </div>
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
