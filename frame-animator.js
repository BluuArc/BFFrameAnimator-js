var $ = $ || window.jQuery;

let FrameAnimator = (function(){
    "use strict";
    let self = {
        animatingCanvas: undefined, //dom object of canvas
        animationState: {
            framesUntilIncrement: 0,
            frameIndex: 0,
            isPlaying: false,
            speed: 1,
        }
    };
    let public_data = {};

    function init(options){
        self.animatingCanvas = d3.select(options.animationContainer)
            .append('canvas').attr('id','animatingCanvas').node();
    }

    function draw(getFrameFn){
        let context = self.animatingCanvas.getContext('2d');
        context.clearRect(0,0,self.animatingCanvas.width,self.animatingCanvas.height);

        let img = getFrameFn(self.animationState);
        context.drawImage(img,0,0);

        if(self.animationState.isPlaying){
            self.animationState.framesUntilIncrement--;
            requestAnimationFrame(() => {
                draw(getFrameFn);
            });
        }
    }

    function setCanvasDimensions(w,h){
        d3.select(self.animatingCanvas)
            .attr('width',w).attr('height',h);
    }

    function play(getFrameFn){
        if(!self.animationState.isPlaying){
            self.animationState.isPlaying = true;
            requestAnimationFrame(() => {
                draw(getFrameFn);
            });
        }
    }

    function stop(){
        self.animationState.isPlaying = false;
    }

    function setAnimationState(newState){
        self.animationState = newState;
    }


    public_data.animationState = self.animationState;
    public_data.init = init;
    public_data.setCanvasDimensions = setCanvasDimensions;
    public_data.play = play;
    public_data.stop = stop;
    public_data.setAnimationState = setAnimationState;
    return public_data;
})();