import { renderResultSections, wireCopyButtons } from "../helpers.js";

export function renderStrength(container) {
  container.innerHTML = `
    <h2 class="tool-title">Strength Tools</h2>
    <p class="tool-subtitle">1RM estimates, training max, and symmetry.</p>

    <div class="form-grid">
      <div>
        <label for="strength-tool">Tool</label>
        <select id="strength-tool">
          <option value="onerm">1RM Estimator</option>
          <option value="percent">Working Weight by %</option>
          <option value="symmetry">Strength Symmetry</option>
        </select>
      </div>

      <div id="strength-fields"></div>

      <button id="strength-calc" class="action-btn">Calculate</button>
    </div>

    <div id="strength-output" class="spacer-top"></div>
  `;

  const toolSelect = document.getElementById("strength-tool");
  const fields = document.getElementById("strength-fields");
  const output = document.getElementById("strength-output");

  function renderFields() {
    if (toolSelect.value === "onerm") {
      fields.innerHTML = `
        <div>
          <label for="weight-lifted">Weight lifted</label>
          <input id="weight-lifted" type="number" step="0.1" />
        </div>
        <div>
          <label for="reps-completed">Reps completed</label>
          <input id="reps-completed" type="number" step="1" />
        </div>
      `;
    } else if (toolSelect.value === "percent") {
      fields.innerHTML = `
        <div>
          <label for="known-1rm">Known 1RM</label>
          <input id="known-1rm" type="number" step="0.1" />
        </div>
        <div>
          <label for="load-percent">Percent</label>
          <input id="load-percent" type="number" step="0.1" />
        </div>
      `;
    } else {
      fields.innerHTML = `
        <div>
          <label for="left-side">Left side</label>
          <input id="left-side" type="number" step="0.1" />
        </div>
        <div>
          <label for="right-side">Right side</label>
          <input id="right-side" type="number" step="0.1" />
        </div>
      `;
    }
  }

  renderFields();
  toolSelect.addEventListener("change", renderFields);

  document.getElementById("strength-calc").addEventListener("click", () => {
    const tool = toolSelect.value;

    if (tool === "onerm") {
      const weight = parseFloat(document.getElementById("weight-lifted").value);
      const reps = parseFloat(document.getElementById("reps-completed").value);

      if (!weight || !reps || weight <= 0 || reps <= 0) {
        output.innerHTML = `<div class="result-box">Enter valid values.</div>`;
        return;
      }

      const epley = weight * (1 + reps / 30);
      const brzycki = reps >= 37 ? null : (weight * 36) / (37 - reps);
      const lombardi = weight * Math.pow(reps, 0.1);
      const values = [epley, lombardi, brzycki].filter((v) => v !== null);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const trainingMax = avg * 0.9;

      const result = {
        summary: `Average estimated 1RM: ${avg.toFixed(1)}\nTraining max (90%): ${trainingMax.toFixed(1)}`,
        explanation: `Displays multiple 1RM estimation methods. Use caution with higher rep counts as estimates become less reliable.`,
        note: `Estimated 1RM based on ${weight.toFixed(1)} x ${reps.toFixed(0)} was ${avg.toFixed(1)} with training max of ${trainingMax.toFixed(1)}.`,
        raw: `Input: ${weight.toFixed(1)} x ${reps.toFixed(0)}\nEpley: ${epley.toFixed(1)}\nBrzycki: ${brzycki === null ? "N/A" : brzycki.toFixed(1)}\nLombardi: ${lombardi.toFixed(1)}\nAverage: ${avg.toFixed(1)}\nTraining Max: ${trainingMax.toFixed(1)}`
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    if (tool === "percent") {
      const oneRm = parseFloat(document.getElementById("known-1rm").value);
      const pct = parseFloat(document.getElementById("load-percent").value);

      if (!oneRm || !pct || oneRm <= 0 || pct <= 0) {
        output.innerHTML = `<div class="result-box">Enter valid values.</div>`;
        return;
      }

      const load = oneRm * (pct / 100);

      const result = {
        summary: `${pct.toFixed(1)}% of 1RM = ${load.toFixed(1)}`,
        explanation: `Converts a target percentage of 1RM into working load.`,
        note: `Working load at ${pct.toFixed(1)}% of 1RM equals ${load.toFixed(1)}.`,
        raw: `1RM: ${oneRm.toFixed(1)}\nPercent: ${pct.toFixed(1)}%\nWorking load: ${load.toFixed(1)}`
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    const left = parseFloat(document.getElementById("left-side").value);
    const right = parseFloat(document.getElementById("right-side").value);

    if (!left || !right || left <= 0 || right <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid values.</div>`;
      return;
    }

    const stronger = Math.max(left, right);
    const weaker = Math.min(left, right);
    const deficit = ((stronger - weaker) / stronger) * 100;
    const weakerSide = left < right ? "Left" : "Right";

    const result = {
      summary: `${weakerSide} side deficit: ${deficit.toFixed(1)}%`,
      explanation: `Compares left and right values and reports deficit relative to the stronger side.`,
      note: `Strength symmetry testing showed ${weakerSide.toLowerCase()} side deficit of ${deficit.toFixed(1)}% compared to the stronger side.`,
      raw: `Left: ${left.toFixed(1)}\nRight: ${right.toFixed(1)}\nDeficit: ${deficit.toFixed(1)}%\nWeaker side: ${weakerSide}`
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
