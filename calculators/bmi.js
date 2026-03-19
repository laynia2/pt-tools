import { renderResultSections, wireCopyButtons } from "../helpers.js";

export function renderBMI(container) {
  container.innerHTML = `
    <h2 class="tool-title">BMI Calculator</h2>
    <p class="tool-subtitle">Imperial or metric BMI with quick interpretation.</p>

    <div class="form-grid">
      <div>
        <label for="bmi-unit">Units</label>
        <select id="bmi-unit">
          <option value="imperial">Imperial (lb, in)</option>
          <option value="metric">Metric (kg, cm)</option>
        </select>
      </div>

      <div>
        <label for="bmi-weight">Weight</label>
        <input id="bmi-weight" type="number" step="0.1" />
      </div>

      <div>
        <label for="bmi-height">Height</label>
        <input id="bmi-height" type="number" step="0.1" />
      </div>

      <button id="bmi-calc" class="action-btn">Calculate BMI</button>
    </div>

    <div id="bmi-output" class="spacer-top"></div>
  `;

  const unitSelect = document.getElementById("bmi-unit");
  const weightInput = document.getElementById("bmi-weight");
  const heightInput = document.getElementById("bmi-height");
  const output = document.getElementById("bmi-output");

  function getCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obesity";
  }

  function getExplanation(bmi) {
    if (bmi < 18.5) return "BMI is below the typical healthy range.";
    if (bmi < 25) return "BMI is within the typical healthy range.";
    if (bmi < 30) return "BMI is above the typical healthy range.";
    return "BMI is in the obesity range and may indicate increased health risk.";
  }

  function updatePlaceholders() {
    if (unitSelect.value === "imperial") {
      weightInput.placeholder = "Weight in lb";
      heightInput.placeholder = "Height in inches";
    } else {
      weightInput.placeholder = "Weight in kg";
      heightInput.placeholder = "Height in cm";
    }
  }

  updatePlaceholders();
  unitSelect.addEventListener("change", updatePlaceholders);

  document.getElementById("bmi-calc").addEventListener("click", () => {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);

    if (!weight || !height || weight <= 0 || height <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid positive values.</div>`;
      return;
    }

    let bmi;
    let rawHeight;

    if (unitSelect.value === "imperial") {
      bmi = (weight / (height * height)) * 703;
      rawHeight = `${height.toFixed(1)} in`;
    } else {
      const heightMeters = height / 100;
      bmi = weight / (heightMeters * heightMeters);
      rawHeight = `${height.toFixed(1)} cm`;
    }

    const category = getCategory(bmi);

    const result = {
      summary: `BMI: ${bmi.toFixed(1)}\nCategory: ${category}`,
      explanation: getExplanation(bmi),
      note: `BMI measured at ${bmi.toFixed(1)} (${category}).`,
      raw: `Units: ${unitSelect.value}\nWeight: ${weight.toFixed(1)}\nHeight: ${rawHeight}`
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
