import { renderResultSections, wireCopyButtons } from "../helpers.js";

export function renderBalance(container) {
  container.innerHTML = `
    <h2 class="tool-title">Balance / Functional Tests</h2>
    <p class="tool-subtitle">Quick interpretation helpers for common tests.</p>

    <div class="form-grid">
      <div>
        <label for="balance-tool">Tool</label>
        <select id="balance-tool">
          <option value="tug">Timed Up and Go (TUG)</option>
          <option value="5xsts">Five Times Sit to Stand</option>
          <option value="30sts">30 Second Sit to Stand</option>
        </select>
      </div>

      <div id="balance-fields"></div>

      <button id="balance-calc" class="action-btn">Calculate</button>
    </div>

    <div id="balance-output" class="spacer-top"></div>
  `;

  const toolSelect = document.getElementById("balance-tool");
  const fields = document.getElementById("balance-fields");
  const output = document.getElementById("balance-output");

  function renderFields() {
    if (toolSelect.value === "30sts") {
      fields.innerHTML = `
        <div>
          <label for="sts-reps">Repetitions in 30 seconds</label>
          <input id="sts-reps" type="number" step="1" />
        </div>
      `;
    } else {
      fields.innerHTML = `
        <div>
          <label for="balance-time">Time (sec)</label>
          <input id="balance-time" type="number" step="0.01" />
        </div>
      `;
    }
  }

  renderFields();
  toolSelect.addEventListener("change", renderFields);

  document.getElementById("balance-calc").addEventListener("click", () => {
    const tool = toolSelect.value;

    if (tool === "tug") {
      const time = parseFloat(document.getElementById("balance-time").value);

      if (!time || time <= 0) {
        output.innerHTML = `<div class="result-box">Enter a valid time.</div>`;
        return;
      }

      let interpretation = "";
      if (time < 10) interpretation = "Normal mobility range";
      else if (time < 20) interpretation = "Good mobility, mostly independent";
      else if (time < 30) interpretation = "Impaired mobility";
      else interpretation = "High mobility limitation / fall risk concern";

      const result = {
        summary: `TUG: ${time.toFixed(2)} sec\nInterpretation: ${interpretation}`,
        explanation: `Longer TUG time suggests greater mobility limitation and fall risk concern.`,
        note: `Timed Up and Go was completed in ${time.toFixed(2)} seconds, consistent with ${interpretation.toLowerCase()}.`,
        raw: `TUG time: ${time.toFixed(2)} sec`
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    if (tool === "5xsts") {
      const time = parseFloat(document.getElementById("balance-time").value);

      if (!time || time <= 0) {
        output.innerHTML = `<div class="result-box">Enter a valid time.</div>`;
        return;
      }

      const interpretation = time <= 12 ? "Better functional lower-extremity performance" : "Slower performance / possible fall risk concern";

      const result = {
        summary: `5xSTS: ${time.toFixed(2)} sec\nInterpretation: ${interpretation}`,
        explanation: `Slower performance may reflect reduced functional lower-extremity strength and transfer efficiency.`,
        note: `Five Times Sit to Stand completed in ${time.toFixed(2)} seconds, indicating ${interpretation.toLowerCase()}.`,
        raw: `5xSTS time: ${time.toFixed(2)} sec`
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    const reps = parseFloat(document.getElementById("sts-reps").value);

    if (!reps || reps <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid repetitions.</div>`;
      return;
    }

    const interpretation = reps >= 12 ? "Better functional sit-to-stand endurance" : "Reduced sit-to-stand endurance / strength";

    const result = {
      summary: `30sSTS: ${reps.toFixed(0)} reps\nInterpretation: ${interpretation}`,
      explanation: `Higher repetitions reflect better functional lower-extremity endurance and transfer performance.`,
      note: `Patient completed ${reps.toFixed(0)} repetitions on the 30 Second Sit to Stand test, indicating ${interpretation.toLowerCase()}.`,
      raw: `30sSTS repetitions: ${reps.toFixed(0)}`
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
