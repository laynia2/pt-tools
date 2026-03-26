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
  bmi: renderBMI,
  gait: renderGait,
  cardio: renderCardio,
  utilities: renderUtilities,
  strength: renderStrength,
  balance: renderBalance,
  outcomes: renderOutcomes,
  billing: renderBilling,
};

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

loadTool("bmi");
