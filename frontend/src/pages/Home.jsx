import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TextChatAssistant() {
  const { userData, getGeminiResponse, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { sender: "ai", text: `Hello ${userData.name}, how can I help you today?` }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const chatWindowRef = useRef(null);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Add new message to chat
  const addMessage = (sender, text) => {
    setMessages((msgs) => [...msgs, { sender, text }]);
  };

  const handleCommand = (data) => {
    const { type, userInput } = data;
    console.log(data);


    if (type === 'gmail-send') {
      const { email, subject, body } = data;
      const subjectEncoded = encodeURIComponent(subject);
      const bodyEncoded = encodeURIComponent(body);

      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subjectEncoded}&body=${bodyEncoded}`, '_blank');
    }

    else if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    } else if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    } else if (type === 'instagram-open') {
      window.open(`https://www.instagram.com/`, '_blank');
    } else if (type === 'facebook-open') {
      window.open(`https://www.facebook.com/`, '_blank');
    } else if (type === 'weather-show') {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    } else if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
  };



  // Handle user submitting a message
  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    setInputText("");
    setLoading(true);

    try {
      const response = await getGeminiResponse(trimmed);
      addMessage("ai", response.response || "Sorry, I didn't understand that.");

      // Call handleCommand after showing the message
      handleCommand(response);
    } catch (error) {
      addMessage("ai", "Oops! Something went wrong.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
  };

   const handleLogOut = async () => {
    try {
      const result = await axios.get(`/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-5 border-b border-indigo-700 shadow-lg">
        <h1 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-red-500 to-yellow-500">
          Text Chat Assistant
        </h1>
        <button
          onClick={handleLogOut}
          className="bg-red-600 cursor-pointer hover:bg-red-700 transition rounded-lg px-5 py-2 text-sm font-semibold shadow-md"
        >
          Logout
        </button>
      </header>

      {/* Chat messages */}
      <main
        ref={chatWindowRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-indigo-700 scrollbar-track-indigo-900"
      >
        {messages.map(({ sender, text }, i) => (
          <div
            key={i}
            className={`flex max-w-[70%] ${sender === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
              }`}
          >
            <div
              className={`px-5 py-3 rounded-2xl max-w-full break-words whitespace-pre-wrap shadow-lg
            ${sender === "user"
                  ? "bg-gradient-to-tr from-green-400 to-teal-500 text-white rounded-br-none"
                  : "bg-gradient-to-tr from-gray-700 to-gray-900 text-gray-200 rounded-bl-none"
                }`}
              style={{ wordBreak: "break-word" }}
            >
              {text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="italic text-gray-300 ml-3 animate-pulse select-none">
            AI is typing...
          </div>
        )}
      </main>

      {/* Input area */}
      <footer className="p-5 bg-gradient-to-t from-indigo-900 via-indigo-800 to-indigo-900 flex items-center gap-4 shadow-inner">
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="flex-grow resize-none rounded-3xl border border-indigo-700 bg-indigo-900 p-4 text-white placeholder-indigo-400 focus:outline-none focus:ring-4 focus:ring-green-400 transition-shadow shadow-md"
          disabled={loading}
          style={{ maxHeight: "100px" }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !inputText.trim()}
          className="bg-green-400 hover:bg-green-500 transition rounded-full px-6 py-3 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </footer>
    </div>
  );

}

export default TextChatAssistant;
