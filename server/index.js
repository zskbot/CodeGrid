const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { spawn, execFile } = require("child_process");
const https = require("https");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const ROOT = path.resolve(__dirname, "..");
const WORKSPACE = path.join(ROOT, "workspace");
const PORT = Number(process.env.PORT || 8899);

fs.mkdirSync(WORKSPACE, { recursive: true });

app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    name: "CodeGrid",
    version: "1.0.0",
    runtime: "web-shell",
    platform: process.platform,
    arch: process.arch,
    workspace: "~/CodeGrid"
  });
});

app.get("/api/workspace", (req, res) => {
  res.json({
    ok: true,
    name: "CodeGrid",
    path: "~/CodeGrid",
    root: WORKSPACE
  });
});

function safePath(input = "") {
  const relative = String(input)
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  const target = path.resolve(
    WORKSPACE,
    relative
  );

  if (
    target !== WORKSPACE &&
    !target.startsWith(WORKSPACE + path.sep)
  ) {
    throw new Error("Invalid workspace path");
  }

  return target;
}

function tree(dir, base = "") {
  const output = [];

  for (const entry of fs.readdirSync(
    dir,
    { withFileTypes: true }
  )) {
    if (
      entry.name === ".git" ||
      entry.name === "node_modules"
    ) {
      continue;
    }

    const relative =
      path.join(base, entry.name);

    const absolute =
      path.join(dir, entry.name);

    if (entry.isDirectory()) {
      output.push({
        name: entry.name,
        path: relative,
        type: "directory",
        children: tree(
          absolute,
          relative
        )
      });
    } else {
      output.push({
        name: entry.name,
        path: relative,
        type: "file"
      });
    }
  }

  return output;
}

app.get("/api/files", (req, res) => {
  try {
    res.json({
      ok: true,
      files: tree(WORKSPACE)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.get("/api/file", (req, res) => {
  try {
    const target =
      safePath(req.query.path || "");

    if (!fs.existsSync(target)) {
      return res.status(404).json({
        ok: false,
        error: "File not found"
      });
    }

    if (fs.statSync(target).isDirectory()) {
      return res.status(400).json({
        ok: false,
        error: "Directory is not editable"
      });
    }

    res.json({
      ok: true,
      path: req.query.path,
      content: fs.readFileSync(
        target,
        "utf8"
      )
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

app.put("/api/file", (req, res) => {
  try {
    const target =
      safePath(req.body.path || "");

    fs.mkdirSync(
      path.dirname(target),
      { recursive: true }
    );

    fs.writeFileSync(
      target,
      String(req.body.content || ""),
      "utf8"
    );

    res.json({
      ok: true,
      path: req.body.path
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

app.delete("/api/file", (req, res) => {
  try {
    const target =
      safePath(req.body.path || "");

    fs.rmSync(target, {
      recursive: true,
      force: true
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});


/*
 * ============================================================
 * CODEGRID GITHUB
 * ============================================================
 */

const GITHUB_ENV_FILE =
  path.join(ROOT, ".codegrid", "github.env");

const GITHUB_TOKEN_FILE =
  path.join(ROOT, ".codegrid", "github.token");

function loadGithubEnv() {

  const result = {};

  if (!fs.existsSync(GITHUB_ENV_FILE)) {
    return result;
  }

  for (const line of fs.readFileSync(
    GITHUB_ENV_FILE,
    "utf8"
  ).split(/\r?\n/)) {

    const match =
      line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (match) {
      result[match[1]] =
        match[2].trim();
    }
  }

  return result;
}

function saveGithubToken(token) {

  fs.mkdirSync(
    path.dirname(GITHUB_TOKEN_FILE),
    { recursive: true }
  );

  fs.writeFileSync(
    GITHUB_TOKEN_FILE,
    String(token),
    {
      encoding: "utf8",
      mode: 0o600
    }
  );

  try {
    fs.chmodSync(
      GITHUB_TOKEN_FILE,
      0o600
    );
  } catch {}
}

function getGithubToken() {

  if (
    !fs.existsSync(
      GITHUB_TOKEN_FILE
    )
  ) {
    return "";
  }

  return fs.readFileSync(
    GITHUB_TOKEN_FILE,
    "utf8"
  ).trim();
}

function githubRequest(
  method,
  apiPath,
  token,
  body = null,
  hostname = "api.github.com"
) {

  return new Promise(
    (resolve, reject) => {

      const payload =
        body === null
          ? null
          : JSON.stringify(body);

      const request =
        https.request(
          {
            hostname,
            path: apiPath,
            method,
            headers: {
              "User-Agent": "CodeGrid",
              "Accept":
                "application/vnd.github+json",
              "X-GitHub-Api-Version":
                "2022-11-28",
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`
                  }
                : {}),
              ...(payload
                ? {
                    "Content-Type":
                      "application/json",
                    "Content-Length":
                      Buffer.byteLength(
                        payload
                      )
                  }
                : {})
            }
          },
          response => {

            let data = "";

            response.setEncoding(
              "utf8"
            );

            response.on(
              "data",
              chunk => {
                data += chunk;
              }
            );

            response.on(
              "end",
              () => {

                let parsed;

                try {
                  parsed =
                    data
                      ? JSON.parse(data)
                      : {};
                } catch {
                  parsed = {
                    raw: data
                  };
                }

                resolve({
                  status:
                    response.statusCode,
                  data: parsed
                });
              }
            );
          }
        );

      request.on(
        "error",
        reject
      );

      if (payload) {
        request.write(payload);
      }

      request.end();
    }
  );
}


/*
 * GitHub connection status
 */

app.get(
  "/api/github/status",
  async (req, res) => {

    try {

      const token =
        getGithubToken();

      if (!token) {
        return res.json({
          ok: true,
          connected: false
        });
      }

      const result =
        await githubRequest(
          "GET",
          "/user",
          token
        );

      if (
        result.status < 200 ||
        result.status >= 300
      ) {

        return res.json({
          ok: true,
          connected: false
        });
      }

      res.json({
        ok: true,
        connected: true,
        user: {
          login:
            result.data.login,
          name:
            result.data.name,
          avatar:
            result.data.avatar_url
        }
      });

    } catch (error) {

      res.status(500).json({
        ok: false,
        connected: false,
        error: error.message
      });
    }
  }
);


/*
 * GitHub repositories
 */

app.get(
  "/api/github/repos",
  async (req, res) => {

    try {

      const token =
        getGithubToken();

      if (!token) {
        return res.status(401).json({
          ok: false,
          error:
            "GitHub is not connected"
        });
      }

      const result =
        await githubRequest(
          "GET",
          "/user/repos?sort=updated&per_page=100",
          token
        );

      if (
        result.status < 200 ||
        result.status >= 300
      ) {
        return res.status(
          result.status || 500
        ).json({
          ok: false,
          error:
            result.data.message ||
            "GitHub API error"
        });
      }

      res.json({
        ok: true,
        repositories:
          result.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name:
              repo.full_name,
            private:
              repo.private,
            html_url:
              repo.html_url,
            clone_url:
              repo.clone_url,
            ssh_url:
              repo.ssh_url,
            default_branch:
              repo.default_branch
          }))
      });

    } catch (error) {

      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);


/*
 * GitHub disconnect
 */

app.post(
  "/api/github/disconnect",
  (req, res) => {

    try {

      if (
        fs.existsSync(
          GITHUB_TOKEN_FILE
        )
      ) {
        fs.rmSync(
          GITHUB_TOKEN_FILE,
          { force: true }
        );
      }

      res.json({
        ok: true,
        connected: false
      });

    } catch (error) {

      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);


/*
 * Device authorization
 *
 * GitHub App credentials are read
 * from .codegrid/github.env.
 */

app.post(
  "/api/github/device",
  async (req, res) => {

    try {

      const env =
        loadGithubEnv();

      const clientId =
        env.GITHUB_CLIENT_ID;

      if (!clientId) {
        return res.status(500).json({
          ok: false,
          error:
            "GITHUB_CLIENT_ID is missing"
        });
      }

      const result =
        await githubRequest(
          "POST",
          "/login/device/code",
          "",
          {
            client_id:
              clientId,
            scope:
              "repo read:user user:email"
          },
          "github.com"
        );

      if (
        result.status < 200 ||
        result.status >= 300
      ) {
        return res.status(
          result.status || 500
        ).json({
          ok: false,
          error:
            result.data.error_description ||
            result.data.message ||
            "GitHub device authorization failed"
        });
      }

      res.json({
        ok: true,
        device_code:
          result.data.device_code,
        user_code:
          result.data.user_code,
        verification_uri:
          result.data.verification_uri,
        verification_uri_complete:
          result.data.verification_uri_complete,
        expires_in:
          result.data.expires_in,
        interval:
          result.data.interval || 5
      });

    } catch (error) {

      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);


/*
 * Device authorization polling
 */

app.post(
  "/api/github/device/poll",
  async (req, res) => {

    try {

      const env =
        loadGithubEnv();

      const clientId =
        env.GITHUB_CLIENT_ID;

      const deviceCode =
        String(
          req.body.device_code || ""
        ).trim();

      if (!clientId || !deviceCode) {
        return res.status(400).json({
          ok: false,
          error:
            "Missing GitHub device authorization data"
        });
      }

      const result =
        await githubRequest(
          "POST",
          "/login/oauth/access_token",
          "",
          {
            client_id:
              clientId,
            device_code:
              deviceCode,
            grant_type:
              "urn:ietf:params:oauth:grant-type:device_code"
          },
          "github.com"
        );

      if (
        result.data.access_token
      ) {

        saveGithubToken(
          result.data.access_token
        );

        return res.json({
          ok: true,
          connected: true
        });
      }

      res.json({
        ok: true,
        connected: false,
        pending:
          result.data.error ===
          "authorization_pending",
        slow_down:
          result.data.error ===
          "slow_down",
        error:
          result.data.error ||
          null,
        error_description:
          result.data.error_description ||
          null
      });

    } catch (error) {

      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);


/*
 * Link current workspace to a repository.
 *
 * Existing git repository:
 * just updates origin.
 */

app.post(
  "/api/github/link",
  async (req, res) => {

    try {

      const token =
        getGithubToken();

      if (!token) {
        return res.status(401).json({
          ok: false,
          error:
            "GitHub is not connected"
        });
      }

      const fullName =
        String(
          req.body.full_name || ""
        ).trim();

      if (!fullName ||
          !/^[^/]+\/[^/]+$/.test(fullName)) {

        return res.status(400).json({
          ok: false,
          error:
            "Repository full_name required"
        });
      }

      const repo =
        await githubRequest(
          "GET",
          `/repos/${fullName}`,
          token
        );

      if (
        repo.status < 200 ||
        repo.status >= 300
      ) {
        return res.status(
          repo.status || 404
        ).json({
          ok: false,
          error:
            repo.data.message ||
            "Repository not found"
        });
      }

      const remote =
        repo.data.clone_url;

      const gitDir =
        path.join(
          WORKSPACE,
          ".git"
        );

      if (!fs.existsSync(gitDir)) {

        execFile(
          "git",
          ["init"],
          { cwd: WORKSPACE },
          error => {

            if (error) {
              return res.status(500).json({
                ok: false,
                error: error.message
              });
            }

            setOriginAndReply();
          }
        );

      } else {
        setOriginAndReply();
      }

      function setOriginAndReply() {

        execFile(
          "git",
          [
            "-C",
            WORKSPACE,
            "remote",
            "get-url",
            "origin"
          ],
          (error) => {

            const finish =
              () => {

                res.json({
                  ok: true,
                  repository: {
                    full_name:
                      repo.data.full_name,
                    html_url:
                      repo.data.html_url,
                    default_branch:
                      repo.data.default_branch
                  }
                });
              };

            if (!error) {

              execFile(
                "git",
                [
                  "-C",
                  WORKSPACE,
                  "remote",
                  "set-url",
                  "origin",
                  remote
                ],
                () => finish()
              );

            } else {

              execFile(
                "git",
                [
                  "-C",
                  WORKSPACE,
                  "remote",
                  "add",
                  "origin",
                  remote
                ],
                () => finish()
              );
            }
          }
        );
      }

    } catch (error) {

      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);

function git(args, res) {
  execFile(
    "git",
    ["-C", WORKSPACE, ...args],
    {
      timeout: 120000
    },
    (error, stdout, stderr) => {
      res.json({
        ok: !error,
        output:
          stdout ||
          stderr ||
          (error ? error.message : "")
      });
    }
  );
}

app.post("/api/git/clone", (req, res) => {
  const url =
    String(req.body.url || "").trim();

  if (!url) {
    return res.status(400).json({
      ok: false,
      error: "Repository URL required"
    });
  }

  execFile(
    "git",
    ["clone", url, WORKSPACE],
    { cwd: ROOT },
    (error, stdout, stderr) => {
      res.json({
        ok: !error,
        output:
          stdout ||
          stderr ||
          (error ? error.message : "")
      });
    }
  );
});

app.post("/api/git/pull", (req, res) => {
  git(["pull"], res);
});

app.post("/api/git/commit", (req, res) => {
  const message =
    String(
      req.body.message ||
      "CodeGrid update"
    );

  execFile(
    "git",
    ["-C", WORKSPACE, "add", "-A"],
    (error, stdout, stderr) => {

      if (error) {
        return res.json({
          ok: false,
          output:
            stdout ||
            stderr ||
            error.message
        });
      }

      git(
        [
          "commit",
          "-m",
          message
        ],
        res
      );
    }
  );
});

app.post("/api/git/push", (req, res) => {
  git(["push"], res);
});

app.use(
  "/preview",
  express.static(WORKSPACE)
);

app.use(
  express.static(
    path.join(ROOT, "public")
  )
);

wss.on("connection", ws => {

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
      stdio: [
        "pipe",
        "pipe",
        "pipe"
      ]
    }
  );

  let closed = false;

  function send(type, data = "") {
    if (
      closed ||
      ws.readyState !== ws.OPEN
    ) return;

    ws.send(JSON.stringify({
      type,
      data
    }));
  }

  function cleanShellOutput(data) {

    let text = data.toString();

    // Remove ANSI color/control sequences.
    text = text.replace(
      /\x1b\[[0-?]*[ -/]*[@-~]/g,
      ""
    );

    text = text.replace(
      /\x1b\][^\x07]*(?:\x07|\x1b\\)/g,
      ""
    );

    text = text.replace(
      /\x1b/g,
      ""
    );

    // Hide Bash/Termux startup warnings.
    text = text.replace(
      /bash:\s*cannot set terminal process group[^\r\n]*(?:\r?\n|$)/g,
      ""
    );

    text = text.replace(
      /bash:\s*no job control in this shell[^\r\n]*(?:\r?\n|$)/g,
      ""
    );

    text = text.replace(
      /bash:\s*initialize_job_control[^\r\n]*(?:\r?\n|$)/g,
      ""
    );

    // Hide old CodeGrid header.
    text = text.replace(
      /CodeGrid Web Shell\r?\n/g,
      ""
    );

    text = text.replace(
      /Workspace:\s*[^\r\n]*\r?\n/g,
      ""
    );

    // Compact workspace path.
    text = text.replace(
      /\/data\/data\/com\.termux\/files\/home\/CodeGrid\/workspace/g,
      "~/CodeGrid"
    );

    text = text.replace(
      /~\/CodeGrid\/workspace/g,
      "~/CodeGrid"
    );

    return text;
  }

  shell.stdout.on("data", data => {

    const text =
      cleanShellOutput(data);

    if(text) {
      send(
        "output",
        text
      );
    }

  });

  shell.stderr.on("data", data => {

    const text =
      cleanShellOutput(data);

    if(text) {
      send(
        "output",
        text
      );
    }

  });

  shell.on("exit", (code, signal) => {

    closed = true;

    if(ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: "exit",
        exitCode: code,
        signal
      }));

      ws.close();
    }
  });

  ws.on("message", raw => {

    try {
      const message =
        JSON.parse(
          raw.toString()
        );

      if(message.type === "input") {
        shell.stdin.write(
          String(
            message.data ?? ""
          )
        );
      }

    } catch {}
  });

  ws.on("close", () => {

    closed = true;

    try {
      shell.kill("SIGTERM");
    } catch {}

  });
});

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log("================================");
    console.log("        CODEGRID ONLINE");
    console.log("================================");
    console.log(
      "http://127.0.0.1:" + PORT
    );
    console.log("");
  }
);
