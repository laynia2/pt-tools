import { renderResultSections, wireCopyButtons } from "../helpers.js";

export function renderBilling(container) {
  container.innerHTML = `
    <h2 class="tool-title">Billing / Timed Units</h2>
    <p class="tool-subtitle">CMS 8-minute rule or simple 15-minute-per-unit method for timed CPT codes.</p>

    <div class="form-grid">
      <div>
        <label for="billing-rule">Billing Rule</label>
        <select id="billing-rule">
          <option value="cms">CMS 8-Minute Rule</option>
          <option value="spm">Straight 15-Minute Rule</option>
        </select>
      </div>
    </div>

    <div class="spacer-top">
      <h3 class="section-title">Timed CPT Codes</h3>
      <p class="small-note">Enter only timed treatment minutes. Leave unused rows blank.</p>
    </div>

    <div class="form-grid" id="billing-rows">
      ${Array.from({ length: 6 }, (_, i) => `
        <div>
          <label for="code-${i}">Code ${i + 1}</label>
          <input id="code-${i}" type="text" placeholder="e.g. 97110" />
        </div>
        <div>
          <label for="minutes-${i}">Minutes ${i + 1}</label>
          <input id="minutes-${i}" type="number" step="1" min="0" placeholder="e.g. 15" />
        </div>
      `).join("")}
    </div>

    <button id="billing-calc" class="action-btn">Calculate Units</button>

    <div id="billing-output" class="spacer-top"></div>
  `;

  const output = document.getElementById("billing-output");

  function cmsTotalUnits(totalMinutes) {
    if (totalMinutes < 8) return 0;
    return Math.floor((totalMinutes - 8) / 15) + 1;
  }

  function spmTotalUnits(totalMinutes) {
    return Math.floor(totalMinutes / 15);
  }

  function allocateUnits(services, totalUnits) {
    const sorted = [...services].sort((a, b) => b.minutes - a.minutes);
    let unitsRemaining = totalUnits;
    const allocations = [];

    for (const service of sorted) {
      let units = 0;

      while (unitsRemaining > 0 && service.minutes >= ((units + 1) * 15) - 7) {
        units += 1;
        unitsRemaining -= 1;
      }

      allocations.push({
        code: service.code,
        minutes: service.minutes,
        units
      });
    }

    if (unitsRemaining > 0) {
      for (const service of allocations) {
        if (unitsRemaining <= 0) break;
        service.units += 1;
        unitsRemaining -= 1;
      }
    }

    return allocations.filter((item) => item.units > 0);
  }

  function formatBilledLine(allocations) {
    if (!allocations.length) return "No billable timed units.";
    return allocations.map((item) => `${item.code} x${item.units}`).join(", ");
  }

  document.getElementById("billing-calc").addEventListener("click", () => {
    const rule = document.getElementById("billing-rule").value;

    const services = [];

    for (let i = 0; i < 6; i += 1) {
      const code = document.getElementById(`code-${i}`).value.trim();
      const minutesRaw = document.getElementById(`minutes-${i}`).value.trim();

      if (!code && !minutesRaw) continue;

      const minutes = parseFloat(minutesRaw);

      if (!code || Number.isNaN(minutes) || minutes < 0) {
        output.innerHTML = `<div class="result-box">Each used row needs both a CPT code and valid minutes.</div>`;
        return;
      }

      if (minutes === 0) continue;

      services.push({ code, minutes });
    }

    if (!services.length) {
      output.innerHTML = `<div class="result-box">Enter at least one timed CPT code and minutes.</div>`;
      return;
    }

    const totalMinutes = services.reduce((sum, item) => sum + item.minutes, 0);
    const totalUnits = rule === "cms"
      ? cmsTotalUnits(totalMinutes)
      : spmTotalUnits(totalMinutes);

    const remainingMinutes = rule === "cms"
      ? (totalMinutes < 8 ? totalMinutes : totalMinutes - (totalUnits * 15))
      : totalMinutes - (totalUnits * 15);

    const allocations = allocateUnits(services, totalUnits);
    const billedLine = formatBilledLine(allocations);

    const noteLine = totalUnits > 0
      ? `Total timed service time: ${totalMinutes} min. Billed: ${billedLine} = ${totalUnits} units.`
      : `Total timed service time: ${totalMinutes} min. No billable timed units.`

    const rawLines = [
      `Rule: ${rule === "cms" ? "CMS 8-Minute Rule" : "Straight 15-Minute Rule"}`,
      `Total timed minutes: ${totalMinutes}`,
      `Total billable units: ${totalUnits}`,
      `Remaining minutes: ${remainingMinutes}`
    ];

    services.forEach((item) => {
      rawLines.push(`${item.code}: ${item.minutes} min`);
    });

    if (allocations.length) {
      rawLines.push("");
      rawLines.push("Allocated Units:");
      allocations.forEach((item) => {
        rawLines.push(`${item.code}: ${item.units} unit(s)`);
      });
    }

    const result = {
      summary: `Total timed minutes: ${totalMinutes}\nTotal billable units: ${totalUnits}\nRemaining minutes: ${remainingMinutes}`,
      explanation: rule === "cms"
        ? "Uses the CMS 8-minute rule on total timed minutes, then distributes units across the entered timed CPT codes."
        : "Uses a simple 15-minutes-per-unit method on total timed minutes, then distributes units across the entered timed CPT codes.",
      note: noteLine,
      raw: rawLines.join("\n")
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
