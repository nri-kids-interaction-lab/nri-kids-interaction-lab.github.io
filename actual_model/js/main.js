$(function(){
    setGlobals();
    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            /**
             * Your drawings need to be inside this function otherwise they will be reset when 
             * you resize the browser window and the canvas goes will be cleared.
             */
            
            drawStuff(); 
    }
    resizeCanvas();

    function setGlobals(){
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        image = document.getElementById('source');
    }
    function getCenterFromWH(width,height){
        return [(canvas.width - width)/2.0, (canvas.height- height)/2.0 - 200]
    }

    function getStrokeColor(color){
        var frequency = .3;
        var red = Math.floor(Math.sin(frequency*color + 0) * 127 + 128);
        var green = Math.floor(Math.sin(frequency*color + 2) * 127 + 128);
        var blue = Math.floor(Math.sin(frequency*color + 4) * 127 + 128);
        return "#" + 
            red.toString(16) + 
            green.toString(16) + 
            blue.toString(16);
    }

    function drawStuff() {
            var thicknessSlider = document.getElementById("thicknessSlider");
            var widthSlider = document.getElementById("widthSlider");
            var heightSlider = document.getElementById("heightSlider");
            var colorSlider = document.getElementById("colorSlider");

            var thickValue = document.getElementById("thickValue");
            var widthValue = document.getElementById("widthValue");
            var heightValue = document.getElementById("heightValue");
            var colorValue = document.getElementById("colorValue");
            

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var center = getCenterFromWH(widthSlider.value,heightSlider.value);
            strokeColor = getStrokeColor(colorSlider.value);
           
            drawSquare(center[0],
                center[1],
                widthSlider.value,
                heightSlider.value, 
                thicknessSlider.value,
                strokeColor);
            drawCancel();

            thickValue.innerHTML = "Thickness Value: " + thicknessSlider.value;
            widthValue.innerHTML = "Width Value: " + widthSlider.value;
            heightValue.innerHTML = "Height Value: " + heightSlider.value;
            colorValue.innerHTML = "Color Value: " + strokeColor;

            rafID = window.requestAnimationFrame( drawStuff );
    }

    function drawSquare(x, y, w, h, thickness, strokeColor){
        ctx.beginPath();
        ctx.lineWidth=thickness;
        ctx.strokeStyle= strokeColor;
        ctx.rect(x,y,w,h); 
        ctx.stroke();
    }

    function drawCancel(){
        // how to change transparency
        ctx.globalAlpha = 0.5
        ctx.drawImage(image, 10, 10);
        ctx.globalAlpha = 1
    }
});




