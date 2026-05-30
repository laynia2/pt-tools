import { renderResultSections, wireCopyButtons } from "../helpers.js";

// ---------------------------------------------------------------------------
// Normative reference data
// ---------------------------------------------------------------------------
const TUG_NORMATIVE = `TUG normative values (community-dwelling adults)
  Age 60–69:  ≤ 9 sec  — normal; > 12 sec — fall risk concern
  Age 70–79:  ≤ 10 sec — normal; > 12 sec — fall risk concern
  Age 80–89:  ≤ 12 sec — normal; > 12 sec — fall risk concern

Clinical thresholds
  < 10 sec    — Normal mobility, low fall risk
  10–19 sec   — Mildly impaired; mostly independent
  20–29 sec   — Moderately impaired; may need assistance
  ≥ 30 sec    — Severely impaired; high fall risk

MDC: ~2.9 sec (community-dwelling older adults)
MCID: ~1.4 sec`;

const FXSTS_NORMATIVE = `5xSTS normative values by age (Bohannon 2006)
  Age 60–69:  ≤ 11.4 sec (men) / ≤ 12.6 sec (women)
  Age 70–79:  ≤ 12.6 sec (men) / ≤ 14.8 sec (women)
  Age 80–89:  ≤ 14.9 sec (men) / ≤ 16.9 sec (women)

Clinical thresholds
  ≤ 12 sec    — Better lower-extremity performance
  > 12 sec    — Reduced LE performance; possible fall risk concern
  > 15 sec    — Significant LE weakness / mobility limitation

MDC: ~2.4 sec
MCID: ~2.0 sec`;

const STS30_NORMATIVE = `30-Second STS normative values by age and sex (Jones et al. 1999)
                 Men     Women
  Age 60–64:   ≥ 14     ≥ 12 reps
  Age 65–69:   ≥ 12     ≥ 11 reps
  Age 70–74:   ≥ 12     ≥ 10 reps
  Age 75–79:   ≥ 11     ≥ 10 reps
  Age 80–84:   ≥ 10     ≥ 9  reps
  Age 85–89:   ≥ 8      ≥ 8  reps
  Age 90–94:   ≥ 7      ≥ 4  reps

General clinical threshold
  ≥ 12 reps   — Better sit-to-stand endurance
  < 12 reps   — Reduced endurance; increased fall risk concern

MDC: ~2 reps`;

// ---------------------------------------------------------------------------
// Goal templates
// ---------------------------------------------------------------------------
function buildTugGoals(time, stgWeeks, ltgWeeks) {
  let stgTarget, ltgTarget, stgFunction, ltgFunction;

  if (time >= 30) {
    stgTarget = 20;
    ltgTarget = 12;
    stgFunction = "improve basic transfer ability and reduce fall risk for supervised mobility";
    ltgFunction = "achieve independent transfer ability and safe household ambulation with reduced fall risk";
  } else if (time >= 20) {
    stgTarget = 15;
    ltgTarget = 10;
    stgFunction = "improve transfer efficiency and mobility to reduce fall risk";
    ltgFunction = "achieve independent mobility for household and basic community activities with reduced fall risk";
  } else if (time >= 12) {
    stgTarget = 10;
    ltgTarget = 9;
    stgFunction = "achieve normal mobility range and independent functional transfers";
    ltgFunction = "demonstrate independent, safe transfers and community-level mobility";
  } else {
    // Already < 10 — target maintenance and improvement
    stgTarget = parseFloat(Math.max(time - 1, 6).toFixed(1));
    ltgTarget = parseFloat(Math.max(time - 2, 6).toFixed(1));
    stgFunction = "maintain and improve mobility and fall risk profile";
    ltgFunction = "maintain independent, safe mobility across home and community environments";
  }

  const stg = `STG (${stgWeeks} weeks): Patient will improve TUG time from ${time.toFixed(2)} sec to ≤ ${stgTarget} sec in order to ${stgFunction}.`;
  const ltg = `LTG (${ltgWeeks} weeks): Patient will improve TUG time to ≤ ${ltgTarget} sec in order to ${ltgFunction}.`;
  return { stg, ltg };
}

