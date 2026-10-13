"use client";

import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";
const modes = ["friendly", "funny", "smart", "short", "warm"];

export default function Home() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("friendly");
  const [reply, setReply] = useState("Hi! Welcome to my LIVE room. Tell me where you're watching from!");
  const [busy, setBusy] = useState(false);
  const [talking, setTalking] = useState(false);
  const [status, setStatus] = useState("Avatar ready");
  const [voiceName, setVoiceName] = useState("US English voice (best available)");
  const [micSupported, setMicSupported] = useState(false);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const w = window as any;
    setMicSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    const updateVoice = () => {
      const voices = window.speechSynthesis?.getVoices?.() || [];
      const selected = voices.find((v) => /en-US/i.test(v.lang) && /female|samantha|aria|jenny|zira|ava/i.test(v.name))
        || voices.find((v) => /en-US/i.test(v.lang));
      if (selected) setVoiceName(selected.name + " · " + selected.lang);
    };
    updateVoice();
    window.speechSynthesis?.addEventListener?.("voiceschanged", updateVoice);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", updateVoice);
      if (stopTimer.current) clearTimeout(stopTimer.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text: string) {
    const clean = text.trim();
    if (!clean || !("speechSynthesis" in window)) {
      setStatus("Text-to-speech is not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    if (stopTimer.current) clearTimeout(stopTimer.current);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => /en-US/i.test(v.lang) && /female|samantha|aria|jenny|zira|ava/i.test(v.name))
      || voices.find((v) => /en-US/i.test(v.lang));
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.rate = 0.96;
    utterance.pitch = 1.08;
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { setTalking(true); setStatus("AI host is speaking"); };
    utterance.onend = () => { setTalking(false); setStatus("Avatar ready"); };
    utterance.onerror = () => { setTalking(false); setStatus("Voice playback stopped"); };
    window.speechSynthesis.speak(utterance);
  }

  async function askAI() {
    if (!message.trim() || busy) return;
    if (!API) {
      setStatus("AI backend not deployed");
      setReply("The browser avatar and voice are ready. The AI brain needs a secure backend URL before it can generate live replies. Configure NEXT_PUBLIC_API_URL to your deployed Copi.po API; never place your OpenAI key in this page.");
      return;
    }
    setBusy(true);
    setStatus("AI is thinking…");
    try {
      const response = await fetch(`${API}/api/v1/ai/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "tiktok",
          external_id: "chromebook-demo-viewer",
          display_name: "LIVE Viewer",
          message: message.trim(),
          mode
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "AI request failed");
      setReply(data.reply);
      setStatus("Reply ready");
    } catch (err) {
      setStatus("Backend not connected");
      setReply("I’m ready to chat! To enable AI-generated replies, start the Copi.po backend and configure OPENAI_API_KEY on the server. You can still test my voice with this message.");
    } finally {
      setBusy(false);
    }
  }

  function startMic() {
    const w = window as any;
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) {
      setStatus("Voice input unavailable; type the viewer comment instead");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setStatus("Listening…");
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setMessage(transcript);
      setStatus("Voice captured — press Generate reply");
    };
    recognition.onerror = () => setStatus("Mic issue — check browser permission");
    recognition.onend = () => {};
    recognition.start();
  }

  function stopVoice() {
    window.speechSynthesis?.cancel();
    if (stopTimer.current) clearTimeout(stopTimer.current);
    setTalking(false);
    setStatus("Voice stopped");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brandMark"><span className="brandIcon">C</span><div><strong>COPI.PO <span>AI</span></strong><small>AITZAZ AI · VIRTUAL LIVE HOST</small></div></div>
        <div className="liveBadge"><i /> BROWSER DEMO</div>
      </header>

      <section className="hero">
        <div className="heroCopy"><div className="eyebrow">YOUR NEXT-GEN LIVE COMPANION</div><h1>Meet your <em>AI host.</em></h1><p>A virtual host that listens, thinks, and speaks in natural American English. Test the avatar here before connecting any supported LIVE tools.</p><div className="statusLine"><span className={talking ? "pulse active" : "pulse"} />{status}</div></div>
        <div className={talking ? "stage talking" : "stage"} aria-label="Animated fictional AI avatar">
          <div className="orb orbOne" /><div className="orb orbTwo" /><div className="ring ringOne" /><div className="ring ringTwo" />
          <div className="avatar">
            <div className="hairBack" /><div className="neck" /><div className="torso"><div className="collar" /></div>
            <div className="face"><div className="brow browL" /><div className="brow browR" /><div className="eye eyeL"><i /></div><div className="eye eyeR"><i /></div><div className="nose" /><div className="cheek cheekL" /><div className="cheek cheekR" /><div className="mouth" /></div><div className="fringe" /><div className="ear earL" /><div className="ear earR" />
          </div>
          <div className="avatarTag"><span className="onlineDot" /><span><b>Copi</b><small>AI virtual host · fictional character</small></span></div>
          <div className="stageCaption">VOICE + AVATAR PREVIEW</div>
        </div>
      </section>

      <section className="workGrid">
        <div className="panel conversation">
          <div className="panelHead"><div><span className="step">01</span><h2>Talk to your host</h2></div><span className="miniStatus">AI BRAIN</span></div>
          <label htmlFor="viewer-message">Viewer comment / message</label>
          <textarea id="viewer-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Example: Hey! Where are you from? Or type a question for the AI host…" rows={4} />
          <div className="modeLabel">RESPONSE STYLE</div><div className="modes">{modes.map((m) => <button key={m} className={mode === m ? "mode selected" : "mode"} onClick={() => setMode(m)}>{m}</button>)}</div>
          <div className="actions"><button className="primary" disabled={busy || !message.trim()} onClick={askAI}>{busy ? "Thinking…" : "✦ Generate AI reply"}</button><button className="secondary" onClick={startMic} disabled={!micSupported}>◉ Speak</button></div>
          <p className="hint">{micSupported ? "Microphone input supported by this browser. Allow mic permission when asked." : "Voice input may not be supported in this browser; you can type instead."}</p>
        </div>

        <div className="panel response">
          <div className="panelHead"><div><span className="step">02</span><h2>Host response</h2></div><span className="miniStatus ready">READY TO SPEAK</span></div>
          <div className="speechBubble"><div className="bubbleTop"><span className="soundIcon">♫</span><span>AI HOST SCRIPT</span></div><p>{reply}</p></div>
          <div className="actions"><button className="primary" onClick={() => speak(reply)}>▶ Hear voice</button><button className="secondary" onClick={stopVoice}>■ Stop</button></div>
          <div className="voiceInfo"><span className="voiceAvatar">♫</span><div><b>English · United States</b><small>{voiceName}</small></div><span className="voiceDot" /></div>
          <p className="hint">The voice depends on the voices installed in ChromeOS. A specific female voice is not guaranteed on every device.</p>
        </div>
      </section>

      <section className="bottomGrid">
        <div className="panel checklist"><div className="panelHead"><div><span className="step">03</span><h2>Build status</h2></div></div>
          <div className="checkRow"><span className="check">✓</span><div><b>Browser avatar preview</b><small>Animated original character · ready for testing</small></div></div>
          <div className="checkRow"><span className="check">✓</span><div><b>Text-to-speech</b><small>Uses the available ChromeOS English voice</small></div></div>
          <div className="checkRow"><span className="check muted">•</span><div><b>AI reply backend</b><small>Requires Copi.po API + server-side OpenAI key</small></div></div>
          <div className="checkRow"><span className="check muted">•</span><div><b>TikTok LIVE connection</b><small>Not connected; needs an approved supported integration</small></div></div>
        </div>
        <div className="panel safety"><div className="safetyIcon">◇</div><div><h2>Built with control in mind</h2><p>This browser prototype does not log in to TikTok, read LIVE comments automatically, or broadcast. It lets you test the host safely. Use only official/authorized integrations for LIVE access.</p><a href="https://github.com/muhammadlai/Copi.po/tree/chromebook-ai-host" target="_blank" rel="noreferrer">View project branch ↗</a></div></div>
      </section>
      <footer>Copi.po · Aitzaz AI Social Copilot <span>CHROMEBOOK FIRST · PREVIEW BUILD</span></footer>

      <style jsx global>{`
        :root{color-scheme:dark;--bg:#080914;--panel:#111326;--line:#282b46;--muted:#9da1c2;--pink:#f36ab0;--purple:#a79aff}
        *{box-sizing:border-box}html,body{margin:0;min-height:100%;background:radial-gradient(ellipse at 72% 0%,#211a40 0%,#0b0c1b 40%,#080914 100%);color:#f6f5ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        body{min-height:100vh}.shell{max-width:1200px;margin:0 auto;padding:28px 28px 22px}.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:44px}.brandMark{display:flex;gap:12px;align-items:center}.brandIcon{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:linear-gradient(140deg,#a98aff,#f36ab0);font-size:23px;font-weight:900;color:#fff;box-shadow:0 5px 30px #a98aff44}.brandMark strong{font-size:16px;letter-spacing:2px}.brandMark strong span{color:#b7a5ff}.brandMark small{display:block;color:#8589ab;font-size:9px;letter-spacing:1.6px;margin-top:4px}.liveBadge{border:1px solid #383452;background:#17152a;border-radius:100px;padding:9px 13px;font-size:10px;letter-spacing:1.3px;color:#d9d4ff}.liveBadge i,.onlineDot,.pulse{display:inline-block;width:7px;height:7px;border-radius:50%;background:#74e0b1;margin-right:7px;box-shadow:0 0 12px #74e0b177}.hero{display:grid;grid-template-columns:1fr 390px;gap:46px;align-items:center;margin-bottom:26px}.heroCopy{padding:14px 0}.eyebrow{font-size:10px;font-weight:800;letter-spacing:2.4px;color:#b6a6ff}.hero h1{font-size:clamp(40px,5.6vw,67px);letter-spacing:-2.8px;line-height:1.02;margin:18px 0}.hero h1 em{font-style:normal;background:linear-gradient(90deg,#b5a5ff,#f68dc2);background-clip:text;-webkit-background-clip:text;color:transparent}.heroCopy>p{max-width:510px;color:#a7aac7;font-size:15px;line-height:1.8}.statusLine{display:flex;align-items:center;gap:8px;margin-top:26px;font-size:12px;color:#d6d4ef}.pulse{margin:0;background:#8172ff}.pulse.active{background:#f36ab0;animation:blink .65s infinite alternate}.stage{height:400px;position:relative;overflow:hidden;border:1px solid #3a3159;border-radius:28px;background:radial-gradient(ellipse at 50% 40%,#43315f 0%,#201a39 45%,#111326 100%);display:flex;justify-content:center;align-items:center;box-shadow:0 20px 90px #0005,inset 0 0 50px #a78bfa0d}.orb{position:absolute;border-radius:50%;filter:blur(30px);opacity:.5}.orbOne{width:190px;height:190px;background:#9d70ff;top:20px;left:30px}.orbTwo{width:160px;height:160px;background:#ed64ad;bottom:10px;right:10px}.ring{position:absolute;border:1px solid #b8a0ff22;border-radius:50%;width:300px;height:300px}.ringTwo{width:350px;height:350px;border-color:#ef8cbd19}.avatar{position:relative;width:220px;height:310px;z-index:2;animation:float 4s ease-in-out infinite;transform-origin:50% 90%}.hairBack{position:absolute;top:25px;left:27px;width:166px;height:204px;border-radius:49% 49% 39% 39%;background:linear-gradient(90deg,#1c152b,#63425c 47%,#26182f);box-shadow:0 0 30px #f3a2d322}.neck{position:absolute;top:171px;left:89px;width:42px;height:55px;border-radius:13px;background:linear-gradient(90deg,#b87570,#f1c0a9,#c17c76)}.torso{position:absolute;bottom:0;left:24px;width:174px;height:115px;border-radius:57% 57% 12% 12%;background:linear-gradient(110deg,#2a2d62,#8770b9 52%,#30284f);border-top:4px solid #e9b6b0;overflow:hidden}.collar{position:absolute;top:-5px;left:62px;width:49px;height:35px;border-left:3px solid #f0d5e4;border-right:3px solid #f0d5e4;transform:perspective(20px) rotateX(-8deg)}.face{position:absolute;top:42px;left:49px;width:123px;height:151px;border-radius:46% 46% 44% 44%;background:linear-gradient(100deg,#bd7e73,#f4c7b1 47%,#d99a89);box-shadow:inset -8px -4px 15px #9a555533;z-index:2}.fringe{position:absolute;top:25px;left:39px;width:144px;height:83px;background:linear-gradient(100deg,#21172b,#714b63,#25172d);border-radius:60% 45% 35% 30%;clip-path:polygon(0 0,100% 0,96% 65%,78% 43%,69% 100%,54% 53%,35% 95%,28% 49%,8% 72%);z-index:3}.ear{position:absolute;top:101px;width:14px;height:25px;border-radius:50%;background:#d89d8d;z-index:1}.earL{left:42px}.earR{right:42px}.brow{position:absolute;top:57px;width:28px;height:7px;border-top:3px solid #583746;border-radius:50%}.browL{left:17px;transform:rotate(-4deg)}.browR{right:17px;transform:rotate(4deg)}.eye{position:absolute;top:72px;width:27px;height:10px;border-bottom:3px solid #3d2a3a;border-radius:50%}.eyeL{left:17px}.eyeR{right:17px}.eye i{position:absolute;top:1px;left:9px;width:7px;height:7px;border-radius:50%;background:#342335}.nose{position:absolute;top:85px;left:59px;width:8px;height:17px;border-right:2px solid #b8756d;border-radius:50%}.cheek{position:absolute;top:100px;width:20px;height:9px;background:#ed888b66;filter:blur(4px);border-radius:50%}.cheekL{left:8px}.cheekR{right:8px}.mouth{position:absolute;top:119px;left:49px;width:27px;height:7px;background:#9e435e;border-radius:4px 4px 12px 12px;transition:height .08s}.talking .mouth{animation:talk .18s infinite alternate}.talking .avatar{animation:float 1.5s ease-in-out infinite}.avatarTag{position:absolute;z-index:4;left:16px;bottom:17px;display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid #ffffff1c;background:#111326c9;border-radius:13px;backdrop-filter:blur(12px)}.avatarTag b,.avatarTag small{display:block}.avatarTag b{font-size:12px}.avatarTag small{font-size:9px;color:#a5a7c7;margin-top:3px}.stageCaption{position:absolute;right:15px;bottom:23px;color:#777b9d;font-size:8px;letter-spacing:1.5px}.workGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.panel{border:1px solid var(--line);background:linear-gradient(150deg,#15172c,#101222);border-radius:20px;padding:23px;box-shadow:0 10px 35px #0002}.panelHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:21px}.panelHead>div{display:flex;align-items:center;gap:10px}.panelHead h2,.safety h2{font-size:16px;margin:0;letter-spacing:-.3px}.step{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#292343;color:#bbaeff;font-size:11px;font-weight:800}.miniStatus{font-size:9px;letter-spacing:1.1px;color:#b8a7ff;border:1px solid #40375d;border-radius:99px;padding:6px 8px}.miniStatus.ready{color:#8de1bd;border-color:#285744}.panel label,.modeLabel{display:block;color:#a4a7c7;font-size:11px;margin-bottom:9px}.panel textarea{width:100%;resize:vertical;min-height:98px;border:1px solid #333651;border-radius:12px;background:#0c0e1c;color:#f5f3ff;padding:13px;font:13px/1.6 inherit;outline:none}.panel textarea:focus{border-color:#8d7be8}.panel textarea::placeholder{color:#646986}.modeLabel{margin-top:17px;font-size:9px;letter-spacing:1.3px}.modes{display:flex;gap:7px;flex-wrap:wrap}.mode{border:1px solid #353852;background:#17192c;color:#aeb1d0;border-radius:99px;padding:7px 12px;font-size:10px;cursor:pointer}.mode.selected{border-color:#8e7cf1;background:#30274f;color:#fff}.actions{display:flex;gap:9px;margin-top:17px}.actions button{min-height:42px;border-radius:11px;padding:0 15px;font-size:11px;font-weight:750;cursor:pointer}.primary{flex:1;border:0;background:linear-gradient(100deg,#8e73f6,#e767aa);color:white;box-shadow:0 5px 18px #b07aff22}.primary:disabled{opacity:.5;cursor:not-allowed}.secondary{border:1px solid #373a58;background:#202239;color:#e2e0f6}.hint{font-size:10px;line-height:1.6;color:#777c9d;margin:13px 0 0}.speechBubble{background:#0c0e1d;border:1px solid #30334e;border-radius:14px;padding:15px;min-height:145px}.bubbleTop{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:1.4px;color:#9f91e6}.soundIcon{font-size:17px;color:#f58bc2}.speechBubble p{font-size:14px;line-height:1.8;color:#f0efff;margin:14px 0 2px;white-space:pre-wrap}.voiceInfo{display:flex;align-items:center;gap:10px;border-top:1px solid #292c44;margin-top:17px;padding-top:15px}.voiceAvatar{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:#2b2447;color:#c4b7ff}.voiceInfo b,.voiceInfo small{display:block}.voiceInfo b{font-size:11px}.voiceInfo small{font-size:10px;color:#888dac;margin-top:4px}.voiceDot{margin-left:auto;width:7px;height:7px;border-radius:50%;background:#7be1b4}.bottomGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.checklist{padding-bottom:12px}.checkRow{display:flex;gap:11px;align-items:flex-start;padding:11px 0;border-top:1px solid #252840}.check{display:grid;place-items:center;flex:0 0 20px;height:20px;border-radius:7px;background:#1d3b36;color:#81e0b6;font-size:12px;font-weight:800}.check.muted{background:#27263c;color:#a7a1cf}.checkRow b,.checkRow small{display:block}.checkRow b{font-size:11px}.checkRow small{font-size:10px;color:#888dac;margin-top:4px}.safety{display:flex;gap:14px;align-items:flex-start}.safetyIcon{display:grid;place-items:center;flex:0 0 38px;height:38px;border-radius:12px;background:#2b2344;color:#c2b3ff;font-size:23px}.safety p{font-size:11px;line-height:1.8;color:#9da1c2}.safety a{font-size:11px;color:#c5b8ff;text-decoration:none}.safety a:hover{text-decoration:underline}footer{display:flex;justify-content:space-between;gap:15px;color:#626786;font-size:10px;padding:26px 3px 0}footer span{letter-spacing:1px;font-size:8px}@keyframes float{50%{transform:translateY(-6px)}}@keyframes talk{to{height:15px;width:30px;left:47px}}@keyframes blink{to{opacity:.4}}@media(max-width:800px){.shell{padding:18px 14px}.topbar{margin-bottom:24px}.hero{grid-template-columns:1fr;gap:20px}.heroCopy{padding:0}.hero h1{font-size:48px}.stage{height:360px;max-width:480px;width:100%;margin:auto}.workGrid,.bottomGrid{grid-template-columns:1fr}.panel{padding:18px}.brandMark small{font-size:8px}.liveBadge{font-size:8px;padding:7px 9px}}@media(min-width:801px) and (max-width:1050px){.hero{grid-template-columns:1fr 330px;gap:25px}.stage{height:370px}}
      `}</style>
    </main>
  );
}
