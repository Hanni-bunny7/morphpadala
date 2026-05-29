import { useState, useEffect, useRef } from "react";

// ── constants ──────────────────────────────────────────────────────────────
const COUNTRIES = {
  USA: { label: "United States", currency: "USD", flag: "🇺🇸", rate: 56.2 },
  UAE: { label: "UAE", currency: "AED", flag: "🇦🇪", rate: 15.6 },
  SG: { label: "Singapore", currency: "SGD", flag: "🇸🇬", rate: 41.3 },
  JP: { label: "Japan", currency: "JPY", flag: "🇯🇵", rate: 0.38 },
  KR: { label: "South Korea", currency: "KRW", flag: "🇰🇷", rate: 0.041 },
};

const TRADITIONAL_FEE_RATE = 0.06; // 6%
const MORPH_FEE_RATE = 0.002;      // 0.2%
const MORPH_BASE_FEE = 0.15;       // base gas

const TRANSFER_STEPS = [
  { id: 1, title: "Validating wallet",   detail: "Checking sender balance & KYC...",      ms: 800  },
  { id: 2, title: "Converting to USDC",  detail: "Bridging via Morph stablecoin rails...", ms: 1400 },
  { id: 3, title: "Routing on Morph L2", detail: "Fast, low-cost settlement layer...",     ms: 2100 },
  { id: 4, title: "Funds delivered",     detail: "Credited to recipient wallet.",           ms: 2900 },
];

const TX_POOL = [
  { name: "Juan Dela Cruz",    route: "Dubai → Cebu" },
  { name: "Ana Reyes",         route: "Singapore → Manila" },
  { name: "Rolando Bautista",  route: "Japan → Davao" },
  { name: "Liza Mendoza",      route: "USA → Iloilo" },
  { name: "Mark Villanueva",   route: "Korea → Pampanga" },
  { name: "Grace Tolentino",   route: "UAE → Batangas" },
  { name: "Carlo Santos",      route: "Singapore → Quezon City" },
  { name: "Maricel Cruz",      route: "USA → Cagayan de Oro" },
  { name: "Dennis Aguilar",    route: "Japan → Laguna" },
  { name: "Rowena Flores",     route: "Dubai → Zamboanga" },
];

