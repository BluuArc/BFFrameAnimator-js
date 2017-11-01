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
        },
        getFrameFn: () => console.log("No frame function specified")
    };
    let public_data = {};

    function init(options){
        self.animatingCanvas = d3.select(options.animationContainer)
            .append('canvas').attr('id','animatingCanvas').node();

        d3.select(options.playButton).on("click", () => togglePlayState(true));
        d3.select(options.stopButton).on("click", () => togglePlayState(false));
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
            self.getFrameFn = getFrameFn;
            self.animationState.isPlaying = true;
            requestAnimationFrame(() => {
                draw(getFrameFn);
            });
        }
    }

    function togglePlayState(state){
        if(!self.animationState.isPlaying && state == true){
            play(self.getFrameFn);
        }else{
            self.animationState.isPlaying = state == true;
        }
    }

    function setAnimationState(newState){
        self.animationState = newState;
    }


    public_data.animationState = self.animationState;
    public_data.init = init;
    public_data.setCanvasDimensions = setCanvasDimensions;
    public_data.play = play;
    public_data.togglePlayState = togglePlayState;
    public_data.setAnimationState = setAnimationState;
    return public_data;
})();