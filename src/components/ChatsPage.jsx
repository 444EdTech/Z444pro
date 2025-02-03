import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function ChatsPage() {
  const [channels, setChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Fetch channels and direct messages
    fetchChannels();
    fetchDirectMessages();
  }, []);

  const fetchChannels = async () => {
    // TODO: Implement fetching channels from Supabase
    setChannels([{ id: 1, name: 'General' }, { id: 2, name: 'Random' }]);
  };

  const fetchDirectMessages = async () => {
    // TODO: Implement fetching direct messages from Supabase
    setDirectMessages([{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }]);
  };

  const handleChatSelect = (chat, type) => {
    setSelectedChat({ ...chat, type });
    // TODO: Fetch messages for the selected chat
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    // TODO: Implement sending message to Supabase
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 bg-light p-3" style={{ height: 'calc(100vh - 56px)' }}>
          <h5>Channels</h5>
          <ul className="list-group">
            {channels.map((channel) => (
              <li
                key={channel.id}
                className={`list-group-item ${selectedChat?.id === channel.id && selectedChat?.type === 'channel' ? 'active' : ''}`}
                onClick={() => handleChatSelect(channel, 'channel')}
              >
                # {channel.name}
              </li>
            ))}
          </ul>
          <h5 className="mt-4">Direct Messages</h5>
          <ul className="list-group">
            {directMessages.map((dm) => (
              <li
                key={dm.id}
                className={`list-group-item ${selectedChat?.id === dm.id && selectedChat?.type === 'dm' ? 'active' : ''}`}
                onClick={() => handleChatSelect(dm, 'dm')}
              >
                @ {dm.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-9 p-3">
          {selectedChat ? (
            <>
              <h3>{selectedChat.type === 'channel' ? `#${selectedChat.name}` : `@${selectedChat.name}`}</h3>
              <div className="border rounded p-3 mb-3" style={{ height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {messages.map((message) => (
                  <div key={message.id} className="mb-2">
                    <strong>{message.sender}:</strong> {message.content}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">Send</button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center mt-5">
              <h3>Select a channel or direct message to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatsPage;
