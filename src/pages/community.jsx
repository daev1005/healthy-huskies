import React, { useState } from 'react';

export default function Community() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Sarah',
      text: 'Just made the quinoa bowl recipe - absolutely delicious! Has anyone tried adding avocado?',
      timestamp: '2 hours ago',
      likes: 12
    },
    {
      id: 2,
      author: 'Mike',
      text: 'What are your favorite protein sources for post-workout meals?',
      timestamp: '5 hours ago',
      likes: 8
    },
    {
      id: 3,
      author: 'Jessica',
      text: 'Meal prepping tips? I always run out of time on Sundays!',
      timestamp: '1 day ago',
      likes: 15
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSubmit = () => {
    if (newMessage.trim() && username.trim()) {
      const message = {
        id: Date.now(),
        author: username,
        text: newMessage,
        timestamp: 'Just now',
        likes: 0
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  const handleLike = (id) => {
    setMessages(messages.map(msg =>
      msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg
    ));
  };

  const filteredMessages = activeTab === 'recent' 
    ? messages.slice(0, 5) 
    : messages;

  return (
    <div className="min-h-screen bg-egg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-tea rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-emerald-700 mb-2">Community Board</h1>
          <p className="text-gray-600">Share recipes, tips, and healthy eating advice</p>
        </div>

        {/* Tabs */}
        <div className="bg-tea rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'all'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              All Discussions
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'recent'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              Recent
            </button>
          </div>
        </div>

        {/* New Message Section */}
        <div className="bg-tea rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-darktea-800 mb-4">Start a Discussion</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-darktea-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <textarea
              placeholder="Share your thoughts, recipes, or questions..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-4 py-3 border border-darktea-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              rows="4"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition transform hover:scale-105 active:scale-95"
            >
              Post Message
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="bg-tea rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {message.author[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{message.author}</p>
                    <p className="text-sm text-gray-500">{message.timestamp}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{message.text}</p>
              
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleLike(message.id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="font-medium">{message.likes}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 bg-tea rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-700">{messages.length}</p>
              <p className="text-gray-600 text-sm">Discussions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">
                {messages.reduce((sum, msg) => sum + msg.likes, 0)}
              </p>
              <p className="text-gray-600 text-sm">Total Likes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">
                {new Set(messages.map(m => m.author)).size}
              </p>
              <p className="text-gray-600 text-sm">Active Members</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
