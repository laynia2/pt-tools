export function renderBMI(container) {
  container.innerHTML = `
    <h2 class="tool-title">BMI Calculator</h2>
    <p class="tool-subtitle">Imperial or metric BMI with category.</p>

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

    <div id="bmi-result" class="result-box">Enter values and calculate.</div>
  `;

  const unitSelect = document.getElementById("bmi-unit");
  const weightInput = document.getElementById("bmi-weight");
  const heightInput = document.getElementById("bmi-height");
  const result = document.getElementById("bmi-result");

  function getCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obesity";
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
      result.textContent = "Enter valid positive values.";
      return;
    }

    let bmi;

    if (unitSelect.value === "imperial") {
      bmi = (weight / (height * height)) * 703;
    } else {
      const heightMeters = height / 100;
      bmi = weight / (heightMeters * heightMeters);
    }

    result.textContent =
`BMI: ${bmi.toFixed(1)}
Category: ${getCategory(bmi)}`;
  });
}
