import { renderResultSections, wireCopyButtons } from "../helpers.js";

// ---------------------------------------------------------------------------
// Normative reference data
// ---------------------------------------------------------------------------
const BMI_NORMATIVE = `WHO BMI classification
  < 18.5        — Underweight
  18.5 – 24.9   — Normal weight
  25.0 – 29.9   — Overweight
  30.0 – 34.9   — Obesity class I
  35.0 – 39.9   — Obesity class II
  ≥ 40.0        — Obesity class III (severe)

PT clinical relevance
  BMI > 30      — Increased load on weight-bearing joints; may affect exercise tolerance
  BMI > 35      — Significantly elevated joint load; consider aquatic, seated, or supported exercise
  BMI < 18.5    — Underweight; may reflect malnutrition, reduced muscle mass, or other underlying condition

Note: BMI is a population-level screening tool. It does not account for body composition,
muscle mass, or distribution of adipose tissue. Use alongside clinical judgment.`;

// ---------------------------------------------------------------------------
// Goal templates
// ---------------------------------------------------------------------------
function buildBmiGoals(bmi, stgWeeks, ltgWeeks) {
  let stgTarget, ltgTarget, stgFunction, ltgFunction;

  if (bmi >= 40) {
    stgTarget = 37;
    ltgTarget = 35;
    stgFunction = "reduce joint load and improve exercise tolerance for participation in therapeutic activities";
    ltgFunction = "reduce joint load to improve functional mobility, activity tolerance, and participation in home exercise program";
  } else if (bmi >= 35) {
    stgTarget = 32;
    ltgTarget = 30;
    stgFunction = "reduce joint load and improve tolerance for weight-bearing therapeutic exercise";
    ltgFunction = "reduce joint load to improve functional mobility and tolerance for community-level activity";
  } else if (bmi >= 30) {
    stgTarget = 28;
    ltgTarget = 25;
    stgFunction = "reduce excess joint load and improve activity tolerance for daily functional tasks";
    ltgFunction = "achieve overweight BMI range to reduce joint load and improve functional mobility";
  } else if (bmi >= 25) {
    stgTarget = 24;
    ltgTarget = 23;
    stgFunction = "progress toward normal BMI range and improve activity tolerance for daily tasks";
    ltgFunction = "achieve and maintain normal BMI range to support functional mobility and reduce injury risk";
  } else {
    // Underweight
    stgTarget = 19;
    ltgTarget = 20;
    stgFunction = "achieve healthy weight range to support muscle function and activity tolerance";
    ltgFunction = "achieve and maintain normal BMI range to support strength, endurance, and safe participation in rehabilitation";
  }

  const direction = bmi >= 25 ? "reduce" : "increase";
  const stg = `STG (${stgWeeks} weeks): Patient will ${direction} BMI from ${bmi.toFixed(1)} toward ${stgTarget} in order to ${stgFunction}.`;
  const ltg = `LTG (${ltgWeeks} weeks): Patient will ${direction} BMI toward ${ltgTarget} in order to ${ltgFunction}.`;
  return { stg, ltg };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
export function renderBMI(container) {
  container.innerHTML = `
    <h2 class="tool-title">BMI Calculator</h2>
    <p class="tool-subtitle">Imperial or metric BMI with interpretation and goals.</p>

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

      <div class="goal-timeframe-row">
        <div>
          <label for="bmi-stg">STG timeframe (weeks)</label>
          <input id="bmi-stg" type="number" step="1" min="1" value="6" />
        </div>
        <div>
          <label for="bmi-ltg">LTG timeframe (weeks)</label>
          <input id="bmi-ltg" type="number" step="1" min="1" value="12" />
        </div>
      </div>

      <button id="bmi-calc" class="action-btn">Calculate BMI</button>
    </div>

    <div id="bmi-output" class="spacer-top"></div>
  `;

  const unitSelect  = document.getElementById("bmi-unit");
  const weightInput = document.getElementById("bmi-weight");
  const heightInput = document.getElementById("bmi-height");
  const output      = document.getElementById("bmi-output");

  function getCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25)   return "Normal weight";
    if (bmi < 30)   return "Overweight";
    if (bmi < 35)   return "Obesity class I";
    if (bmi < 40)   return "Obesity class II";
    return "Obesity class III";
  }

  function getExplanation(bmi) {
    if (bmi < 18.5) return "BMI is below the typical healthy range. May be associated with reduced muscle mass or nutritional concerns relevant to rehabilitation.";
    if (bmi < 25)   return "BMI is within the typical healthy range.";
    if (bmi < 30)   return "BMI is above the typical healthy range. May contribute to increased joint load during weight-bearing activity.";
    if (bmi < 35)   return "BMI is in the obesity class I range. Increased joint load may affect exercise tolerance and mobility; consider exercise modifications.";
    if (bmi < 40)   return "BMI is in the obesity class II range. Significantly elevated joint load; aquatic, seated, or supported exercise may be appropriate.";
    return "BMI is in the obesity class III range. Exercise tolerance and mobility may be substantially affected; individualize activity selection and intensity.";
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
    const weight   = parseFloat(weightInput.value);
    const height   = parseFloat(heightInput.value);
    const stgWeeks = parseInt(document.getElementById("bmi-stg").value, 10) || 6;
    const ltgWeeks = parseInt(document.getElementById("bmi-ltg").value, 10) || 12;

    if (!weight || !height || weight <= 0 || height <= 0) {
      output.innerHTML = `<div class="result-box">Enter valid positive values.</div>`;
      return;
    }

    let bmi, rawHeight;
    if (unitSelect.value === "imperial") {
      bmi = (weight / (height * height)) * 703;
      rawHeight = `${height.toFixed(1)} in`;
    } else {
      const heightM = height / 100;
      bmi = weight / (heightM * heightM);
      rawHeight = `${height.toFixed(1)} cm`;
    }

    const category = getCategory(bmi);
    const { stg, ltg } = buildBmiGoals(bmi, stgWeeks, ltgWeeks);

    const result = {
      summary: `BMI: ${bmi.toFixed(1)}\nCategory: ${category}`,
      note: `BMI calculated at ${bmi.toFixed(1)} (${category}). ${getExplanation(bmi)}`,
      goals: `${stg}\n\n${ltg}`,
      normative: BMI_NORMATIVE,
      raw: `Units: ${unitSelect.value}\nWeight: ${weight.toFixed(1)}\nHeight: ${rawHeight}\nBMI: ${bmi.toFixed(1)}\nSTG timeframe: ${stgWeeks} weeks\nLTG timeframe: ${ltgWeeks} weeks`,
      explanation: `BMI = weight(kg) / height(m)². Imperial formula: (weight(lb) / height(in)²) × 703. Classification per WHO categories. BMI is a screening tool only — does not account for body composition or fat distribution.`,
    };

    output.innerHTML = renderResultSections(result);
    wireCopyButtons(output, result);
  });
}
