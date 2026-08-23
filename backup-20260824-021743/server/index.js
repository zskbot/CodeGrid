const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8899;
const ROOT = path.resolve(__dirname, "../workspace");

fs.mkdirSync(ROOT, { recursive: true });

app.use(express.static(path.resolve(__dirname, "../public")));

app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    name: "CodeGrid",
    runtime: "web-shell",
    platform: process.platform,
    arch: process.arch
  });
});

wss.on("connection", ws => {
  const shell =
    process.env.SHELL ||
    (process.platform === "win32" ? "powershell.exe" : "/bin/sh");

  const child = spawn(shell, ["-i"], {
    cwd: ROOT,
    env: {
      ...process.env,
      TERM: "xterm-256color"
    },
    stdio: ["pipe", "pipe", "pipe"]
  });

  ws.send(
    "\x1b[1;36mCodeGrid Web Shell\x1b[0m\r\n" +
    "\x1b[90mWorkspace: " + ROOT + "\x1b[0m\r\n\r\n"
  );

  child.stdout.on("data", data => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data.toString());
    }
  });

  child.stderr.on("data", data => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data.toString());
    }
  });

  child.on("close", code => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        `\r\n\x1b[90m[Shell exited: ${code}]\x1b[0m\r\n`
      );
    }
  });

  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "input") {
        child.stdin.write(String(msg.data || ""));
      }
    } catch {}
  });

  ws.on("close", () => {
    try {
      child.kill();
    } catch {}
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("================================");
  console.log("        CODEGRID ONLINE");
  console.log("================================");
  console.log(`http://127.0.0.1:${PORT}`);
});
