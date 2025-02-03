import React, { useState, useEffect, useContext, useRef } from "react" 
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import Swal from "sweetalert2"
import { User, Send, Paperclip, ArrowLeft } from "lucide-react"
import ProfilePopup from "./ProfilePopup"
import "../styles/ChatWindow.css"

function ChatWindow({ recipientId, isMobileView, isDarkMode, isGroupChat = false, onBack }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState(null)
  const { user } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const chatEndRef = useRef(null)
  const chatMessagesRef = useRef(null)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (recipientId) {
      fetchRecipient()
    }
  }, [recipientId])

  useEffect(() => {
    if (recipient) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [recipient])

  useEffect(() => {
    scrollToBottom()
  }, [messages]) // Correct dependency
  

  useEffect(() => {
    if (messages.length > 0 && !isGroupChat) {
      markMessagesAsSeen()
    }
  }, [messages, isGroupChat])

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function fetchRecipient() {
    try {
      if (isGroupChat) {
        const { data, error } = await supabase.from("groups").select("*").eq("id", recipientId).single()

        if (error) throw error
        setRecipient(data)
      } else {
        const otherUsername = recipientId.split("-").find((username) => username !== user.username)
        const { data, error } = await supabase
          .from(user.role === "learner" ? "guidesDB" : "learnersDB")
          .select("*")
          .eq("user_name", otherUsername)
          .single()

        if (error) throw error
        setRecipient(data)
      }
    } catch (error) {
      console.error("Error fetching recipient:", error)
      Swal.fire("Error", "Failed to fetch recipient details. Please try again later.", "error")
    }
  }

  async function fetchMessages() {
    try {
      if (isGroupChat) {
        const { data, error } = await supabase
          .from("group_chats")
          .select("*")
          .eq("group_id", recipientId)
          .order("created_at", { ascending: true })

        if (error) throw error
        setMessages(data || [])
      } else {
        const { data, error } = await supabase.from("chat_conversations").select("*").eq("id", recipientId).single()

        if (error) {
          if (error.code === "PGRST116") {
            // No matching row found, which means it's a new chat
            setMessages([])
            return
          }
          throw error
        }
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      Swal.fire("Error", "Failed to fetch messages. Please try again later.", "error")
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      if (isGroupChat) {
        const { data, error } = await supabase.from("group_chats").insert({
          group_id: recipientId,
          sender_id: user.id,
          sender_name: user.name,
          message: newMessage,
        })

        if (error) throw error
      } else {
        const newMessageObj = {
          id: Date.now(),
          sender_id: user.id,
          sender_username: user.username,
          sender_name: user.name,
          message: newMessage,
          created_at: new Date().toISOString(),
          seen: false,
        }

        const { data: existingConversation, error: fetchError } = await supabase
          .from("chat_conversations")
          .select("messages")
          .eq("id", recipientId)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") throw fetchError

        const updatedMessages = existingConversation
          ? [...existingConversation.messages, newMessageObj]
          : [newMessageObj]

        const { data, error } = await supabase.from("chat_conversations").upsert({
          id: recipientId,
          participant1_id: user.id,
          participant2_id: recipient.id,
          participant1_username: user.username,
          participant2_username: recipient.user_name,
          participant1_type: user.role,
          participant2_type: user.role === "learner" ? "guide" : "learner",
          messages: updatedMessages,
          last_message_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      setNewMessage("")
      fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      Swal.fire("Error", "Failed to send message. Please try again.", "error")
    }
  }

  async function markMessagesAsSeen() {
    if (isGroupChat || !messages.length) return

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.sender_id !== user.id && !lastMessage.seen) {
      try {
        const updatedMessages = messages.map((msg) => (msg.sender_id !== user.id ? { ...msg, seen: true } : msg))

        const { data, error } = await supabase
          .from("chat_conversations")
          .update({ messages: updatedMessages })
          .eq("id", recipientId)

        if (error) throw error

        setMessages(updatedMessages)
      } catch (error) {
        console.error("Error marking messages as seen:", error)
      }
    }
  }

  function parseMessage(message) {
    return message.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index !== message.split("\n").length - 1 && <br />}
      </React.Fragment>
    ))
  }

  const handleTyping = () => {
    setIsTyping(true)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  if (!recipient) {
    return <div>Loading...</div>
  }

  return (
    <div
      className={`chat-window glassmorphism ${isDarkMode ? "dark-theme" : "light-theme"}`}
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="chat-header" style={{ borderColor: theme.secondary }}>
        {isMobileView && (
          <ArrowLeft
            className="back-arrow"
            onClick={onBack}
            style={{ cursor: "pointer", marginRight: "1rem", color: theme.text }}
          />
        )}
        <div className="header-channel">
          <img
            src={recipient.image ? `data:image/jpeg;base64,${recipient.image}` : "/placeholder.svg"}
            alt={recipient.name}
            className="recipient-avatar"
          />
          <div className="recipient-info">
            <span className="fw-semibold">{recipient?.name}</span>
            {isTyping && (
              <span className="typing-indicator">
                typing<span className="loading-dots"></span>
              </span>
            )}
          </div>
          {!isGroupChat && (
            <User
              className="profile-icon"
              onClick={() => setShowProfilePopup(true)}
              style={{ cursor: "pointer", marginLeft: "auto", color: theme.text }}
            />
          )}
        </div>
      </div>
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender_id === user.id ? "sent" : "received"}`}>
            <div
              className="message-content"
              style={{ backgroundColor: message.sender_id === user.id ? theme.primary : theme.accent }}
            >
              {isGroupChat && message.sender_id !== user.id && <p className="sender-name">{message.sender_name}</p>}
              <p
                className="message-text"
                style={{ color: message.sender_id === user.id ? theme.background : theme.text }}
              >
                {parseMessage(message.message)}
              </p>
              <div className="message-info">
                <span
                  className="message-time"
                  style={{ color: message.sender_id === user.id ? theme.background : theme.text }}
                >
                  {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {!isGroupChat && message.sender_id === user.id && (
                  <span
                    className={message.seen ? "seen" : "unseen"}
                    style={{ color: message.sender_id === user.id ? theme.background : theme.text }}
                  >
                    {message.seen ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input" style={{ borderColor: theme.secondary }}>
        <form onSubmit={sendMessage} className="input-container">
          {/* <button type="button" className="attach-button" style={{ color: theme.text }}>
            <Paperclip size={20} />
          </button> */}
          <input
            type="text"
            className="message-input"
            placeholder={`Message ${recipient?.name}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            style={{ backgroundColor: theme.background, color: theme.text }}
          />
          <button type="submit" className="send-button" style={{ color: theme.primary }}>
            <Send size={20} />
          </button>
        </form>
      </div>
      {!isGroupChat && (
        <ProfilePopup
          show={showProfilePopup}
          onHide={() => setShowProfilePopup(false)}
          userData={recipient}
          theme={theme}
        />
      )}
    </div>
  )
}

export default ChatWindow