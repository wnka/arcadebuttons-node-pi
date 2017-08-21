"use strict";
const app = require('http').createServer(handler);
const io = require('socket.io').listen(app);
const fs = require('fs');
const Gpio = require('onoff').Gpio;

// Different button states
const BUTTON_UP = "up";
const BUTTON_DOWN = "down";
const BUTTON_CLICKED = "clicked";

// Represents a "button" we want to interact with.
// NOTE: I'm viewing joystick directions as buttons too.
// tag = button name, should match HTML element ID in index.html
// gpioPin = numeric GPIO pin id
class Button {
  constructor(tag, gpioPin) {
    this.tag = tag;
    this.gpioPin = gpioPin;
    this.gpio = null;
    this.downFlag = false;
  }
  // Stops listening to the GPIO pin
  stop()
  {
    if (this.gpio)
    {
      this.gpio.unexport();
    }
  }
  // Starts listening on GPIO pin and emitting events over socket.io
  listen()
  {
    console.log(`listening for input on ${this.tag}`);
    // First, stop.  We could have other listeners.
    this.stop();
    // We aren't in down state
    this.downFlag = false;
    // Set up a new GPIO listener
    // 'in' means we're reading from the pin
    // 'both' means we want events on both edges of the pin transition
    this.gpio = new Gpio(this.gpioPin, 'in', 'both');
    this.gpio.watch((err, value) => {
      if (err) exit();
      let state = BUTTON_UP;
      if (value === 0)
      {
        state = BUTTON_DOWN;
      }
      // Delay movements by ~4 frames (4/60 = ~66ms).
      // This accounts for the delay my capture setup introduces.
      // Your milage may vary.
      setTimeout(() => {
        io.emit(this.tag, {v:state});
      }, 63);
    });
    io.emit(this.tag, {v:BUTTON_UP});
  }
  // Stops listening on the GPIO pin and presses the button.
  // In order to do this, we have to stop listening on the pin.
  down()
  {
    // If we're already down, we're done.
    // The reason for this flag is that currently, index.html listens to both
    // ontouchstart and onclick events, which on an iPhone will (sometimes?) both
    // fire after tapping on a button. This will also prevent multiple clients from
    // clicking buttons and causing problems.  Probably a better way to coordinate that,
    // but this is a start.
    if (this.downFlag)
    {
      return;
    }
    console.log(`Pushing ${this.tag}`);
    this.downFlag = true;
    
    // Emit that this button in now in "clicked" state,
    // Meaning we are remotely clicking it through index.html
    // The reason we emit an event for the clicked state is that
    // there could be multiple viewers of the page, and this way
    // if one viewer remotely clicks a button, they'll all get notified.
    io.emit(this.tag, {v:BUTTON_CLICKED});
    this.stop();
    
    // Set up a new GPIO object
    // 'out' means we're able to set the value of the pin and click the button
    this.gpio = new Gpio(this.gpioPin, 'out');
    this.gpio.writeSync(0);
    
    // Currently we just hold the button down for 1 second, then start listening again
    setTimeout(() => {
      this.gpio.writeSync(1);
      this.listen();
    }, 1000);
  }
}

app.listen(8079);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
              function (err, data) {
                if (err) {
                  res.writeHead(500);
                  return res.end('Error loading index.html');
                }

                res.writeHead(200);
                return res.end(data);
              });
}

io.sockets.on('connection', function (socket) {
  console.log('user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on(BUTTON_CLICKED, function(data) {
    const button = buttons[data["button"]];
    if (button)
    {
      button.down();
    }
  });
});

// build hashmap of buttons.
// currently the key names match the HTML element IDs in index.html
const buttons = new Object();
buttons['up'] = new Button('up', 16);
buttons['down'] = new Button('down', 6);
buttons['left'] = new Button('left', 20);
buttons['right'] = new Button('right', 12);
buttons['b1'] = new Button('b1', 19);
buttons['b2'] = new Button('b2', 26);
buttons['b3'] = new Button('b3', 21);
buttons['b4'] = new Button('b4', 13);

// Start listening
for (const button in buttons)
{
  buttons[button].listen();
}

// On exit, stop all buttons
function exit() {
  for (const button in buttons)
  {
    buttons[button].stop();
  }
  process.exit();
}

process.on('SIGINT', exit);
