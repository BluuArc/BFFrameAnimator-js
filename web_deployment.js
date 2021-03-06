/* eslint-disable no-console */
const express = require('express'),
  app = express();
const rp = require('request-promise');
const request = require('request').defaults({ encoding: null });

app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/get/:url',function (req, res) {
  console.log(req.params.url);
  rp.get(decodeURIComponent(req.params.url))
    .then((data) => {
      res.set('Content-Type','text/plain');
      res.send(data).end();
    }).catch((err) => {
      res.status(500).send(err).end();
    });
});

app.get('/getjson/:url', function (req, res) {
  console.log(req.params.url);
  rp.get(decodeURIComponent(req.params.url))
    .then((data) => {
      res.set('Content-Type', 'application/json');
      res.send(data).end();
    }).catch((err) => {
      res.status(500).send(err).end();
    });
});

app.get('/getImage/:url',function (req, res){
  const format = req.query.format || 'image/png';
  console.log(req.params.url, format);
  const decodedPath = decodeURIComponent(req.params.url);
  // based on https://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
  request.get(decodedPath, function (err, response, body){
    try {
      if (!err && response.statusCode === 200){
        res.contentType(format);
        const imageData = Buffer.from(body).toString('base64');
        if (format !== 'text/plain') {
          res.end(imageData, 'base64');
        } else {
          res.end(imageData);
        }
      } else {
        res.status((response && response.statusCode) || 500).send((response && response.statusMessage) || err.Error).end();
      }
    } catch (err) {
      res.status(500).send(err).end();
    }
  });
});

const server = app.listen(app.get('port'), function () {
  console.log('Listening on ' + this.address().address + ':' + this.address().port);
});

module.exports = server;
