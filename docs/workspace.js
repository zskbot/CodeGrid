(() => {
  const tabs = [...document.querySelectorAll(".workspace-tab")];
  const pages = [...document.querySelectorAll(".workspace-page")];

  function activate(name, updateHash=true){
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.page === name);
    });

    pages.forEach(page => {
      page.classList.toggle("active", page.id === "workspace-" + name);
    });

    if(updateHash){
      history.replaceState(null,"","#" + name);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => activate(tab.dataset.page));
  });

  document.querySelectorAll("[data-workspace-page]").forEach(button => {
    button.addEventListener("click", () => {
      activate(button.dataset.workspacePage);
    });
  });

  const initial = location.hash.replace("#","");
  activate(
    tabs.some(t => t.dataset.page === initial) ? initial : "home",
    false
  );

  const terminal = document.querySelector("#workspace-terminal-output");
  const command = document.querySelector("#workspace-command");

  function runCommand(){
    const value = command?.value.trim();
    if(!value || !terminal) return;

    terminal.textContent += "\n$ " + value + "\n";

    if(value === "clear"){
      terminal.textContent = "";
    }else if(value === "pwd"){
      terminal.textContent += "~/CodeGrid/workspace\n";
    }else if(value === "ls"){
      terminal.textContent += "src/\npublic/\npackage.json\nREADME.md\n";
    }else{
      terminal.textContent += "CodeGrid Docs Workspace: command routed to the workspace shell.\n";
    }

    if(command) command.value = "";
    terminal.scrollTop = terminal.scrollHeight;
  }

  command?.addEventListener("keydown", e => {
    if(e.key === "Enter") runCommand();
  });

  document.querySelector("[data-run-command]")?.addEventListener("click",runCommand);

  document.querySelector("[data-clear-terminal]")?.addEventListener("click",()=>{
    if(terminal) terminal.textContent = "CodeGrid Web Shell\nReady.\n";
  });

  document.querySelectorAll("[data-copy-workspace]").forEach(button=>{
    button.addEventListener("click",async()=>{
      const text = button.dataset.copyWorkspace || "";
      try{
        await navigator.clipboard.writeText(text);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(()=>button.textContent=old,900);
      }catch{
        button.textContent = "Copy failed";
      }
    });
  });

  const editor = document.querySelector("#workspace-editor-input");
  const save = document.querySelector("[data-save-editor]");
  const editorStatus = document.querySelector("#editor-status");

  save?.addEventListener("click",()=>{
    if(editorStatus){
      editorStatus.textContent =
        "Saved locally in this documentation workspace demo.";
    }
    localStorage.setItem("codegrid-demo-editor",editor?.value || "");
  });

  const stored = localStorage.getItem("codegrid-demo-editor");
  if(stored && editor) editor.value = stored;
})();