function randomTx(excludeNames = []) {
  const pool = TX_POOL.filter(t => !excludeNames.includes(t.name));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const amount = Math.floor(Math.random() * 18000 + 2000);
  return {
    ...pick,
    amount: `₱${amount.toLocaleString("en-PH")}`,
    ts: Date.now(),
  };
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

// ── helpers ────────────────────────────────────────────────────────────────
function shortHash() {
  return "0x" + [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

function AnimatedNumber({ value, prefix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef();
  const start = useRef(display);
  const startTime = useRef(null);

  useEffect(() => {
    start.current = display;
    startTime.current = null;
    const target = value;
    const duration = 600;

    const step = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(start.current + (target - start.current) * ease);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]); // eslint-disable-line

  const formatted = display.toLocaleString("en-PH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return <span>{prefix}{formatted}</span>;
}

// ── main component ─────────────────────────────────────────────────────────
export default function App() {
  const [country, setCountry]     = useState("USA");
  const [recipient, setRecipient] = useState("Maria Santos");
  const [amount, setAmount]       = useState(200);
  const [phase, setPhase]         = useState("idle"); // idle | sending | done
  const [completedSteps, setCompletedSteps] = useState([]);
  const [txHash, setTxHash]       = useState("");
  const [elapsed, setElapsed]     = useState(0);
  const [networkTx, setNetworkTx] = useState(14892);
  const [recentTx, setRecentTx]   = useState(() => [
    { name: "Juan Dela Cruz",   route: "Dubai → Cebu",          amount: "₱5,200",  ts: Date.now() - 120000 },
    { name: "Ana Reyes",        route: "Singapore → Manila",    amount: "₱8,900",  ts: Date.now() - 320000 },
    { name: "Rolando Bautista", route: "Japan → Davao",         amount: "₱12,450", ts: Date.now() - 660000 },
  ]);
  const elapsedTimer = useRef(null);

  const { currency, flag, rate } = COUNTRIES[country];
  const phpAmount   = amount * rate;
  const morphFee    = +(amount * MORPH_FEE_RATE + MORPH_BASE_FEE).toFixed(2);
  const tradFee     = +(amount * TRADITIONAL_FEE_RATE).toFixed(2);
  const savings     = +(tradFee - morphFee).toFixed(2);

  // fake live network counter
  useEffect(() => {
    const id = setInterval(() => setNetworkTx(n => n + Math.floor(Math.random() * 3 + 1)), 1800);
    return () => clearInterval(id);
  }, []);

  // live recent-tx feed
  useEffect(() => {
    function schedule() {
      const delay = Math.random() * 3000 + 4000; // 4–7s
      return setTimeout(() => {
        setRecentTx(prev => {
          const next = randomTx(prev.map(t => t.name));
          return [next, ...prev].slice(0, 6);
        });
        timerRef.current = schedule();
      }, delay);
    }
    const timerRef = { current: null };
    timerRef.current = schedule();
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleSend = () => {
    if (phase !== "idle") return;
    const hash = shortHash();
    setTxHash(hash);
    setPhase("sending");
    setCompletedSteps([]);

    // start elapsed timer
    setElapsed(0);
    elapsedTimer.current = setInterval(() => setElapsed(e => +(e + 0.1).toFixed(1)), 100);

    TRANSFER_STEPS.forEach((s) => {
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, s.id]);
        if (s.id === TRANSFER_STEPS.length) {
          clearInterval(elapsedTimer.current);
          setPhase("done");
          setRecentTx(prev => [{
            name: recipient,
            route: `${COUNTRIES[country].label} → Philippines`,
            amount: `₱${(amount * COUNTRIES[country].rate).toLocaleString("en-PH")}`,
            ts: Date.now(),
          }, ...prev].slice(0, 6));
        }
      }, s.ms);
    });
  };

  const handleReset = () => {
    clearInterval(elapsedTimer.current);
    setPhase("idle");
    setCompletedSteps([]);
    setTxHash("");
    setElapsed(0);
  };

  const activeStep = phase === "sending"
    ? TRANSFER_STEPS.find(s => !completedSteps.includes(s.id))?.id ?? null
    : null;

  return (
    <div className="min-h-screen text-white" style={{ background: "#080D1A", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google font import via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0e1525; } ::-webkit-scrollbar-thumb { background: #2a3450; border-radius: 3px; }
        select, input { color-scheme: dark; }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.4)} 50%{box-shadow:0 0 0 8px rgba(139,92,246,0)} }
        @keyframes slide-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .step-active { animation: pulse-glow 1.4s ease infinite; }
        .slide-in { animation: slide-in .35s ease forwards; }
        .spinner { display:inline-block; width:14px; height:14px; border:2px solid #a78bfa; border-top-color:transparent; border-radius:50%; animation:spin .7s linear infinite; }
      `}</style>

      {/* ── header ── */}
      <header style={{ borderBottom: "1px solid #1a2240", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>MorphPadala</div>
            <div style={{ fontSize: 11, color: "#4b5ea8", marginTop: 1 }}>Cross-border remittance on Morph L2</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 12, color: "#4b5ea8" }}>
            <span style={{ color: "#22c55e", marginRight: 5 }}>●</span>Morph Testnet
          </div>
          <div style={{ fontSize: 12, color: "#4b5ea8" }}>
            <span style={{ color: "#a78bfa" }}>⬡</span> <AnimatedNumber value={networkTx} /> txns today
          </div>
          <div style={{ fontSize: 12, background: "#0e1525", border: "1px solid #1e2d50", borderRadius: 8, padding: "5px 12px", color: "#7c8db5" }}>
            Powered by Morph
          </div>
        </div>
      </header>

      {/* ── hero blurb ── */}
      <div style={{ textAlign: "center", padding: "32px 16px 8px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px", margin: 0 }}>
          Send money home. <span style={{ color: "#7c3aed" }}>Instantly.</span> Without the fees.
        </h1>
        <p style={{ color: "#4b5ea8", marginTop: 8, fontSize: 14 }}>
          Built for OFWs. Settled on Morph L2 — fast, cheap, transparent.
        </p>
      </div>

      {/* ── three-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 1100, margin: "24px auto", padding: "0 24px" }}>

        {/* ── COLUMN 1 · Send ── */}
        <Card>
          <ColHeader color="#a78bfa" label="Send Money" />

          <label style={labelStyle}>Sending from</label>
          <div style={{ position: "relative", marginTop: 6 }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none" }}>{flag}</div>
            <select
              value={country}
              onChange={e => { setCountry(e.target.value); handleReset(); }}
              style={{ ...inputStyle, paddingLeft: 40 }}
            >
              {Object.entries(COUNTRIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label} ({v.currency})</option>
              ))}
            </select>
          </div>

          <label style={{ ...labelStyle, marginTop: 14 }}>Recipient name</label>
          <input
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
            placeholder="Full name"
          />

          <label style={{ ...labelStyle, marginTop: 14 }}>Amount ({currency})</label>
          <div style={{ position: "relative", marginTop: 6 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4b5ea8", fontSize: 13 }}>{currency}</span>
            <input
              type="number"
              value={amount}
              min={1}
              onChange={e => { setAmount(Math.max(1, Number(e.target.value))); handleReset(); }}
              style={{ ...inputStyle, paddingLeft: 46 }}
            />
          </div>

          {/* fee breakdown */}
          <div style={{ marginTop: 16, background: "#0a0f1e", border: "1px solid #1a2240", borderRadius: 12, padding: "14px 16px" }}>
            <Row label="Exchange rate" value={`1 ${currency} = ₱${rate}`} />
            <Row label={`Recipient gets`} value={<span style={{ color: "#22c55e", fontWeight: 600 }}>₱{phpAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>} />
            <div style={{ borderTop: "1px solid #1a2240", margin: "10px 0" }} />
            <Row label="Traditional fee (~6%)" value={<span style={{ color: "#f87171" }}>−{currency} {tradFee.toFixed(2)}</span>} />
            <Row label="Morph fee (0.2% + gas)" value={<span style={{ color: "#34d399" }}>−{currency} {morphFee.toFixed(2)}</span>} />
            <div style={{ borderTop: "1px solid #1a2240", margin: "10px 0" }} />
            <Row label="You save" value={<span style={{ color: "#a78bfa", fontWeight: 700 }}>{currency} {savings.toFixed(2)}</span>} />
            <Row label="Estimated arrival" value={<span style={{ color: "#fbbf24" }}>~ 3 seconds</span>} />
          </div>

          {phase === "idle" && (
            <button onClick={handleSend} style={btnStyle("#7c3aed")}>
              Send with Morph
            </button>
          )}
          {phase === "sending" && (
            <button disabled style={btnStyle("#3730a3", true)}>
              <span className="spinner" /> &nbsp;Processing...
            </button>
          )}
          {phase === "done" && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button disabled style={{ ...btnStyle("#16a34a", false), flex: 1 }}>✓ Sent!</button>
              <button onClick={handleReset} style={{ ...btnStyle("#1e2d50", false), flex: 1, color: "#7c8db5" }}>Send again</button>
            </div>
          )}
        </Card>

        {/* ── COLUMN 2 · Transfer status ── */}
        <Card>
          <ColHeader color="#60a5fa" label="Transfer Status" />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TRANSFER_STEPS.map((s) => {
              const done   = completedSteps.includes(s.id);
              const active = activeStep === s.id;
              const waiting = !done && !active && phase !== "idle";

              return (
                <div
                  key={s.id}
                  className={active ? "step-active" : done ? "slide-in" : ""}
                  style={{
                    borderRadius: 12,
                    padding: "12px 14px",
                    border: `1px solid ${done ? "#16a34a55" : active ? "#7c3aed88" : "#1a2240"}`,
                    background: done ? "#052013" : active ? "#14093d" : "#0a0f1e",
                    transition: "all .3s ease",
                    opacity: (phase === "idle" || waiting) ? 0.45 : 1,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: done ? "#16a34a" : active ? "#7c3aed" : "#1a2240",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: done || active ? "#fff" : "#4b5ea8",
                    transition: "all .3s",
                  }}>
                    {done ? "✓" : active ? <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> : s.id}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: done ? "#4ade80" : active ? "#a78bfa" : "#7c8db5" }}>
                      {s.title}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#4b5ea8" }}>{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* timing + tx hash */}
          <div style={{ marginTop: 16, background: "#0a0f1e", border: "1px solid #1a2240", borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#4b5ea8" }}>Transaction Hash</p>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#34d399", fontFamily: "'DM Mono', monospace", wordBreak: "break-all" }}>
              {txHash || "—"}
            </p>
            {phase !== "idle" && (
              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4b5ea8" }}>
                <span>Elapsed</span>
                <span style={{ color: "#fbbf24", fontFamily: "'DM Mono', monospace" }}>{elapsed.toFixed(1)}s</span>
              </div>
            )}
            {phase === "done" && (
              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#4b5ea8" }}>Status</span>
                <span style={{ color: "#4ade80", fontWeight: 600 }}>CONFIRMED ✓</span>
              </div>
            )}
          </div>

          {/* network info */}
          <div style={{ marginTop: 12, background: "#0a0f1e", border: "1px solid #1a2240", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#4b5ea8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Network</p>
            <Row label="Chain" value="Morph L2 (Testnet)" small />
            <Row label="Block time" value="~2s" small />
            <Row label="Finality" value="~10s" small />
          </div>
        </Card>

        {/* ── COLUMN 3 · Receiver ── */}
        <Card>
          <ColHeader color="#34d399" label="Receiver Wallet" />

          <div style={{ background: "linear-gradient(135deg,#052013,#0a0f1e)", border: "1px solid #16a34a33", borderRadius: 14, padding: "18px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#4b5ea8" }}>Recipient</p>
            <p style={{ margin: "5px 0 0", fontWeight: 700, fontSize: 18 }}>{recipient || "—"}</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#4b5ea8" }}>Philippines · GCash Wallet</p>

            <div style={{ marginTop: 20 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#4b5ea8" }}>Balance (PHP)</p>
              <div style={{ marginTop: 6, fontSize: 38, fontWeight: 700, color: phase === "done" ? "#4ade80" : "#7c8db5", fontFamily: "'DM Mono', monospace", letterSpacing: "-1px" }}>
                {phase === "done"
                  ? <AnimatedNumber value={phpAmount} prefix="₱" decimals={2} />
                  : "₱0.00"}
              </div>
            </div>
          </div>

          {/* incoming notification */}
          <div style={{ marginTop: 12 }}>
            {phase === "done" ? (
              <div className="slide-in" style={{ background: "#052013", border: "1px solid #16a34a55", borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ margin: 0, color: "#4ade80", fontWeight: 700, fontSize: 13 }}>
                  + ₱{phpAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} received
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7c8db5" }}>
                  From sender via Morph L2 · {new Date().toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div style={{ background: "#0a0f1e", border: "1px solid #1a2240", borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#4b5ea8" }}>
                  {phase === "sending" ? "Transfer in progress..." : "Waiting for transfer..."}
                </p>
              </div>
            )}
          </div>

          {/* recent tx */}
          <div style={{ marginTop: 12, background: "#0a0f1e", border: "1px solid #1a2240", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 12, color: "#7c8db5", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recent on Morph</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentTx.map((tx, i) => (
                <div key={tx.ts} className={i === 0 ? "slide-in" : ""} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{tx.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#4b5ea8" }}>{tx.route} · {timeAgo(tx.ts)}</p>
                  </div>
                  <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* savings callout */}
          <div style={{ marginTop: 12, background: "#0e0527", border: "1px solid #4c1d9544", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#7c3aed" }}>Total saved this transfer</p>
            <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 700, color: "#a78bfa" }}>
              <AnimatedNumber value={savings} prefix={`${currency} `} decimals={2} />
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 10, color: "#4b5ea8" }}>vs. traditional remittance at 6% fee</p>
          </div>
        </Card>
      </div>

      {/* ── footer ── */}
      <footer style={{ textAlign: "center", padding: "24px 16px", borderTop: "1px solid #1a2240", color: "#2a3a5a", fontSize: 11 }}>
        Built on Morph L2 · MorphPadala · Build In! Payments Hackathon 2026 · #MorphBuildSprint
      </footer>
    </div>
  );
}

// ── small reusable components ──────────────────────────────────────────────
function Card({ children }) {
  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2240", borderRadius: 20, padding: "20px", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
      {children}
    </div>
  );
}

function ColHeader({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color }}>{label}</h2>
    </div>
  );
}

function Row({ label, value, small }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <span style={{ fontSize: small ? 11 : 12, color: "#4b5ea8" }}>{label}</span>
      <span style={{ fontSize: small ? 11 : 12 }}>{value}</span>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: "#4b5ea8", textTransform: "uppercase", letterSpacing: "0.5px" };

const inputStyle = {
  width: "100%",
  background: "#0a0f1e",
  border: "1px solid #1a2240",
  borderRadius: 10,
  padding: "10px 12px",
  color: "#e2e8f0",
  fontSize: 14,
  outline: "none",
  display: "block",
};

function btnStyle(bg, disabled = false) {
  return {
    width: "100%",
    background: disabled ? "#1e2d50" : bg,
    border: "none",
    borderRadius: 12,
    padding: "12px",
    color: disabled ? "#4b5ea8" : "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? "default" : "pointer",
    marginTop: 14,
    transition: "opacity .2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };
}