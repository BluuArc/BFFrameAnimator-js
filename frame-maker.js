
var $ = $ || window.jQuery;

let FrameMaker = (function(){
    "use strict";
    let self = {
        components: {
            sheet: undefined, //d3 object of image container
            frame: undefined, //d3 object of frame container
            parts: undefined //d3 object of parts container
        },
        noInit: true,
        frames: { //keys are animation types, values are arrays of canvas frames
        },
    };
    let public_data = {};

    const servers = {
        eu: "http://static-bravefrontier.gumi-europe.net/content/",
        gl: "http://2.cdn.bravefrontier.gumi.sg/content/",
        jp: "http://cdn.android.brave.a-lim.jp/",
    };

    const filepaths = {
        cgg: "unit/cgg/",
        cgs: "unit/cgs/",
        anime: "unit/img/"
    };

    const cgsTypes = ['idle', 'move', 'atk', 'skill'];

    //frame, parts, and sheet are CSS selectors as strings
    function init(options){
        if (!d3) {
            throw "Missing d3 library";
        }else if(!$){
            throw "Missing jQuery library";
        }else if(!options){
            throw "Missing options parameter";
        }else if(!options.frame){
            throw "Missing frame selector";
        }else if(!options.parts){
            throw "Missing parts selector";
        }else if(!options.sheet){
            throw "Missing sheet selector"
        }else{
            delete self.noInit;
        }

        self.components.frame = d3.select(options.frame);
        self.components.parts = d3.select(options.parts);
        self.components.sheet = d3.select(options.sheet);
        self.components.sheet.selectAll('img').remove();
    }

    function loadCSV(path) {
        return new Promise((fulfill, reject) => {
            try {
                $.get("/get/" + encodeURIComponent(path), function (data) {
                    try{
                        let csv = data.split('\n').map((line) => {
                            return line.split(',');
                        })
                        fulfill(csv);
                    }catch(err){
                        reject(err);
                    }
                })
            } catch (err) {
                reject(err);
            }
        });
    }


    /*  unitInfo has the following properties:
        id: the ID of the unit (e.g. 10011)
        server: the server the unit can be found on (i.e. gl, jp, or eu)
        animation: { //optional; contains custom information to use for the unit
            anime: array of sprite sheet urls
            cgg: url of cgg file
            cgs: {
                <animation name>: <animation url>
            }
        }
    */
    function isValidUnitInfo(unitInfo){
        if(!unitInfo){
            throw "No unit info specified";
        }else if(!unitInfo.id){
            throw "No unit ID specified";
        }else if(!unitInfo.server){
            throw "No server specified";
        }else{
            unitInfo.animation = unitInfo.animation || {};
            return true;
        }
    }

    function loadSpritesheets(sheetArr){
        let loadSpriteSheet = function(sheetUrl, domTarget) {
            return new Promise((fulfill,reject) => {
                d3.select(domTarget).on('load', () => {
                    fulfill();
                }).on('error',(err) => {
                    console.log("Didn't load",sheetUrl);
                    reject(err);
                })
                .attr('src', "/getImage/" + encodeURIComponent(sheetUrl));
            });
        }

        self.components.sheet.selectAll('img').remove();

        console.log(sheetArr);

        let loadPromises = [];
        self.components.sheet.selectAll('img')
            .data(sheetArr).enter().append('img')
            .attr('id', (d,i) => { return `sheet${i}`})
            // .attr('crossOrigin', "Anonymous")
            .each(function(d,i){
                loadPromises.push(loadSpriteSheet(d,this));
            });

        return Promise.all(loadPromises);
    }

    function loadAnimationData(unitInfo){
        const prefixUrl = servers[unitInfo.server];
        let animationData = {
            cgg: undefined,
            cgs: {}
        };
        let processCGG = function(data){
            let cggData = [];
            for (let frame of data) {
                if (frame.length < 2) {
                    console.log("encountered empty frame, skipping");
                    continue;
                }
                let cgg = {};
                cgg.anchorType = +frame[0];
                cgg.part_count = +frame[1];
                cgg.frame_data = [];

                let curIndex = 2,
                    part_count = 0;
                while (part_count < cgg.part_count) {
                    let frameInfo = {};
                    frameInfo.position = { //origin is middle
                        x: +frame[curIndex++],
                        y: +frame[curIndex++]
                    };
                    frameInfo.next_type = +frame[curIndex++];
                    frameInfo.blend_mode = +frame[curIndex++];
                    frameInfo.opacity = +frame[curIndex++];
                    frameInfo.rotate = +frame[curIndex++];
                    frameInfo.img = { //origin is top left
                            x: +frame[curIndex++],
                            y: +frame[curIndex++],
                            width: +frame[curIndex++],
                            height: +frame[curIndex++],
                        },
                        frameInfo.page_id = +frame[curIndex++];

                    let isValid = true;
                    for (let f in frameInfo) {
                        if (f !== "position" && f !== "img" && isNaN(frameInfo[f])) {
                            isValid = false;
                        }
                    }
                    if (isValid) {
                        part_count++;
                        cgg.frame_data.push(frameInfo);
                    } else {
                        console.log("NaN issue with", frameInfo, cgg);
                    }
                }
                cggData.push(cgg);
            }
            return cggData;
        };

        let processCGS = function(data){
            let cgsData = [];
            for (let frame of data) {
                let frameInfo = {};
                frameInfo.frame_index = +frame[0];
                frameInfo.x_pos_offset = +frame[1];
                frameInfo.y_pos_offset = +frame[2];
                frameInfo.frame_delay = +frame[3];
                let isValid = true;
                for(let f in frameInfo){
                    if(isNaN(frameInfo[f])){
                        isValid = false;
                    }
                }
                if(isValid)
                    cgsData.push(frameInfo);
                else
                    console.log("Ignoring NaN CGS line",frameInfo);
            }
            return cgsData;
        }

        const cgg = `${prefixUrl}${filepaths.cgg}unit_cgg_${unitInfo.id}.csv`, cgsPrefix = `${prefixUrl}${filepaths.cgs}`;

        let cggPromise = loadCSV(cgg)
            .then((data) => {
                console.log(data);
                animationData.cgg = processCGG(data);
            });
        
        let cgsPromises = [];
        for(const c of cgsTypes){
            let curPromise = loadCSV(`${cgsPrefix}unit_${c}_cgs_${unitInfo.id}.csv`)
                .then((data) => {
                    animationData.cgs[c] = processCGS(data);
                }).catch((err) => {
                    console.log(err);
                    delete animationData.cgs[c];
                    return;
                });
            cgsPromises.push(curPromise);
        }


        return Promise.all([cggPromise,...cgsPromises])
            .then(() => {
                return animationData;
            });
    }

    //need animInfo for bounds checking
    function drawFrames(spritesheets,cggData,animInfo,targetContainer,animType){
        targetContainer.selectAll('canvas').remove();
        self.frames[animType] = [];

        let drawFrame = function(frameData,targetCanvas,sourceSheets,frameBounds, drawIntermediate){
            const origin = {
                x: targetCanvas.width / 2,
                y: targetCanvas.height / 2
            };
            let context = targetCanvas.getContext('2d');
            let tempCanvas = self.components.parts.select("#temp" + animType).node();
            
            // for (let i = frameData.frame_data.length - 1; i >= 0; --i) {
            for (let i = frameData.frame_data.length - 1; i >= 0 ; --i) {
                let f = frameData.frame_data[i]; //draw in reverse order
                let tempContext = tempCanvas.getContext('2d');
                const w = f.img.width, h = f.img.height;

                tempContext.clearRect(0,0,tempCanvas.width,tempCanvas.height);
                tempContext.globalAlpha = f.opacity/100;

                let flipX = f.next_type == 1 || f.next_type == 3;
                let flipY = f.next_type == 2 || f.next_type == 3;
                if(flipX || flipY || f.rotate !== 0){
                    let partCanvas = self.components.parts.append('canvas')
                        .attr('width',w).attr('height',h);
                    let pContext = partCanvas.node().getContext('2d');

                    //set flips
                    pContext.translate(flipX ? w : 0, flipY ? h : 0);
                    pContext.scale(flipX ? -1 : 1, flipY ? -1 : 1);

                    pContext.drawImage(
                        sourceSheets[f.page_id],
                        f.img.x, f.img.y, w, h,
                        0, 0, w, h
                    );

                    if (f.rotate !== 0) {
                        pContext.rotate(f.rotate * Math.PI / 180);
                        console.log(f.rotate, partCanvas.node());
                    }
                    
                    let startX = f.position.x + origin.x + frameBounds.offset.x,
                        startY = f.position.y + origin.y + frameBounds.offset.y,
                        rotationOffsetX = 0, rotationOffsetY = 0, isLandscape = w > h;
                    if (f.rotate !== 0) {
                        tempContext.translate(startX + (w / 2), startY + (h / 2));
                        tempContext.rotate(-f.rotate * Math.PI / 180);
                        tempContext.translate(-(startX + (w / 2)), -(startY + (h / 2)));
                        console.log(f.rotate, partCanvas.node());

                        let angle = f.rotate;
                        while(angle < 0){
                            angle += 360;
                        }

                        if(angle === 90 || angle === 270){
                            rotationOffsetY -= isLandscape ? h : 0;
                            rotationOffsetX -= !isLandscape ? w : 0;
                                
                        }

                    }
                    
                    tempContext.drawImage(
                        partCanvas.node(),
                        0, 0, w, h,
                        startX + rotationOffsetX, startY + rotationOffsetY, w, h
                    );

                    if (f.rotate !== 0) {
                        tempContext.translate(startX + (w / 2), startY + (h / 2));
                        tempContext.rotate(f.rotate * Math.PI / 180);
                        tempContext.translate(-(startX + (w / 2)), -(startY + (h / 2)));
                        // console.log(f.rotate, partCanvas.node());
                    }
                }else{
                    tempContext.drawImage(
                        sourceSheets[f.page_id],
                        f.img.x, f.img.y, w, h,
                        f.position.x + origin.x + frameBounds.offset.x, f.position.y + origin.y + frameBounds.offset.y, w, h
                    );
                }
                

                //blend code based off of this: http://pastebin.com/vXc0yNRh
                if(f.blend_mode === 1){
                    let imgData = tempContext.getImageData(0,0,targetCanvas.width,targetCanvas.height);
                    let pixelData = imgData.data;
                    for(let p = 0; p < pixelData.length; p += 4){
                        let [r,g,b,a] = [pixelData[p],pixelData[p+1],pixelData[p+2],pixelData[p+3]];
                        if(a > 0){
                            let multiplier = 1 + (a*f.opacity/100)/255.0;
                            if(f.blend_mode === 1){
                                r = Math.min(255,Math.floor(r * multiplier));
                                g = Math.min(255,Math.floor(g * multiplier));
                                b = Math.min(255,Math.floor(b * multiplier));
                                a = Math.floor(((r+g+b)/3)*f.opacity/100);
                            }
                            if(r+g+b < 50) a = 0;
                            
                            [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]] = [r,g,b,a];
                        }
                    }
                    tempContext.putImageData(imgData,0,0);
                }


                //copy result to final canvas
                context.drawImage(tempCanvas,0,0);
                if(drawIntermediate){
                    let intermediateCanvas = self.components.parts.append('canvas')
                        .attr('width',targetCanvas.width).attr('height', targetCanvas.height)
                        .style('width', targetCanvas.width).style('height', targetCanvas.height)
                    intermediateCanvas.node().getContext('2d').drawImage(targetCanvas,0,0);
                }
            }
        }

        let actualFrames = []; //frames to draw

        //analyze bounds - to refactor?
        let xMin, yMin, xMax, yMax;
        for (let i of animInfo) {
            let frameData = cggData[i.frame_index];
            actualFrames.push(frameData);
            for (let f of frameData.frame_data) {
                let w = f.img.width, h = f.img.height;
                //set mins
                !isNaN(xMin) ? (xMin = Math.min(xMin, f.position.x - w)) : (xMin = f.position.x - w);
                !isNaN(yMin) ? (yMin = Math.min(yMin, f.position.y - ((animType === "atk") ? h : 0))) : (yMin = f.position.y - ((animType === "atk") ? h : 0));

                //set max
                !isNaN(xMax) ? (xMax = Math.max(xMax, f.position.x + w)) : (xMax = f.position.x + w);
                !isNaN(yMax) ? (yMax = Math.max(yMax, f.position.y + h)) : (yMax = f.position.y + h);
            }
        }
        //store bounds
        const frameBounds = {
            x: [xMin, xMax],
            y: [yMin, yMax],
            w: (xMax - xMin),
            h: yMax - yMin,
            offset: {//add to move sprite to right/bottom, add half to center - use as needed
                x: animType === "atk" ? (xMax - xMin)*0.125 : 0,
                y: animType === "atk" ? (yMax-yMin)*0.20 : (yMax - yMin)*0.40
            }
        };

        console.log(actualFrames);

        //create temporary canvas
        let tempCanvas = self.components.parts
            .append('canvas').attr('id','temp' + animType)
            .attr('width', frameBounds.w).attr('height', frameBounds.h);

        targetContainer.selectAll('canvas')
            .data(actualFrames).enter().append('canvas')
            .attr('width', frameBounds.w).attr('height', frameBounds.h)
            .attr('id', (d,i) => { return "frame" + i; })
            .attr('delay', (d,i) => { return animInfo[i].frame_delay; })
            .each((data,index,domArray) => {
                drawFrame(data,domArray[index],spritesheets,frameBounds);
                self.frames[animType].push(domArray[index]);
            });
    }

    function createAnimation(unitInfo){
        if(self.noInit){
            throw "Must initialize FrameMaker first with FrameMaker.init(options)";
        }
        if(isValidUnitInfo(unitInfo)){
            const prefixUrl = servers[unitInfo.server];

            //load sprite sheet
            let loadImg;
            console.log("Loading sprite sheets");
            if(unitInfo.animation.anime){
                loadImg = loadSpritesheets(unitInfo.animation.anime);
            }else{
                const sheetUrl = `${prefixUrl}${filepaths.anime}unit_anime_${unitInfo.id}.png`;
                loadImg = loadSpritesheets([sheetUrl]);
            }
            
            return loadImg.then(() => {
                console.log("Loading animation files");
                return loadAnimationData(unitInfo);
            }).then((animationData) => {
                console.log("Drawing Frames");
                let sheetArr = [];
                self.components.sheet.selectAll('img')
                    .each(function(){
                        sheetArr.push(this);
                    });
                for(let animType in animationData.cgs){
                    let animContainer = self.components.frame.append('div')
                        .attr('id',animType);

                    drawFrames(sheetArr,animationData.cgg,animationData.cgs[animType],animContainer,animType);
                }
                return;
            });
        }
    }

    function getFrame(type,number){
        return self.frames[type][number];
    }

    function getNumFrames(type){
        return self.frames[type].length;
    }

    function getAnimationTypes(){
        return Object.keys(self.frames);
    }

    public_data.init = init;
    public_data.createAnimation = createAnimation;
    public_data.getFrame = getFrame;
    public_data.getNumFrames = getNumFrames;
    public_data.getAnimationTypes = getAnimationTypes;
    return public_data;
})();