import { renderResultSections, wireCopyButtons } from "../helpers.js";

const CPT_OPTIONS = [
  {
    code: "97110",
    shortName: "Ther-Ex",
    fullName: "Therapeutic Exercise",
    description: "Therapeutic exercises to develop strength, endurance, range of motion, and flexibility."
  },
  {
    code: "97112",
    shortName: "Neuro Re-Ed",
    fullName: "Neuromuscular Re-Education",
    description: "Movement, balance, coordination, kinesthetic sense, posture, and proprioception training."
  },
  {
    code: "97113",
    shortName: "Aquatic Therapy",
    fullName: "Aquatic Therapy / Aquatic Therapeutic Exercise",
    description: "Therapeutic procedures performed in water to improve function, mobility, strength, or tolerance."
  },
  {
    code: "97116",
    shortName: "Gait Training",
    fullName: "Gait Training Therapy",
    description: "Training in walking and related functional ambulation tasks."
  },
  {
    code: "97140",
    shortName: "Manual Therapy",
    fullName: "Manual Therapy Techniques",
    description: "Manual therapy including mobilization, manipulation, manual lymphatic drainage, or traction."
  },
  {
    code: "97535",
    shortName: "Self Management",
    fullName: "Self-Care / Home Management Training",
    description: "Training in self-care, home management, activities of daily living, and compensatory strategies."
  },
  {
    code: "97530",
    shortName: "Therapeutic Activity",
    fullName: "Therapeutic Activities",
    description: "Dynamic activities to improve functional performance."
  },
  {
    code: "97035",
    shortName: "Ultrasound",
    fullName: "Ultrasound Therapy",
    description: "Application of ultrasound modality."
  }
];

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
      <p class="small-note">Select a code and enter minutes. Leave unused rows blank.</p>
    </div>

    <div class="form-grid" id="billing-rows">
      ${Array.from({ length: 6 }, (_, i) => `
        <div>
          <label for="code-${i}">Code ${i + 1}</label>
          <select id="code-${i}">
            <option value="">Select CPT code</option>
            ${CPT_OPTIONS.map(
              (item) =>
                `<option value="${item.code}">${item.code} — ${item.shortName}</option>`
            ).join("")}
          </select>
        </div>
        <div>
          <label for="minutes-${i}">Minutes ${i + 1}</label>
          <input id="minutes-${i}" type="number" step="1" min="0" placeholder="e.g. 15" />
        </div>
      `).join("")}
    </div>

    <button id="billing-calc" class="action-btn">Calculate Units</button>

    <div class="spacer-top">
      <h3 class="section-title">CPT Code Reference</h3>
      <p class="small-note">Tap a button to copy the code title and description.</p>
      <div id="billing-reference" class="copy-btn-row"></div>
    </div>

    <div id="billing-output" class="spacer-top"></div>
  `;

  const output = document.getElementById("billing-output");
  const reference = document.getElementById("billing-reference");

  renderReferenceButtons(reference);

  function cmsTotalUnits(totalMinutes) {
    if (totalMinutes < 8) return 0;
    return Math.floor((totalMinutes - 8) / 15) + 1;
  }

  function spmTotalUnits(totalMinutes) {
    return Math.floor(totalMinutes / 15);
  }

  function maxUnitsForMinutes(minutes, rule) {
    if (rule === "spm") {
      return Math.floor(minutes / 15);
    }

    if (minutes < 8) return 0;
    return Math.floor((minutes - 8) / 15) + 1;
  }

  function allocateUnits(services, totalUnits, rule) {
    const allocations = services.map((service) => ({
      ...service,
      units: 0,
      maxUnits: maxUnitsForMinutes(service.minutes, rule)
    }));

    let unitsRemaining = totalUnits;

    while (unitsRemaining > 0) {
      let bestIndex = -1;
      let bestRemainder = -1;

      allocations.forEach((service, index) => {
        if (service.units >= service.maxUnits) return;

        const remainder = service.minutes - service.units * 15;
        if (remainder > bestRemainder) {
          bestRemainder = remainder;
          bestIndex = index;
        }
      });

      if (bestIndex === -1) break;

      allocations[bestIndex].units += 1;
      unitsRemaining -= 1;
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
      const code = document.getElementById(`code-${i}`).value;
      const minutesRaw = document.getElementById(`minutes-${i}`).value.trim();

      if (!code && !minutesRaw) continue;

      const minutes = parseFloat(minutesRaw);

      if (!code || Number.isNaN(minutes) || minutes < 0) {
        output.innerHTML = `<div class="result-box">Each used row needs both a CPT code and valid minutes.</div>`;
        return;
      }

      if (minutes === 0) continue;

      const codeInfo = CPT_OPTIONS.find((item) => item.code === code);

      services.push({
        code,
        minutes,
        shortName: codeInfo?.shortName || "",
        fullName: codeInfo?.fullName || ""
      });
    }

    if (!services.length) {
      output.innerHTML = `<div class="result-box">Enter at least one timed CPT code and minutes.</div>`;
      return;
    }

    const totalMinutes = services.reduce((sum, item) => sum + item.minutes, 0);
    const totalUnits =
      rule === "cms" ? cmsTotalUnits(totalMinutes) : spmTotalUnits(totalMinutes);

    const remainingMinutes =
      totalUnits > 0 ? totalMinutes - totalUnits * 15 : totalMinutes;

    const allocations = allocateUnits(services, totalUnits, rule);
    const billedLine = formatBilledLine(allocations);

    const noteLine =
      totalUnits > 0
        ? `Total timed service time: ${totalMinutes} min. Billed: ${billedLine} = ${totalUnits} units.`
        : `Total timed service time: ${totalMinutes} min. No billable timed units.`;

    const rawLines = [
      `Rule: ${rule === "cms" ? "CMS 8-Minute Rule" : "Straight 15-Minute Rule"}`,
      `Total timed minutes: ${totalMinutes}`,
      `Total billable units: ${totalUnits}`,
      `Remaining minutes: ${remainingMinutes}`
    ];

    services.forEach((item) => {
      rawLines.push(`${item.code} — ${item.shortName}: ${item.minutes} min`);
    });

    if (allocations.length) {
      rawLines.push("");
      rawLines.push("Allocated Units:");
      allocations.forEach((item) => {
        rawLines.push(`${item.code} — ${item.shortName}: ${item.units} unit(s)`);
      });
    }

    const result = {
      summary: `Total timed minutes: ${totalMinutes}\nTotal billable units: ${totalUnits}\nRemaining minutes: ${remainingMinutes}`,
      explanation:
        rule === "cms"
          ? "Uses the CMS 8-minute rule on total timed minutes, then distributes units across the entered timed CPT codes."
          : "Uses a simple 15-minutes-per-unit method on total timed minutes, then distributes units across the entered timed CPT codes.",
      note: noteLine,
      raw: rawLines.join("\n")
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}

function renderReferenceButtons(container) {
  container.innerHTML = CPT_OPTIONS.map(
    (item) => `
      <button class="secondary-btn billing-ref-btn" data-code="${item.code}">
        ${item.code} — ${item.shortName}
      </button>
    `
  ).join("");

  container.querySelectorAll(".billing-ref-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const item = CPT_OPTIONS.find((entry) => entry.code === btn.dataset.code);
      if (!item) return;

      const text = `${item.code} ${item.fullName}\n${item.description}`;

      try {
        await navigator.clipboard.writeText(text);
        const oldText = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = oldText;
        }, 1000);
      } catch {
        // do nothing
      }
    });
  });
}