function buildFxstsGoals(time, stgWeeks, ltgWeeks) {
  let stgTarget, ltgTarget, stgFunction, ltgFunction;

  if (time > 15) {
    stgTarget = 15;
    ltgTarget = 12;
    stgFunction = "reduce fall risk and improve functional lower-extremity strength for transfers";
    ltgFunction = "demonstrate adequate functional LE strength for safe independent transfers and community mobility";
  } else if (time > 12) {
    stgTarget = 12;
    ltgTarget = 11;
    stgFunction = "achieve normal 5xSTS performance and reduce fall risk";
    ltgFunction = "demonstrate functional LE strength for safe transfers and community-level activities";
  } else {
    stgTarget = parseFloat(Math.max(time - 1, 8).toFixed(1));
    ltgTarget = parseFloat(Math.max(time - 2, 7).toFixed(1));
    stgFunction = "maintain and improve functional lower-extremity performance";
    ltgFunction = "maintain functional LE strength for safe independent transfers and community ambulation";
  }

  const stg = `STG (${stgWeeks} weeks): Patient will improve 5xSTS time from ${time.toFixed(2)} sec to ≤ ${stgTarget} sec in order to ${stgFunction}.`;
  const ltg = `LTG (${ltgWeeks} weeks): Patient will improve 5xSTS time to ≤ ${ltgTarget} sec in order to ${ltgFunction}.`;
  return { stg, ltg };
}

