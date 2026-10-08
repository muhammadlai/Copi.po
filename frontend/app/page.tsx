"use client";

import { useState } from "react";

const modes = ["friendly", "funny", "smart", "short", "warm"];

export default function Home() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("friendly");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready");

  async function suggest() {
    if (!message.trim()) return;
    setBusy(true);
    setStatus("AI is thinking...");
    setReply("");
    try {
      const response = await fetch("http://localhost:8000/api/v1/ai/reply", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          platform: "tiktok",
          external_id: "demo-viewer",
          display_name: "Live Viewer",
          message,
          mode
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Request failed");
      setReply(data.reply);
      setStatus("Suggestion ready");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{fontFamily:"system-ui",maxWidth:1100,margin:"0 auto",padding:32}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div><h1 style={{marginBottom:6}}>Copi.po</h1><p style={{margin:0}}>Aitzaz AI Social Copilot</p></div>
        <span style={{padding:"8px 12px",border:"1px solid #ddd",borderRadius:20}}>{status}</span>
      </header>

      <section style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
        <div style={{border:"1px solid #ddd",borderRadius:16,padding:24}}>
          <h2>TikTok LIVE Copilot</h2>
          <p>Paste a viewer comment here during local testing. The same AI brain will later consume authorized platform events.</p>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Viewer says: ..." rows={6} style={{width:"100%",padding:12,borderRadius:10,border:"1px solid #ccc",boxSizing:"border-box"}} />
          <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"14px 0"}}>
            {modes.map(x=><button key={x} onClick={()=>setMode(x)} style={{padding:"8px 12px",borderRadius:20,border:"1px solid #bbb",fontWeight:mode===x?700:400}}>{x}</button>)}
          </div>
          <button disabled={busy} onClick={suggest} style={{padding:"11px 18px",borderRadius:10,border:"1px solid #222"}}>{busy ? "Thinking..." : "Suggest Reply"}</button>
          {reply && <div style={{marginTop:20,padding:18,borderRadius:12,border:"1px solid #ddd"}}><strong>Suggested reply</strong><p>{reply}</p></div>}
        </div>

        <aside style={{border:"1px solid #ddd",borderRadius:16,padding:20}}>
          <h3>System</h3>
          <p>AI Brain: server-side</p>
          <p>Memory: SQLite</p>
          <p>WhatsApp: webhook + send API</p>
          <p>TikTok: official integration adapter</p>
          <hr />
          <h3>Modes</h3>
          <p>Friendly · Funny · Smart · Short · Warm</p>
        </aside>
      </section>
    </main>
  );
}
