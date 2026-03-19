import { renderResultSections, wireCopyButtons } from "../helpers.js";

export function renderOutcomes(container) {
  container.innerHTML = `
    <h2 class="tool-title">Outcomes</h2>
    <p class="tool-subtitle">Percent change, pain reduction, and MDC check.</p>

    <div class="form-grid">
      <div>
        <label for="outcome-tool">Tool</label>
        <select id="outcome-tool">
          <option value="percent">Percent Change</option>
          <option value="pain">Pain Reduction %</option>
          <option value="mdc">MDC Checker</option>
        </select>
      </div>

      <div id="outcome-fields"></div>

      <button id="outcome-calc" class="action-btn">Calculate</button>
    </div>

    <div id="outcome-output" class="spacer-top"></div>
  `;

  const toolSelect = document.getElementById("outcome-tool");
  const fields = document.getElementById("outcome-fields");
  const output = document.getElementById("outcome-output");

  function renderFields() {
    if (toolSelect.value === "mdc") {
      fields.innerHTML = `
        <div>
          <label for="baseline">Baseline score</label>
          <input id="baseline" type="number" step="0.01" />
        </div>
        <div>
          <label for="current">Current score</label>
          <input id="current" type="number" step="0.01" />
        </div>
        <div>
          <label for="mdc-value">MDC value</label>
          <input id="mdc-value" type="number" step="0.01" />
        </div>
      `;
      return;
    }

    fields.innerHTML = `
      <div>
        <label for="baseline">Baseline value</label>
        <input id="baseline" type="number" step="0.01" />
      </div>
      <div>
        <label for="current">Current value</label>
        <input id="current" type="number" step="0.01" />
      </div>
    `;
  }

  renderFields();
  toolSelect.addEventListener("change", renderFields);

  document.getElementById("outcome-calc").addEventListener("click", () => {
    const tool = toolSelect.value;
    const baseline = parseFloat(document.getElementById("baseline").value);
    const current = parseFloat(document.getElementById("current").value);

    if (isNaN(baseline) || isNaN(current) || baseline === 0) {
      output.innerHTML = `<div class="result-box">Enter valid values. Baseline cannot be 0.</div>`;
      return;
    }

    if (tool === "percent") {
      const change = ((current - baseline) / baseline) * 100;

      const result = {
        summary: `Percent change: ${change.toFixed(1)}%`,
        explanation: `Positive values indicate increase from baseline; negative values indicate decrease from baseline.`,
        note: `Change from ${baseline.toFixed(2)} to ${current.toFixed(2)} equals ${change.toFixed(1)}%.`,
        raw: `Baseline: ${baseline.toFixed(2)}\nCurrent: ${current.toFixed(2)}\nPercent change: ${change.toFixed(1)}%`
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    if (tool === "pain") {
      const reduction = ((baseline - current) / baseline) * 100;

      const result = {
        summary: `Pain reduction: ${reduction.toFixed(1)}%`,
        explanation: `Higher positive values indicate larger pain reduction from baseline.`,
        note: `Pain reduced from ${baseline.toFixed(1)} to ${current.toFixed(1)}, representing ${reduction.toFixed(1)}% improvement.`,
        raw: `Initial pain: ${baseline.toFixed(1)}\nCurrent pain: ${current.toFixed(1)}\nPain reduction: ${reduction.toFixed(1)}%`
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    const mdcValue = parseFloat(document.getElementById("mdc-value").value);

    if (isNaN(mdcValue) || mdcValue < 0) {
      output.innerHTML = `<div class="result-box">Enter a valid MDC value.</div>`;
      return;
    }

    const absoluteChange = Math.abs(current - baseline);
    const met = absoluteChange >= mdcValue;

    const result = {
      summary: `Absolute change: ${absoluteChange.toFixed(2)}\nExceeded MDC: ${met ? "Yes" : "No"}`,
      explanation: `Checks whether observed change exceeds the entered minimal detectable change threshold.`,
      note: `Change from ${baseline.toFixed(2)} to ${current.toFixed(2)} was ${absoluteChange.toFixed(2)}, which ${met ? "exceeds" : "does not exceed"} the MDC of ${mdcValue.toFixed(2)}.`,
      raw: `Baseline: ${baseline.toFixed(2)}\nCurrent: ${current.toFixed(2)}\nMDC: ${mdcValue.toFixed(2)}\nAbsolute change: ${absoluteChange.toFixed(2)}`
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
