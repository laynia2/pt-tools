export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildFullResultText(result) {
  const parts = [];

  if (result.summary) {
    parts.push(`Summary\n${result.summary}`);
  }

  if (result.explanation) {
    parts.push(`Explanation\n${result.explanation}`);
  }

  if (result.note) {
    parts.push(`Clinical Note\n${result.note}`);
  }

  if (result.raw) {
    parts.push(`Raw Values\n${result.raw}`);
  }

  return parts.join("\n\n");
}

export function renderResultSections(result) {
  return `
    <div class="result-section">
      <h3 class="section-title">Summary</h3>
      <div class="result-box">${escapeHtml(result.summary || "")}</div>
    </div>

    <div class="result-section">
      <h3 class="section-title">Explanation</h3>
      <div class="result-box">${escapeHtml(result.explanation || "")}</div>
    </div>

    <div class="result-section">
      <h3 class="section-title">Clinical Note</h3>
      <div class="result-box">${escapeHtml(result.note || "")}</div>
    </div>

    <div class="result-section">
      <h3 class="section-title">Raw Values</h3>
      <div class="result-box">${escapeHtml(result.raw || "")}</div>
    </div>

    <div class="result-section">
      <div class="copy-btn-row">
        <button class="secondary-btn copy-btn" data-copy-type="summary">Copy Summary</button>
        <button class="secondary-btn copy-btn" data-copy-type="explanation">Copy Explanation</button>
        <button class="secondary-btn copy-btn" data-copy-type="note">Copy Clinical Note</button>
        <button class="secondary-btn copy-btn" data-copy-type="raw">Copy Raw Values</button>
        <button class="action-btn copy-btn" data-copy-type="full">Copy Full Result</button>
      </div>
      <div class="copy-status hidden" data-copy-status>Copied</div>
    </div>
  `;
}

export function wireCopyButtons(container, result) {
  const statusEl = container.querySelector("[data-copy-status]");

  container.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      let textToCopy = "";

      switch (btn.dataset.copyType) {
        case "summary":
          textToCopy = result.summary || "";
          break;
        case "explanation":
          textToCopy = result.explanation || "";
          break;
        case "note":
          textToCopy = result.note || "";
          break;
        case "raw":
          textToCopy = result.raw || "";
          break;
        case "full":
          textToCopy = buildFullResultText(result);
          break;
        default:
          textToCopy = "";
      }

      const ok = await copyText(textToCopy);

      if (statusEl) {
        statusEl.textContent = ok ? "Copied" : "Copy failed";
        statusEl.classList.remove("hidden");
        clearTimeout(statusEl._hideTimer);
        statusEl._hideTimer = setTimeout(() => {
          statusEl.classList.add("hidden");
        }, 1200);
      }
    });
  });
}
