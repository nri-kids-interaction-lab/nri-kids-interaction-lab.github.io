// ***
// socket.js
// establish websocket connection to communication server of ohmni Android tablet and the overlay
// receives and stores ambient sound level in ambientNoiseLevels array
// ***

const ambientNoiseLevels = []; // stores data from the Android app
const smoothConstAmbient = 1000 * 1.5; // 20 seconds

function setUpWebSocket() {
    const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
    const hostname = "ohmni-android-comm.herokuapp.com";
    const testHostname = "localhost:3000";
    const echoSocketUrl = socketProtocol + '//' + hostname + '/echo/'
    const socket = new WebSocket(echoSocketUrl);
    socket.onopen = () => {
        socket.send('Attemp to connect to server!');
    }

    socket.onmessage = e => {
        // obtain the current time in miliseconds and append to array
        const message = JSON.parse(e.data)
        // console.log("Noise level received: " + JSON.stringify(message));

        // if it the message is the establishment message, process it
        // console.log(message)
        /*
        format of message from Android:
        {
            time: 1569863893984,
            noiseLevel: 137.22881355932202
        }

        */
       // make sure message is not the establishment message and value is not zero (ambient recorder returns zero when operator is speaking)
        if (message.message != "Connection to overlay established" && message.noiseLevel != 0) {
            ambientNoiseLevels.push(message);
            // console.log(message);
            // remove all messages that are 1 second eslier than the current one, delete it
            while (ambientNoiseLevels[ambientNoiseLevels.length - 1].time - ambientNoiseLevels[0].time > smoothConstAmbient) {
                ambientNoiseLevels.shift();
            }
            // console.log("Message from server: ", JSON.parse(e.data));
            // console.log('Message from server:', e.data)
        }
    }

    socket.onclose = e => {
        setUpWebSocket();
    }

    socket.onerror = e => {
        console.log("web socket error")
    }
}

// function getTimeMili() {
//     var d = new Date();
//     return d.getTime();
// }