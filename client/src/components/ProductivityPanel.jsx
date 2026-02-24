import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

const columns = ["todo", "in-progress", "done"];

export default function ProductivityPanel() {
  const [reminders, setReminders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [emails, setEmails] = useState([]);
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState(null);
  const [agentRuns, setAgentRuns] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [memories, setMemories] = useState([]);
  const [pin, setPin] = useState("1234");
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, endpoint: "", method: "post" });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [r, t, e, c, i, a, w, d, m] = await Promise.all([
        axios.get("/api/reminders"),
        axios.get("/api/tasks"),
        axios.get("/api/emails"),
        axios.get("/api/calendar"),
        axios.get("/api/analytics"),
        axios.get("/api/agent-runs"),
        axios.get("/api/workspaces"),
        axios.get("/api/documents"),
        axios.get("/api/memory"),
      ]);
      setReminders(r.data.reminders);
      setTasks(t.data.tasks);
      setEmails(e.data.emails);
      setEvents(c.data.events);
      setInsights(i.data.insights);
      setAgentRuns(a.data.runs);
      setWorkspaces(w.data.workspaces);
      setDocuments(d.data.documents);
      setMemories(m.data.memories);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to sync productivity data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      reminders
        .filter((r) => r.status === "pending" && new Date(r.datetime).getTime() <= Date.now())
        .forEach((r) => toast(`Reminder: ${r.title}. ${r.followUpSuggestion || "Need follow-up?"}`));
    }, 30000);
    return () => clearInterval(timer);
  }, [reminders]);

  const run = async (fn, successMessage) => {
    try {
      await fn();
      if (successMessage) toast.success(successMessage);
      await loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    }
  };

  const createReminder = async () => run(() => axios.post("/api/reminders", { title: "Follow up", datetime: new Date(Date.now() + 3600000), followUpSuggestion: "Do you want me to draft the submission email too?" }), "Reminder created");
  const createTask = async () => run(() => axios.post("/api/tasks", { title: "Auto task from chat", status: "todo", priority: "medium" }), "Task created");
  const draftEmail = async () => run(() => axios.post("/api/emails/draft", { to: "demo@example.com", subject: "Draft", body: "Generated draft" }), "Email draft created");
  const createEvent = async () => run(() => axios.post("/api/calendar", { title: "Weekly Planning", startTime: new Date(Date.now() + 86400000), endTime: new Date(Date.now() + 90000000) }, { headers: { "x-action-confirmed": "true" } }), "Event created");
  const saveMemory = async () => run(() => axios.post("/api/memory", { key: "tone", value: "concise and proactive", confidence: 0.8 }), "Memory saved");
  const createAgentRun = async () => run(() => axios.post("/api/agent-runs", { goal: "Plan my Goa trip under 20k" }), "Agent run created");
  const createWorkspace = async () => run(() => axios.post("/api/workspaces", { name: "Product Team" }), "Workspace created");

  const uploadDocument = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await run(() => axios.post("/api/documents", fd, { headers: { "Content-Type": "multipart/form-data" } }), "Document uploaded");
  };

  const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
  const onDrop = async (e, status) => {
    const taskId = e.dataTransfer.getData("taskId");
    await run(() => axios.patch(`/api/tasks/${taskId}`, { status }));
  };

  const secureAction = (endpoint) => setConfirmState({
    open: true,
    endpoint,
    method: endpoint.includes("/approve") ? "patch" : "post",
  });
  const doConfirm = async () => {
    await run(() =>
      axios({
        url: confirmState.endpoint,
        method: confirmState.method,
        headers: { "x-action-confirmed": "true", "x-action-pin": pin },
      })
    );
    setConfirmState({ open: false, endpoint: "", method: "post" });
  };

  return (
    <div className="mt-4 p-3 border rounded-xl space-y-3 max-h-[42vh] overflow-auto">
      <ConfirmationModal open={confirmState.open} title="Confirm high-risk action" requirePin pin={pin} setPin={setPin} onCancel={() => setConfirmState({ open: false, endpoint: "", method: "post" })} onConfirm={doConfirm} />

      <div className="flex gap-2 flex-wrap text-xs">
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={createReminder}>+Reminder</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={createTask}>+Task</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={draftEmail}>+Email</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={createEvent}>+Event</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={saveMemory}>+Memory</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={createAgentRun}>+Agent Run</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={createWorkspace}>+Workspace</button>
        <input type="file" onChange={uploadDocument} className="text-xs" />
      </div>

      {loading && <p className="text-xs italic">Loading agentic modules...</p>}

      <div className="text-xs">Memories: {memories.length} | Docs: {documents.length} | Workspaces: {workspaces.length}</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>Reminders: {reminders.length}</div>
        <div>Events: {events.length}</div>
        <div>Agent Runs: {agentRuns.length}</div>
        <div>Emails: {emails.length}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {columns.map((col) => (
          <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col)} className="border rounded p-2 min-h-16">
            <h4 className="capitalize text-xs font-semibold">{col}</h4>
            {tasks.filter((t) => t.status === col).map((t) => (
              <div key={t._id} draggable onDragStart={(e) => onDragStart(e, t._id)} className="mt-1 p-1 bg-gray-100 rounded text-xs text-black">
                {t.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      {emails.map((e) => (
        <div key={e._id} className="text-xs">
          {e.subject} ({e.status}){" "}
          <button className="underline" onClick={() => secureAction(`/api/emails/${e._id}/approve`)}>Approve</button>{" "}
          <button className="underline" onClick={() => secureAction(`/api/emails/${e._id}/send`)}>Send</button>
        </div>
      ))}

      {insights && <div className="text-xs">Score {insights.productivityScore} | Tasks done {insights.tasksCompleted} | Time saved {insights.timeSavedEstimateHours}h</div>}
    </div>
  );
}
