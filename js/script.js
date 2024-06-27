function closeOverlay(overlayId) {
    document.getElementById(overlayId).style.display = 'none';
}

function calculateVbeltLength() {
    const d1 = parseFloat(document.getElementById('d1').value);
    const d2 = parseFloat(document.getElementById('d2').value);
    const cd = parseFloat(document.getElementById('cd').value);

    if (isNaN(d1) || isNaN(d2) || isNaN(cd)) {
        alert('Please enter valid numbers.');
        return;
    }

    const beltLength = 2 * cd + (Math.PI / 2) * (d1 + d2) + ((d1 - d2) ** 2) / (4 * cd);
    document.getElementById('vbelt-result').value = `V-Belt Length: ${beltLength.toFixed(2)}`;
}

function calculatePulleySize() {
    const driveRPM = parseFloat(document.getElementById('drive-rpm').value);
    const outputRPM = parseFloat(document.getElementById('output-rpm').value);
    const driveDiameter = parseFloat(document.getElementById('drive-diameter').value);
    const drivenDiameter = parseFloat(document.getElementById('driven-diameter').value);

    if (isNaN(driveRPM) || isNaN(outputRPM)) {
        alert('Please enter valid RPM values.');
        return;
    }

    if (!isNaN(driveDiameter) && isNaN(drivenDiameter)) {
        const calculatedDrivenDiameter = (driveDiameter * driveRPM) / outputRPM;
        document.getElementById('driven-diameter').value = calculatedDrivenDiameter.toFixed(2);
        document.getElementById('driven-diameter').style.color = 'red';
    } else if (isNaN(driveDiameter) && !isNaN(drivenDiameter)) {
        const calculatedDriveDiameter = (drivenDiameter * outputRPM) / driveRPM;
        document.getElementById('drive-diameter').value = calculatedDriveDiameter.toFixed(2);
        document.getElementById('drive-diameter').style.color = 'red';
    } else {
        alert('Please leave one of the pulley diameter fields blank to calculate.');
    }
}

function calculateSprocketSize() {
    const driveRPM = parseFloat(document.getElementById('drive-sprocket-rpm').value);
    const outputRPM = parseFloat(document.getElementById('output-sprocket-rpm').value);
    const driveTeeth = parseFloat(document.getElementById('drive-sprocket-teeth').value);
    const drivenTeeth = parseFloat(document.getElementById('driven-sprocket-teeth').value);

    if (isNaN(driveRPM) || isNaN(outputRPM)) {
        alert('Please enter valid RPM values.');
        return;
    }

    if (!isNaN(driveTeeth) && isNaN(drivenTeeth)) {
        const calculatedDrivenTeeth = (driveTeeth * driveRPM) / outputRPM;
        document.getElementById('driven-sprocket-teeth').value = calculatedDrivenTeeth.toFixed(2);
        document.getElementById('driven-sprocket-teeth').style.color = 'red';
    } else if (isNaN(driveTeeth) && !isNaN(drivenTeeth)) {
        const calculatedDriveTeeth = (drivenTeeth * outputRPM) / driveRPM;
        document.getElementById('drive-sprocket-teeth').value = calculatedDriveTeeth.toFixed(2);
        document.getElementById('drive-sprocket-teeth').style.color = 'red';
    } else {
        alert('Please leave one of the sprocket teeth fields blank to calculate.');
    }
}
