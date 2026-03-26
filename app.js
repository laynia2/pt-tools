import { renderBMI } from "./calculators/bmi.js";
import { renderGait } from "./calculators/gait.js";
import { renderCardio } from "./calculators/cardio.js";
import { renderUtilities } from "./calculators/utilities.js";
import { renderStrength } from "./calculators/strength.js";
import { renderBalance } from "./calculators/balance.js";
import { renderOutcomes } from "./calculators/outcomes.js";
import { renderBilling } from "./calculators/billing.js";

const app = document.getElementById("app");
const navButtons = document.querySelectorAll(".nav-btn");

const tools = {
  home: renderHome,
  bmi: renderBMI,
  gait: renderGait,
  cardio: renderCardio,
  utilities: renderUtilities,
  strength: renderStrength,
  balance: renderBalance,
  outcomes: renderOutcomes,
  billing: renderBilling,
};

function renderHome(container) {
  container.innerHTML = `
    <h2 class="tool-title">PT Tools</h2>
    <p class="tool-subtitle">Quick clinical calculators and note helpers for rehab use.</p>

    <div class="result-box">
      PT Tools is a simple collection of calculators and helper tools designed for quick use during treatment, documentation, and clinical decision support.

      Use the menu on the left to open a calculator or tool.

      For version history, roadmap, bug reports, or feature requests, use the Info page.
    </div>

    <div class="spacer-top">
      <a href="./info.html" class="info-link-btn">Open Info Page</a>
    </div>

    <div class="spacer-top">
      <h3 class="section-title">Current Tool Areas</h3>
      <div class="result-box">
        • BMI
        • Gait Speed
        • Heart Rate Zones
        • Utilities / Unit Conversions
        • Strength Tools
        • Balance / Functional Tests
        • Outcomes
        • Billing
      </div>
    </div>

    <div class="spacer-top">
      <h3 class="section-title">Notes</h3>
      <div class="result-box">
        This site is for clinical support only and does not replace clinical judgment.
        Do not enter patient-identifying information.
      </div>
    </div>
  `;
}

function setActiveButton(toolName) {
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === toolName);
  });
}

function loadTool(toolName) {
  const renderFn = tools[toolName];
  if (!renderFn) return;
  setActiveButton(toolName);
  renderFn(app);
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    loadTool(btn.dataset.tool);
  });
});

loadTool("home");
