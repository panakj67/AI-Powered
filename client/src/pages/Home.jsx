import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Search, Sun, Moon, Send, X } from "lucide-react";
import Aura from "../assets/Aura.png";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ScriptDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, getGeminiResponse, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  // Chat states
  const [messages, setMessages] = useState([
    { sender: "ai", text: `Hello ${userData?.name || "there"}, how can I help you today?` }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages((msgs) => [...msgs, { sender, text }]);
  };

  const handleCommand = (data) => {
    const { type, userInput } = data;

    if (type === "gmail-send") {
      const { email, subject, body } = data;
      const subjectEncoded = encodeURIComponent(subject);
      const bodyEncoded = encodeURIComponent(body);
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subjectEncoded}&body=${bodyEncoded}`,
        "_blank"
      );
    } else if (type === "google-search") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
    } else if (type === "calculator-open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    } else if (type === "instagram-open") {
      window.open("https://www.instagram.com/", "_blank");
    } else if (type === "facebook-open") {
      window.open("https://www.facebook.com/", "_blank");
    } else if (type === "weather-show") {
      window.open("https://www.google.com/search?q=weather", "_blank");
    } else if (type === "youtube-search" || type === "youtube-play") {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    setInputText("");
    setLoading(true);

    try {
      const response = await getGeminiResponse(trimmed);
      addMessage("ai", response.response || "Sorry, I didn't understand that.");
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
      const result = await axios.get(`/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      toast.success(result.data.message);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-black text-white" : "bg-white text-gray-900"}`}>
      {/* Sidebar */}
      <aside
        className={`
          fixed sm:relative z-80 top-0 left-0 h-full sm:h-auto w-60 p-4 flex flex-col justify-between
          ${darkMode ? "bg-black" : "bg-white"} shadow-lg transition-transform duration-300
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0
        `}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img src={Aura} alt="Aura Logo" className="h-full w-full object-cover" />
              </div>
              <p className="text-2xl font-medium ml-2">Aura</p>
            </div>
            <X
              className="h-4 w-4 sm:hidden text-gray-500 hover:text-red-600 cursor-pointer"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Search" className="pl-8 focus:ring-1 focus:ring-black" />
          </div>

          <nav className="space-y-3">
            <p className="font-medium text-sm cursor-pointer">New Chat</p>
            <p className="text-sm hover:font-medium hover:text-md cursor-pointer">Projects</p>
            <p className="text-sm hover:font-medium hover:text-md cursor-pointer">Templates</p>
            <p className="text-sm hover:font-medium hover:text-md cursor-pointer">Documents</p>
            <p className="text-sm hover:font-medium hover:text-md cursor-pointer text-blue-500">Community (NEW)</p>
            <p className="text-sm hover:font-medium hover:text-md cursor-pointer">History</p>
          </nav>
        </div>

        <div className="space-y-3">
          <button
            className="w-full cursor-pointer bg-transparent flex gap-2 justify-center border border-gray-300 rounded-full p-2 items-center"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <>
                <Sun className="h-4 w-4" /> Light
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" /> Dark
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <img
              src="https://cdn-icons-png.freepik.com/512/6388/6388307.png"
              alt="profile"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-sm">{userData?.name}</p>
              <p className="text-xs text-gray-500">{userData.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="flex shadow-sm justify-between items-center p-4 border-gray-300 dark:border-gray-700">
          <div className="flex items-center">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="sm:hidden cursor-pointer flex h-10 w-10 rounded-full overflow-hidden"
            >
              <img src={Aura} alt="Aura Logo" className="h-full w-full object-cover" />
            </button>
            <h2 className="text-lg font-semibold ml-2">AI Chat</h2>
          </div>
          <Button variant="default" className="cursor-pointer" onClick={handleLogOut}>
            ⚡ Logout
          </Button>
        </header>

        {/* Chat Messages */}
        <div
          ref={chatWindowRef}
          className="flex-1 w-[94%] max-w-2xl absolute top-20 h-[70%] left-1/2 transform -translate-x-1/2 py-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
        >
          {messages.map(({ sender, text }, i) => (
            <div
              key={i}
              className={`flex max-w-[70%] ${
                sender === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
              }`}
            >
              <div
                className={`px-4 py-1 rounded-2xl max-w-full break-words whitespace-pre-wrap shadow-md ${
                  sender === "user"
                    ? `${darkMode ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"} text-white rounded-br-none`
                    : `bg-gradient-to-tr ${darkMode ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"} text-gray-800 rounded-bl-none`
                }`}
                style={{ wordBreak: "break-word" }}
              >
                {text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="italic text-gray-500 ml-3 animate-pulse select-none">
              AI is typing...
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="w-[94%] max-w-2xl z-50 absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center border rounded-full p-2 bg-transparent shadow-md">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={`flex-1 border-none outline-none px-2 py-1 rounded-full  bg-transparent
                     ${darkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputText.trim()}
            className={`cursor-pointer ml-2 rounded-full
              ${darkMode ? "text-white" : "text-black"}   p-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

      </main>
    </div>
  );
}
