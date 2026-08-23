const { spawn } = require("child_process");

function createShell(cwd, env = {}) {
  return spawn(
    "script",
    ["-q", "/dev/null", "-c", "bash --noprofile --norc"],
    {
      cwd,
      env: {
        ...process.env,
        ...env,
        TERM: "xterm-256color",
        COLORTERM: "truecolor"
      },
      stdio: ["pipe", "pipe", "pipe"]
    }
  );
}

module.exports = { createShell };
