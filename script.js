// Overlay handling function
function closeOverlay(id) {
    document.getElementById(id).style.display = 'none';
}

// V-Belt Length Calculator function
function calculateVbeltLength() {
  const d1 = parseFloat(document.getElementById('d1').value); // small pulley
  const d2 = parseFloat(document.getElementById('d2').value); // large pulley
  const C  = parseFloat(document.getElementById('cd').value); // center distance
  const resultField = document.getElementById('vbelt-result');

  if (d1 && d2 && C) {
    // Standard V‐belt length formula:
    const L = 
      2 * C
      + (Math.PI / 2) * (d1 + d2)
      + Math.pow(d2 - d1, 2) / (4 * C);

    resultField.value = L.toFixed(2);
  } else {
    resultField.value = 'Invalid input';
  }
}

// Pulley Size Calculator function
function calculatePulleySize() {
    const driveRpm = parseFloat(document.getElementById('drive-rpm').value);
    const outputRpm = parseFloat(document.getElementById('output-rpm').value);
    const driveDiameter = parseFloat(document.getElementById('drive-diameter').value);
    const drivenDiameter = parseFloat(document.getElementById('driven-diameter').value);
    
    if (driveRpm && outputRpm) {
        if (!driveDiameter && drivenDiameter) {
            document.getElementById('drive-diameter').value = ((outputRpm / driveRpm) * drivenDiameter).toFixed(2);
        } else if (driveDiameter && !drivenDiameter) {
            document.getElementById('driven-diameter').value = ((driveRpm / outputRpm) * driveDiameter).toFixed(2);
        } else {
            alert('Please leave one of the diameter fields blank for calculation.');
        }
    } else {
        alert('Please enter valid RPM values.');
    }
}

// Sprocket Size Calculator function
function calculateSprocketSize() {
    const driveSprocketRpm = parseFloat(document.getElementById('drive-sprocket-rpm').value);
    const outputSprocketRpm = parseFloat(document.getElementById('output-sprocket-rpm').value);
    const driveSprocketTeeth = parseFloat(document.getElementById('drive-sprocket-teeth').value);
    const drivenSprocketTeeth = parseFloat(document.getElementById('driven-sprocket-teeth').value);
    
    if (driveSprocketRpm && outputSprocketRpm) {
        if (!driveSprocketTeeth && drivenSprocketTeeth) {
            document.getElementById('drive-sprocket-teeth').value = ((outputSprocketRpm / driveSprocketRpm) * drivenSprocketTeeth).toFixed(2);
        } else if (driveSprocketTeeth && !drivenSprocketTeeth) {
            document.getElementById('driven-sprocket-teeth').value = ((driveSprocketRpm / outputSprocketRpm) * driveSprocketTeeth).toFixed(2);
        } else {
            alert('Please leave one of the teeth fields blank for calculation.');
        }
    } else {
        alert('Please enter valid RPM values.');
    }
}

// Inches to Millimeters Converter
document.getElementById("inchValue").addEventListener("input", () => {
    convertInchToMm(true);
});
document.getElementById("mmValue").addEventListener("input", () => {
    convertInchToMm(false);
});

function convertInchToMm(isInch) {
    let inchField = document.getElementById("inchValue");
    let mmField = document.getElementById("mmValue");
    let inch = parseFloat(inchField.value) || 0;
    let mm = parseFloat(mmField.value) || 0;

    if (isInch) {
        if (inch) mmField.value = (inch * 25.4).toFixed(2);
        else mmField.value = '';
    } else {
        if (mm) inchField.value = (mm / 25.4).toFixed(2);
        else inchField.value = '';
    }
}

// Newton Meters to Foot Pounds Converter
document.getElementById("nmValue").addEventListener("input", () => {
    convertNmToFp(true);
});
document.getElementById("fpValue").addEventListener("input", () => {
    convertNmToFp(false);
});

function convertNmToFp(isNm) {
    let nmField = document.getElementById("nmValue");
    let fpField = document.getElementById("fpValue");
    let nm = parseFloat(nmField.value) || 0;
    let fp = parseFloat(fpField.value) || 0;

    if (isNm) {
        if (nm) fpField.value = (nm * 0.73756).toFixed(2);
        else fpField.value = '';
    } else {
        if (fp) nmField.value = (fp / 0.73756).toFixed(2);
        else nmField.value = '';
    }
}

// Torque Calculator
document.querySelectorAll('input[name="driveType"]').forEach((elem) => {
    elem.addEventListener("change", resetTorqueCalculator);
});
document.getElementById("loadTorque").addEventListener("input", calculateTorque);
document.getElementById("netTorque").addEventListener("input", calculateTorqueReverse);

function resetTorqueCalculator() {
    document.getElementById("loadTorque").value = '';
    document.getElementById("netTorque").value = '';
}

function calculateTorque() {
    let loadTorque = parseFloat(document.getElementById("loadTorque").value) || 0;
    let netTorqueField = document.getElementById("netTorque");
    let driveType = document.querySelector('input[name="driveType"]:checked').value;

    if (loadTorque) {
        let netTorque;
        if (driveType === "belt") {
            netTorque = loadTorque * 1.1; // Example calculation for belt
        } else {
            netTorque = loadTorque * 1.2; // Example calculation for chain
        }
        netTorqueField.value = netTorque.toFixed(2);
    } else {
        netTorqueField.value = '';
    }
}

function calculateTorqueReverse() {
    let netTorque = parseFloat(document.getElementById("netTorque").value) || 0;
    let loadTorqueField = document.getElementById("loadTorque");
    let driveType = document.querySelector('input[name="driveType"]:checked').value;

    if (netTorque) {
        let loadTorque;
        if (driveType === "belt") {
            loadTorque = netTorque / 1.1; // Example reverse calculation for belt
        } else {
            loadTorque = netTorque / 1.2; // Example reverse calculation for chain
        }
        loadTorqueField.value = loadTorque.toFixed(2);
    } else {
        loadTorqueField.value = '';
    }
}
