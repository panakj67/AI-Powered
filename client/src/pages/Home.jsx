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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true" ? true : false; // convert string to boolean
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, getGeminiResponse, setUserData, allChats, setAllChats } = useContext(userDataContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedChat, setSelectedChat] = useState(() => {
    const saved = localStorage.getItem("selectedChat");
    return saved ? JSON.parse(saved) : null;
  });

  const chatWindowRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

const addMessage = async (sender, text, chat = selectedChat) => {
  try {
    if (chat?._id) {
      await axios.post(`/api/chat/${chat._id}/messages`, { sender, text });
    }
    setMessages((msgs) => [...msgs, { sender, text }]);
  } catch (error) {
    toast.error(error.message);
  }
};


  const handleCommand = (data) => {
    const { type, userInput } = data;

    if (type === "gmail-send") {
      const { email, subject, body } = data;
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
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

  const generateTitle = (firstMessage) => {
    const words = firstMessage.split(" ");
    return words.length > 5 ? words.slice(0, 5).join(" ") + "..." : firstMessage;
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
  
    setInputText("");
    setLoading(true);
  
    try {
      let chatToUse = selectedChat;
  
      // If no chat selected, create new chat and use it immediately
      if (!selectedChat) {
        const title = generateTitle(trimmed);
        const newChat = await handleCreateChat(title);
        chatToUse = newChat; // use this chat for adding the first message
      }
  
      // Add user message
      await addMessage("user", trimmed, chatToUse);
  
      // Get AI response
      const response = await getGeminiResponse(trimmed);
      await addMessage("ai", response.response, chatToUse);
  
      handleCommand(response);
  
    } catch (error) {
      await addMessage("ai", "Oops! Something went wrong.");
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
      console.error(error);
    }
  };

  const handleCreateChat = async (title) => {
    try {
      // Call your backend API to create a new chat
      const { data } = await axios.post("/api/chat", { title });
  
      const newChat = data.chat; // assuming your backend returns { chat: { ... } }
  
      // Update the chats list
      setAllChats((prevChats) => [newChat, ...prevChats]);
      setChats((prevChats) => [newChat, ...prevChats]); // if you have filtered/searchable chats
  
      // Set the new chat as selected
      setSelectedChat(newChat);
  
      // Store in localStorage for persistence
      localStorage.setItem("selectedChat", JSON.stringify(newChat));
  
      // Clear messages for the new chat
      setMessages([]);
  
      return newChat; // Important: return the newly created chat for immediate use
  
    } catch (error) {
      toast.error(error.message);
      console.error(error);
      return null;
    }
  };
  


  const handleDeleteChat = async (chat) => {
    try {
       if( selectedChat?._id === chat._id  ){
         setSelectedChat(null);
       }
       const temp = allChats.filter(chat1 =>
        chat1._id !== chat._id
      );
       setAllChats(temp);
       const chatId = chat._id;
       const {data} = await axios.delete(`/api/chat/${chatId}`);
       console.log(data.message);
       
       if(data.success){
         toast.success(data.message);
       }else toast.error(data.message);
    } catch (error) {
       toast.error(error.message);
    }
  }

  const clearChat = () => {
    setMessages([]);
    setSelectedChat(null);
    setMobileSidebarOpen(false);
    toast.success("New chat created successfully!")
  };

  const fetchMessages = async () => {
    if (!selectedChat?._id) return [];
    try {
      const { data } = await axios.get(`/api/chat/${selectedChat._id}/messages`);
      return data.messages || [];
    } catch (error) {
      toast.error(error.message);
      return [];
    }
  };

  useEffect(() => {
    // console.log(selectedChat);
    
    const loadMessages = async () => {
      if (selectedChat) {
        const msgs = await fetchMessages();
        setMessages(msgs);
      }
    };
    loadMessages();
  }, [selectedChat]);

  const [chats, setChats] = useState([]); // full chat list
  const [search, setSearch] = useState("");

  useEffect(() => {
  // Initially load chats
    setChats(allChats);
  }, [allChats]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const temp = allChats.filter(chat =>
        chat.title.toLowerCase().includes(search.toLowerCase())
      );
      setChats(temp);
    }, 300); // 300ms delay
  
    return () => clearTimeout(handler);
  }, [search, allChats]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode)
    localStorage.setItem("selectedChat", JSON.stringify(selectedChat))
  }, [darkMode, selectedChat])
  

  return (
    <div className={`flex h-screen ${darkMode ? "bg-black text-white" : "bg-white text-gray-900"}`}>
      {/* Sidebar */}
      <aside className={`fixed sm:relative z-80 top-0 left-0 h-full sm:h-auto w-60 p-4 flex flex-col justify-between ${darkMode ? "bg-black" : "bg-white"} shadow-lg transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img src={Aura} alt="Aura Logo" className="h-full w-full object-cover" />
              </div>
              <p className="text-2xl font-medium ml-2">Aura</p>
            </div>
            <X className="h-4 w-4 sm:hidden text-gray-500 hover:text-red-600 cursor-pointer" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          </div>

          <div className="mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Search"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              />
            </div>
          </div>


          <nav className="space-y-2">
            <p onClick={clearChat} className="font-medium text-sm bg-indigo-500 p-2 rounded-2xl text-gray-300 cursor-pointer">New Chat</p>
            <h1 className="font-bold text-xl">History</h1>

            

         <div className={`overflow-x-auto h-50 ${darkMode && "dark"} custom-scrollbar`}>
           {chats && chats.map((chat) => (
             <div
               key={chat._id}
               className={`relative flex group items-center justify-between text-sm font-semibold p-2 rounded-2xl cursor-pointer 
                           ${selectedChat?._id === chat._id ? "bg-[#0D98D3] text-white" : "hover:bg-indigo-300/20"} transition-opacity duration-100`}
               onClick={() => { setSelectedChat(chat); setMobileSidebarOpen(false); setSearch("") }}
             >
               <span>{chat.title}</span>
         
               {/* Delete Icon */}
               <X
                   className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"                 onClick={(e) => {
                   e.stopPropagation(); // Prevent selecting the chat
                   handleDeleteChat(chat); // your delete function
                 }}
               />
             </div>
           ))}
         </div>

          </nav>
        </div>

        <div className="space-y-3">
          <button className="w-full cursor-pointer bg-transparent flex gap-2 justify-center border border-gray-300 rounded-full p-2 items-center" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <><Sun className="h-4 w-4" /> Light</> : <><Moon className="h-4 w-4" /> Dark</>}
          </button>

          <div className="flex items-center space-x-2">
            <img src="https://cdn-icons-png.freepik.com/512/6388/6388307.png" alt="profile" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="font-medium text-sm">{userData?.name}</p>
              <p className="text-xs text-gray-500">{userData?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main onClick={() => setMobileSidebarOpen(false)} className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="flex shadow-sm justify-between items-center p-4 border-gray-300 dark:border-gray-700">
          <div onClick={(e) => e.stopPropagation()} className="flex items-center">
            <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="sm:hidden cursor-pointer flex h-10 w-10 rounded-full overflow-hidden">
              <img src={Aura} alt="Aura Logo" className="h-full w-full object-cover" />
            </button>
            <h2 className="text-lg font-semibold ml-2">AI Chat</h2>
          </div>
          <Button variant="default" className="cursor-pointer" onClick={handleLogOut}>
            ⚡ Logout
          </Button>
        </header>

        {/* Chat Messages */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center transform h-full px-4 sm:px-6 md:px-8">
            <img className="h-40 sm:h-32 md:h-48 lg:h-56 xl:h-64" src={Aura} alt="Aura" />
            <h1 className="text-3xl sm:text-2xl md:text-4xl font-semibold text-center mt-4">What can I help with?</h1>
          </div>
        ) : (
          <div ref={chatWindowRef} className="flex-1 w-[94%] max-w-2xl absolute top-18 h-[73.5%] left-1/2 transform -translate-x-1/2 py-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {messages.map(({ sender, text }, i) => (
              <div key={i} className={`flex max-w-[70%] ${sender === "user" ? "ml-auto justify-end" : "mr-auto justify-start"}`}>
                <div className={`px-4 py-1 rounded-2xl max-w-full break-words whitespace-pre-wrap shadow-md ${sender === "user" ? `${darkMode ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"} text-white rounded-br-none` : `${darkMode ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"} rounded-bl-none`}`} style={{ wordBreak: "break-word" }}>
                  {text}
                </div>
              </div>
            ))}
            {loading && <div className="italic text-gray-500 ml-3 animate-pulse select-none">AI is typing...</div>}
          </div>
        )}

        {/* Chat Input */}
        <div className="w-[94%] max-w-2xl z-50 absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center border rounded-full p-2 bg-transparent shadow-md">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={`flex-1 border-none outline-none px-2 py-1 rounded-full bg-transparent ${darkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !inputText.trim()} className={`cursor-pointer ml-2 rounded-full ${darkMode ? "text-white" : "text-black"} p-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
            <Send className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
