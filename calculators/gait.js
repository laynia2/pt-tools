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
      <button id="gait-copy" class="secondary-btn">Copy Result</button>
    </div>

    <div id="gait-result" class="result-box">Enter values and calculate.</div>
  `;

  const resultBox = document.getElementById("gait-result");

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
        ? "Below 0.7 m/s, which is a higher mobility/safety concern."
        : "At or above 0.7 m/s.";

    let crosswalk;
    if (speedMps >= 1.2) {
      crosswalk = "Meets the typical 1.2 m/s crossing benchmark.";
    } else {
      crosswalk = `Below the typical 1.2 m/s crossing benchmark. Needs +${(1.2 - speedMps).toFixed(2)} m/s.`;
    }

    return { level, risk, crosswalk };
  }

  function buildResultText(distanceFt, timeSec) {
    const speedFtPerSec = distanceFt / timeSec;
    const speedMps = (distanceFt * 0.3048) / timeSec;
    const interpretation = interpretSpeed(speedMps);

    return `Gait Speed
Distance: ${distanceFt.toFixed(1)} ft
Time: ${timeSec.toFixed(2)} sec

Speed: ${speedFtPerSec.toFixed(2)} ft/s
       ${speedMps.toFixed(2)} m/s

Interpretation
Level: ${interpretation.level}
Risk: ${interpretation.risk}
Crosswalk: ${interpretation.crosswalk}`;
  }

  document.getElementById("gait-calc").addEventListener("click", () => {
    const distanceFt = parseFloat(document.getElementById("gait-distance").value);
    const timeSec = parseFloat(document.getElementById("gait-time").value);

    if (!distanceFt || !timeSec || distanceFt <= 0 || timeSec <= 0) {
      resultBox.textContent = "Enter valid positive values.";
      return;
    }

    resultBox.textContent = buildResultText(distanceFt, timeSec);
  });

  document.getElementById("gait-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resultBox.textContent);
    } catch {
      // do nothing
    }
  });
}
