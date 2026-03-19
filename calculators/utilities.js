import { renderResultSections, wireCopyButtons } from "../helpers.js";

export function renderUtilities(container) {
  container.innerHTML = `
    <h2 class="tool-title">Utilities</h2>
    <p class="tool-subtitle">Common unit conversions for clinic use.</p>

    <div class="form-grid">
      <div>
        <label for="conv-type">Conversion Type</label>
        <select id="conv-type">
          <option value="kgToLb">kg to lb</option>
          <option value="lbToKg">lb to kg</option>
          <option value="mToFt">m to ft</option>
          <option value="ftToM">ft to m</option>
          <option value="cmToIn">cm to in</option>
          <option value="inToCm">in to cm</option>
          <option value="mpsToMph">m/s to mph</option>
          <option value="mphToMps">mph to m/s</option>
          <option value="bodyWeightPct">body weight % to load</option>
        </select>
      </div>

      <div>
        <label for="conv-value">Value</label>
        <input id="conv-value" type="number" step="0.01" />
      </div>

      <div id="conv-extra-wrap" style="display:none;">
        <label for="conv-extra">Body weight</label>
        <input id="conv-extra" type="number" step="0.01" />
      </div>

      <button id="conv-calc" class="action-btn">Convert</button>
    </div>

    <div id="conv-output" class="spacer-top"></div>
  `;

  const output = document.getElementById("conv-output");
  const typeSelect = document.getElementById("conv-type");
  const extraWrap = document.getElementById("conv-extra-wrap");

  const converters = {
    kgToLb: { label: "kg to lb", convert: (v) => v * 2.20462, unit: "lb" },
    lbToKg: { label: "lb to kg", convert: (v) => v / 2.20462, unit: "kg" },
    mToFt: { label: "m to ft", convert: (v) => v * 3.28084, unit: "ft" },
    ftToM: { label: "ft to m", convert: (v) => v / 3.28084, unit: "m" },
    cmToIn: { label: "cm to in", convert: (v) => v / 2.54, unit: "in" },
    inToCm: { label: "in to cm", convert: (v) => v * 2.54, unit: "cm" },
    mpsToMph: { label: "m/s to mph", convert: (v) => v * 2.23694, unit: "mph" },
    mphToMps: { label: "mph to m/s", convert: (v) => v / 2.23694, unit: "m/s" },
  };

  function updateExtraField() {
    extraWrap.style.display = typeSelect.value === "bodyWeightPct" ? "block" : "none";
  }

  updateExtraField();
  typeSelect.addEventListener("change", updateExtraField);

  document.getElementById("conv-calc").addEventListener("click", () => {
    const type = typeSelect.value;
    const value = parseFloat(document.getElementById("conv-value").value);
    const extra = parseFloat(document.getElementById("conv-extra").value);

    if (type === "bodyWeightPct") {
      if (isNaN(value) || isNaN(extra) || extra <= 0) {
        output.innerHTML = `<div class="result-box">Enter valid values.</div>`;
        return;
      }

      const load = extra * (value / 100);

      const result = {
        summary: `${value.toFixed(1)}% of body weight = ${load.toFixed(2)} lb`,
        explanation: `Converts a selected percentage of body weight into actual load.`,
        note: `Target load at ${value.toFixed(1)}% body weight equals ${load.toFixed(2)} lb for body weight of ${extra.toFixed(1)} lb.`,
        raw: `Body weight: ${extra.toFixed(1)} lb\nPercent: ${value.toFixed(1)}%\nLoad: ${load.toFixed(2)} lb`
      };

      output.innerHTML = renderResultSections(result);
      wireCopyButtons(output, result);
      return;
    }

    if (isNaN(value)) {
      output.innerHTML = `<div class="result-box">Enter a valid number.</div>`;
      return;
    }

    const converter = converters[type];
    const converted = converter.convert(value);

    const result = {
      summary: `Output: ${converted.toFixed(2)} ${converter.unit}`,
      explanation: `Converts ${converter.label}.`,
      note: `${converter.label} conversion: ${value} → ${converted.toFixed(2)} ${converter.unit}.`,
      raw: `Conversion: ${converter.label}\nInput: ${value}\nOutput: ${converted.toFixed(2)} ${converter.unit}`
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
