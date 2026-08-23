# CodeGrid

Mobile-first Web IDE.

## Web IDE

- Terminal
- Editor
- Files
- Preview

## API

- Auth
- Workspace
- Terminal
- GitHub

## Runtime

- Sandbox
- Shell
- Process
- Preview

## GitHub

- Clone
- Pull
- Commit
- Push

## Runtime flow

Browser
  -> WebSocket
  -> CodeGrid API
  -> node-pty
  -> Bash
  -> Workspace

## Workspace

The default development workspace is:

~/CodeGrid/workspace
