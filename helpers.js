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

// ---------------------------------------------------------------------------
// Result schema
// ---------------------------------------------------------------------------
// result = {
//   summary:    string   — short values + classification shown first
//   note:       string   — clinical note sentence(s), paste-ready
//   goals:      string   — STG + LTG template text (optional)
//   normative:  string   — full normative reference table (optional)
//   raw:        string   — input echo + computed values
//   explanation:string   — methodology / reference context shown last
// }
// ---------------------------------------------------------------------------

export function buildFullResultText(result) {
  const parts = [];

  if (result.summary) {
    parts.push(`Summary\n${result.summary}`);
  }

  if (result.note) {
    parts.push(`Clinical Note\n${result.note}`);
  }

  if (result.goals) {
    parts.push(`Goals\n${result.goals}`);
  }

  if (result.normative) {
    parts.push(`Normative Reference\n${result.normative}`);
  }

  if (result.raw) {
    parts.push(`Raw Values\n${result.raw}`);
  }

  if (result.explanation) {
    parts.push(`Explanation\n${result.explanation}`);
  }

  return parts.join("\n\n");
}

export function renderResultSections(result) {
  const goalsSection = result.goals
    ? `
    <div class="result-section">
      <h3 class="section-title">Goals</h3>
      <div class="result-box">${escapeHtml(result.goals)}</div>
    </div>`
    : "";

  const normativeSection = result.normative
    ? `
    <div class="result-section">
      <h3 class="section-title">Normative Reference</h3>
      <div class="result-box">${escapeHtml(result.normative)}</div>
    </div>`
    : "";

  const goalsBtn = result.goals
    ? `<button class="secondary-btn copy-btn" data-copy-type="goals">Copy Goals</button>`
    : "";

  // Section order: Summary → Clinical Note → Goals → Normative → Raw Values → Explanation → Copy buttons
  return `
    <div class="result-section">
      <h3 class="section-title">Summary</h3>
      <div class="result-box">${escapeHtml(result.summary || "")}</div>
    </div>

    <div class="result-section">
      <h3 class="section-title">Clinical Note</h3>
      <div class="result-box">${escapeHtml(result.note || "")}</div>
    </div>

    ${goalsSection}

    ${normativeSection}

    <div class="result-section">
      <h3 class="section-title">Raw Values</h3>
      <div class="result-box">${escapeHtml(result.raw || "")}</div>
    </div>

    <div class="result-section">
      <h3 class="section-title">Explanation</h3>
      <div class="result-box">${escapeHtml(result.explanation || "")}</div>
    </div>

    <div class="result-section">
      <div class="copy-btn-row">
        <button class="secondary-btn copy-btn" data-copy-type="summary">Copy Summary</button>
        <button class="secondary-btn copy-btn" data-copy-type="note">Copy Clinical Note</button>
        ${goalsBtn}
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
        case "note":
          textToCopy = result.note || "";
          break;
        case "goals":
          textToCopy = result.goals || "";
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
