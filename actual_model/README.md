# Description
Actual volume measurement model. This model is developed as part of the [NRI kids project](http://robotics.usc.edu/interaction/sponsors/desc.php?name=nrikids). It allows the operator of the Ohmni robot to tell whether people around him/her can hear his/hers voice or not. The data fed into the model are voice level of the operator, distance between the robot and the listener, and ambient noise level around the robot.

## Architecture of the model
The model is comprised of three parts. They are:
1. An Android app on the Android tablet on the [Ohmni Robot](https://ohmnilabs.com/). [Link to the code](https://github.com/lunjohnzhang/BackgroundAmbientSoundRecorder).
2. An web overlay for the operator to control the robot. (current repository)
3. A communication server dedicated to send data from the Android tablet on the robot to the overlay. [Link to the code](https://github.com/lunjohnzhang/ohmni_android_comm_server)

The voice level of the operator and the distance between the robot and the listener is obtained on the web overlay. The ambient noise level is obtained on the Android tablet.

### The robot (Android tablet)
We are primarily interested in the ambient noise level around the robot. To obtain such information on realtime, we implemented an Android app running on the background to retrieve and send such data to the overlay.

### The communication server
The server does nothing but receives ambient noise level data from the Android tablet on the robot and sends it to the web overlay using websocket. The server is implemented using express nodejs and is running permanently on [heroku](https://www.heroku.com/home).

### The web overlay
The web overlay is primarily responsible for retrieving the voice level of the operator, doing face detection, and receiving ambient noise level data from the communication server.

The main end point of the overlay is [overlay.html](https://nri-kids-interaction-lab.github.io/actual_model/overlay.html). You can add/modify/delete any GUI related functionality here.

The code dedicated to retrieve voice level of the operator is in `js/audio_record.js`. The volume meter we are using is in `js/volume_meter.js`. The volume meter would be automatically running once the overlay is loaded. We are using javascript webworker to put the volumne meter on another thread so that it does not affect face detection.

The code dedicated to detect faces is ... (TO DO)

The code dedicated to set up websocket connection with the communication server and receive ambient noise level data is in `js/socket.js`. Once the overlay is loaded, it sets up a connection with the server and reconnects to it everytime it is disconnected. The data is stored in `time_interval_ambient` at the top of the file.

Note that measurements of volume meter and ambient noise level are smoothed. The smoothing is determined by the fixed smooth constants (e.g. smooth constant of 1000 means taking the average of past 1000ms of data and feed it into the model). If you want to change the smooth constant, please edit `smoothConstOperator` variable in `js/audio_record.js` for voice level of the operator, or `smoothConstAmbient` in `js/socket.js` for ambient noise level.

The main model code is inside `js/model.js`. It computes the speakers output and compares it to a learned threshold. If the speakers output is larger than the threshold, the listener is predicted to be able to hear the operator's voice, which case the box around the listener would be green, else red.

# TO DO

- [] Maybe: only show icons when the operator is talking? 


NOTES
* The smoothers for operator voice and ambient noise could be made more efficient...probably not a huge deal, though.
* Regarding the webcam resolution:
	* Stream display in the web app seems to NOT stretch. It's only slightly wider than tall, maybe W = 1.33H
	* When we call captureVideo(resWidth, resHeight) it obeys us! So captureVideo(1, 100) compresses the image down to a 1x100 strip, which then gets stretched horizontally when we ask for it to display as a 200x200, so it ends up as a bunch of horizontal stripes.
* Tingxi says the webcam resolution is 1920x1080. But WATCH OUT: the size of the canvas on which it's being displayed depends on your browser window size, and our captureVideo() images are screen captures of that canvas! At least the canvas is scaled so the ratio doesn't change. 
* For smoothing the operator's vocal volume we are starting with a window of 1.5s. But beware of attenuated peak volumes! Matt knows what that means.
* The equation for distance based on face height assumes (as of 10/4) that all faces are actually 17cm tall. The face detector measures your face height from the very bottom of your chin to about your hairline. This is actually ~20cm for Matt and ~19.5cm for Yang, but the equation fits best (especially at longer distances) when using 19cm for Matt and ~17.5cm for Yang and Yulun. I've chosen 17cm to favor smaller faces since this will be deployed in a high school. ~Matt
* On 10/9 it was found that the volume appropriateness model works pretty well. This was in the lab with the A/C going right next to Matt's desk, which is moderately loud. Might want to test in a quieter setting, too. Anyway, the model gave the green check mark very liberally -- even when I (Matt) could just hardly hear one or two words from my distance. Might want to raise that bar a bit. 