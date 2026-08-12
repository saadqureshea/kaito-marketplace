import { useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

// Thread for Application.messages[] - shared by the Worker and Employer
// dashboards since POST /api/jobs/applications/:appId/messages is open to
// either participant.
export default function MessageThread({ applicationId, initialMessages = [] }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/jobs/applications/${applicationId}/messages`, { body });
      setMessages((prev) => [...prev, data]);
      setBody("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-line bg-surface p-3">
        {messages.length === 0 ? (
          <p className="text-xs text-ink-700/75">No messages yet.</p>
        ) : (
          messages.map((m, i) => {
            const isMine = String(m.sender?._id || m.sender) === String(user._id);
            return (
              <div key={m._id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-1.5 text-xs ${
                    isMine ? "bg-signal-500 text-on-brand" : "bg-paper-100 text-ink-900"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          className="input !py-1.5 text-xs"
          placeholder="Message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button disabled={sending || !body.trim()} className="btn-secondary !px-3 !py-1.5 text-xs">
          Send
        </button>
      </form>
    </div>
  );
}
