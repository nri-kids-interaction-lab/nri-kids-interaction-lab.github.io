/*
The MIT License (MIT)
Copyright (c) 2014 Chris Wilson
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var audioContext = null;
var meter = null;
var ctx = null;
var WIDTH = 500;
var HEIGHT = 50;
var rafID = null;

var operatorVoicesLevel = []; // store smoothed volume of robot operator
const smoothConstOperator = 1000 * 1.5; // smoothing constant, in miliseconds


function loadAudioContext() {
    // grab our canvas
    // ctx = document.getElementById("meter").getContext("2d");

    // monkeypatch Web Audio
    // console.log(self);
    // window = self;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);
        }

        // ask for an audio input
        navigator.getUserMedia({
            audio: true
        }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }

}


function didntGetStream() {
    alert('Couldnt get the stream');
}

var mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // set radius for lerp over frames
    volumeRadiusChange = 0;
    lastAlpha = 0;

    // kick off the visual updating
    // drawLoop();

    // kick off speaker level updating
    updateSpeakerLevel();
}

function lerp(a, b, f) {
    return a + f * (b - a);
}

// function drawLoop(time) {
//     // clear the background
//     ctx.canvas.width = window.innerWidth;
//     ctx.canvas.height = window.innerHeight;

//     // check if we're currently clipping
//     //meter.checkClipping()


//     // volumechange
//     // TODO, make this into an ellipse
//     // big circle constant radius
//     var slider1 = document.getElementById("myRange");
//     var slider2 = document.getElementById("myRange2");
//     var slider3 = document.getElementById("myRange3");
//     var slider4 = document.getElementById("myRange4");

//     lastAlpha = meter.volume > slider1.value ?
//         lerp(lastAlpha, meter.volume, slider2.value) :
//         lerp(lastAlpha, 0, slider2.value);

//     volumeRadiusChange = meter.volume > slider1.value ?
//         lerp(volumeRadiusChange, meter.volume * slider4.value, slider3.value) :
//         lerp(volumeRadiusChange, 0, slider3.value);

//     ctx.globalAlpha = lastAlpha;

//     //console.log(slider1.value, slider2.value, slider3.value, slider4.value);
//     // console.log(meter.volume);

//     // console.log(operatorVoicesLevel);
//     var fullScreenRadius = Math.min(window.innerWidth / 2.0, window.innerHeight / 2.0);
//     var circleRadius = fullScreenRadius - volumeRadiusChange;
//     var grd = ctx.createRadialGradient(
//         window.innerWidth / 2.0, // small x 
//         window.innerHeight / 2.0, // small y 
//         window.innerHeight / 2.0, // small r
//         window.innerWidth / 2.0, // large x
//         window.innerHeight / 2.0, // large y
//         window.innerHeight // large r
//     );


//     grd.addColorStop(0, "blue");
//     grd.addColorStop(1, "red");

//     ctx.fillStyle = grd;

//     ctx.beginPath();
//     ctx.arc(window.innerWidth / 2.0, window.innerHeight / 2.0, circleRadius, 0, 2 * Math.PI);
//     ctx.rect(window.innerWidth, 0, -window.innerWidth, window.innerHeight);
//     ctx.fill();




//     // set up the next visual callback
//     rafID = window.requestAnimationFrame(drawLoop);
// }

function updateSpeakerLevel(time) {
    // push measured volume to the array along with the timestamp
    const e = {
        "time": getTimeMili(),
        "volume": meter.volume
    }
    operatorVoicesLevel.push(e);

    //console.log(e.time + " " + e.volume);
    // delete all measures that are some time interval ago.
    while (operatorVoicesLevel[operatorVoicesLevel.length - 1].time - operatorVoicesLevel[0].time > smoothConstOperator) {
        operatorVoicesLevel.shift();
    }
    // console.log(operatorVoicesLevel);

    // console.log(operatorVoicesLevel[operatorVoicesLevel.length - 1]);
    rafID = window.requestAnimationFrame(updateSpeakerLevel);
}

function getTimeMili() {
    var d = new Date();
    return d.getTime();
}

// runs audio recorder in another thread
function startAudioRecorder(){
    return new Promise(function(resolve, reject) {
        loadAudioContext();
    });
}
// startAudioRecorder();
