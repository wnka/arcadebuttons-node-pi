var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Gpio = require('onoff').Gpio
  , button = new Gpio(27, 'in', 'both');

io.set('log level', 1);
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
  socket.emit('news', { hello: 'This is Buttons' });
});

button.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('button', {v:value});
});

function exit() {
    button.unexport();
    process.exit();
}

process.on('SIGINT', exit);
