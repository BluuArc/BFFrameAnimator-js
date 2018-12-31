const FrameAnimator = function () {
  "use strict";
  const self = {
    stageCanvas: undefined,
    animationState: {
      framesUntilRedraw: 0,
      currentFrameIndex: 0,
      isPlaying: false,
      frames: [],
      lastKnownDelay: 0,
      speed: 1,
    },
    onAnimStart: nop, // when index is 0, before frame is drawn
    beforeRedraw: nop, // before frame is drawn
    afterRedraw: nop, // after frame is drawn
    onAnimEnd: nop // when index === frames.length - 1, after frame is drawn
  };
  /* 
    TODO: add frame set array to animation state -> arrays of sprite entities
      - each index has delay, index, frames, and id
        - add draw position on canvas as an option
      - event handlers will have id as extra parameter)
  */

  function nop(animationState) {}

  function setStageCanvas(domCanvas) {
    self.stageCanvas = domCanvas;
  }

  function setFrames(arr = []) {
    self.animationState.frames = arr;
    self.animationState.currentFrameIndex = 0;
  }

  function setAnimationState(newState) {
    self.animationState = newState;
  }

  // send no arguments to toggle
  function pause() {
    self.animationState.isPlaying = false;
  }

  // each function is keyed by associated callback name
  function setCallbackFunctions(funcs = {}) {
    const callbacks = ['onAnimStart', 'beforeRedraw', 'afterRedraw', 'onAnimEnd'];
    callbacks.forEach(cbName => {
      if (typeof funcs[cbName] === 'function') {
        self[cbName] = funcs[cbName];
      }
    });
  }

  function setCanvasDimensions(w, h) {
    $(self.stageCanvas).attr('width', w).attr('height', h);
  }

  function clearCanvas() {
    if (self.stageCanvas) {
      self.stageCanvas.getContext('2d').clearRect(0, 0, self.stageCanvas.width, self.stageCanvas.height);
    }
  }

  function getCurrentFrameIndex() {
    return self.animationState.currentFrameIndex;
  }

  function draw() {
    self.beforeRedraw(self.animationState);

    const currentFrame = self.animationState.frames[self.animationState.currentFrameIndex++];
    const context = self.stageCanvas.getContext('2d');
    clearCanvas();
    context.drawImage(
      currentFrame,
      0, 0
    );

    self.animationState.lastKnownDelay = currentFrame.$frameMakerData.delay;
    self.animationState.framesUntilRedraw = self.animationState.lastKnownDelay;

    self.afterRedraw(self.animationState);

    if (self.animationState.currentFrameIndex >= (self.animationState.frames.length - 1)) {
      self.onAnimEnd(self.animationState);
      self.animationState.currentFrameIndex = 0;
    }
  }

  function tick() {
    if (self.animationState.framesUntilRedraw + 1 === self.animationState.lastKnownDelay &&
        self.animationState.currentFrameIndex === 0) {
      self.onAnimStart(self.animationState);
    } else if (self.animationState.framesUntilRedraw <= 0) {
      draw();
    }

    if (self.animationState.isPlaying) {
      self.animationState.framesUntilRedraw -= self.animationState.speed;
      requestAnimationFrame(() => tick());
    }
  }

  function play() {
    if(!self.animationState.isPlaying) {
      console.debug('starting playback');
      self.animationState.isPlaying = true;
      requestAnimationFrame(() => tick());
    }
  }

  return {
    setStageCanvas,
    setFrames,
    setAnimationState,
    setCallbackFunctions,
    setCanvasDimensions,
    getCurrentFrameIndex,
    pause,
    play
  };
};
