import { renderResultSections, wireCopyButtons } from "../helpers.js";

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

      <button id="gait-calc" class="action-btn">Calculate Gait Speed</button>
    </div>

    <div id="gait-output" class="spacer-top"></div>
  `;

  const output = document.getElementById("gait-output");

  function interpretSpeed(speedMps) {
    let level = "";
    if (speedMps < 0.4) {
      level = "Household ambulation range";
    } else if (speedMps < 0.8) {
      level = "Limited community ambulation range";
    } else {
      level = "Community ambulation range";
    }

    const risk =
      speedMps < 0.7
        ? "Below 0.7 m/s, which may indicate increased mobility and safety concern."
        : "At or above 0.7 m/s.";

    const crosswalk =
      speedMps >= 1.2
        ? "Meets the typical 1.2 m/s street-crossing benchmark."
        : `Below the typical 1.2 m/s street-crossing benchmark; needs +${(1.2 - speedMps).toFixed(2)} m/s.`;

    return { level, risk, crosswalk };
  }

  document.getElementById("gait-calc").addEventListener("click", () => {
    const distanceFt = parseFloat(document.getElementById("gait-distance").value);
    const timeSec = parseFloat(document.getElementById("gait-time").value);

    if (!distanceFt || !timeSec || distanceFt <= 0 || timeSec <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid positive values.</div>`;
      return;
    }

    const speedFtPerSec = distanceFt / timeSec;
    const speedMps = (distanceFt * 0.3048) / timeSec;
    const interpretation = interpretSpeed(speedMps);

    const result = {
      summary: `Speed: ${speedFtPerSec.toFixed(2)} ft/s\nSpeed: ${speedMps.toFixed(2)} m/s\nLevel: ${interpretation.level}`,
      explanation: `${interpretation.risk}\n${interpretation.crosswalk}`,
      note: `Patient demonstrated gait speed of ${speedMps.toFixed(2)} m/s (${speedFtPerSec.toFixed(2)} ft/s) over ${distanceFt.toFixed(1)} ft in ${timeSec.toFixed(2)} seconds. This falls in the ${interpretation.level.toLowerCase()} and ${speedMps >= 1.2 ? "meets" : "does not meet"} the typical street-crossing benchmark of 1.2 m/s.`,
      raw: `Distance: ${distanceFt.toFixed(1)} ft\nTime: ${timeSec.toFixed(2)} sec\nSpeed: ${speedFtPerSec.toFixed(2)} ft/s\nSpeed: ${speedMps.toFixed(2)} m/s`
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
