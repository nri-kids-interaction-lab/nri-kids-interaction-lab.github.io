// ***
// socket.js
// establish websocket connection to communication server of ohmni Android tablet and the overlay
// receives and stores ambient sound level in ambient_noise_levels array
// ***

const ambient_noise_levels = []; // stores data from the Android app

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
        const time = getTimeMili();
        const message = {
            "time": time,
            "data": JSON.parse(e.data)
        }
        console.log(JSON.stringify(message));

        // if it the message is the establishment message, process it
        console.log(message.data)
        if (message.data.message != "Connection to overlay established") {
            ambient_noise_levels.push(message);
            // remove all messages that are 1 second eslier than the current one, delete it
            while (ambient_noise_levels[ambient_noise_levels.length - 1].time - ambient_noise_levels[0].time > 1000) {
                ambient_noise_levels.shift();
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

function getTimeMili() {
    var d = new Date();
    return d.getTime();
}