function build30StsGoals(reps, stgWeeks, ltgWeeks) {
  let stgTarget, ltgTarget, stgFunction, ltgFunction;

  if (reps < 8) {
    stgTarget = 8;
    ltgTarget = 12;
    stgFunction = "improve basic sit-to-stand endurance for functional mobility and transfers";
    ltgFunction = "achieve functional sit-to-stand endurance for independent transfers and fall risk reduction";
  } else if (reps < 12) {
    stgTarget = 12;
    ltgTarget = 14;
    stgFunction = "achieve functional sit-to-stand endurance for safe independent transfers";
    ltgFunction = "demonstrate adequate LE endurance for independent home and community mobility";
  } else {
    stgTarget = reps + 2;
    ltgTarget = reps + 4;
    stgFunction = "improve sit-to-stand endurance for community-level activity tolerance";
    ltgFunction = "maintain and improve functional LE endurance for community-level activities";
  }

  const stg = `STG (${stgWeeks} weeks): Patient will improve 30-sec STS from ${Math.round(reps)} reps to ≥ ${stgTarget} reps in order to ${stgFunction}.`;
  const ltg = `LTG (${ltgWeeks} weeks): Patient will improve 30-sec STS to ≥ ${ltgTarget} reps in order to ${ltgFunction}.`;
  return { stg, ltg };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
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

      <div class="goal-timeframe-row">
        <div>
          <label for="balance-stg">STG timeframe (weeks)</label>
          <input id="balance-stg" type="number" step="1" min="1" value="4" />
        </div>
        <div>
          <label for="balance-ltg">LTG timeframe (weeks)</label>
          <input id="balance-ltg" type="number" step="1" min="1" value="8" />
        </div>
      </div>

      <button id="balance-calc" class="action-btn">Calculate</button>
    </div>

    <div id="balance-output" class="spacer-top"></div>
  `;

  const toolSelect = document.getElementById("balance-tool");
  const fields     = document.getElementById("balance-fields");
  const output     = document.getElementById("balance-output");

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
    const tool     = toolSelect.value;
    const stgWeeks = parseInt(document.getElementById("balance-stg").value, 10) || 4;
    const ltgWeeks = parseInt(document.getElementById("balance-ltg").value, 10) || 8;

    // ── TUG ──────────────────────────────────────────────────────────────
    if (tool === "tug") {
      const time = parseFloat(document.getElementById("balance-time").value);
      if (!time || time <= 0) {
        output.innerHTML = `<div class="result-box">Enter a valid time.</div>`;
        return;
      }

      let interpretation;
      if (time < 10)       interpretation = "Normal mobility range";
      else if (time < 20)  interpretation = "Mildly impaired mobility — mostly independent";
      else if (time < 30)  interpretation = "Moderately impaired mobility — may require assistance";
      else                 interpretation = "Severely impaired mobility — high fall risk concern";

      const { stg, ltg } = buildTugGoals(time, stgWeeks, ltgWeeks);

      const result = {
        summary: `TUG: ${time.toFixed(2)} sec\nInterpretation: ${interpretation}`,
        note: `Timed Up and Go completed in ${time.toFixed(2)} seconds, consistent with ${interpretation.toLowerCase()}.`,
        goals: `${stg}\n\n${ltg}`,
        normative: TUG_NORMATIVE,
        raw: `TUG time: ${time.toFixed(2)} sec\nSTG timeframe: ${stgWeeks} weeks\nLTG timeframe: ${ltgWeeks} weeks`,
        explanation: `TUG measures time to rise from a chair, walk 3 m, turn, return, and sit. Norms from Podsiadlo & Richardson. Longer times correlate with greater fall risk and mobility limitation. MDC ~2.9 sec; MCID ~1.4 sec.`,
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    // ── 5xSTS ─────────────────────────────────────────────────────────────
    if (tool === "5xsts") {
      const time = parseFloat(document.getElementById("balance-time").value);
      if (!time || time <= 0) {
        output.innerHTML = `<div class="result-box">Enter a valid time.</div>`;
        return;
      }

      const interpretation = time <= 12
        ? "Better functional lower-extremity performance"
        : "Reduced LE performance — possible fall risk concern";

      const { stg, ltg } = buildFxstsGoals(time, stgWeeks, ltgWeeks);

      const result = {
        summary: `5xSTS: ${time.toFixed(2)} sec\nInterpretation: ${interpretation}`,
        note: `Five Times Sit to Stand completed in ${time.toFixed(2)} seconds, indicating ${interpretation.toLowerCase()}.`,
        goals: `${stg}\n\n${ltg}`,
        normative: FXSTS_NORMATIVE,
        raw: `5xSTS time: ${time.toFixed(2)} sec\nSTG timeframe: ${stgWeeks} weeks\nLTG timeframe: ${ltgWeeks} weeks`,
        explanation: `5xSTS measures time to complete five sit-to-stand cycles without arm use. Reflects functional LE strength and transfer efficiency. Normative values from Bohannon 2006. MDC ~2.4 sec; MCID ~2.0 sec.`,
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    // ── 30sSTS ────────────────────────────────────────────────────────────
    const reps = parseFloat(document.getElementById("sts-reps").value);
    if (!reps || reps <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid repetitions.</div>`;
      return;
    }

    const interpretation = reps >= 12
      ? "Better functional sit-to-stand endurance"
      : "Reduced sit-to-stand endurance / strength";

    const { stg, ltg } = build30StsGoals(reps, stgWeeks, ltgWeeks);

    const result = {
      summary: `30sSTS: ${Math.round(reps)} reps\nInterpretation: ${interpretation}`,
      note: `Patient completed ${Math.round(reps)} repetitions on the 30-Second Sit to Stand test, indicating ${interpretation.toLowerCase()}.`,
      goals: `${stg}\n\n${ltg}`,
      normative: STS30_NORMATIVE,
      raw: `30sSTS reps: ${Math.round(reps)}\nSTG timeframe: ${stgWeeks} weeks\nLTG timeframe: ${ltgWeeks} weeks`,
      explanation: `30sSTS counts the number of full sit-to-stand cycles in 30 seconds. Reflects LE endurance and functional strength. Normative values from Jones et al. 1999. General clinical threshold is ≥ 12 reps; MDC ~2 reps.`,
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
