import { useState, useEffect, useRef } from "react";

// ─── MOCK DATABASE (mirrors ER diagram exactly) ───────────────────────────────

const DB = {
  USER_ACCOUNT: [
    { UserID: "USR-001", Username: "s.kirkpatrick", Email: "s.kirkpatrick@corp.net", LastLogin: "2025-03-08T14:22:00Z", TimeStamp: "2024-01-10T09:00:00Z" },
    { UserID: "USR-002", Username: "w.kim", Email: "w.kim@corp.net", LastLogin: "2025-03-08T13:10:00Z", TimeStamp: "2024-01-12T10:00:00Z" },
    { UserID: "USR-003", Username: "m.rasmussen", Email: "m.rasmussen@corp.net", LastLogin: "2025-03-08T11:55:00Z", TimeStamp: "2024-02-01T08:00:00Z" },
    { UserID: "USR-004", Username: "r.shen", Email: "r.shen@corp.net", LastLogin: "2025-03-07T16:30:00Z", TimeStamp: "2024-02-15T09:00:00Z" },
    { UserID: "USR-005", Username: "d.denq", Email: "d.denq@corp.net", LastLogin: "2025-03-06T08:00:00Z", TimeStamp: "2024-03-01T07:00:00Z" },
  ],

  NETWORK_ASSET: [
    { AssetID: "AST-001", OwnerID: "USR-001", IPAddress: "192.168.1.14", AssetName: "Web Server Alpha" },
    { AssetID: "AST-002", OwnerID: "USR-001", IPAddress: "192.168.1.22", AssetName: "DB Server Primary" },
    { AssetID: "AST-003", OwnerID: "USR-002", IPAddress: "10.0.0.23", AssetName: "Dev Workstation 03" },
    { AssetID: "AST-004", OwnerID: "USR-003", IPAddress: "172.16.0.5", AssetName: "Analytics Node" },
    { AssetID: "AST-005", OwnerID: "USR-003", IPAddress: "192.168.2.88", AssetName: "File Server Bravo" },
    { AssetID: "AST-006", OwnerID: "USR-004", IPAddress: "10.0.1.4", AssetName: "VPN Gateway" },
    { AssetID: "AST-007", OwnerID: "USR-005", IPAddress: "192.168.3.11", AssetName: "Mail Server" },
  ],

  VULNERABILITY: [
    { VulnerabilityID: "VUL-001", AssetID: "AST-001", Severity: "Critical", Status: "Open", DateDiscovered: "2025-03-06" },
    { VulnerabilityID: "VUL-002", AssetID: "AST-001", Severity: "High", Status: "In Progress", DateDiscovered: "2025-03-07" },
    { VulnerabilityID: "VUL-003", AssetID: "AST-002", Severity: "Medium", Status: "Open", DateDiscovered: "2025-03-05" },
    { VulnerabilityID: "VUL-004", AssetID: "AST-005", Severity: "Critical", Status: "Patched", DateDiscovered: "2025-03-01" },
    { VulnerabilityID: "VUL-005", AssetID: "AST-007", Severity: "Low", Status: "Open", DateDiscovered: "2025-03-08" },
    { VulnerabilityID: "VUL-006", AssetID: "AST-003", Severity: "High", Status: "Open", DateDiscovered: "2025-03-07" },
  ],

  SECURITY_EVENT: [
    { EventID: "EVT-001", AssetID: "AST-001", EventType: "Brute Force", Severity: "Critical", SourceIP: "45.33.112.88" },
    { EventID: "EVT-002", AssetID: "AST-003", EventType: "Port Scan", Severity: "High", SourceIP: "198.51.100.4" },
    { EventID: "EVT-003", AssetID: "AST-004", EventType: "Anomaly Detected", Severity: "Medium", SourceIP: "10.0.0.91" },
    { EventID: "EVT-004", AssetID: "AST-005", EventType: "Malware Signature", Severity: "Critical", SourceIP: "203.0.113.55" },
    { EventID: "EVT-005", AssetID: "AST-006", EventType: "Unusual Login", Severity: "Low", SourceIP: "10.0.1.200" },
    { EventID: "EVT-006", AssetID: "AST-007", EventType: "SQL Injection Attempt", Severity: "High", SourceIP: "91.108.4.18" },
    { EventID: "EVT-007", AssetID: "AST-002", EventType: "Privilege Escalation", Severity: "Critical", SourceIP: "192.168.1.55" },
  ],

  INCIDENT: [
    { IncidentID: "INC-041", EventID: "EVT-001", IncidentType: "Brute Force Attack", StartTime: "2025-03-08T14:32:00Z", AssignedTo: "USR-001" },
    { IncidentID: "INC-040", EventID: "EVT-002", IncidentType: "Reconnaissance", StartTime: "2025-03-08T14:21:00Z", AssignedTo: "USR-002" },
    { IncidentID: "INC-039", EventID: "EVT-003", IncidentType: "Behavioral Anomaly", StartTime: "2025-03-08T13:58:00Z", AssignedTo: "USR-003" },
    { IncidentID: "INC-038", EventID: "EVT-004", IncidentType: "Malware Infection", StartTime: "2025-03-08T13:12:00Z", AssignedTo: "USR-001" },
    { IncidentID: "INC-037", EventID: "EVT-005", IncidentType: "Unauthorized Access", StartTime: "2025-03-08T12:44:00Z", AssignedTo: "USR-004" },
    { IncidentID: "INC-036", EventID: "EVT-006", IncidentType: "Injection Attack", StartTime: "2025-03-08T11:30:00Z", AssignedTo: "USR-005" },
    { IncidentID: "INC-035", EventID: "EVT-007", IncidentType: "Privilege Escalation", StartTime: "2025-03-08T10:05:00Z", AssignedTo: "USR-002" },
  ],

  REMEDIATION_ACTION: [
    { ActionID: "REM-001", IncidentID: "INC-041", ActionType: "Asset Isolation", CompletedTime: null },
    { ActionID: "REM-002", IncidentID: "INC-040", ActionType: "IP Block", CompletedTime: "2025-03-08T14:35:00Z" },
    { ActionID: "REM-003", IncidentID: "INC-039", ActionType: "Alert Escalation", CompletedTime: null },
    { ActionID: "REM-004", IncidentID: "INC-038", ActionType: "Asset Quarantine", CompletedTime: "2025-03-08T13:20:00Z" },
    { ActionID: "REM-005", IncidentID: "INC-038", ActionType: "Malware Scan", CompletedTime: "2025-03-08T13:45:00Z" },
    { ActionID: "REM-006", IncidentID: "INC-037", ActionType: "Session Termination", CompletedTime: "2025-03-08T12:50:00Z" },
    { ActionID: "REM-007", IncidentID: "INC-036", ActionType: "WAF Rule Update", CompletedTime: null },
    { ActionID: "REM-008", IncidentID: "INC-035", ActionType: "Account Lock", CompletedTime: "2025-03-08T10:15:00Z" },
  ],

  AI_AGENT: [
    { AgentID: "AGT-001", AgentType: "Intrusion Detection", ModelVersion: "sentinel-v2.1" },
    { AgentID: "AGT-002", AgentType: "Anomaly Detection", ModelVersion: "sentinel-v2.1" },
    { AgentID: "AGT-003", AgentType: "Threat Intelligence", ModelVersion: "sentinel-v3.0" },
    { AgentID: "AGT-004", AgentType: "Malware Analysis", ModelVersion: "sentinel-v2.3" },
    { AgentID: "AGT-005", AgentType: "Behavioral Analysis", ModelVersion: "sentinel-v3.0" },
  ],

  AI_RESPONSE: [
    { ResponseID: "RSP-001", AgentID: "AGT-001", ActionType: "Auto-Block", ActionTaken: "Blocked source IP 45.33.112.88 via firewall rule", Justification: "847 failed authentication attempts detected in 90s window. Threshold: 100. POLICY-03 triggered automatic isolation." },
    { ResponseID: "RSP-002", AgentID: "AGT-003", ActionType: "Alert", ActionTaken: "Raised HIGH severity alert for port scan activity", Justification: "Sequential port probing detected across 1024 ports in 30s. Pattern matches known reconnaissance signature." },
    { ResponseID: "RSP-003", AgentID: "AGT-002", ActionType: "Escalate", ActionTaken: "Flagged event for human analyst review", Justification: "Behavioral deviation score 0.91 detected. Above 0.85 threshold. Insufficient confidence for automated action per POLICY-07." },
    { ResponseID: "RSP-004", AgentID: "AGT-004", ActionType: "Quarantine", ActionTaken: "Asset AST-005 quarantined from network segment", Justification: "Emotet variant signature match (confidence: 99.2%). Immediate isolation applied per POLICY-01." },
    { ResponseID: "RSP-005", AgentID: "AGT-005", ActionType: "Alert", ActionTaken: "Notified on-call analyst via PagerDuty", Justification: "Login from geolocation 4,200km from last known location. Time delta: 2h. Physically impossible travel detected." },
    { ResponseID: "RSP-006", AgentID: "AGT-001", ActionType: "WAF-Update", ActionTaken: "Deployed WAF rule block for SQL injection pattern", Justification: "UNION-based SQL injection detected. Payload matches CVE-2024-1234 exploit pattern." },
    { ResponseID: "RSP-007", AgentID: "AGT-005", ActionType: "Account-Lock", ActionTaken: "Locked account d.denq and triggered MFA reset", Justification: "Lateral movement pattern detected. Account accessed 3 restricted shares within 5 minutes." },
  ],

  SECURITY_POLICY: [
    { PolicyID: "POL-001", PolicyType: "Auto-Isolate", Action: "Quarantine asset immediately on malware confirmation", AppliesToModelType: "sentinel-v2.3" },
    { PolicyID: "POL-002", PolicyType: "Rate-Limit", Action: "Block IP after 100 failed auth attempts in 60s", AppliesToModelType: "sentinel-v2.1" },
    { PolicyID: "POL-003", PolicyType: "Auto-Block", Action: "Firewall block on brute force detection", AppliesToModelType: "sentinel-v2.1" },
    { PolicyID: "POL-004", PolicyType: "Escalate", Action: "Page on-call analyst for Critical incidents", AppliesToModelType: "sentinel-v3.0" },
    { PolicyID: "POL-005", PolicyType: "Audit-Log", Action: "Log all AI responses to immutable audit trail", AppliesToModelType: "ALL" },
    { PolicyID: "POL-006", PolicyType: "Geo-Block", Action: "Flag logins from impossible travel distance", AppliesToModelType: "sentinel-v3.0" },
    { PolicyID: "POL-007", PolicyType: "Human-Review", Action: "Require analyst approval for anomaly score > 0.85", AppliesToModelType: "sentinel-v2.1" },
    { PolicyID: "POL-008", PolicyType: "WAF-Update", Action: "Auto-deploy WAF rules on confirmed injection attacks", AppliesToModelType: "sentinel-v2.1" },
    { PolicyID: "POL-009", PolicyType: "MFA-Reset", Action: "Force MFA reset on detected lateral movement", AppliesToModelType: "sentinel-v3.0" },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SEV_COLOR = { Critical: "#ff4444", High: "#ff8c00", Medium: "#f0c040", Low: "#44cc88" };
const SEV_BG    = { Critical: "#ff444422", High: "#ff8c0022", Medium: "#f0c04022", Low: "#44cc8822" };
const STATUS_COLOR = { Open: "#ff4444", "In Progress": "#ff8c00", Patched: "#44cc88", Active: "#ff4444", Investigating: "#f0c040", Contained: "#44cc88", Resolved: "#44cc88" };

const relTime = (iso) => {
  const d = (Date.now() - new Date(iso)) / 60000;
  if (d < 60) return `${Math.round(d)}m ago`;
  if (d < 1440) return `${Math.round(d / 60)}h ago`;
  return `${Math.round(d / 1440)}d ago`;
};

const incidentStatus = (inc) => {
  const rem = DB.REMEDIATION_ACTION.filter(r => r.IncidentID === inc.IncidentID);
  if (rem.length === 0) return "Active";
  if (rem.every(r => r.CompletedTime)) return "Resolved";
  return "Investigating";
};

// ─── STYLE CONSTANTS ─────────────────────────────────────────────────────────

const S = {
  bg:      "#01040d",
  surface: "#080b0f",
  card:    "#111822",
  border:  "#1c2a3a",
  border2: "#243040",
  accent:  "#1e8cff",
  text:    "#c4d4e4",
  dim:     "#809db5",
  dimmer:  "#7e90a5",
  mono:    "'Courier New', 'Lucida Console', monospace",
  sans:    "'Trebuchet MS', 'Gill Sans', sans-serif",
};

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

const Badge = ({ label, color }) => (
  <span style={{
    fontSize: 10, padding: "2px 7px", borderRadius: 3,
    background: SEV_BG[label] || "#1c2a3a",
    color: color || SEV_COLOR[label] || S.dim,
    fontFamily: S.mono, letterSpacing: "0.05em", whiteSpace: "nowrap",
    border: `1px solid ${(SEV_BG[label] || "#1c2a3a").replace("22", "55")}`,
  }}>{label}</span>
);

const Pill = ({ label, color }) => (
  <span style={{
    fontSize: 10, padding: "2px 8px", borderRadius: 10,
    background: (STATUS_COLOR[label] || S.accent) + "20",
    color: STATUS_COLOR[label] || S.accent,
    fontFamily: S.mono, whiteSpace: "nowrap",
  }}>{label}</span>
);

const Dot = ({ color }) => (
  <span style={{
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0,
  }} />
);

const SectionHead = ({ title, count, color }) => (
  <div style={{
    padding: "11px 18px", borderBottom: `1px solid ${S.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: S.surface,
  }}>
    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</span>
    {count !== undefined && (
      <span style={{ fontSize: 10, fontFamily: S.mono, color: color || S.dim, background: (color || S.dim) + "20", padding: "1px 7px", borderRadius: 3 }}>
        {count}
      </span>
    )}
  </div>
);

const StatBox = ({ label, value, sub, accent, warn }) => (
  <div style={{
    background: S.card, border: `1px solid ${warn ? SEV_COLOR.Critical + "55" : S.border}`,
    borderRadius: 6, padding: "16px 20px", flex: 1, minWidth: 120,
    boxShadow: warn ? `0 0 12px ${SEV_COLOR.Critical}18` : "none",
  }}>
    <div style={{ color: S.dim, fontSize: 10, fontFamily: S.mono, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ color: accent || S.text, fontSize: 28, fontWeight: 700, fontFamily: S.mono, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ color: S.dimmer, fontSize: 11, marginTop: 6, fontFamily: S.mono }}>{sub}</div>}
  </div>
);

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function OverviewView() {
  const activeInc = DB.INCIDENT.filter(i => incidentStatus(i) !== "Resolved");
  const critEvents = DB.SECURITY_EVENT.filter(e => e.Severity === "Critical");
  const openVulns = DB.VULNERABILITY.filter(v => v.Status === "Open");
  const totalEvents = DB.SECURITY_EVENT.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stat Row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Active Incidents" value={activeInc.length} accent={SEV_COLOR.Critical} warn sub="requires attention" />
        <StatBox label="Critical Events" value={critEvents.length} accent={SEV_COLOR.High} sub="today" />
        <StatBox label="Open Vulnerabilities" value={openVulns.length} accent={SEV_COLOR.Medium} sub="across all assets" />
        <StatBox label="Assets Monitored" value={DB.NETWORK_ASSET.length} sub="all reachable" />
        <StatBox label="AI Agents Online" value={DB.AI_AGENT.length} accent="#44cc88" sub="all active" />
        <StatBox label="Policies Enforced" value={DB.SECURITY_POLICY.length} sub="last updated 3h ago" />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Recent Security Events */}
        <div style={{ flex: 3, background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
          <SectionHead title="Recent Security Events" count={`${totalEvents} total`} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: S.surface }}>
                {["Event ID", "Type", "Asset", "Source IP", "Severity"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: S.dimmer, fontSize: 10, fontFamily: S.mono, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DB.SECURITY_EVENT.map((ev, i) => {
                const asset = DB.NETWORK_ASSET.find(a => a.AssetID === ev.AssetID);
                return (
                  <tr key={ev.EventID} style={{ borderTop: `1px solid ${S.border}`, background: i % 2 === 0 ? S.card : S.surface }}>
                    <td style={{ padding: "9px 14px", fontFamily: S.mono, color: S.accent, fontSize: 12 }}>{ev.EventID}</td>
                    <td style={{ padding: "9px 14px", color: S.text, fontSize: 12 }}>{ev.EventType}</td>
                    <td style={{ padding: "9px 14px", fontFamily: S.mono, color: S.dim, fontSize: 11 }}>
                      <div>{asset?.AssetName}</div>
                      <div style={{ color: S.dimmer, fontSize: 10 }}>{asset?.IPAddress}</div>
                    </td>
                    <td style={{ padding: "9px 14px", fontFamily: S.mono, color: S.dimmer, fontSize: 11 }}>{ev.SourceIP}</td>
                    <td style={{ padding: "9px 14px" }}><Badge label={ev.Severity} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Top Incidents */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
            <SectionHead title="Active Incidents" count={activeInc.length} color={SEV_COLOR.Critical} />
            {activeInc.slice(0, 4).map((inc) => {
              const ev = DB.SECURITY_EVENT.find(e => e.EventID === inc.EventID);
              const asset = DB.NETWORK_ASSET.find(a => a.AssetID === ev?.AssetID);
              const status = incidentStatus(inc);
              return (
                <div key={inc.IncidentID} style={{ padding: "11px 16px", borderTop: `1px solid ${S.border}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Dot color={STATUS_COLOR[status] || S.dim} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontFamily: S.mono, color: S.accent, fontSize: 12 }}>{inc.IncidentID}</span>
                      <Pill label={status} />
                    </div>
                    <div style={{ color: S.text, fontSize: 12 }}>{inc.IncidentType}</div>
                    <div style={{ color: S.dimmer, fontSize: 11, marginTop: 2, fontFamily: S.mono }}>{asset?.IPAddress} · {relTime(inc.StartTime)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vulnerability Summary */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
            <SectionHead title="Vulnerability Summary" />
            {["Critical", "High", "Medium", "Low"].map(sev => {
              const count = DB.VULNERABILITY.filter(v => v.Severity === sev).length;
              const pct = Math.round((count / DB.VULNERABILITY.length) * 100);
              return (
                <div key={sev} style={{ padding: "10px 16px", borderTop: `1px solid ${S.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: SEV_COLOR[sev], fontSize: 12, fontFamily: S.mono }}>{sev}</span>
                    <span style={{ color: S.dim, fontSize: 12, fontFamily: S.mono }}>{count}</span>
                  </div>
                  <div style={{ background: S.border, borderRadius: 2, height: 4 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: SEV_COLOR[sev], borderRadius: 2, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentsView() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* Incident Table */}
      <div style={{ flex: selected ? 3 : 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden", transition: "flex 0.3s" }}>
        <SectionHead title="Incident Queue" count={`${DB.INCIDENT.length} total`} />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: S.surface }}>
              {["Incident ID", "Type", "Event", "Asset", "Status", "Started", "Assigned To"].map(h => (
                <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: S.dimmer, fontSize: 10, fontFamily: S.mono, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DB.INCIDENT.map((inc, i) => {
              const ev = DB.SECURITY_EVENT.find(e => e.EventID === inc.EventID);
              const asset = DB.NETWORK_ASSET.find(a => a.AssetID === ev?.AssetID);
              const user = DB.USER_ACCOUNT.find(u => u.UserID === inc.AssignedTo);
              const status = incidentStatus(inc);
              const isSel = selected?.IncidentID === inc.IncidentID;
              return (
                <tr key={inc.IncidentID}
                  onClick={() => setSelected(isSel ? null : inc)}
                  style={{
                    borderTop: `1px solid ${S.border}`,
                    background: isSel ? "#0f2040" : i % 2 === 0 ? S.card : S.surface,
                    cursor: "pointer",
                    borderLeft: isSel ? `3px solid ${S.accent}` : "3px solid transparent",
                  }}>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.accent, fontSize: 12 }}>{inc.IncidentID}</td>
                  <td style={{ padding: "10px 14px", color: S.text, fontSize: 12 }}>{inc.IncidentType}</td>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.dim, fontSize: 11 }}>{inc.EventID}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11 }}>
                    <div style={{ color: S.text }}>{asset?.AssetName}</div>
                    <div style={{ color: S.dimmer, fontFamily: S.mono, fontSize: 10 }}>{asset?.IPAddress}</div>
                  </td>
                  <td style={{ padding: "10px 14px" }}><Pill label={status} /></td>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.dimmer, fontSize: 11 }}>{relTime(inc.StartTime)}</td>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.dim, fontSize: 11 }}>{user?.Username}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (() => {
        const ev = DB.SECURITY_EVENT.find(e => e.EventID === selected.EventID);
        const asset = DB.NETWORK_ASSET.find(a => a.AssetID === ev?.AssetID);
        const owner = DB.USER_ACCOUNT.find(u => u.UserID === asset?.OwnerID);
        const assigned = DB.USER_ACCOUNT.find(u => u.UserID === selected.AssignedTo);
        const remediations = DB.REMEDIATION_ACTION.filter(r => r.IncidentID === selected.IncidentID);
        const aiResp = DB.AI_RESPONSE.find(r => {
          const respIdx = DB.INCIDENT.findIndex(i => i.IncidentID === selected.IncidentID);
          return r.ResponseID === `RSP-00${respIdx + 1}`;
        });
        const status = incidentStatus(selected);

        return (
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Header */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: S.mono, color: S.accent, fontSize: 14, marginBottom: 4 }}>{selected.IncidentID}</div>
                  <div style={{ color: S.text, fontSize: 16, fontWeight: 600 }}>{selected.IncidentType}</div>
                </div>
                <Pill label={status} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 12 }}>
                {[
                  ["Event", selected.EventID],
                  ["Event Type", ev?.EventType],
                  ["Asset", asset?.AssetName],
                  ["Asset IP", asset?.IPAddress],
                  ["Source IP", ev?.SourceIP],
                  ["Severity", ev?.Severity],
                  ["Owner", owner?.Username],
                  ["Assigned To", assigned?.Username],
                  ["Started", new Date(selected.StartTime).toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ color: S.dimmer, fontSize: 10, fontFamily: S.mono, marginBottom: 2 }}>{k}</div>
                    <div style={{ color: k === "Severity" ? SEV_COLOR[v] : S.text, fontFamily: ["Event", "Asset IP", "Source IP", "Assigned To", "Owner"].includes(k) ? S.mono : "inherit" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Response */}
            {aiResp && (
              <div style={{ background: S.card, border: `1px solid #1e8cff33`, borderRadius: 6, overflow: "hidden" }}>
                <SectionHead title={`AI Response — ${aiResp.AgentID}`} color={S.accent} />
                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ color: S.dimmer, fontSize: 10, fontFamily: S.mono, marginBottom: 4 }}>ACTION TAKEN</div>
                    <div style={{ color: S.text, fontSize: 12, background: S.surface, padding: "8px 12px", borderRadius: 4, fontFamily: S.mono }}>{aiResp.ActionTaken}</div>
                  </div>
                  <div>
                    <div style={{ color: S.dimmer, fontSize: 10, fontFamily: S.mono, marginBottom: 4 }}>JUSTIFICATION</div>
                    <div style={{ color: "#7ab0d0", fontSize: 12, lineHeight: 1.6, background: S.surface, padding: "8px 12px", borderRadius: 4 }}>{aiResp.Justification}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Remediation Actions */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
              <SectionHead title="Remediation Actions" count={remediations.length} />
              {remediations.map(rem => (
                <div key={rem.ActionID} style={{ padding: "10px 18px", borderTop: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Dot color={rem.CompletedTime ? "#44cc88" : "#ff8c00"} />
                    <div>
                      <div style={{ color: S.text, fontSize: 12 }}>{rem.ActionType}</div>
                      <div style={{ color: S.dimmer, fontSize: 11, fontFamily: S.mono }}>{rem.ActionID}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Pill label={rem.CompletedTime ? "Completed" : "Pending"} />
                    {rem.CompletedTime && <div style={{ color: S.dimmer, fontSize: 10, fontFamily: S.mono, marginTop: 3 }}>{relTime(rem.CompletedTime)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function AssetsView() {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* Asset List */}
      <div style={{ flex: 2, background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
        <SectionHead title="Network Assets" count={DB.NETWORK_ASSET.length} />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: S.surface }}>
              {["Asset ID", "Name", "IP Address", "Owner", "Vulnerabilities", "Events"].map(h => (
                <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: S.dimmer, fontSize: 10, fontFamily: S.mono, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DB.NETWORK_ASSET.map((asset, i) => {
              const owner = DB.USER_ACCOUNT.find(u => u.UserID === asset.OwnerID);
              const vulns = DB.VULNERABILITY.filter(v => v.AssetID === asset.AssetID);
              const events = DB.SECURITY_EVENT.filter(e => e.AssetID === asset.AssetID);
              const critVuln = vulns.some(v => v.Severity === "Critical" && v.Status !== "Patched");
              const isSel = selectedAsset?.AssetID === asset.AssetID;
              return (
                <tr key={asset.AssetID}
                  onClick={() => setSelectedAsset(isSel ? null : asset)}
                  style={{
                    borderTop: `1px solid ${S.border}`,
                    background: isSel ? "#0f2040" : i % 2 === 0 ? S.card : S.surface,
                    cursor: "pointer",
                    borderLeft: isSel ? `3px solid ${S.accent}` : "3px solid transparent",
                  }}>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.accent, fontSize: 12 }}>{asset.AssetID}</td>
                  <td style={{ padding: "10px 14px", color: S.text, fontSize: 12 }}>{asset.AssetName}</td>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.dim, fontSize: 12 }}>{asset.IPAddress}</td>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.dim, fontSize: 12 }}>{owner?.Username}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {critVuln && <Dot color={SEV_COLOR.Critical} />}
                      <span style={{ fontFamily: S.mono, color: critVuln ? SEV_COLOR.Critical : S.dim, fontSize: 12 }}>{vulns.length}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: S.mono, color: S.dim, fontSize: 12 }}>{events.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Asset Detail */}
      {selectedAsset && (() => {
        const owner = DB.USER_ACCOUNT.find(u => u.UserID === selectedAsset.OwnerID);
        const vulns = DB.VULNERABILITY.filter(v => v.AssetID === selectedAsset.AssetID);
        const events = DB.SECURITY_EVENT.filter(e => e.AssetID === selectedAsset.AssetID);
        return (
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, padding: "16px 20px" }}>
              <div style={{ fontFamily: S.mono, color: S.accent, fontSize: 12, marginBottom: 6 }}>{selectedAsset.AssetID}</div>
              <div style={{ color: S.text, fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{selectedAsset.AssetName}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 12 }}>
                {[["IP Address", selectedAsset.IPAddress], ["Owner ID", selectedAsset.OwnerID], ["Owner Username", owner?.Username], ["Owner Email", owner?.Email], ["Last Login", owner?.LastLogin ? relTime(owner.LastLogin) : "—"]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ color: S.dimmer, fontSize: 10, fontFamily: S.mono, marginBottom: 2 }}>{k}</div>
                    <div style={{ color: S.text, fontFamily: S.mono, fontSize: 12 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerabilities */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
              <SectionHead title="Vulnerabilities" count={vulns.length} color={vulns.some(v => v.Severity === "Critical") ? SEV_COLOR.Critical : S.dim} />
              {vulns.length === 0 && <div style={{ padding: 16, color: S.dimmer, fontSize: 12, fontFamily: S.mono }}>No vulnerabilities recorded.</div>}
              {vulns.map(v => (
                <div key={v.VulnerabilityID} style={{ padding: "10px 18px", borderTop: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: S.mono, color: S.dim, fontSize: 11, marginBottom: 3 }}>{v.VulnerabilityID}</div>
                    <div style={{ color: S.dimmer, fontSize: 11 }}>Discovered: {v.DateDiscovered}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge label={v.Severity} />
                    <Pill label={v.Status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Events */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
              <SectionHead title="Security Events" count={events.length} />
              {events.length === 0 && <div style={{ padding: 16, color: S.dimmer, fontSize: 12, fontFamily: S.mono }}>No events recorded.</div>}
              {events.map(ev => (
                <div key={ev.EventID} style={{ padding: "10px 18px", borderTop: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: S.mono, color: S.accent, fontSize: 11, marginBottom: 3 }}>{ev.EventID}</div>
                    <div style={{ color: S.text, fontSize: 12 }}>{ev.EventType}</div>
                    <div style={{ color: S.dimmer, fontSize: 11, fontFamily: S.mono }}>from {ev.SourceIP}</div>
                  </div>
                  <Badge label={ev.Severity} />
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function AgentsView() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* Agent Cards */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>AI Agents</div>
        {DB.AI_AGENT.map(agent => {
          const responses = DB.AI_RESPONSE.filter(r => r.AgentID === agent.AgentID);
          const policies = DB.SECURITY_POLICY.filter(p => p.AppliesToModelType === agent.ModelVersion || p.AppliesToModelType === "ALL");
          const isSel = selectedAgent?.AgentID === agent.AgentID;
          return (
            <div key={agent.AgentID}
              onClick={() => setSelectedAgent(isSel ? null : agent)}
              style={{
                background: isSel ? "#0f2040" : S.card,
                border: `1px solid ${isSel ? S.accent : S.border}`,
                borderRadius: 6, padding: "14px 18px", cursor: "pointer",
                boxShadow: isSel ? `0 0 12px ${S.accent}22` : "none",
                transition: "all 0.2s",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Dot color="#44cc88" />
                  <span style={{ fontFamily: S.mono, color: S.accent, fontSize: 13 }}>{agent.AgentID}</span>
                </div>
                <span style={{ fontSize: 10, fontFamily: S.mono, color: "#44cc88", background: "#44cc8820", padding: "2px 7px", borderRadius: 3 }}>ACTIVE</span>
              </div>
              <div style={{ color: S.text, fontSize: 13, marginBottom: 4 }}>{agent.AgentType}</div>
              <div style={{ fontFamily: S.mono, color: S.dimmer, fontSize: 11 }}>{agent.ModelVersion}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: S.dim }}>
                <span><span style={{ color: S.text }}>{responses.length}</span> responses</span>
                <span><span style={{ color: S.text }}>{policies.length}</span> policies</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Detail */}
      {selectedAgent && (() => {
        const responses = DB.AI_RESPONSE.filter(r => r.AgentID === selectedAgent.AgentID);
        const policies = DB.SECURITY_POLICY.filter(p => p.AppliesToModelType === selectedAgent.ModelVersion || p.AppliesToModelType === "ALL");
        return (
          <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Responses */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
              <SectionHead title={`AI Responses — ${selectedAgent.AgentID}`} count={responses.length} color={S.accent} />
              {responses.length === 0 && <div style={{ padding: 16, color: S.dimmer, fontSize: 12, fontFamily: S.mono }}>No responses logged.</div>}
              {responses.map(resp => (
                <div key={resp.ResponseID} style={{ padding: "14px 18px", borderTop: `1px solid ${S.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: S.mono, color: S.accent, fontSize: 12 }}>{resp.ResponseID}</span>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: "#f0c040", background: "#f0c04018", padding: "2px 8px", borderRadius: 3 }}>{resp.ActionType}</span>
                  </div>
                  <div style={{ color: S.text, fontSize: 12, marginBottom: 6 }}>{resp.ActionTaken}</div>
                  <div style={{ color: S.dimmer, fontSize: 11, lineHeight: 1.5, borderLeft: `2px solid ${S.border2}`, paddingLeft: 10 }}>{resp.Justification}</div>
                </div>
              ))}
            </div>

            {/* Applicable Policies */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
              <SectionHead title="Applicable Security Policies" count={policies.length} />
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: S.surface }}>
                    {["Policy ID", "Type", "Action", "Applies To"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: S.dimmer, fontSize: 10, fontFamily: S.mono, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policies.map((pol, i) => (
                    <tr key={pol.PolicyID} style={{ borderTop: `1px solid ${S.border}`, background: i % 2 === 0 ? S.card : S.surface }}>
                      <td style={{ padding: "9px 14px", fontFamily: S.mono, color: S.accent, fontSize: 12 }}>{pol.PolicyID}</td>
                      <td style={{ padding: "9px 14px", color: S.text, fontSize: 12 }}>{pol.PolicyType}</td>
                      <td style={{ padding: "9px 14px", color: S.dim, fontSize: 12 }}>{pol.Action}</td>
                      <td style={{ padding: "9px 14px", fontFamily: S.mono, color: pol.AppliesToModelType === "ALL" ? "#44cc88" : S.dimmer, fontSize: 11 }}>{pol.AppliesToModelType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function PoliciesView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
        <SectionHead title="Security Policies" count={`${DB.SECURITY_POLICY.length} active`} color="#44cc88" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: S.surface }}>
              {["Policy ID", "Type", "Action", "Applies To Model", "Coverage"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: S.dimmer, fontSize: 10, fontFamily: S.mono, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DB.SECURITY_POLICY.map((pol, i) => {
              const agentCount = pol.AppliesToModelType === "ALL"
                ? DB.AI_AGENT.length
                : DB.AI_AGENT.filter(a => a.ModelVersion === pol.AppliesToModelType).length;
              return (
                <tr key={pol.PolicyID} style={{ borderTop: `1px solid ${S.border}`, background: i % 2 === 0 ? S.card : S.surface }}>
                  <td style={{ padding: "12px 16px", fontFamily: S.mono, color: S.accent, fontSize: 12 }}>{pol.PolicyID}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: "#f0c040", background: "#f0c04018", padding: "3px 8px", borderRadius: 3 }}>{pol.PolicyType}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: S.text, fontSize: 12, maxWidth: 320 }}>{pol.Action}</td>
                  <td style={{ padding: "12px 16px", fontFamily: S.mono, fontSize: 11, color: pol.AppliesToModelType === "ALL" ? "#44cc88" : S.dim }}>
                    {pol.AppliesToModelType}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: S.border, borderRadius: 2, height: 4, width: 80 }}>
                        <div style={{ width: `${(agentCount / DB.AI_AGENT.length) * 100}%`, height: "100%", background: "#44cc88", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim }}>{agentCount}/{DB.AI_AGENT.length} agents</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Policy → Agent mapping */}
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
        <SectionHead title="Agent Policy Coverage Matrix" />
        <div style={{ padding: 18, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: S.mono }}>
            <thead>
              <tr>
                <th style={{ padding: "6px 12px", color: S.dimmer, textAlign: "left", borderBottom: `1px solid ${S.border}` }}>Policy</th>
                {DB.AI_AGENT.map(a => (
                  <th key={a.AgentID} style={{ padding: "6px 12px", color: S.dim, textAlign: "center", borderBottom: `1px solid ${S.border}` }}>{a.AgentID}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DB.SECURITY_POLICY.map((pol, i) => (
                <tr key={pol.PolicyID} style={{ background: i % 2 === 0 ? S.card : S.surface }}>
                  <td style={{ padding: "8px 12px", color: S.accent, borderTop: `1px solid ${S.border}` }}>{pol.PolicyID}</td>
                  {DB.AI_AGENT.map(agent => {
                    const applies = pol.AppliesToModelType === "ALL" || pol.AppliesToModelType === agent.ModelVersion;
                    return (
                      <td key={agent.AgentID} style={{ padding: "8px 12px", textAlign: "center", borderTop: `1px solid ${S.border}` }}>
                        {applies
                          ? <span style={{ color: "#44cc88", fontSize: 13 }}>✓</span>
                          : <span style={{ color: S.border2, fontSize: 13 }}>·</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Overview" },
  { id: "incidents", label: "Incidents" },
  { id: "assets",    label: "Asset Analysis" },
  { id: "agents",    label: "AI Agents" },
  { id: "policies",  label: "Policies" },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeIncidents = DB.INCIDENT.filter(i => incidentStatus(i) !== "Resolved").length;

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: S.bg, color: S.text, fontFamily: S.sans }}>
      <style>{`
        html, body, #root { width: 100%; min-height: 100vh; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; background: ${S.surface}; }
        ::-webkit-scrollbar-thumb { background: ${S.border2}; border-radius: 3px; }
        tr:hover td { background: #0f2535 !important; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 52,
        background: S.surface, borderBottom: `1px solid ${S.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#44cc88", boxShadow: "0 0 8px #44cc88", animation: "blink 2.5s infinite" }} />
            <span style={{ fontFamily: S.mono, fontSize: 16, color: "#e8f0f8", letterSpacing: "0.1em" }}>
              AI<span style={{ color: S.accent }}>·</span>NETWORK ANALYSIS</span>
            </div>
          <span style={{ color: S.dimmer, fontSize: 11, fontFamily: S.mono }}>// Agentic Network Security Platform</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {activeIncidents > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: SEV_COLOR.Critical + "18", border: `1px solid ${SEV_COLOR.Critical}44`, padding: "4px 12px", borderRadius: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: SEV_COLOR.Critical, animation: "blink 1s infinite" }} />
              <span style={{ fontFamily: S.mono, fontSize: 11, color: SEV_COLOR.Critical }}>{activeIncidents} ACTIVE INCIDENT{activeIncidents > 1 ? "S" : ""}</span>
            </div>
          )}
          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim }}>
            {clock.toLocaleTimeString("en-US", { hour12: false })} UTC
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{ display: "flex", background: S.surface, borderBottom: `1px solid ${S.border}`, padding: "0 28px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "12px 18px",
            fontFamily: S.mono, fontSize: 12, letterSpacing: "0.06em",
            color: tab === t.id ? S.accent : S.dim,
            borderBottom: `2px solid ${tab === t.id ? S.accent : "transparent"}`,
            transition: "all 0.15s",
          }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px", width: "100%" }}>
        {tab === "overview"  && <OverviewView />}
        {tab === "incidents" && <IncidentsView />}
        {tab === "assets"    && <AssetsView />}
        {tab === "agents"    && <AgentsView />}
        {tab === "policies"  && <PoliciesView />}
      </div>
    </div>
  );
}
