// ***
// model.js
// coontains the logic of the actual model
// ***


// regard faceHeight and faceWidth as constant for now
const actualFaceHeight = 0.225; // meter
const actualFaceWidth = 0.14; // meter
var botV = 0; // bot volume

function setBotVolume(value) {
    // Value must be from 1 to 11.
    Ohmni.setBotVolume(value);
}

function getBotVolume() {
    Ohmni.getBotVolume();
}

// call back of getBotVolume
function getBotVolumeCb(value) {
    botV = value;
}

function takeMedianOperator(array_) {
    array_.sort(function(a, b){return a-b});
    if (array_.length == 0) {
        return 0;
    }

    const mid1 = array_[Math.floor((array_.length) / 2) - 1];
    const mid2 = array_[Math.floor((array_.length) / 2)];

    if (array_.length % 2 == 0) {
        return (mid1.volume + mid2.volume) / 2;
    }
    else if (array_.length % 2 != 0) {
        return mid2.volume;
    }
}

function takeMedianAmbient(array_) {
    array_.sort(function(a, b){return a-b});
    if (array_.length == 0) {
        return 0;
    }

    const mid1 = array_[Math.floor((array_.length) / 2) - 1];
    const mid2 = array_[Math.floor((array_.length) / 2)];

    if (array_.length % 2 == 0) {
        return (mid1.noiseLevel + mid2.noiseLevel) / 2;
    }
    else if (array_.length % 2 != 0) {
        return mid2.noiseLevel;
    }
}


function obtainSpeakerOutput() {
    // equation:
    // speaker_output = 3.4 * bot_volume + 8 * ln(smoothed_input_volume) + 58

    // obtain bot volume
    getBotVolume();
    // console.log("botV: " + botV);
    const eps = 1e-8; // small constant added to the operator voice level to avoid outputing neg inf from Math.log

    // obtain smoothed input volume of the speaker
    const operatorVoicesLevelMedian = (takeMedianOperator(operatorVoicesLevel.slice()));
    console.log("operator median: " + operatorVoicesLevelMedian);

    // console.log(operatorVoicesLevel);
    // console.log("median: " + operatorVoicesLevelMedian);
    // apply the equation and return the result
    const speakerOutput = 3.4 * botV + 8 * Math.log(operatorVoicesLevelMedian + eps) + 58;
    return speakerOutput;
}

function applyVoiceModel(pixelFaceHeight) {
    const speakerOutput = obtainSpeakerOutput();
    console.log("speaker output: " + speakerOutput);

    // obtain the ambient average ambient noise
    var ambientNoiseMedian = (takeMedianAmbient(ambientNoiseLevels.slice()));
    console.log("ambient median: " + ambientNoiseMedian);

    // obtain the distance to the face d = .5 * .225 / tan(.5 * h_pix *  0.0090175)
    const distanceToFace = 0.5 * 0.225 / Math.tan(0.5 * pixelFaceHeight * 0.0090175);
    console.log("distance to face: " + distanceToFace);

    // obtain the threshold:
    // min_intelligible_mumbling_volume(dB) = 0.01168*smoothed_ambient_volume + 6.90635*ln(distance_in_meters) + 49.40575
    const minIntelligibleMumblingVolume = 0.01168 * ambientNoiseMedian + 6.90635 * Math.log(distanceToFace) + 49.40575;
    console.log("threshold: " + minIntelligibleMumblingVolume);

    // if the speaker output is above threshold, return true (the listener can hear the speaker, else return false)
    if (speakerOutput >= minIntelligibleMumblingVolume) {
        return true;
    }
    else {
        return false;
    }
}