import React, { useState, useEffect, useContext } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { supabase } from "../supabase"
import { UserContext } from "../contexts/UserContext"
import { ThemeContext } from "../contexts/ThemeContext"
import Swal from "sweetalert2"
import { Search, MessageCircle, Users, Plus, ArrowLeft } from "lucide-react"
import "../styles/ChatsList.css"
import ChatWindow from "./ChatWindow"

function ChatsList() {
  const [chats, setChats] = useState([])
  const [groups, setGroups] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activeGroup, setActiveGroup] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSection, setActiveSection] = useState("chats")
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768)
  const [showChatWindow, setShowChatWindow] = useState(false)
  const { user } = useContext(UserContext)
  const { isDarkMode, theme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (location.state && location.state.activeGroup) {
      setActiveGroup(location.state.activeGroup)
      setActiveSection("groups")
    }
  }, [location])

  useEffect(() => {
    fetchChats()
    fetchGroups()
  }, [])

  useEffect(() => {
    if (id) {
      setActiveChat(id)
    }
  }, [id])

  async function fetchChats() {
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })

      if (error) throw error

      const chatsWithDetails = await Promise.all(
        data.map(async (chat) => {
          const otherParticipantId = chat.participant1_id === user.id ? chat.participant2_id : chat.participant1_id
          const otherParticipantType =
            chat.participant1_id === user.id ? chat.participant2_type : chat.participant1_type
          const otherParticipantUsername =
            chat.participant1_id === user.id ? chat.participant2_username : chat.participant1_username

          const { data: userData, error: userError } = await supabase
            .from(otherParticipantType === "learner" ? "learnersDB" : "guidesDB")
            .select("name, image")
            .eq("id", otherParticipantId)
            .single()

          if (userError) throw userError

          const lastMessage = chat.messages[chat.messages.length - 1]

          return {
            ...chat,
            otherParticipantName: userData.name,
            otherParticipantImage: userData.image,
            otherParticipantId,
            otherParticipantUsername,
            lastMessage: lastMessage ? lastMessage.message : "",
            lastMessageTime: lastMessage ? lastMessage.created_at : chat.last_message_at,
          }
        }),
      )

      setChats(chatsWithDetails)
    } catch (error) {
      console.error("Error fetching chats:", error)
      Swal.fire("Error", "Failed to fetch chats. Please try again later.", "error")
    }
  }

  async function fetchGroups() {
    try {
      const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false })

      if (error) throw error

      const userGroups = data.filter((group) => group.members.includes(user.id))
      setGroups(userGroups)
    } catch (error) {
      console.error("Error fetching groups:", error)
      Swal.fire("Error", "Failed to fetch groups. Please try again later.", "error")
    }
  }

  const handleChatClick = async (otherParticipantId, otherParticipantUsername) => {
    const conversationId =
      user.role === "learner"
        ? `${user.username}-${otherParticipantUsername}`
        : `${otherParticipantUsername}-${user.username}`

    const existingChat = chats.find((chat) => chat.id === conversationId)

    if (existingChat) {
      setActiveChat(existingChat.id)
      navigate(`/chats/${existingChat.id}`, { replace: true })
    } else {
      try {
        const newChat = {
          id: conversationId,
          participant1_id: user.id,
          participant2_id: otherParticipantId,
          participant1_username: user.username,
          participant2_username: otherParticipantUsername,
          participant1_type: user.role,
          participant2_type: user.role === "learner" ? "guide" : "learner",
          messages: [],
          last_message_at: new Date().toISOString(),
        }

        const { data, error } = await supabase.from("chat_conversations").insert(newChat).select().single()

        if (error) throw error

        const { data: participantData, error: participantError } = await supabase
          .from(user.role === "learner" ? "guidesDB" : "learnersDB")
          .select("name, image")
          .eq("id", otherParticipantId)
          .single()

        if (participantError) throw participantError

        const updatedChat = {
          ...data,
          otherParticipantName: participantData.name,
          otherParticipantImage: participantData.image,
          otherParticipantId: otherParticipantId,
        }

        setChats((prevChats) => [updatedChat, ...prevChats])
        setActiveChat(data.id)
        navigate(`/chats/${data.id}`, { replace: true })
      } catch (error) {
        console.error("Error creating new chat:", error)
        Swal.fire("Error", "Failed to create new chat. Please try again.", "error")
      }
    }
    if (isMobileView) {
      setShowChatWindow(true)
    }
  }

  const handleGroupClick = (groupId) => {
    setActiveGroup(groupId)
    setActiveChat(null)
    navigate(`/chats?group=${groupId}`, { replace: true })
    if (isMobileView) {
      setShowChatWindow(true)
    }
  }

  const handleBackToList = () => {
    setShowChatWindow(false)
    setActiveChat(null)
    setActiveGroup(null)
  }

  const filteredChats = chats.filter((chat) =>
    chat.otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div
      className={`chat-container ${isDarkMode ? "dark-theme" : "light-theme"}`}
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      {(!isMobileView || (isMobileView && !showChatWindow)) && (
        <div className="sidebar glassmorphism" style={{ borderColor: theme.secondary }}>
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" style={{ color: theme.text }} />
              <input
                type="text"
                placeholder="Search chats and groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ backgroundColor: theme.background, color: theme.text }}
              />
            </div>
            <div className="section-buttons mb-3">
              <button
                className={`btn btn-cool ${activeSection === "chats" ? "btn-primary" : "btn-outline-primary"} me-2`}
                onClick={() => setActiveSection("chats")}
                style={{
                  backgroundColor: activeSection === "chats" ? theme.primary : "transparent",
                  color: theme.text,
                }}
              >
                <MessageCircle size={18} className="me-2" />
                Chats
              </button>
              <button
                className={`btn btn-cool ${activeSection === "groups" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setActiveSection("groups")}
                style={{
                  backgroundColor: activeSection === "groups" ? theme.primary : "transparent",
                  color: theme.text,
                }}
              >
                <Users size={18} className="me-2" />
                Groups
              </button>
            </div>
          </div>
          <div className="channels-section">
            <div className="section-header">
              <span>{activeSection === "chats" ? "CHATS" : "GROUPS"}</span>
              <button
                className="btn btn-sm btn-outline-secondary rounded-circle"
                style={{ color: theme.text, borderColor: theme.secondary }}
              >
                <Plus size={16} />
              </button>
            </div>
            <ul className="channel-list">
              {(activeSection === "chats" ? filteredChats : filteredGroups).map((item) => (
                <li
                  key={item.id}
                  className={`channel-item ${item.id === (activeSection === "chats" ? activeChat : activeGroup) ? "active" : ""}`}
                  onClick={() =>
                    activeSection === "chats"
                      ? handleChatClick(item.otherParticipantId, item.otherParticipantUsername)
                      : handleGroupClick(item.id)
                  }
                  style={{
                    backgroundColor:
                      item.id === (activeSection === "chats" ? activeChat : activeGroup) ? theme.accent : "transparent",
                    color: theme.text,
                  }}
                >
                  <img
                    src={item.image ? `data:image/jpeg;base64,${item.image}` : "/placeholder.svg"}
                    alt={item.name || item.otherParticipantName}
                    className="avatar"
                  />
                  <div className="channel-info">
                    <span className="channel-name">{item.name || item.otherParticipantName}</span>
                    <span className="last-message">{item.lastMessage || item.description}</span>
                  </div>
                  {activeSection === "chats" && (
                    <span className="last-message-time">
                      {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {(!isMobileView || (isMobileView && showChatWindow)) && (
        <div className="chat-main">
          {(activeChat || activeGroup) && (
            <ChatWindow
              key={activeChat || activeGroup}
              recipientId={activeChat || activeGroup}
              isMobileView={isMobileView}
              isDarkMode={isDarkMode}
              isGroupChat={activeSection === "groups"}
              onBack={handleBackToList}
            />
          )}
          {!activeChat && !activeGroup && !isMobileView && (
            <div
              className="chat-placeholder glassmorphism"
              style={{ backgroundColor: theme.background, color: theme.text }}
            >
              <h2 className="gradient-text">Select a chat or group to start messaging</h2>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatsList

