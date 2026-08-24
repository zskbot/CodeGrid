# CodeGrid architecture

CodeGrid is a local, mobile-first web IDE. Its browser client is served by a single Express process that owns the workspace, exposes HTTP APIs, and creates a dedicated Bash process for each terminal WebSocket connection.

## System overview

```text
Browser (`public/index.html`)
  ├── HTTP ────────────────────────────────┐
  │                                         ▼
  │                              Express (`server/index.js`)
  │                                ├── workspace file APIs
  │                                ├── Git and GitHub APIs
  │                                └── static preview at `/preview/`
  │                                         │
  └── WebSocket ────────────────────────────┼──► Bash session (`script` + `bash`)
                                            │
                                            ▼
                                   `workspace/` project directory
```

## Runtime responsibilities

| Layer | Primary file | Responsibility |
| --- | --- | --- |
| Browser IDE | `public/index.html` | Terminal, Explorer, editor, preview, Git UI, GitHub device authorization UI. |
| HTTP and WebSocket server | `server/index.js` | Owns routes, validates workspace paths, serves files, starts shells, and executes Git commands. |
| Workspace | `workspace/` | User project files and the root served at `/preview/`. Created automatically at startup. |
| Termux launcher | `run-codegrid.sh` | Restarts the server on port `8899` and records process/log state. |
| Module descriptors | `api/`, `runtime/`, `web-ide/`, `github/` | Small CommonJS entry points that describe the product’s API and runtime areas. |

## API groups

- **Workspace:** `/api/health`, `/api/workspace`, `/api/files`, and `/api/file`.
- **GitHub:** `/api/github/status`, `/api/github/device`, `/api/github/device/poll`, `/api/github/repos`, `/api/github/link`, and `/api/github/disconnect`.
- **Git:** `/api/git/clone`, `/api/git/pull`, `/api/git/commit`, and `/api/git/push`.
- **Preview:** `/preview/` statically serves the workspace.

## GitHub and Git authentication

GitHub device authorization reads `GITHUB_CLIENT_ID` from `.codegrid/github.env` and stores the issued user token in `.codegrid/github.token`. These local-only files are ignored by Git.

When a GitHub token exists, Git commands receive a temporary GitHub HTTP authorization header through the child process environment. The token is not written into the `origin` URL, allowing private GitHub clone, pull, and push operations without exposing credentials in repository configuration.

## Workspace boundary

The file API resolves requested paths relative to `workspace/` and rejects paths outside that directory. Git clone only runs when the workspace is empty, preventing it from replacing existing project data.
