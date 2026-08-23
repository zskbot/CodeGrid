const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");
const { spawn } = require("child_process");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const ROOT = path.resolve(__dirname, "..");
const WORKSPACE = path.join(ROOT, "workspace");
const PORT = Number(process.env.PORT || 8899);

fs.mkdirSync(WORKSPACE, { recursive: true });

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    name: "CodeGrid",
    version: "1.0.0",
    port: PORT,
    workspace: WORKSPACE
  });
});

app.get("/api/workspace", (req, res) => {
  res.json({
    name: "CodeGrid",
    path: "~/CodeGrid",
    root: WORKSPACE
  });
});

function safePath(input = "") {
  const clean = String(input).replace(/^\/+/, "");
  const target = path.resolve(WORKSPACE, clean);

  if (
    target !== WORKSPACE &&
    !target.startsWith(WORKSPACE + path.sep)
  ) {
    throw new Error("Invalid workspace path");
  }

  return target;
}

function walk(dir, base = "") {
  const result = [];

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      item.name === ".git" ||
      item.name === "node_modules" ||
      item.name.startsWith(".codegrid")
    ) {
      continue;
    }

    const rel = path.join(base, item.name);

    if (item.isDirectory()) {
      result.push({
        name: item.name,
        path: rel,
        type: "directory",
        children: walk(path.join(dir, item.name), rel)
      });
    } else {
      result.push({
        name: item.name,
        path: rel,
        type: "file"
      });
    }
  }

  return result;
}

app.get("/api/files", (req, res) => {
  try {
    res.json({
      ok: true,
      files: walk(WORKSPACE)
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

app.get("/api/file", (req, res) => {
  try {
    const file = safePath(req.query.path || "");

    if (!fs.existsSync(file)) {
      return res.status(404).json({
        ok: false,
        error: "File not found"
      });
    }

    if (fs.statSync(file).isDirectory()) {
      return res.status(400).json({
        ok: false,
        error: "Path is a directory"
      });
    }

    res.json({
      ok: true,
      path: req.query.path,
      content: fs.readFileSync(file, "utf8")
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: err.message
    });
  }
});

app.put("/api/file", (req, res) => {
  try {
    const file = safePath(req.body.path || "");
    const content = String(req.body.content ?? "");

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, "utf8");

    res.json({
      ok: true,
      path: req.body.path
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: err.message
    });
  }
});

app.post("/api/file", (req, res) => {
  try {
    const file = safePath(req.body.path || "");

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, String(req.body.content ?? ""), "utf8");

    res.json({
      ok: true,
      path: req.body.path
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: err.message
    });
  }
});

app.delete("/api/file", (req, res) => {
  try {
    const file = safePath(req.body.path || "");

    if (!fs.existsSync(file)) {
      return res.status(404).json({
        ok: false,
        error: "File not found"
      });
    }

    fs.rmSync(file, {
      recursive: true,
      force: true
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: err.message
    });
  }
});

app.get("/api/git/status", (req, res) => {
  execFile(
    "git",
    ["-C", WORKSPACE, "status", "--short", "--branch"],
    (error, stdout, stderr) => {
      res.json({
        ok: !error,
        output: stdout || stderr || ""
      });
    }
  );
});

app.post("/api/git/clone", (req, res) => {
  const url = String(req.body.url || "").trim();

  if (!url) {
    return res.status(400).json({
      ok: false,
      error: "Repository URL required"
    });
  }

  execFile(
    "git",
    ["clone", url, WORKSPACE],
    {
      cwd: ROOT
    },
    (error, stdout, stderr) => {
      res.json({
        ok: !error,
        output: stdout || stderr || ""
      });
    }
  );
});

app.post("/api/git/pull", (req, res) => {
  execFile(
    "git",
    ["-C", WORKSPACE, "pull"],
    (error, stdout, stderr) => {
      res.json({
        ok: !error,
        output: stdout || stderr || ""
      });
    }
  );
});

app.post("/api/git/commit", (req, res) => {
  const message =
    String(req.body.message || "CodeGrid update").trim();

  execFile(
    "git",
    ["-C", WORKSPACE, "add", "-A"],
    (addError, addStdout, addStderr) => {
      if (addError) {
        return res.json({
          ok: false,
          output: addStdout || addStderr || addError.message
        });
      }

      execFile(
        "git",
        ["-C", WORKSPACE, "commit", "-m", message],
        (error, stdout, stderr) => {
          res.json({
            ok: !error,
            output: stdout || stderr || ""
          });
        }
      );
    }
  );
});

app.post("/api/git/push", (req, res) => {
  execFile(
    "git",
    ["-C", WORKSPACE, "push"],
    (error, stdout, stderr) => {
      res.json({
        ok: !error,
        output: stdout || stderr || ""
      });
    }
  );
});

app.use("/preview", express.static(WORKSPACE));
app.use(express.static(path.join(ROOT, "public")));

wss.on("connection", (ws) => {

  /*
   * Android/Termux does not have a usable node-pty
   * prebuild for this environment.
   *
   * Use Termux's native `script` command as the PTY
   * bridge instead.
   */

  const shell = spawn(
    "script",
    [
      "-q",
      "/dev/null",
      "-c",
      "bash --noprofile --norc"
    ],
    {
      cwd: WORKSPACE,
      env: {
        ...process.env,
        TERM: "xterm-256color",
        COLORTERM: "truecolor"
      },
      stdio: ["pipe", "pipe", "pipe"]
    }
  );

  let closed = false;

  function send(type, data = "") {

    if (
      closed ||
      ws.readyState !== ws.OPEN
    ) {
      return;
    }

    ws.send(
      JSON.stringify({
        type,
        data
      })
    );
  }

  shell.stdout.on("data", data => {
    send(
      "output",
      data.toString()
    );
  });

  shell.stderr.on("data", data => {
    send(
      "output",
      data.toString()
    );
  });

  shell.on("exit", (code, signal) => {

    closed = true;

    if(ws.readyState === ws.OPEN){

      ws.send(
        JSON.stringify({
          type:"exit",
          exitCode:code,
          signal
        })
      );

      ws.close();
    }
  });

  ws.on("message", raw => {

    try {

      const message =
        JSON.parse(raw.toString());

      if(message.type === "input"){

        shell.stdin.write(
          String(message.data ?? "")
        );

        return;
      }

      /*
       * Resize is intentionally ignored here.
       *
       * Termux `script` provides the PTY,
       * while the browser remains responsible
       * for the visual viewport.
       */

      if(message.type === "resize"){
        return;
      }

    } catch {
      // Ignore invalid WebSocket messages.
    }
  });

  ws.on("close", () => {

    closed = true;

    try {
      shell.kill("SIGTERM");
    } catch {}

  });

  ws.on("error", () => {

    closed = true;

    try {
      shell.kill("SIGTERM");
    } catch {}

  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log(" CodeGrid");
  console.log("========================================");
  console.log("Web IDE : http://127.0.0.1:" + PORT);
  console.log("Preview : http://127.0.0.1:" + PORT + "/preview");
  console.log("API     : http://127.0.0.1:" + PORT + "/api/health");
  console.log("Shell   : node-pty");
  console.log("Root    : " + ROOT);
  console.log("========================================");
});
