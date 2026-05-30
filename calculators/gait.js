import { renderResultSections, wireCopyButtons } from "../helpers.js";

// ---------------------------------------------------------------------------
// Normative reference data
// ---------------------------------------------------------------------------
const GAIT_NORMATIVE = `Ambulation tiers (Middleton et al.)
  < 0.40 m/s  — Household ambulation
  0.40–0.79 m/s — Limited community ambulation
  ≥ 0.80 m/s  — Community ambulation

Key benchmarks
  < 0.70 m/s  — Increased fall / safety risk
  ≥ 0.80 m/s  — Minimum for basic community ambulation
  ≥ 1.00 m/s  — Associated with better health outcomes in older adults
  ≥ 1.20 m/s  — Typical street-crossing speed (MUTCD standard)
  ≥ 1.40 m/s  — Typical for healthy community-dwelling adults

Minimum Detectable Change (MDC): ~0.10 m/s
Minimal Clinically Important Difference (MCID): ~0.10 m/s`;

// ---------------------------------------------------------------------------
// Goal templates
// ---------------------------------------------------------------------------
// Returns { stg, ltg } strings given the measured speed, STG weeks, LTG weeks.
// Targets the next meaningful tier if below community; otherwise targets crosswalk.
function buildGaitGoals(speedMps, stgWeeks, ltgWeeks) {
  let stgTarget, ltgTarget, stgFunction, ltgFunction;

  if (speedMps < 0.40) {
    // Household → target limited community
    stgTarget = 0.40;
    ltgTarget = 0.60;
    stgFunction = "ambulate safely within the home environment";
    ltgFunction = "ambulate in limited community settings such as medical appointments";
  } else if (speedMps < 0.70) {
    // Low limited community → target safety threshold, then community
    stgTarget = 0.70;
    ltgTarget = 0.80;
    stgFunction = "reduce fall risk and ambulate safely within the home and immediate community";
    ltgFunction = "ambulate in community settings including stores and medical facilities";
  } else if (speedMps < 0.80) {
    // High limited community → target community threshold
    stgTarget = 0.80;
    ltgTarget = 1.00;
    stgFunction = "achieve community-level ambulation for errands and medical appointments";
    ltgFunction = "ambulate in community settings with improved endurance and safety";
  } else if (speedMps < 1.20) {
    // Community but below crosswalk — target crosswalk benchmark
    stgTarget = parseFloat((speedMps + 0.10).toFixed(2));
    ltgTarget = 1.20;
    stgFunction = "improve community ambulation speed and endurance";
    ltgFunction = "safely cross intersections and navigate parking lots and community environments";
  } else {
    // Already at or above 1.20 — maintain and refine
    stgTarget = parseFloat((speedMps + 0.05).toFixed(2));
    ltgTarget = parseFloat((speedMps + 0.10).toFixed(2));
    stgFunction = "maintain and improve community ambulation speed";
    ltgFunction = "maintain safe, independent community ambulation across all environments";
  }

  const stg = `STG (${stgWeeks} weeks): Patient will improve gait speed from ${speedMps.toFixed(2)} m/s to ≥${stgTarget.toFixed(2)} m/s as measured by ${speedMps < 0.70 ? "10-meter walk test or similar timed walk" : "timed walk assessment"} in order to ${stgFunction}.`;

  const ltg = `LTG (${ltgWeeks} weeks): Patient will improve gait speed to ≥${ltgTarget.toFixed(2)} m/s as measured by timed walk assessment in order to ${ltgFunction}.`;

  return { stg, ltg };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
export function renderGait(container) {
  container.innerHTML = `
    <h2 class="tool-title">Gait Speed</h2>
    <p class="tool-subtitle">Timed walking distance in feet and time in seconds.</p>

    <div class="form-grid">
      <div>
        <label for="gait-distance">Distance (ft)</label>
        <input id="gait-distance" type="number" step="0.1" value="50" />
      </div>

      <div>
        <label for="gait-time">Time (sec)</label>
        <input id="gait-time" type="number" step="0.01" />
      </div>

      <div class="goal-timeframe-row">
        <div>
          <label for="gait-stg">STG timeframe (weeks)</label>
          <input id="gait-stg" type="number" step="1" min="1" value="4" />
        </div>
        <div>
          <label for="gait-ltg">LTG timeframe (weeks)</label>
          <input id="gait-ltg" type="number" step="1" min="1" value="8" />
        </div>
      </div>

      <button id="gait-calc" class="action-btn">Calculate Gait Speed</button>
    </div>

    <div id="gait-output" class="spacer-top"></div>
  `;

  const output = document.getElementById("gait-output");

  function interpretSpeed(speedMps) {
    let level;
    if (speedMps < 0.40) {
      level = "Household ambulation range";
    } else if (speedMps < 0.80) {
      level = "Limited community ambulation range";
    } else {
      level = "Community ambulation range";
    }

    const risk =
      speedMps < 0.70
        ? "Below 0.70 m/s — may indicate increased fall and safety risk."
        : "At or above 0.70 m/s fall-risk threshold.";

    const crosswalk =
      speedMps >= 1.20
        ? "Meets the 1.20 m/s street-crossing benchmark (MUTCD)."
        : `Below the 1.20 m/s street-crossing benchmark — needs +${(1.20 - speedMps).toFixed(2)} m/s.`;

    return { level, risk, crosswalk };
  }

  document.getElementById("gait-calc").addEventListener("click", () => {
    const distanceFt = parseFloat(document.getElementById("gait-distance").value);
    const timeSec    = parseFloat(document.getElementById("gait-time").value);
    const stgWeeks   = parseInt(document.getElementById("gait-stg").value, 10) || 4;
    const ltgWeeks   = parseInt(document.getElementById("gait-ltg").value, 10) || 8;

    if (!distanceFt || !timeSec || distanceFt <= 0 || timeSec <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid positive values.</div>`;
      return;
    }

    const speedFtPerSec = distanceFt / timeSec;
    const speedMps = (distanceFt * 0.3048) / timeSec;
    const interp = interpretSpeed(speedMps);
    const { stg, ltg } = buildGaitGoals(speedMps, stgWeeks, ltgWeeks);

    const result = {
      summary: `Speed: ${speedMps.toFixed(2)} m/s  (${speedFtPerSec.toFixed(2)} ft/s)\nLevel: ${interp.level}\n${interp.risk}`,

      note: `Gait speed assessed over ${distanceFt.toFixed(0)} ft in ${timeSec.toFixed(2)} sec. Speed = ${speedMps.toFixed(2)} m/s (${speedFtPerSec.toFixed(2)} ft/s), consistent with ${interp.level.toLowerCase()}. ${interp.risk} ${interp.crosswalk}`,

      goals: `${stg}\n\n${ltg}`,

      normative: GAIT_NORMATIVE,

      raw: `Distance: ${distanceFt.toFixed(1)} ft\nTime: ${timeSec.toFixed(2)} sec\nSpeed: ${speedFtPerSec.toFixed(2)} ft/s\nSpeed: ${speedMps.toFixed(2)} m/s\nSTG timeframe: ${stgWeeks} weeks\nLTG timeframe: ${ltgWeeks} weeks`,

      explanation: `Gait speed is calculated as distance ÷ time. Converted to m/s using 1 ft = 0.3048 m. Ambulation tiers adapted from Middleton et al. The 0.70 m/s threshold reflects fall-risk literature; the 1.20 m/s threshold reflects MUTCD pedestrian crossing standards. MDC and MCID are approximately 0.10 m/s.`,
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
