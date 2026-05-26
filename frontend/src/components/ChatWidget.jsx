'use client';
import { API_BASE_URL } from '@/config';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleChat } from '@/store/uiSlice';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function ChatWidget() {
  const dispatch = useDispatch();
  const { isChatOpen } = useSelector(state => state.ui);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init',
          text: 'Hi there! 👋 I am your Apex Virtual Assistant. Ask me about your orders, coupons, refunds, or delivery times!',
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMessage = {
      id: Math.random().toString(),
      text: inputVal,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      const data = await response.json();
      
      setIsTyping(false);
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          text: data.reply,
          sender: 'bot',
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        text: 'Sorry, I am facing connectivity issues. Please try again.',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 500 }}>
      {/* Floating Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => dispatch(toggleChat())}
          className="btn btn-primary"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(37,99,235,0.4)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Box Panel */}
      {isChatOpen && (
        <div
          className="glass-panel"
          style={{
            width: '380px',
            height: '500px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            animation: 'chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={20} />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Apex Assistant</h4>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>AI Support Chatbot</span>
              </div>
            </div>
            <button onClick={() => dispatch(toggleChat())} style={{ color: 'white' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flexGrow: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: 'hsl(var(--bg-primary))'
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  maxWidth: '85%'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: msg.sender === 'user' ? 'hsl(var(--bg-tertiary))' : 'hsl(var(--accent-primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}
                >
                  {msg.sender === 'user' ? <User size={14} style={{ color: 'hsl(var(--text-primary))' }} /> : <Bot size={14} />}
                </div>
                <div>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: msg.sender === 'user' ? 'hsl(var(--bg-tertiary))' : 'hsl(var(--bg-secondary))',
                      border: msg.sender === 'user' ? '1px solid hsl(var(--border-color))' : '1px solid hsl(var(--border-color))',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: 'hsl(var(--text-primary))'
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      color: 'hsl(var(--text-muted))',
                      display: 'block',
                      textAlign: msg.sender === 'user' ? 'right' : 'left',
                      marginTop: '4px'
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'hsl(var(--accent-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Bot size={14} />
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'hsl(var(--bg-secondary))',
                  border: '1px solid hsl(var(--border-color))',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span className="dot" style={{ animation: 'bounce 1.4s infinite 0.2s' }}>.</span>
                  <span className="dot" style={{ animation: 'bounce 1.4s infinite 0.4s' }}>.</span>
                  <span className="dot" style={{ animation: 'bounce 1.4s infinite 0.6s' }}>.</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '14px 20px',
              borderTop: '1px solid hsl(var(--border-color))',
              backgroundColor: 'hsl(var(--bg-secondary))',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="form-input"
              style={{
                height: '40px',
                fontSize: '13px',
                paddingLeft: '16px',
                borderRadius: 'var(--radius-full)'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes chatSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        .dot {
          display: inline-block;
          font-weight: 900;
          font-size: 16px;
          line-height: 0;
          color: hsl(var(--text-muted));
        }
      `}</style>
    </div>
  );
}
