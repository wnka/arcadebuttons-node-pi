var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Gpio = require('onoff').Gpio
  , up = new Gpio(24, 'in', 'both')
  , down = new Gpio(17, 'in', 'both')
  , left = new Gpio(23, 'in', 'both')
  , right = new Gpio(22, 'in', 'both')
  , b1 = new Gpio(18, 'in', 'both')
  , b2 = new Gpio(27, 'in', 'both')
  , b3 = new Gpio(25, 'in', 'both')
  , b4 = new Gpio(4, 'in', 'both') // Currently the "start" button

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

up.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('up', {v:value});
});
down.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('down', {v:value});
});
left.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('left', {v:value});
});
right.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('right', {v:value});
});
b1.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('b1', {v:value});
});
b2.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('b2', {v:value});
});
b3.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('b3', {v:value});
});
b4.watch(function(err, value) {
    if (err) exit();
    io.sockets.emit('b4', {v:value});
});

function exit() {
    up.unexport();
    down.unexport();
    left.unexport();
    right.unexport();
    b1.unexport();
    b2.unexport();
    b3.unexport();
    b4.unexport();
    process.exit();
}

process.on('SIGINT', exit);
