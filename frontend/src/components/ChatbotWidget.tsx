import React, { useState, useRef, useEffect } from 'react';
import './chatbot.css';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! 👋 How can I help you today?",
            sender: 'bot',
            timestamp: 'Just now'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Draggable toggle position (left/top in px). Persisted to localStorage.
    const [togglePos, setTogglePos] = useState<{ left: number; top: number } | null>(null);
    const togglePosRef = useRef<{ left: number; top: number } | null>(null);
    const dragState = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

    // Initialize toggle position from localStorage or default (bottom-right)
    useEffect(() => {
        const saved = localStorage.getItem('chatbot-toggle-pos');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setTogglePos(parsed);
                togglePosRef.current = parsed;
            } catch { /* ignore */ }
        } else if (typeof window !== 'undefined') {
            setTogglePos({ left: window.innerWidth - 84, top: window.innerHeight - 84 });
            togglePosRef.current = { left: window.innerWidth - 84, top: window.innerHeight - 84 };
        }
    }, []);

    // Keep ref in sync
    useEffect(() => { togglePosRef.current = togglePos; }, [togglePos]);

    // Pointer event handlers for dragging the toggle (supports mouse + touch)
    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragState.current = { startX: e.clientX, startY: e.clientY, origLeft: togglePosRef.current?.left ?? rect.left, origTop: togglePosRef.current?.top ?? rect.top };
        setIsDragging(true);
    };

    useEffect(() => {
        if (!isDragging) return;

        const onMove = (ev: PointerEvent) => {
            if (!dragState.current) return;
            ev.preventDefault();
            const dx = ev.clientX - dragState.current.startX;
            const dy = ev.clientY - dragState.current.startY;
            const origLeft = dragState.current.origLeft;
            const origTop = dragState.current.origTop;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const toggleW = 56;
            const toggleH = 56;
            const minLeft = 8;
            const minTop = 8;
            const maxLeft = Math.max(minLeft, w - toggleW - 8);
            const maxTop = Math.max(minTop, h - toggleH - 8);
            const newLeft = Math.min(maxLeft, Math.max(minLeft, Math.round(origLeft + dx)));
            const newTop = Math.min(maxTop, Math.max(minTop, Math.round(origTop + dy)));
            setTogglePos({ left: newLeft, top: newTop });
        };

        const onUp = (ev?: PointerEvent) => {
            setIsDragging(false);
            dragState.current = null;
            // persist
            try { localStorage.setItem('chatbot-toggle-pos', JSON.stringify(togglePosRef.current)); } catch {}
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [isDragging]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const now = new Date();
        const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newUserMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: timeString
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            const responses = [
                "Thanks for your message! We'll get back to you shortly.",
                "That's interesting! Tell me more.",
                "I can help with that.",
                "Could you clarify what you mean?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const newBotMessage: Message = {
                id: Date.now() + 1,
                text: randomResponse,
                sender: 'bot',
                timestamp: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`
            };
            
            setMessages(prev => [...prev, newBotMessage]);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    // compute inline styles for toggle and window to follow the toggle
    const toggleStyle: React.CSSProperties | undefined = togglePos ? { left: togglePos.left, top: togglePos.top, right: 'auto', bottom: 'auto', position: 'fixed' } : undefined;

    const computeWindowStyle = (): React.CSSProperties => {
        const chatW = 380;
        const chatH = 520;
        const toggleW = 56;
        const toggleH = 56;
        const margin = 12;
        if (!togglePos) return { right: 28, bottom: 96 } as React.CSSProperties;
        // prefer placing window above the toggle; if not enough space, place below
        let top = togglePos.top - chatH - margin;
        if (top < 8) top = togglePos.top + toggleH + margin;
        // center horizontally relative to toggle
        let left = togglePos.left - Math.round((chatW - toggleW) / 2);
        // clamp
        left = Math.max(8, Math.min(window.innerWidth - chatW - 8, left));
        return { position: 'fixed', left, top, width: chatW, height: chatH } as React.CSSProperties;
    };

    const chatWindowStyle = computeWindowStyle();

    return (
        <div id="chatbot-widget">
            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`} id="chat-window" style={chatWindowStyle}>
                {/* Header */}
                <div className="chat-header">
                    <div className="bot-info">
                        <div className="bot-avatar">
                            <img src="/chatbot-logo.svg" alt="Chatbot logo" className="bot-logo" />
                        </div>
                        <div className="bot-details">
                            <span className="bot-name">Assistant</span>
                            <span className="bot-status">
                                <span className="status-dot"></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={toggleChat} aria-label="Close chat" type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages" id="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            <div className="message-content">
                                {msg.text}
                            </div>
                            <div className="message-time">{msg.timestamp}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            aria-label="Chat message input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            ref={inputRef}
                        />
                        <button className="send-btn" onClick={handleSendMessage} disabled={!inputValue.trim()} aria-label="Send message" type="button">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Toggle Button */}
            <button
                className={`chatbot-toggler ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
                onClick={toggleChat}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                type="button"
                onPointerDown={handlePointerDown}
                style={toggleStyle}
            >
                <span className="toggle-mark" aria-hidden="true">
                    <span className="mark-bubble">
                        <span className="mark-dot mark-dot-1" />
                        <span className="mark-dot mark-dot-2" />
                    </span>
                </span>
                <span className="toggle-close" aria-hidden="true">×</span>
                <span className="toggle-tooltip">Chat with Assistant</span>
            </button>
        </div>
    );
};

export default ChatbotWidget;
