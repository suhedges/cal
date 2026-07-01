(function () {
  "use strict";

  const INCH_TO_MM = 25.4;
  const NM_TO_FT_LBS = 0.7375621493;
  const FT_LBS_TO_NM = 1.3558179483;
  const HP_TORQUE_CONSTANT = 5252.113122;

  let disclaimerAccepted = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function getNumber(id) {
    const field = byId(id);
    if (!field) return NaN;

    const value = parseFloat(field.value);
    return Number.isFinite(value) ? value : NaN;
  }

  function hasValue(id) {
    const field = byId(id);
    return Boolean(field && field.value.trim() !== "");
  }

  function setValue(id, value) {
    const field = byId(id);
    if (field) field.value = value;
  }

  function setOutput(id, value) {
    const output = byId(id);
    if (output) output.textContent = value;
  }

  function setOutputHtml(id, value) {
    const output = byId(id);
    if (output) output.innerHTML = value;
  }

  function setMessage(id, message, type) {
    const el = byId(id);
    if (!el) return;

    el.textContent = message || "";
    el.classList.remove("is-error", "is-success", "is-warning");

    if (type === "error") el.classList.add("is-error");
    if (type === "success") el.classList.add("is-success");
    if (type === "warning") el.classList.add("is-warning");
  }

  function round(value, decimals) {
    const factor = Math.pow(10, decimals || 2);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function formatNumber(value, decimals) {
    if (!Number.isFinite(value)) return "";

    const places = decimals ?? 2;
    return round(value, places).toFixed(places);
  }

  function isWholeNumber(value) {
    return Number.isFinite(value) && Math.abs(value - Math.round(value)) < 1e-9;
  }

  function nearestWhole(value) {
    if (!Number.isFinite(value)) return NaN;
    return Math.max(1, Math.round(value));
  }

  function clearMessageAndOutput(messageId, outputId, outputText) {
    setMessage(messageId, "");

    if (outputId) {
      setOutput(outputId, outputText || "Result will appear here.");
    }
  }

  window.closeOverlay = function closeOverlay(id) {
    const overlay = byId(id);
    if (overlay) overlay.style.display = "none";
  };

  window.calculateVbeltLength = function calculateVbeltLength() {
    const d1 = getNumber("d1");
    const d2 = getNumber("d2");
    const centerDistance = getNumber("cd");

    if (d1 <= 0 || d2 <= 0 || centerDistance <= 0) {
      setOutput("vbelt-result", "Result will appear here.");
      setMessage(
        "vbelt-message",
        "Enter positive values for both pulley pitch diameters and center distance.",
        "error"
      );
      return;
    }

    const diameterDifference = Math.abs(d2 - d1);

    if (centerDistance <= diameterDifference / 2) {
      setOutput("vbelt-result", "Check dimensions.");
      setMessage(
        "vbelt-message",
        "Center distance must be greater than half the difference between the two pulley diameters.",
        "error"
      );
      return;
    }

    const beltLength =
      2 * centerDistance +
      (Math.PI / 2) * (d1 + d2) +
      Math.pow(d2 - d1, 2) / (4 * centerDistance);

    const wrapAngleSmall =
      180 -
      (2 * Math.asin(diameterDifference / (2 * centerDistance)) * 180) /
        Math.PI;

    setOutput(
      "vbelt-result",
      `Approx. open-belt length: ${formatNumber(beltLength, 2)} inches`
    );

    if (wrapAngleSmall < 120) {
      setMessage(
        "vbelt-message",
        `Small pulley wrap is approx. ${formatNumber(
          wrapAngleSmall,
          1
        )}°. Consider increasing center distance or using an idler; verify with manufacturer data.`,
        "warning"
      );
      return;
    }

    setMessage(
      "vbelt-message",
      `Approximate open-belt pitch length calculated. Small pulley wrap is approx. ${formatNumber(
        wrapAngleSmall,
        1
      )}°.`,
      "success"
    );
  };

  window.calculatePulleySize = function calculatePulleySize() {
    const driveRpm = getNumber("drive-rpm");
    const outputRpm = getNumber("output-rpm");
    const driveDiameter = getNumber("drive-diameter");
    const drivenDiameter = getNumber("driven-diameter");
    const driveDiameterEntered = hasValue("drive-diameter");
    const drivenDiameterEntered = hasValue("driven-diameter");

    if (driveRpm <= 0 || outputRpm <= 0) {
      setOutput("pulley-result", "Leave one diameter field blank.");
      setMessage("pulley-message", "Enter positive RPM values first.", "error");
      return;
    }

    if (driveDiameterEntered === drivenDiameterEntered) {
      setOutput("pulley-result", "Leave exactly one diameter field blank.");
      setMessage(
        "pulley-message",
        "Provide one known pulley diameter and leave the diameter to calculate blank.",
        "error"
      );
      return;
    }

    if (!driveDiameterEntered) {
      if (drivenDiameter <= 0) {
        setMessage(
          "pulley-message",
          "Enter a positive driven pulley diameter.",
          "error"
        );
        return;
      }

      const calculatedDriveDiameter = (outputRpm / driveRpm) * drivenDiameter;
      const ratio = drivenDiameter / calculatedDriveDiameter;

      setValue("drive-diameter", formatNumber(calculatedDriveDiameter, 2));
      setOutput(
        "pulley-result",
        `Drive pulley diameter: ${formatNumber(
          calculatedDriveDiameter,
          2
        )} inches`
      );
      setMessage(
        "pulley-message",
        `Assumes no slip. Diameter ratio is approx. ${formatNumber(
          ratio,
          2
        )}:1.`,
        "success"
      );
      return;
    }

    if (driveDiameter <= 0) {
      setMessage(
        "pulley-message",
        "Enter a positive drive pulley diameter.",
        "error"
      );
      return;
    }

    const calculatedDrivenDiameter = (driveRpm / outputRpm) * driveDiameter;
    const ratio = calculatedDrivenDiameter / driveDiameter;

    setValue("driven-diameter", formatNumber(calculatedDrivenDiameter, 2));
    setOutput(
      "pulley-result",
      `Driven pulley diameter: ${formatNumber(
        calculatedDrivenDiameter,
        2
      )} inches`
    );
    setMessage(
      "pulley-message",
      `Assumes no slip. Diameter ratio is approx. ${formatNumber(
        ratio,
        2
      )}:1.`,
      "success"
    );
  };

  window.calculateSprocketSize = function calculateSprocketSize() {
    const driveRpm = getNumber("drive-sprocket-rpm");
    const outputRpm = getNumber("output-sprocket-rpm");
    const driveTeeth = getNumber("drive-sprocket-teeth");
    const drivenTeeth = getNumber("driven-sprocket-teeth");
    const driveTeethEntered = hasValue("drive-sprocket-teeth");
    const drivenTeethEntered = hasValue("driven-sprocket-teeth");

    if (driveRpm <= 0 || outputRpm <= 0) {
      setOutput("sprocket-result", "Leave one tooth-count field blank.");
      setMessage(
        "sprocket-message",
        "Enter positive RPM values first.",
        "error"
      );
      return;
    }

    if (driveTeethEntered === drivenTeethEntered) {
      setOutput("sprocket-result", "Leave exactly one tooth-count field blank.");
      setMessage(
        "sprocket-message",
        "Provide one known whole-number sprocket tooth count and leave the tooth count to calculate blank.",
        "error"
      );
      return;
    }

    if (!driveTeethEntered) {
      if (drivenTeeth <= 0 || !isWholeNumber(drivenTeeth)) {
        setMessage(
          "sprocket-message",
          "Enter a positive whole-number driven sprocket tooth count.",
          "error"
        );
        return;
      }

      const exactDriveTeeth = (outputRpm / driveRpm) * drivenTeeth;
      const roundedDriveTeeth = nearestWhole(exactDriveTeeth);
      const estimatedOutputRpm = (driveRpm * roundedDriveTeeth) / drivenTeeth;
      const messageType = isWholeNumber(exactDriveTeeth)
        ? "success"
        : "warning";

      setValue("drive-sprocket-teeth", String(roundedDriveTeeth));
      setOutput(
        "sprocket-result",
        `Exact drive teeth: ${formatNumber(
          exactDriveTeeth,
          2
        )}; nearest whole: ${roundedDriveTeeth}`
      );
      setMessage(
        "sprocket-message",
        `Nearest whole tooth count gives approx. ${formatNumber(
          estimatedOutputRpm,
          2
        )} output RPM. Verify available sprockets and chain speed.`,
        messageType
      );
      return;
    }

    if (driveTeeth <= 0 || !isWholeNumber(driveTeeth)) {
      setMessage(
        "sprocket-message",
        "Enter a positive whole-number drive sprocket tooth count.",
        "error"
      );
      return;
    }

    const exactDrivenTeeth = (driveRpm / outputRpm) * driveTeeth;
    const roundedDrivenTeeth = nearestWhole(exactDrivenTeeth);
    const estimatedOutputRpm = (driveRpm * driveTeeth) / roundedDrivenTeeth;
    const messageType = isWholeNumber(exactDrivenTeeth)
      ? "success"
      : "warning";

    setValue("driven-sprocket-teeth", String(roundedDrivenTeeth));
    setOutput(
      "sprocket-result",
      `Exact driven teeth: ${formatNumber(
        exactDrivenTeeth,
        2
      )}; nearest whole: ${roundedDrivenTeeth}`
    );
    setMessage(
      "sprocket-message",
      `Nearest whole tooth count gives approx. ${formatNumber(
        estimatedOutputRpm,
        2
      )} output RPM. Verify available sprockets and chain speed.`,
      messageType
    );
  };

  function convertInchToMm(isInch) {
    const inchField = byId("inchValue");
    const mmField = byId("mmValue");

    if (!inchField || !mmField) return;

    const inch = parseFloat(inchField.value);
    const mm = parseFloat(mmField.value);

    if (isInch) {
      if (inchField.value.trim() === "") {
        mmField.value = "";
        setMessage("inch-mm-message", "");
        return;
      }

      if (!Number.isFinite(inch)) {
        mmField.value = "";
        setMessage("inch-mm-message", "Enter a valid inch value.", "error");
        return;
      }

      mmField.value = formatNumber(inch * INCH_TO_MM, 2);
      setMessage(
        "inch-mm-message",
        `${inch} in = ${mmField.value} mm`,
        "success"
      );
      return;
    }

    if (mmField.value.trim() === "") {
      inchField.value = "";
      setMessage("inch-mm-message", "");
      return;
    }

    if (!Number.isFinite(mm)) {
      inchField.value = "";
      setMessage(
        "inch-mm-message",
        "Enter a valid millimeter value.",
        "error"
      );
      return;
    }

    inchField.value = formatNumber(mm / INCH_TO_MM, 4);
    setMessage(
      "inch-mm-message",
      `${mm} mm = ${inchField.value} in`,
      "success"
    );
  }

  function convertNmToFp(isNm) {
    const nmField = byId("nmValue");
    const fpField = byId("fpValue");

    if (!nmField || !fpField) return;

    const nm = parseFloat(nmField.value);
    const fp = parseFloat(fpField.value);

    if (isNm) {
      if (nmField.value.trim() === "") {
        fpField.value = "";
        setMessage("nm-ft-message", "");
        return;
      }

      if (!Number.isFinite(nm)) {
        fpField.value = "";
        setMessage(
          "nm-ft-message",
          "Enter a valid Newton meter value.",
          "error"
        );
        return;
      }

      fpField.value = formatNumber(nm * NM_TO_FT_LBS, 2);
      setMessage(
        "nm-ft-message",
        `${nm} Nm = ${fpField.value} ft-lbs`,
        "success"
      );
      return;
    }

    if (fpField.value.trim() === "") {
      nmField.value = "";
      setMessage("nm-ft-message", "");
      return;
    }

    if (!Number.isFinite(fp)) {
      nmField.value = "";
      setMessage(
        "nm-ft-message",
        "Enter a valid foot-pound value.",
        "error"
      );
      return;
    }

    nmField.value = formatNumber(fp / NM_TO_FT_LBS, 2);
    setMessage(
      "nm-ft-message",
      `${fp} ft-lbs = ${nmField.value} Nm`,
      "success"
    );
  }

  window.calculateTorque = function calculateTorque() {
    const hp = getNumber("torque-hp");
    const rpm = getNumber("torque-rpm");
    const serviceFactorRaw = getNumber("torque-service-factor");
    const serviceFactor = hasValue("torque-service-factor")
      ? serviceFactorRaw
      : 1;

    if (hp <= 0 || rpm <= 0) {
      setOutput("torque-result", "Enter horsepower and RPM.");
      setMessage(
        "torque-message",
        "Enter positive horsepower and RPM values.",
        "error"
      );
      return;
    }

    if (!Number.isFinite(serviceFactor) || serviceFactor <= 0) {
      setOutput("torque-result", "Check service factor.");
      setMessage(
        "torque-message",
        "Service factor must be a positive value. Use 1 if no service factor is needed.",
        "error"
      );
      return;
    }

    const runningTorqueFtLbs = (hp * HP_TORQUE_CONSTANT) / rpm;
    const runningTorqueNm = runningTorqueFtLbs * FT_LBS_TO_NM;
    const designTorqueFtLbs = runningTorqueFtLbs * serviceFactor;
    const designTorqueNm = runningTorqueNm * serviceFactor;

    const resultHtml = [
      `<strong>Running torque:</strong> ${formatNumber(
        runningTorqueFtLbs,
        2
      )} ft-lbs (${formatNumber(runningTorqueNm, 2)} Nm)`,
      `<strong>Design torque:</strong> ${formatNumber(
        designTorqueFtLbs,
        2
      )} ft-lbs (${formatNumber(designTorqueNm, 2)} Nm)`
    ].join("<br>");

    setOutputHtml("torque-result", resultHtml);
    setMessage(
      "torque-message",
      serviceFactor === 1
        ? "Torque calculated from horsepower and RPM."
        : `Torque calculated with a ${formatNumber(
            serviceFactor,
            2
          )} service factor.`,
      "success"
    );
  };

  function clearTorque() {
    setOutput("torque-result", "Enter horsepower and RPM.");
    setMessage("torque-message", "");
  }

  function nudgeDisclaimer() {
    const disclaimer = byId("calculator-disclaimer");
    const okButton = byId("calculator-disclaimer-ok");

    if (!disclaimer) return;

    disclaimer.classList.remove("needs-attention");

    // Force a reflow so repeated clicks restart the attention animation.
    void disclaimer.offsetWidth;

    disclaimer.classList.add("needs-attention");

    window.setTimeout(() => {
      disclaimer.classList.remove("needs-attention");
    }, 850);

    if (okButton && typeof okButton.focus === "function") {
      okButton.focus({ preventScroll: true });
    }

    notifyCalculatorPanelChange();
  }

  function notifyCalculatorPanelChange() {
    document.dispatchEvent(new CustomEvent("tsb-calculator-panel-change"));
  }

  function getCalculatorSelectorButtons() {
    return Array.from(document.querySelectorAll("[data-calculator-target]"));
  }

  function getCalculatorPanels() {
    return Array.from(document.querySelectorAll("[data-calculator-panel]"));
  }

  function activateCalculator(targetId, shouldFocusPanel) {
    const controls = byId("calculatorControls");
    const buttons = getCalculatorSelectorButtons();
    const panels = getCalculatorPanels();
    const activePanel = byId(targetId);

    if (!activePanel) return;

    if (controls) {
      controls.classList.add("has-calculator-selected");
    }

    buttons.forEach((button) => {
      const isActive = button.dataset.calculatorTarget === targetId;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-expanded", isActive ? "true" : "false");
    });

    panels.forEach((panel) => {
      const isActive = panel.id === targetId;

      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    if (shouldFocusPanel && typeof activePanel.focus === "function") {
      activePanel.focus({ preventScroll: true });
    }

    notifyCalculatorPanelChange();
  }

  function focusCalculatorSelection(currentButton, direction) {
    const buttons = getCalculatorSelectorButtons();
    const currentIndex = buttons.indexOf(currentButton);

    if (currentIndex === -1 || buttons.length === 0) return null;

    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
    const nextButton = buttons[nextIndex];

    if (!nextButton) return null;

    nextButton.focus({ preventScroll: true });
    return nextButton;
  }

  function moveCalculatorSelection(currentButton, direction) {
    const nextButton = focusCalculatorSelection(currentButton, direction);

    if (!nextButton || !disclaimerAccepted) return;

    activateCalculator(nextButton.dataset.calculatorTarget, false);
  }

  function bindCalculatorSelector() {
    const buttons = getCalculatorSelectorButtons();

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!disclaimerAccepted) {
          nudgeDisclaimer();
          return;
        }

        activateCalculator(button.dataset.calculatorTarget, true);
      });

      button.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          moveCalculatorSelection(button, 1);
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          moveCalculatorSelection(button, -1);
        }

        if (event.key === "Home") {
          event.preventDefault();
          const firstButton = buttons[0];

          if (firstButton) {
            firstButton.focus({ preventScroll: true });

            if (disclaimerAccepted) {
              activateCalculator(firstButton.dataset.calculatorTarget, false);
            }
          }
        }

        if (event.key === "End") {
          event.preventDefault();
          const lastButton = buttons[buttons.length - 1];

          if (lastButton) {
            lastButton.focus({ preventScroll: true });

            if (disclaimerAccepted) {
              activateCalculator(lastButton.dataset.calculatorTarget, false);
            }
          }
        }
      });
    });

    getCalculatorPanels().forEach((panel) => {
      panel.classList.remove("is-active");
      panel.hidden = true;
    });

    buttons.forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-expanded", "false");
      button.tabIndex = 0;
    });
  }

  function bindDisclaimerConsent() {
    const controls = byId("calculatorControls");
    const okButton = byId("calculator-disclaimer-ok");
    const disclaimer = byId("calculator-disclaimer");

    if (!controls || !okButton) return;

    disclaimerAccepted = false;
    controls.classList.add("is-waiting-for-disclaimer");
    controls.setAttribute("aria-disabled", "true");

    okButton.addEventListener("click", () => {
      disclaimerAccepted = true;
      controls.classList.remove("is-waiting-for-disclaimer");
      controls.setAttribute("aria-disabled", "false");

      if (disclaimer) {
        disclaimer.classList.remove("needs-attention");
        disclaimer.classList.add("is-accepted");
      }

      okButton.textContent = "Accepted";
      okButton.disabled = true;
      okButton.setAttribute("aria-disabled", "true");

      const firstFocusable = controls.querySelector(
        ".calculator-select-button"
      );

      if (firstFocusable && typeof firstFocusable.focus === "function") {
        firstFocusable.focus({ preventScroll: true });
      }

      notifyCalculatorPanelChange();
    });
  }

  function bindEvents() {
    bindDisclaimerConsent();
    bindCalculatorSelector();

    const vbeltButton = byId("vbelt-calculate");
    const pulleyButton = byId("pulley-calculate");
    const sprocketButton = byId("sprocket-calculate");
    const torqueButton = byId("torque-calculate");

    if (vbeltButton) {
      vbeltButton.addEventListener("click", window.calculateVbeltLength);
    }

    if (pulleyButton) {
      pulleyButton.addEventListener("click", window.calculatePulleySize);
    }

    if (sprocketButton) {
      sprocketButton.addEventListener("click", window.calculateSprocketSize);
    }

    if (torqueButton) {
      torqueButton.addEventListener("click", window.calculateTorque);
    }

    ["d1", "d2", "cd"].forEach((id) => {
      const field = byId(id);

      if (field) {
        field.addEventListener("input", () =>
          clearMessageAndOutput("vbelt-message", "vbelt-result")
        );
      }
    });

    ["drive-rpm", "output-rpm", "drive-diameter", "driven-diameter"].forEach(
      (id) => {
        const field = byId(id);

        if (field) {
          field.addEventListener("input", () =>
            clearMessageAndOutput(
              "pulley-message",
              "pulley-result",
              "Leave one diameter field blank."
            )
          );
        }
      }
    );

    [
      "drive-sprocket-rpm",
      "output-sprocket-rpm",
      "drive-sprocket-teeth",
      "driven-sprocket-teeth"
    ].forEach((id) => {
      const field = byId(id);

      if (field) {
        field.addEventListener("input", () =>
          clearMessageAndOutput(
            "sprocket-message",
            "sprocket-result",
            "Leave one tooth-count field blank."
          )
        );
      }
    });

    const inchField = byId("inchValue");
    const mmField = byId("mmValue");

    if (inchField) {
      inchField.addEventListener("input", () => convertInchToMm(true));
    }

    if (mmField) {
      mmField.addEventListener("input", () => convertInchToMm(false));
    }

    const nmField = byId("nmValue");
    const fpField = byId("fpValue");

    if (nmField) {
      nmField.addEventListener("input", () => convertNmToFp(true));
    }

    if (fpField) {
      fpField.addEventListener("input", () => convertNmToFp(false));
    }

    ["torque-hp", "torque-rpm", "torque-service-factor"].forEach((id) => {
      const field = byId(id);

      if (field) {
        field.addEventListener("input", clearTorque);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();

(function () {
  "use strict";

  const allowedParentOrigins = [
    "https://www.tristate-bearing.com",
    "https://tristate-bearing.com"
  ];

  let resizeTimer = null;

  function getDocumentHeight() {
    const body = document.body;
    const html = document.documentElement;

    return Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      html ? html.clientHeight : 0,
      html ? html.scrollHeight : 0,
      html ? html.offsetHeight : 0
    );
  }

  function postHeight() {
    const height = getDocumentHeight();

    allowedParentOrigins.forEach(function (origin) {
      window.parent.postMessage(
        {
          type: "tsb-calculators-height",
          height: height
        },
        origin
      );
    });
  }

  function schedulePostHeight() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(postHeight, 80);
  }

  window.addEventListener("load", postHeight);
  window.addEventListener("resize", schedulePostHeight);

  document.addEventListener("input", schedulePostHeight);
  document.addEventListener("change", schedulePostHeight);
  document.addEventListener("click", schedulePostHeight);
  document.addEventListener("tsb-calculator-panel-change", schedulePostHeight);

  window.addEventListener("message", function (event) {
    if (!allowedParentOrigins.includes(event.origin)) return;

    const data = event.data || {};

    if (data.type === "tsb-calculators-measure") {
      postHeight();
    }
  });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(schedulePostHeight);

    observer.observe(document.documentElement);

    if (document.body) {
      observer.observe(document.body);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedulePostHeight);
  } else {
    schedulePostHeight();
  }
})();