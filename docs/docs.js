(() => {
  const menu = document.querySelector(".menu");
  const sidebar = document.querySelector(".sidebar");

  menu?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  document.querySelectorAll(".nav").forEach(link => {
    link.addEventListener("click", () => {
      sidebar?.classList.remove("open");
    });
  });

  document.querySelectorAll(".copy").forEach(button => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";

      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = old || "Copy";
        }, 1000);
      } catch {
        button.textContent = "Failed";
        setTimeout(() => {
          button.textContent = "Copy";
        }, 1000);
      }
    });
  });

  const search = document.querySelector(".search");

  search?.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const query = search.value.trim().toLowerCase();
    if (!query) return;

    const links = [...document.querySelectorAll(".nav")];
    const match = links.find(link =>
      link.textContent.toLowerCase().includes(query)
    );

    if (match) {
      window.location.href = match.href;
    }
  });

  document.addEventListener("keydown", event => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();
      search?.focus();
    }

    if (event.key === "Escape") {
      search?.blur();
    }
  });
})();
