(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const tool = $("bctt-tool");
  if (!tool) return;

  const state = {
    stages: [],
    stage: 0,
    speed: 3.2,
    grade: 0,
    baselineSymptoms: 0,
    stopReason: "",
    stopNotes: "",
    timerRemaining: 60,
    timerId: null
  };

  const els = {
    date: $("bctt-date"),
    patientId: $("bctt-patient-id"),
    age: $("bctt-age"),
    heightGroup: $("bctt-height-group"),
    startSpeed: $("bctt-start-speed"),
    restHr: $("bctt-rest-hr"),
    baselineSymptoms: $("bctt-baseline-symptoms"),
    baselineRpe: $("bctt-baseline-rpe"),
    baselineNotes: $("bctt-baseline-notes"),
    modified: $("bctt-modified-protocol"),
    aphRmax: $("bctt-aphrmax"),
    hr80: $("bctt-hr80"),
    hr90: $("bctt-hr90"),
    stageNumber: $("bctt-stage-number"),
    currentSpeed: $("bctt-current-speed"),
    currentGrade: $("bctt-current-grade"),
    timer: $("bctt-timer"),
    liveHr: $("bctt-live-hr"),
    liveRpe: $("bctt-live-rpe"),
    liveSymptoms: $("bctt-live-symptoms"),
    liveNotes: $("bctt-live-notes"),
    deltaAlert: $("bctt-delta-alert"),
    stageTableBody: $("bctt-stage-table-body"),
    resultsTableBody: $("bctt-results-table-body"),
    stopDialog: $("bctt-stop-dialog"),
    stopNotes: $("bctt-stop-notes"),
    trainingPercent: $("bctt-training-percent"),
    trainingTarget: $("bctt-training-target"),
    assessment: $("bctt-assessment"),
    activity: $("bctt-activity"),
    stg: $("bctt-stg"),
    ltg: $("bctt-ltg"),
    toast: $("bctt-toast")
  };

  function todayLocal() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffset).toISOString().slice(0, 10);
  }

  els.date.value = todayLocal();

  function num(el, fallback = null) {
    const value = Number(el.value);
    return Number.isFinite(value) && el.value !== "" ? value : fallback;
  }

  function round(value) {
    return Math.round(value);
  }

  function selectedChecks(containerId) {
    return [...document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`)].map(x => x.value);
  }

  function clearChecks(containerId) {
    document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(x => x.checked = false);
  }

  function showPanel(name) {
    document.querySelectorAll(".bctt-panel").forEach(p => p.classList.toggle("is-active", p.dataset.panel === name));
    document.querySelectorAll(".bctt-step").forEach(s => s.classList.toggle("is-active", s.dataset.go === name));
    tool.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(toast._id);
    toast._id = setTimeout(() => els.toast.classList.remove("is-visible"), 1800);
  }

  function updateHrRefs() {
    const age = num(els.age);
    if (!age) {
      els.aphRmax.textContent = els.hr80.textContent = els.hr90.textContent = "—";
      return;
    }
    const max = 220 - age;
    els.aphRmax.textContent = `${max} bpm`;
    els.hr80.textContent = `${round(max * 0.80)} bpm`;
    els.hr90.textContent = `${round(max * 0.90)} bpm`;
  }

  function setSpeedFromHeight() {
    const recommended = els.heightGroup.value === "tall" ? 3.6 : 3.2;
    els.startSpeed.value = recommended.toFixed(1);
  }

  els.age.addEventListener("input", updateHrRefs);
  els.heightGroup.addEventListener("change", setSpeedFromHeight);

  function currentSettingsForStage(stage) {
    const initial = num(els.startSpeed, 3.2);
    if (stage <= 15) return { speed: initial, grade: stage };
    return { speed: initial + ((stage - 15) * 0.4), grade: 15 };
  }

  function updateCurrentStageUi() {
    const settings = currentSettingsForStage(state.stage);
    state.speed = settings.speed;
    state.grade = settings.grade;
    els.stageNumber.textContent = `Stage ${state.stage}`;
    els.currentSpeed.textContent = state.speed.toFixed(1);
    els.currentGrade.textContent = state.grade.toFixed(0);
  }

  function updateDelta() {
    const symptoms = num(els.liveSymptoms);
    if (symptoms === null) {
      els.deltaAlert.textContent = "Symptom change: —";
      els.deltaAlert.className = "bctt-delta-alert";
      return;
    }
    const delta = symptoms - state.baselineSymptoms;
    const sign = delta > 0 ? "+" : "";
    els.deltaAlert.textContent = `Symptom change: ${sign}${delta}/10`;
    els.deltaAlert.className = "bctt-delta-alert";
    if (delta >= 3) {
      els.deltaAlert.classList.add("is-stop");
      els.deltaAlert.textContent += " — BCTT symptom-exacerbation criterion reached";
    } else if (delta >= 2) {
      els.deltaAlert.classList.add("is-warning");
    }
  }

  els.liveSymptoms.addEventListener("input", updateDelta);

  function resetStageInputs() {
    els.liveHr.value = "";
    els.liveRpe.value = "";
    els.liveSymptoms.value = state.baselineSymptoms;
    els.liveNotes.value = "";
    clearChecks("bctt-current-symptom-list");
    updateDelta();
    els.liveHr.focus();
  }

  function formatTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function startTimer() {
    stopTimer();
    state.timerRemaining = 60;
    els.timer.textContent = "01:00";
    state.timerId = setInterval(() => {
      state.timerRemaining -= 1;
      if (state.timerRemaining <= 0) {
        state.timerRemaining = 0;
        els.timer.textContent = "00:00";
        clearInterval(state.timerId);
        state.timerId = null;
        if (navigator.vibrate) navigator.vibrate([150, 100, 150]);
        toast("Stage minute complete");
        return;
      }
      els.timer.textContent = formatTimer(state.timerRemaining);
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function validateSetup() {
    if (!num(els.age)) {
      alert("Enter the patient's age before starting.");
      els.age.focus();
      return false;
    }
    if (num(els.baselineSymptoms) === null) {
      alert("Enter baseline symptom severity.");
      return false;
    }
    return true;
  }

  function startTest() {
    if (!validateSetup()) return;
    state.stages = [];
    state.stage = 0;
    state.baselineSymptoms = num(els.baselineSymptoms, 0);
    state.stopReason = "";
    state.stopNotes = "";
    updateCurrentStageUi();
    renderStageTables();
    resetStageInputs();
    showPanel("test");
    startTimer();
  }

  function saveCurrentStage() {
    const hr = num(els.liveHr);
    const rpe = num(els.liveRpe);
    const symptoms = num(els.liveSymptoms);

    if (hr === null || rpe === null || symptoms === null) {
      alert("Enter HR, RPE, and symptom severity for this stage.");
      return false;
    }

    const delta = symptoms - state.baselineSymptoms;
    state.stages.push({
      stage: state.stage,
      speed: Number(state.speed.toFixed(1)),
      grade: state.grade,
      hr,
      rpe,
      symptoms,
      delta,
      symptomNames: selectedChecks("bctt-current-symptom-list"),
      notes: els.liveNotes.value.trim()
    });

    renderStageTables();
    return true;
  }

  function saveAndAdvance() {
    if (!saveCurrentStage()) return;

    const last = state.stages[state.stages.length - 1];
    if (last.delta >= 3) {
      openStopDialog("Symptom exacerbation");
      return;
    }

    state.stage += 1;
    updateCurrentStageUi();
    resetStageInputs();
    startTimer();
  }

  function deleteLastStage() {
    if (!state.stages.length) return;
    const removed = state.stages.pop();
    state.stage = removed.stage;
    updateCurrentStageUi();
    renderStageTables();
    toast("Last stage removed");
  }

  function renderStageTables() {
    const simple = state.stages.map(s => `
      <tr>
        <td>${s.stage}</td>
        <td>${s.speed.toFixed(1)}</td>
        <td>${s.grade}%</td>
        <td>${s.hr}</td>
        <td>${s.rpe}</td>
        <td>${s.symptoms}</td>
        <td>${s.delta > 0 ? "+" : ""}${s.delta}</td>
      </tr>`).join("");

    els.stageTableBody.innerHTML = simple;

    els.resultsTableBody.innerHTML = state.stages.map(s => `
      <tr>
        <td>${s.stage}</td>
        <td>${s.speed.toFixed(1)} mph</td>
        <td>${s.grade}%</td>
        <td>${s.hr}</td>
        <td>${s.rpe}</td>
        <td>${s.symptoms}/10</td>
        <td>${s.delta > 0 ? "+" : ""}${s.delta}</td>
        <td>${escapeHtml(s.symptomNames.join(", ") || "—")}</td>
        <td>${escapeHtml(s.notes || "—")}</td>
      </tr>`).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function openStopDialog(reason = "") {
    stopTimer();
    if (reason) {
      const radio = document.querySelector(`input[name="bctt-stop-reason"][value="${CSS.escape(reason)}"]`);
      if (radio) radio.checked = true;
    }
    if (typeof els.stopDialog.showModal === "function") {
      els.stopDialog.showModal();
    } else {
      const entered = prompt("Reason for ending test:", reason || "Symptom exacerbation");
      if (entered !== null) {
        state.stopReason = entered;
        calculateResults();
      }
    }
  }

  function confirmEnd() {
    const selected = document.querySelector('input[name="bctt-stop-reason"]:checked');
    state.stopReason = selected ? selected.value : "Other";
    state.stopNotes = els.stopNotes.value.trim();

    // If clinician has entered an unsaved stage, offer to include it.
    const unsavedHr = num(els.liveHr);
    const currentAlreadySaved = state.stages.some(s => s.stage === state.stage);
    if (!currentAlreadySaved && unsavedHr !== null) {
      const rpe = num(els.liveRpe);
      const symptoms = num(els.liveSymptoms);
      if (rpe !== null && symptoms !== null) saveCurrentStage();
    }

    els.stopDialog.close();
    calculateResults();
  }

  function finalStage() {
    return state.stages[state.stages.length - 1] || null;
  }

  function isSymptomLimited() {
    const last = finalStage();
    return !!last && (state.stopReason === "Symptom exacerbation" || last.delta >= 3);
  }

  function calculateResults() {
    stopTimer();
    const last = finalStage();

    if (!last) {
      alert("Record at least one stage before calculating results.");
      return;
    }

    $("bctt-result-stop").textContent = state.stopReason || "Test ended";
    $("bctt-result-workload").textContent = `${last.speed.toFixed(1)} mph at ${last.grade}%`;
    $("bctt-result-hr").textContent = `${last.hr} bpm`;
    $("bctt-result-rpe").textContent = `${last.rpe}/20`;
    $("bctt-result-symptoms").textContent = `${last.symptoms}/10`;
    $("bctt-result-delta").textContent = `${last.delta > 0 ? "+" : ""}${last.delta}/10`;
    $("bctt-result-90hrt").textContent = `${round(last.hr * 0.90)} bpm`;
    $("bctt-result-duration").textContent = `${Math.max(0, state.stages.length - 1)} min + Stage 0`;

    renderStageTables();
    updateTrainingTarget();
    generateDocumentation();
    drawChart();
    showPanel("results");
  }

  function patientDescriptor() {
    const id = els.patientId.value.trim();
    return id ? `Patient ${id}` : "Patient";
  }

  function symptomPhrase(last) {
    if (!last.symptomNames.length) return "reported symptoms";
    return last.symptomNames.join(", ").toLowerCase();
  }

  function generateDocumentation() {
    const last = finalStage();
    if (!last) return;

    const patient = patientDescriptor();
    const baseline = state.baselineSymptoms;
    const workload = `${last.speed.toFixed(1)} mph at ${last.grade}% grade`;
    const symptomatic = isSymptomLimited();
    const age = num(els.age);
    const max = age ? 220 - age : null;
    const pctMax = max ? round((last.hr / max) * 100) : null;
    const targetPct = Number(els.trainingPercent.value);
    const target = round(last.hr * targetPct);
    const symptoms = symptomPhrase(last);

    if (symptomatic) {
      els.assessment.value =
        `${patient} demonstrated symptom-limited exercise intolerance during the Buffalo Concussion Treadmill Test. ` +
        `Symptoms increased from ${baseline}/10 at baseline to ${last.symptoms}/10 (${last.delta >= 0 ? "+" : ""}${last.delta}) ` +
        `at ${workload}, with heart rate ${last.hr} bpm and RPE ${last.rpe}/20. ` +
        `Primary symptoms at termination included ${symptoms}. ` +
        `The heart rate associated with symptom exacerbation was ${last.hr} bpm and may be used, with clinical judgment, to guide sub-symptom aerobic exercise dosing.`;

      els.activity.value =
        `Completed graded aerobic exertion testing using the Buffalo Concussion Treadmill Test. ` +
        `Treadmill workload was progressed according to protocol while heart rate, RPE, symptom severity, symptom type, and clinical observations were monitored at each stage. ` +
        `Testing was terminated for ${state.stopReason.toLowerCase()} at ${workload}, HR ${last.hr} bpm, RPE ${last.rpe}/20, and symptoms ${last.symptoms}/10. ` +
        `Based on today's response, an initial aerobic training ceiling of approximately ${target} bpm (${round(targetPct * 100)}% of termination HR) may be used if otherwise clinically appropriate.`;

      els.stg.value =
        `Within 2–4 weeks, patient will tolerate at least 20 minutes of continuous aerobic activity at or below the prescribed sub-symptom heart-rate target without a >2-point increase in concussion-related symptoms.`;

      els.ltg.value =
        `Within 4–8 weeks, patient will demonstrate improved graded exertional tolerance with increased heart-rate/workload threshold and no clinically significant concussion-related symptom exacerbation, supporting progression toward prior level of activity.`;
    } else {
      els.assessment.value =
        `${patient} completed graded aerobic exertion testing to ${workload}, HR ${last.hr} bpm` +
        `${pctMax ? ` (${pctMax}% of age-predicted HRmax)` : ""}, with RPE ${last.rpe}/20}. ` +
        `Symptoms changed from ${baseline}/10 to ${last.symptoms}/10 (${last.delta >= 0 ? "+" : ""}${last.delta}) without reaching the BCTT ≥3-point symptom-exacerbation criterion. ` +
        `No symptom-limited physiologic exercise threshold was identified during today's test. Findings should be integrated with the remainder of the concussion examination and other potential symptom generators.`;

      els.activity.value =
        `Completed graded aerobic exertion assessment using the Buffalo Concussion Treadmill Test with serial monitoring of treadmill workload, heart rate, RPE, symptoms, and clinical observations. ` +
        `Patient reached ${workload}, HR ${last.hr} bpm, and RPE ${last.rpe}/20 without meeting the ≥3-point symptom-exacerbation criterion.`;

      els.stg.value =
        `Within 2–4 weeks, patient will tolerate 20–30 minutes of aerobic activity at a clinically appropriate moderate-to-vigorous intensity without a >2-point increase in concussion-related symptoms.`;

      els.ltg.value =
        `Within 4–8 weeks, patient will tolerate graded aerobic exertion appropriate for prior level of activity without clinically significant concussion-related symptom exacerbation.`;
    }

    updateTrainingTarget();
  }

  function updateTrainingTarget() {
    const last = finalStage();
    if (!last) {
      els.trainingTarget.textContent = "—";
      return;
    }
    const pct = Number(els.trainingPercent.value);
    els.trainingTarget.textContent = `${round(last.hr * pct)} bpm`;
  }

  els.trainingPercent.addEventListener("change", () => {
    updateTrainingTarget();
    generateDocumentation();
  });

  function drawChart() {
    const canvas = $("bctt-chart");
    const ctx = canvas.getContext("2d");
    const data = state.stages;
    if (!data.length) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = { left: 50, right: 45, top: 25, bottom: 42 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const hrs = data.map(d => d.hr);
    const hrMin = Math.max(40, Math.floor((Math.min(...hrs) - 10) / 10) * 10);
    const hrMax = Math.min(240, Math.ceil((Math.max(...hrs) + 10) / 10) * 10);
    const maxSym = 10;

    const x = i => pad.left + (data.length === 1 ? plotW / 2 : i * plotW / (data.length - 1));
    const yHr = v => pad.top + plotH - ((v - hrMin) / Math.max(1, hrMax - hrMin)) * plotH;
    const ySym = v => pad.top + plotH - (v / maxSym) * plotH;

    // Grid + axes
    ctx.strokeStyle = "#dbe2e8";
    ctx.lineWidth = 1;
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#62707d";
    ctx.textAlign = "right";

    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH * i / 4);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      const hrVal = Math.round(hrMax - ((hrMax - hrMin) * i / 4));
      ctx.fillText(String(hrVal), pad.left - 7, y + 4);
      const symVal = Math.round(maxSym - (maxSym * i / 4));
      ctx.textAlign = "left";
      ctx.fillText(String(symVal), w - pad.right + 7, y + 4);
      ctx.textAlign = "right";
    }

    // X labels
    ctx.textAlign = "center";
    data.forEach((d, i) => {
      ctx.fillText(String(d.stage), x(i), h - 20);
    });
    ctx.fillText("Stage", pad.left + plotW / 2, h - 5);

    // HR line
    ctx.strokeStyle = "#155eef";
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const px = x(i), py = yHr(d.hr);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Symptom line
    ctx.strokeStyle = "#b42318";
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const px = x(i), py = ySym(d.symptoms);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Dots
    data.forEach((d, i) => {
      ctx.fillStyle = "#155eef";
      ctx.beginPath(); ctx.arc(x(i), yHr(d.hr), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b42318";
      ctx.beginPath(); ctx.arc(x(i), ySym(d.symptoms), 3.5, 0, Math.PI * 2); ctx.fill();
    });

    // Labels
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#155eef";
    ctx.textAlign = "left";
    ctx.fillText("HR", pad.left, 15);
    ctx.fillStyle = "#b42318";
    ctx.fillText("Symptoms", pad.left + 32, 15);
  }

  function buildNoteText() {
    return [
      "BCTT ASSESSMENT",
      els.assessment.value.trim(),
      "",
      "ACTIVITY / INTERVENTION",
      els.activity.value.trim(),
      "",
      "SHORT-TERM GOAL",
      els.stg.value.trim(),
      "",
      "LONG-TERM GOAL",
      els.ltg.value.trim()
    ].join("\n");
  }

  async function copyNote() {
    const text = buildNoteText();
    try {
      await navigator.clipboard.writeText(text);
      toast("Documentation copied");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Documentation copied");
    }
  }

  function csvEscape(value) {
    const s = String(value ?? "");
    return `"${s.replaceAll('"', '""')}"`;
  }

  function exportCsv() {
    if (!state.stages.length) return;
    const rows = [
      ["Patient/Chart ID", els.patientId.value.trim()],
      ["Date", els.date.value],
      ["Age", els.age.value],
      ["Resting HR", els.restHr.value],
      ["Baseline symptoms", els.baselineSymptoms.value],
      ["Baseline RPE", els.baselineRpe.value],
      ["Stop reason", state.stopReason],
      ["Stop notes", state.stopNotes],
      [],
      ["Stage", "Speed mph", "Grade %", "HR bpm", "RPE", "Symptoms /10", "Delta", "Symptoms reported", "Notes"],
      ...state.stages.map(s => [
        s.stage, s.speed.toFixed(1), s.grade, s.hr, s.rpe, s.symptoms, s.delta,
        s.symptomNames.join("; "), s.notes
      ]),
      [],
      ["Assessment", els.assessment.value],
      ["Activity / Intervention", els.activity.value],
      ["Short-term goal", els.stg.value],
      ["Long-term goal", els.ltg.value]
    ];

    const csv = rows.map(r => r.map(csvEscape).join(",")).join("\r\n");
    downloadBlob(csv, `BCTT_${safeFilename(els.patientId.value || "test")}_${els.date.value}.csv`, "text/csv;charset=utf-8");
  }

  function exportJson() {
    const payload = {
      test: "Buffalo Concussion Treadmill Test",
      patientId: els.patientId.value.trim(),
      date: els.date.value,
      age: num(els.age),
      restingHr: num(els.restHr),
      baselineSymptoms: state.baselineSymptoms,
      baselineRpe: num(els.baselineRpe),
      baselineSymptomNames: selectedChecks("bctt-baseline-symptom-list"),
      baselineNotes: els.baselineNotes.value.trim(),
      modifiedProtocol: els.modified.checked,
      startingSpeed: num(els.startSpeed),
      stopReason: state.stopReason,
      stopNotes: state.stopNotes,
      stages: state.stages,
      documentation: {
        assessment: els.assessment.value,
        activity: els.activity.value,
        shortTermGoal: els.stg.value,
        longTermGoal: els.ltg.value
      }
    };
    downloadBlob(JSON.stringify(payload, null, 2), `BCTT_${safeFilename(els.patientId.value || "test")}_${els.date.value}.json`, "application/json");
  }

  function safeFilename(value) {
    return String(value).trim().replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "") || "test";
  }

  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function resetAll() {
    stopTimer();
    if (!confirm("Clear the current BCTT and start a new test?")) return;

    state.stages = [];
    state.stage = 0;
    state.stopReason = "";
    state.stopNotes = "";
    els.patientId.value = "";
    els.date.value = todayLocal();
    els.age.value = "";
    els.heightGroup.value = "short";
    els.startSpeed.value = "3.2";
    els.restHr.value = "";
    els.baselineSymptoms.value = "0";
    els.baselineRpe.value = "6";
    els.baselineNotes.value = "";
    els.modified.checked = false;
    els.stopNotes.value = "";
    clearChecks("bctt-baseline-symptom-list");
    clearChecks("bctt-current-symptom-list");
    updateHrRefs();
    renderStageTables();
    showPanel("setup");
  }

  document.querySelectorAll(".bctt-step").forEach(btn => {
    btn.addEventListener("click", () => showPanel(btn.dataset.go));
  });

  $("bctt-start-test").addEventListener("click", startTest);
  $("bctt-save-advance").addEventListener("click", saveAndAdvance);
  $("bctt-delete-last").addEventListener("click", deleteLastStage);
  $("bctt-end-test").addEventListener("click", () => openStopDialog());
  $("bctt-confirm-end").addEventListener("click", confirmEnd);
  $("bctt-regenerate-docs").addEventListener("click", generateDocumentation);
  $("bctt-copy-note").addEventListener("click", copyNote);
  $("bctt-print-pdf").addEventListener("click", () => window.print());
  $("bctt-export-csv").addEventListener("click", exportCsv);
  $("bctt-export-json").addEventListener("click", exportJson);
  $("bctt-new-test").addEventListener("click", resetAll);

  updateHrRefs();
})();
