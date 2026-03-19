import { renderResultSections, wireCopyButtons } from "../helpers.js";

export function renderCardio(container) {
  container.innerHTML = `
    <h2 class="tool-title">Heart Rate Zones</h2>
    <p class="tool-subtitle">Multiple HR max equations plus 85% cutoff. Resting HR is optional for Karvonen.</p>

    <div class="form-grid">
      <div>
        <label for="hr-age">Age</label>
        <input id="hr-age" type="number" step="1" />
      </div>

      <div>
        <label for="hr-resting">Resting HR (optional)</label>
        <input id="hr-resting" type="number" step="1" />
      </div>

      <button id="hr-calc" class="action-btn">Calculate HR Zones</button>
    </div>

    <div id="hr-output" class="spacer-top"></div>
  `;

  const output = document.getElementById("hr-output");

  const formulas = {
    "Fox (220-age)": (age) => 220 - age,
    "Tanaka": (age) => 208 - (0.7 * age),
    "Nes": (age) => 211 - (0.64 * age),
    "Gellish": (age) => 207 - (0.7 * age),
    "Gulati": (age) => 206 - (0.88 * age),
  };

  function zoneRangePercent(hrMax, low, high) {
    return `${Math.round(hrMax * low)}-${Math.round(hrMax * high)}`;
  }

  function zoneRangeHrr(hrMax, resting, low, high) {
    const reserve = hrMax - resting;
    return `${Math.round(resting + reserve * low)}-${Math.round(resting + reserve * high)}`;
  }

  document.getElementById("hr-calc").addEventListener("click", () => {
    const age = parseFloat(document.getElementById("hr-age").value);
    const restingValue = document.getElementById("hr-resting").value.trim();
    const restingHR = restingValue === "" ? null : parseFloat(restingValue);

    if (!age || age <= 0) {
      output.innerHTML = `<div class="result-box">Enter a valid age.</div>`;
      return;
    }

    if (restingHR !== null && (!restingHR || restingHR <= 0)) {
      output.innerHTML = `<div class="result-box">Enter a valid resting HR or leave it blank.</div>`;
      return;
    }

    const summaryLines = [];
    const rawLines = [`Age: ${age}`, `Resting HR: ${restingHR ?? "not entered"}`];

    for (const [name, fn] of Object.entries(formulas)) {
      const hrMax = fn(age);
      summaryLines.push(`${name}: HR max ${Math.round(hrMax)}, 85% cutoff ${Math.round(hrMax * 0.85)}`);
      rawLines.push(
        `${name} | Z1 ${zoneRangePercent(hrMax, 0.5, 0.6)} | Z2 ${zoneRangePercent(hrMax, 0.6, 0.7)} | Z3 ${zoneRangePercent(hrMax, 0.7, 0.8)} | Z4 ${zoneRangePercent(hrMax, 0.8, 0.9)} | Z5 ${zoneRangePercent(hrMax, 0.9, 1.0)}`
      );

      if (restingHR !== null) {
        rawLines.push(
          `${name} HRR | Z1 ${zoneRangeHrr(hrMax, restingHR, 0.5, 0.6)} | Z2 ${zoneRangeHrr(hrMax, restingHR, 0.6, 0.7)} | Z3 ${zoneRangeHrr(hrMax, restingHR, 0.7, 0.8)} | Z4 ${zoneRangeHrr(hrMax, restingHR, 0.8, 0.9)} | Z5 ${zoneRangeHrr(hrMax, restingHR, 0.9, 1.0)} | 85% ${Math.round(restingHR + (hrMax - restingHR) * 0.85)}`
        );
      }
    }

    const result = {
      summary: summaryLines.join("\n"),
      explanation: `Shows multiple predicted HR max equations with standard training zones. ${restingHR !== null ? "Karvonen / HRR zones are also included." : "Enter resting HR to also display Karvonen / HRR zones."}`,
      note: `Heart rate zones calculated using multiple age-predicted HR max equations${restingHR !== null ? " and Karvonen / HRR method" : ""}.`,
      raw: rawLines.join("\n")
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
