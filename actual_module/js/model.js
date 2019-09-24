// ***
// model.js
// coontains the logic of the actual model
// ***

// regard faceHeight and faceWidth as constant for now
const actualFaceHeight = 0.225; // meter
const actualFaceWidth = 0.14; // meter

function setBotVolume(value) {
    // Value must be from 1 to 11.
    Ohmni.setBotVolume(value);
}

function getBotVolume() {
    Ohmni.getBotVolume();
}

function obtainSpeakerOutput() {
    // equation:
    // speaker_output = 3.4 * bot_volume + 8 * ln(smoothed_input_volume) + 58

    // obtain bot volume
    const botV = getBotVolume();
    const eps = 1e-8; // small constant added to the operator voice level to avoid outputing neg inf from Math.log

    // obtain smoothed input volume of the speaker
    var operatorVoicesLevelMean = 0;
    for (var i = 0; i < operatorVoicesLevel.length; i++) {
        operatorVoicesLevelMean += operatorVoicesLevel[i];
    }
    operatorVoicesLevelMean /= operatorVoicesLevelMean.length;

    // apply the equation and return the result
    const speakerOutput = 3.4 * botV + 8 * Math.log(operatorVoicesLevelMean + eps) + 58;
    return speakerOutput;
}

function applyVoiceModel(pixelFaceHeight) {
    const speakerOutput = obtainSpeakerOutput();
    console.log("speaker output: " + speakerOutput);
    // // obtain the ambient average ambient noise
    // var ambientNoiseMean = 0;
    // for(var i=0; i<ambientNoiseLevels.length; i++) {
    //     ambientNoiseMean += ambientNoiseLevels[i];
    // }
    // ambientNoiseMean /= ambientNoiseLevels.length;

    // // obtain the distance to the face
    // const distanceToFace = (0.5*actualFaceHeight) / Math.tan(0.5*pixelFaceHeight)

    // // obtain the threshold
    // const minIntelligibleMumblingVolume = 0.01168*ambientNoiseMean + 6.90635*distanceToFace;
}