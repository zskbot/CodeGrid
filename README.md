<div align="center">
  <img src="https://img.shields.io/badge/CodeGrid-Web%20IDE-65A8FF?style=for-the-badge&labelColor=0B1020" alt="CodeGrid Web IDE">

  <h1>CodeGrid</h1>
  <p><strong>A focused, mobile-first development workspace that runs in your browser.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 18 or later">
    <img src="https://img.shields.io/badge/Express-5.1.0-000000?style=flat-square&logo=express&logoColor=white" alt="Express 5.1.0">
    <img src="https://img.shields.io/badge/Interface-Mobile--first-65A8FF?style=flat-square" alt="Mobile-first interface">
    <img src="https://img.shields.io/badge/License-Private-7A8AA6?style=flat-square" alt="Private project">
  </p>

  <p>
    <a href="#quick-start">Quick start</a> ·
    <a href="#what-you-can-do">Features</a> ·
    <a href="#github-connection">GitHub</a> ·
    <a href="#api-overview">API</a>
  </p>
</div>

---

## Build, edit, preview, and ship — from one workspace

CodeGrid is a lightweight web IDE designed for a fast development loop. Open it in a browser, work with files inside the local workspace, use the live Bash terminal, preview web projects, and synchronize changes through Git or GitHub.

> **Workspace:** `~/CodeGrid/workspace`<br>
> **Default URL:** `http://127.0.0.1:8899`

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>⌘ Live terminal</h3>
      <p>Use a persistent browser-connected Bash session for commands, package tools, and project workflows.</p>
    </td>
    <td width="50%" valign="top">
      <h3>◫ File explorer & editor</h3>
      <p>Browse the workspace tree, open files, create new files, edit source code, and save without leaving the IDE.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>◉ Instant preview</h3>
      <p>Preview files served directly from the workspace at <code>/preview/</code>, with a one-click refresh.</p>
    </td>
    <td width="50%" valign="top">
      <h3>⎇ Source control</h3>
      <p>Clone repositories, pull changes, create commits, push updates, and connect a GitHub repository as the workspace remote.</p>
    </td>
  </tr>
</table>

## What you can do

| Area | Included workflow |
| --- | --- |
| **Terminal** | A WebSocket-backed Bash shell, ANSI cleanup, keyboard shortcuts, reconnect status, and a clearable terminal buffer. |
| **Explorer** | Recursive file tree, folder expansion, file counts, refresh, new-file flow, file selection, and save feedback. |
| **Editor** | Plain-text source editing with unsaved/saved state indicators and UTF-8 workspace file persistence. |
| **Preview** | Browser preview for content in the workspace, available at `/preview/`. |
| **Git** | Clone, pull, stage and commit all changes, then push using the configured workspace remote. |
| **GitHub** | Device authorization, repository browsing, repository-to-workspace linking, and disconnect support. |

## Quick start

### 1. Prerequisites

Install the following on the machine running CodeGrid:

- **Node.js 18+**
- **npm**
- **Git** for source-control commands
- **Bash** and the `script` command for the live terminal session

### 2. Install dependencies

```bash
git clone <your-codegrid-repository-url>
cd CodeGrid
npm install
```

### 3. Start the IDE

```bash
npm start
```

Open [http://127.0.0.1:8899](http://127.0.0.1:8899) in your browser.

To choose another port:

```bash
PORT=3000 npm start
```

### Termux shortcut

For a Termux environment, the included launcher restarts CodeGrid on port `8899`, stores its process ID in `.codegrid.pid`, and writes server output to `codegrid.log`.

```bash
chmod +x run-codegrid.sh
./run-codegrid.sh
```

## Project structure

```text
CodeGrid/
├── public/
│   └── index.html          # Browser IDE: terminal, explorer, preview, Git and GitHub UI
├── server/
│   └── index.js            # Express server, workspace APIs, GitHub flow, WebSocket shell
├── workspace/              # Your editable project files and preview root
├── api/                    # API module entry points
├── runtime/                # Runtime module entry points
├── github/                 # Git operation entry points
├── run-codegrid.sh         # Termux launcher
└── package.json            # Node scripts and dependencies
```

## How it works

```text
Browser UI
    │
    ├── HTTP ───────────────► Express APIs ─────► Workspace files / Git / GitHub
    │
    └── WebSocket ──────────► Bash shell ───────► ~/CodeGrid/workspace

Browser preview ────────────► /preview/ ─────────► Workspace static files
```

- The server creates `workspace/` automatically when it starts.
- File endpoints resolve every requested path inside this workspace.
- `/preview/` serves the workspace as static content.
- Each terminal connection launches a Bash process rooted at the workspace.

## GitHub connection

CodeGrid uses GitHub’s **device authorization flow**. This keeps the authentication interaction in GitHub while CodeGrid stores the resulting access token locally.

### Configure a GitHub OAuth App

1. Create a GitHub OAuth App and enable device flow for it.
2. Create `.codegrid/github.env` in the repository root.
3. Add the Client ID:

```dotenv
GITHUB_CLIENT_ID=your_github_oauth_client_id
```

4. Start CodeGrid, choose **Connect GitHub**, and follow the on-screen verification code.

After authorization, CodeGrid stores the token in `.codegrid/github.token` with owner-only file permissions where supported. Keep `.codegrid/` private and never commit credentials.

## API overview

All API responses are JSON and are served by the local CodeGrid server.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Server and runtime status. |
| `GET` | `/api/workspace` | Workspace metadata. |
| `GET` | `/api/files` | Recursive workspace file tree. |
| `GET` | `/api/file?path=…` | Read a single file. |
| `PUT` | `/api/file` | Save a file with `{ path, content }`. |
| `DELETE` | `/api/file` | Delete a workspace file or directory. |
| `GET` | `/api/github/status` | GitHub connection status. |
| `GET` | `/api/github/repos` | Repositories for the connected account. |
| `POST` | `/api/github/device` | Start device authorization. |
| `POST` | `/api/github/device/poll` | Check device authorization progress. |
| `POST` | `/api/github/link` | Set the current workspace repository remote. |
| `POST` | `/api/git/clone` | Clone a repository into the workspace. |
| `POST` | `/api/git/pull` | Pull from the configured remote. |
| `POST` | `/api/git/commit` | Stage all files and create a commit. |
| `POST` | `/api/git/push` | Push to the configured remote. |

## Development

```bash
# Run the same local server command used for development
npm run dev

# Confirm the server is responding
curl http://127.0.0.1:8899/api/health
```

The project deliberately keeps the client and server dependency footprint small: Express provides the HTTP/static server and `ws` powers the terminal connection.

## Safety notes

- CodeGrid is intended for trusted local or private-network use.
- The terminal has the same permissions as the process that starts the server.
- Do not expose a CodeGrid instance directly to the public internet without adding authentication, TLS, and appropriate network controls.
- Review repositories before cloning or executing their scripts.

---

<div align="center">
  <strong>CodeGrid</strong><br>
  <sub>Your local browser workspace for building on the move.</sub>
</div>
