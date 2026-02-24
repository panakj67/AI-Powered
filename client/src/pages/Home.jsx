import React, { lazy, useContext, useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
import {
  Search,
  Sun,
  Moon,
  Send,
  X,
  Mic,
  MicOff,
  Sparkles,
  PanelLeft,
  Plus,
  LogOut,
} from "lucide-react";
import Aura from "../assets/Aura.png";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const FreshChat = lazy(() => import("../components/FreshChat"));

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
}

export default function ScriptDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, getGeminiResponse, darkMode, setDarkMode, setUserData, allChats, setAllChats } = useContext(userDataContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedChat, setSelectedChat] = useState(() => {
    const saved = localStorage.getItem("selectedChat");
    if (!saved || saved === "undefined") return null;

    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse selectedChat from localStorage:", e);
      return null;
    }
  });

  const chatWindowRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [listening, setListening] = useState(false);

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
      const formattedBody = body.replace(/\n/g, "\r\n");

      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedBody)}`,
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
    return words.length > 5 ? `${words.slice(0, 5).join(" ")}...` : firstMessage;
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setInputText("");
    setChatLoading(true);

    try {
      let chatToUse = selectedChat;

      if (!selectedChat) {
        const newChat = await handleCreateChat(generateTitle(trimmed));
        chatToUse = newChat;
      }

      await addMessage("user", trimmed, chatToUse);
      const response = await getGeminiResponse(trimmed);
      await addMessage("ai", response.response, chatToUse);
      speak(response.response);
      handleCommand(response);
    } catch (error) {
      await addMessage("ai", "Oops! Something went wrong.");
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!chatLoading) handleSend();
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
      const { data } = await axios.post("/api/chat", { title });
      const newChat = data.chat;

      setAllChats((prevChats) => [newChat, ...prevChats]);
      setChats((prevChats) => [newChat, ...prevChats]);
      setSelectedChat(newChat);
      localStorage.setItem("selectedChat", JSON.stringify(newChat));
      setMessages([]);

      return newChat;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  const handleDeleteChat = async (chat) => {
    try {
      if (selectedChat?._id === chat._id) {
        setSelectedChat(null);
        setMessages([]);
      }

      setAllChats((prev) => prev.filter((chatItem) => chatItem._id !== chat._id));
      const { data } = await axios.delete(`/api/chat/${chat._id}`);
      if (data.success) toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedChat(null);
    setMobileSidebarOpen(false);
    toast.success("New chat created successfully!");
  };

  const fetchMessages = async () => {
    if (!selectedChat?._id) {
      setLoading(false);
      return [];
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`/api/chat/${selectedChat._id}/messages`);
      return data.messages || [];
    } catch (error) {
      toast.error(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await fetchMessages();
      setMessages(msgs);
    };
    loadMessages();
  }, [selectedChat]);

  useEffect(() => {
    setChats(allChats);
  }, [allChats]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const temp = allChats.filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase()));
      setChats(temp);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, allChats]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("selectedChat", JSON.stringify(selectedChat));
  }, [darkMode, selectedChat]);

  const startListening = () => {
    if (!recognition) {
      toast.error("Speech Recognition not supported in this browser.");
      return;
    }

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setTimeout(() => {
        setInputText((value) => {
          if (value.trim()) handleSend();
          return value;
        });
      }, 0);
    };

    recognition.onerror = (event) => {
      toast.error(`Voice recognition error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`h-screen w-full p-2 sm:p-6 ${darkMode ? "bg-slate-950" : "bg-slate-200/70"}`}>
      <div className={`mx-auto flex h-full max-w-[1500px] overflow-hidden rounded-[28px] border ${darkMode ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-300 bg-white text-slate-900"}`}>
        <aside className={`fixed z-50 h-full w-72 shrink-0 border-r px-4 py-5 transition-transform sm:relative sm:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={Aura} alt="Aura" className="h-10 w-10 rounded-2xl" />
              <p className="text-xl font-semibold">Aura</p>
            </div>
            <button className="sm:hidden" onClick={() => setMobileSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={`mb-4 flex items-center gap-2 rounded-2xl border px-3 py-2 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <button onClick={clearChat} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" /> New Chat
          </button>

          <div className="mb-3 text-sm font-semibold text-slate-500">History</div>
          <div className="space-y-2 overflow-y-auto pb-8 h-[52vh]">
            {chats?.map((chat) => (
              <div
                key={chat._id}
                className={`group flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2 text-sm ${selectedChat?._id === chat._id ? "bg-indigo-600 text-white" : darkMode ? "hover:bg-slate-800" : "hover:bg-slate-200"}`}
                onClick={() => {
                  setSelectedChat(chat);
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="line-clamp-1">{chat.title}</span>
                <X
                  className="h-4 w-4 opacity-0 transition group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-5 left-4 right-4 space-y-3">
            <button className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm ${darkMode ? "border-slate-700" : "border-slate-300"}`} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {darkMode ? "Light mode" : "Dark mode"}
            </button>
            <div className="flex items-center gap-2">
              <img src="https://cdn-icons-png.freepik.com/512/6388/6388307.png" alt="profile" className="h-10 w-10 rounded-full" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userData?.name}</p>
                <p className="truncate text-xs text-slate-500">{userData?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative flex flex-1 flex-col">
          <header className={`flex items-center justify-between border-b px-4 py-4 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="rounded-xl p-2 sm:hidden">
                <PanelLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">AI Chat</h2>
            </div>
            <Button variant="default" className="cursor-pointer rounded-xl" onClick={handleLogOut}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </header>

          <div className="relative flex-1 px-4 pb-32 pt-6">
            {messages.length === 0 ? (
              !loading && <FreshChat />
            ) : (
              <div ref={chatWindowRef} className="mx-auto h-full max-w-3xl space-y-4 overflow-y-auto pr-1">
                {messages.map(({ sender, text }, i) => (
                  <div key={i} className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow ${sender === "user" ? "rounded-br-md bg-indigo-600 text-white" : darkMode ? "rounded-bl-md bg-slate-800 text-slate-100" : "rounded-bl-md bg-slate-100 text-slate-800"}`}>
                      {text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="animate-pulse text-sm text-slate-500">AI is typing...</div>}
              </div>
            )}
          </div>

          <div className="absolute bottom-5 left-1/2 w-[95%] max-w-3xl -translate-x-1/2">
            <div className={`rounded-3xl border px-4 py-3 shadow-lg ${darkMode ? "border-indigo-500/40 bg-slate-900" : "border-indigo-300 bg-white"}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent py-1 text-sm outline-none"
                  disabled={chatLoading}
                />
                <button onClick={startListening} className="rounded-full p-2 hover:bg-slate-200/70 dark:hover:bg-slate-700">
                  {listening ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5 text-emerald-500" />}
                </button>
                <button
                  onClick={handleSend}
                  disabled={chatLoading || !inputText.trim()}
                  className="rounded-full bg-indigo-600 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        <aside className={`hidden w-72 border-l p-4 xl:block ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
          <h3 className="mb-3 text-sm font-semibold text-slate-500">Quick Actions</h3>
          <div className="grid gap-3">
            {["Write copy", "Image generation", "Create avatar", "Write code"].map((item) => (
              <button key={item} className={`rounded-2xl border p-3 text-left text-sm ${darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 bg-white hover:bg-slate-100"}`}>
                {item}
              </button>
            ))}
          </div>

          <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-500">Recent Chats</h3>
          <div className="space-y-2">
            {chats.slice(0, 6).map((chat) => (
              <div key={chat._id} className={`rounded-xl border p-3 text-sm ${darkMode ? "border-slate-700" : "border-slate-200 bg-white"}`}>
                <p className="line-clamp-1 font-medium">{chat.title}</p>
                <p className="text-xs text-slate-500">Open from sidebar</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
