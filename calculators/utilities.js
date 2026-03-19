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
        </select>
      </div>

      <div>
        <label for="conv-value">Value</label>
        <input id="conv-value" type="number" step="0.01" />
      </div>

      <button id="conv-calc" class="action-btn">Convert</button>
    </div>

    <div id="conv-result" class="result-box">Enter a value and convert.</div>
  `;

  const resultBox = document.getElementById("conv-result");

  const converters = {
    kgToLb: {
      label: "kg to lb",
      convert: (v) => v * 2.20462,
      unit: "lb",
    },
    lbToKg: {
      label: "lb to kg",
      convert: (v) => v / 2.20462,
      unit: "kg",
    },
    mToFt: {
      label: "m to ft",
      convert: (v) => v * 3.28084,
      unit: "ft",
    },
    ftToM: {
      label: "ft to m",
      convert: (v) => v / 3.28084,
      unit: "m",
    },
    cmToIn: {
      label: "cm to in",
      convert: (v) => v / 2.54,
      unit: "in",
    },
    inToCm: {
      label: "in to cm",
      convert: (v) => v * 2.54,
      unit: "cm",
    },
  };

  document.getElementById("conv-calc").addEventListener("click", () => {
    const type = document.getElementById("conv-type").value;
    const value = parseFloat(document.getElementById("conv-value").value);

    if (!value && value !== 0) {
      resultBox.textContent = "Enter a valid number.";
      return;
    }

    const converter = converters[type];
    const converted = converter.convert(value);

    resultBox.textContent =
`${converter.label}
Input: ${value}
Output: ${converted.toFixed(2)} ${converter.unit}`;
  });
}
