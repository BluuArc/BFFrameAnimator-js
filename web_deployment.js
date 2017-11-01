var express = require('express'),
    app = express();
var rp = require('request-promise');
var request = require('request').defaults({ encoding: null });

var argv = require('yargs')
    .usage('Usage: $0 -p [integer] -i [string of IP address]')
    .default("p", 80)
    .default("i", '127.0.0.1')
    .alias('p', 'port')
    .alias('i', 'ip').alias('i', 'ip-address')
    .describe('p', 'Port to run server on')
    .describe('i', 'IP Address to run server on')
    .help('h')
    .alias('h', 'help')
    .argv;

app.use(express.static(__dirname));

app.get('/get/:url',function(req,res){
    console.log(req.params.url);
    rp.get(decodeURIComponent(req.params.url))
        .then((data) => {
            res.set('Content-Type','text/plain');
            res.send(data).end();
        }).catch((err)=> {
            res.send(err).end();
        });
      
});

app.get('/getImage/:url',function(req,res){
    console.log(req.params.url);
    // based on https://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
    request.get(decodeURIComponent(req.params.url), function(err,response,body){
        if(!err){
            res.contentType('image/png');
            res.end(new Buffer(body).toString('base64'), 'base64');
        }else{
            res.end(err);
        }
    })
    // rp.get(decodeURIComponent(req.params.url))
    //     .then(function(data) {
    //         let img = new Buffer(data,'binary').toString('base64');
    //         res.contentType('image/png');
    //         res.end(img, 'base64');
    //         // console.log(img);
    //     }).catch((err) => {
    //         res.send(err).end();
    //     });
});

app.get('/', function (req,res) {
    console.log("Sending index.html");
    res.sendFile("index.html").end();
});

var server = app.listen(argv.port, function () {
    console.log("Listening on " + this.address().address + ":" + this.address().port);
});