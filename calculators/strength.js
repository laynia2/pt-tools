import { renderResultSections, wireCopyButtons } from "../helpers.js";

// ---------------------------------------------------------------------------
// Normative reference data — symmetry only (the tool with benchmarks)
// ---------------------------------------------------------------------------
const SYMMETRY_NORMATIVE = `Limb Symmetry Index (LSI) benchmarks
  ≥ 90%       — Commonly used return-to-sport threshold (varies by sport/activity)
  ≥ 85%       — Often used as return-to-function threshold for general ADLs
  < 85%       — Clinically meaningful asymmetry; functional limitation likely
  < 75%       — Significant asymmetry; high functional limitation / compensation risk

Common clinical contexts
  ACL return to sport:  ≥ 90% LSI on hop tests and strength testing
  General ADL function: ≥ 85% LSI on relevant strength measures
  Stair negotiation:    ≥ 80% LSI commonly cited
  Older adults:         > 10–15% deficit associated with fall risk and mobility limitation

LSI = (weaker side / stronger side) × 100
Deficit % = 100 − LSI`;

// ---------------------------------------------------------------------------
// Goal templates
// ---------------------------------------------------------------------------
function buildSymmetryGoals(deficit, weakerSide, stgWeeks, ltgWeeks) {
  let stgTarget, ltgTarget, stgFunction, ltgFunction;

  if (deficit >= 25) {
    stgTarget = 20;
    ltgTarget = 15;
    stgFunction = "reduce significant bilateral asymmetry and improve functional loading tolerance";
    ltgFunction = "reduce limb asymmetry to support safe functional mobility and bilateral weight-bearing activities";
  } else if (deficit >= 15) {
    stgTarget = 10;
    ltgTarget = 10;
    stgFunction = "reduce limb asymmetry to support safe functional activities including stair negotiation and transfers";
    ltgFunction = "achieve ≤ 10% deficit to support return to functional activities and reduce compensation risk";
  } else if (deficit >= 10) {
    stgTarget = 10;
    ltgTarget = 8;
    stgFunction = "achieve clinically acceptable limb symmetry for safe functional and community-level activities";
    ltgFunction = "achieve ≤ 10% limb symmetry deficit to support return to prior level of function";
  } else {
    stgTarget = 5;
    ltgTarget = 5;
    stgFunction = "maintain and improve bilateral symmetry for optimal functional performance";
    ltgFunction = "maintain bilateral symmetry ≤ 5% deficit for full return to prior level of function";
  }

  const stg = `STG (${stgWeeks} weeks): Patient will reduce ${weakerSide.toLowerCase()} side strength deficit from ${deficit.toFixed(1)}% to ≤ ${stgTarget}% in order to ${stgFunction}.`;
  const ltg = `LTG (${ltgWeeks} weeks): Patient will reduce ${weakerSide.toLowerCase()} side strength deficit to ≤ ${ltgTarget}% in order to ${ltgFunction}.`;
  return { stg, ltg };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
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
      <div id="strength-goal-fields"></div>

      <button id="strength-calc" class="action-btn">Calculate</button>
    </div>

    <div id="strength-output" class="spacer-top"></div>
  `;

  const toolSelect  = document.getElementById("strength-tool");
  const fields      = document.getElementById("strength-fields");
  const goalFields  = document.getElementById("strength-goal-fields");
  const output      = document.getElementById("strength-output");

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
      goalFields.innerHTML = "";
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
      goalFields.innerHTML = "";
    } else {
      // Symmetry — show goal timeframe fields
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
      goalFields.innerHTML = `
        <div class="goal-timeframe-row">
          <div>
            <label for="strength-stg">STG timeframe (weeks)</label>
            <input id="strength-stg" type="number" step="1" min="1" value="4" />
          </div>
          <div>
            <label for="strength-ltg">LTG timeframe (weeks)</label>
            <input id="strength-ltg" type="number" step="1" min="1" value="8" />
          </div>
        </div>
      `;
    }
  }

  renderFields();
  toolSelect.addEventListener("change", renderFields);

  document.getElementById("strength-calc").addEventListener("click", () => {
    const tool = toolSelect.value;

    // ── 1RM ──────────────────────────────────────────────────────────────
    if (tool === "onerm") {
      const weight = parseFloat(document.getElementById("weight-lifted").value);
      const reps   = parseFloat(document.getElementById("reps-completed").value);

      if (!weight || !reps || weight <= 0 || reps <= 0) {
        output.innerHTML = `<div class="result-box">Enter valid values.</div>`;
        return;
      }

      const epley     = weight * (1 + reps / 30);
      const brzycki   = reps >= 37 ? null : (weight * 36) / (37 - reps);
      const lombardi  = weight * Math.pow(reps, 0.1);
      const values    = [epley, lombardi, brzycki].filter((v) => v !== null);
      const avg       = values.reduce((a, b) => a + b, 0) / values.length;
      const trainingMax = avg * 0.9;

      const result = {
        summary: `Estimated 1RM: ${avg.toFixed(1)}\nTraining max (90%): ${trainingMax.toFixed(1)}`,
        note: `Estimated 1RM based on ${weight.toFixed(1)} × ${Math.round(reps)} reps was ${avg.toFixed(1)}; training max (90%) = ${trainingMax.toFixed(1)}.`,
        raw: `Input: ${weight.toFixed(1)} × ${Math.round(reps)} reps\nEpley: ${epley.toFixed(1)}\nBrzycki: ${brzycki === null ? "N/A (reps ≥ 37)" : brzycki.toFixed(1)}\nLombardi: ${lombardi.toFixed(1)}\nAverage: ${avg.toFixed(1)}\nTraining Max (90%): ${trainingMax.toFixed(1)}`,
        explanation: `Three 1RM estimation formulas are averaged. Epley: w × (1 + r/30). Brzycki: (w × 36) / (37 − r); excluded if reps ≥ 37. Lombardi: w × r^0.1. Estimates become less reliable above ~10 reps. Training max = average × 0.90.`,
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    // ── Working % ─────────────────────────────────────────────────────────
    if (tool === "percent") {
      const oneRm = parseFloat(document.getElementById("known-1rm").value);
      const pct   = parseFloat(document.getElementById("load-percent").value);

      if (!oneRm || !pct || oneRm <= 0 || pct <= 0) {
        output.innerHTML = `<div class="result-box">Enter valid values.</div>`;
        return;
      }

      const load = oneRm * (pct / 100);

      const result = {
        summary: `${pct.toFixed(1)}% of ${oneRm.toFixed(1)} = ${load.toFixed(1)}`,
        note: `Working load at ${pct.toFixed(1)}% of 1RM (${oneRm.toFixed(1)}) equals ${load.toFixed(1)}.`,
        raw: `1RM: ${oneRm.toFixed(1)}\nPercent: ${pct.toFixed(1)}%\nWorking load: ${load.toFixed(1)}`,
        explanation: `Working load = 1RM × (percent / 100).`,
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    // ── Symmetry ──────────────────────────────────────────────────────────
    const left  = parseFloat(document.getElementById("left-side").value);
    const right = parseFloat(document.getElementById("right-side").value);

    if (!left || !right || left <= 0 || right <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid values.</div>`;
      return;
    }

    const stgWeeks  = parseInt(document.getElementById("strength-stg").value, 10) || 4;
    const ltgWeeks  = parseInt(document.getElementById("strength-ltg").value, 10) || 8;
    const stronger  = Math.max(left, right);
    const weaker    = Math.min(left, right);
    const deficit   = ((stronger - weaker) / stronger) * 100;
    const lsi       = (weaker / stronger) * 100;
    const weakerSide = left < right ? "Left" : "Right";

    const { stg, ltg } = buildSymmetryGoals(deficit, weakerSide, stgWeeks, ltgWeeks);

    const result = {
      summary: `${weakerSide} side deficit: ${deficit.toFixed(1)}%\nLSI: ${lsi.toFixed(1)}%`,
      note: `Strength symmetry testing showed a ${weakerSide.toLowerCase()} side deficit of ${deficit.toFixed(1)}% (LSI ${lsi.toFixed(1)}%) compared to the stronger side.`,
      goals: `${stg}\n\n${ltg}`,
      normative: SYMMETRY_NORMATIVE,
      raw: `Left: ${left.toFixed(1)}\nRight: ${right.toFixed(1)}\nStronger side: ${left > right ? "Left" : "Right"} (${stronger.toFixed(1)})\nWeaker side: ${weakerSide} (${weaker.toFixed(1)})\nDeficit: ${deficit.toFixed(1)}%\nLSI: ${lsi.toFixed(1)}%\nSTG timeframe: ${stgWeeks} weeks\nLTG timeframe: ${ltgWeeks} weeks`,
      explanation: `LSI (Limb Symmetry Index) = (weaker / stronger) × 100. Deficit = 100 − LSI. The ≥ 90% LSI threshold is commonly used for return-to-sport; ≥ 85% is often used for general functional return. Values vary by clinical context and activity demand.`,
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
