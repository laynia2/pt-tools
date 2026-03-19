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
      <button id="hr-copy" class="secondary-btn">Copy Result</button>
    </div>

    <div id="hr-result" class="result-box">Enter values and calculate.</div>
  `;

  const resultBox = document.getElementById("hr-result");

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
    const zLow = Math.round(resting + reserve * low);
    const zHigh = Math.round(resting + reserve * high);
    return `${zLow}-${zHigh}`;
  }

  function buildOutput(age, restingHR) {
    const lines = [];
    lines.push("Heart Rate Zones");
    lines.push(`Age: ${age}`);
    lines.push(`Resting HR: ${restingHR ? restingHR : "not entered"}`);
    lines.push("");

    lines.push("% Max HR Method");
    lines.push("-----------------------");

    for (const [name, fn] of Object.entries(formulas)) {
      const hrMax = fn(age);
      lines.push(name);
      lines.push(`HR Max: ${Math.round(hrMax)} bpm`);
      lines.push(`Z1 50-60%: ${zoneRangePercent(hrMax, 0.5, 0.6)}`);
      lines.push(`Z2 60-70%: ${zoneRangePercent(hrMax, 0.6, 0.7)}`);
      lines.push(`Z3 70-80%: ${zoneRangePercent(hrMax, 0.7, 0.8)}`);
      lines.push(`Z4 80-90%: ${zoneRangePercent(hrMax, 0.8, 0.9)}`);
      lines.push(`Z5 90-100%: ${zoneRangePercent(hrMax, 0.9, 1.0)}`);
      lines.push(`85% cutoff: ${Math.round(hrMax * 0.85)}`);
      lines.push("");
    }

    if (restingHR) {
      lines.push("Karvonen / HRR Method");
      lines.push("-----------------------");

      for (const [name, fn] of Object.entries(formulas)) {
        const hrMax = fn(age);
        lines.push(name);
        lines.push(`HR Max: ${Math.round(hrMax)} bpm`);
        lines.push(`Resting HR: ${Math.round(restingHR)} bpm`);
        lines.push(`Z1 50-60%: ${zoneRangeHrr(hrMax, restingHR, 0.5, 0.6)}`);
        lines.push(`Z2 60-70%: ${zoneRangeHrr(hrMax, restingHR, 0.6, 0.7)}`);
        lines.push(`Z3 70-80%: ${zoneRangeHrr(hrMax, restingHR, 0.7, 0.8)}`);
        lines.push(`Z4 80-90%: ${zoneRangeHrr(hrMax, restingHR, 0.8, 0.9)}`);
        lines.push(`Z5 90-100%: ${zoneRangeHrr(hrMax, restingHR, 0.9, 1.0)}`);
        const reserve85 = Math.round(restingHR + (hrMax - restingHR) * 0.85);
        lines.push(`85% cutoff: ${reserve85}`);
        lines.push("");
      }
    }

    return lines.join("\n").trim();
  }

  document.getElementById("hr-calc").addEventListener("click", () => {
    const age = parseFloat(document.getElementById("hr-age").value);
    const restingValue = document.getElementById("hr-resting").value.trim();
    const restingHR = restingValue === "" ? null : parseFloat(restingValue);

    if (!age || age <= 0) {
      resultBox.textContent = "Enter a valid age.";
      return;
    }

    if (restingHR !== null && (!restingHR || restingHR <= 0)) {
      resultBox.textContent = "Enter a valid resting HR or leave it blank.";
      return;
    }

    resultBox.textContent = buildOutput(age, restingHR);
  });

  document.getElementById("hr-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resultBox.textContent);
    } catch {
      // do nothing
    }
  });
}
