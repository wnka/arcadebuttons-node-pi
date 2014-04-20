arcadebuttons-node-pi
=====================

Reads the input of buttons from GPIO pins on a Raspberry Pi and displays them on a webpage using Node.js.

This is very much a work in progress, more of a proof-of-concept at this point. So far it's been alligator clips on GPIO pins with two buttons, which does work.

# Backstory

I play arcade games (mostly shmups) and sometimes stream on [twitch.tv](http://twitch.tv/pdp80) from my arcade cabinet.
My JAMMA capture setup is [detailed here](http://shmups.system11.org/viewtopic.php?f=6&t=45917). I taped a webcam to my ceiling
to capture the joystick movements, but its hard to tell what inputs are being made due to poor lighting and my hands being in the way. Other players who play from within MAME can have a nice
input display that shows the movements they're making. This project is an attempt at providing that kind of input display
for an actual arcade cabinet.

So the idea is that I'll be able to have a Raspberry Pi under the control panel of my arcade cabinet with the control wires split off and plugged into the GPIO pins, then the Node app will provide a nice display that I can use while streaming. This is probably not the
easiest or most lightweight way to do this but I wanted to play around with Node.js and the asynchronous nature of human inputs
seemed like a good project to learn with. Network latency might be a problem, but we'll see.

# Example video

[Here is an example video of it actually working!](https://www.youtube.com/watch?v=uSHMhtIR2wg)
