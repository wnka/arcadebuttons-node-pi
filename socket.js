var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
//  , gpio = require('rpi-gpio');

app.listen(8081);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

i = 0;

setInterval(function() {
    io.sockets.emit('news', {hello:i++});
}, 1000);

// gpio.setup(27, gpio.DIR_IN, readInput);
// 
// function readInput() {
//     gpio.read(27, function(err, value) {
//         io.sockets.emit('button', {hello:value});
//     });
// }

gpio.on('change', function(channel, value) {
    console.log('Channel ' + channel + ' value is now ' + value);
    io.sockets.emit('button', {hello:value});
});
gpio.setup(27, gpio.DIR_IN);
