var socketio = require('socket.io');
const ArgumentParser = require('argparse').ArgumentParser;
color = require('ansi-color').set;

const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'NetPickle Server'
});

parser.addArgument(
    ['-p', '--port'],
    {
        help: 'the port to launch the server',
        required: true
    }
);

let args = parser.parseArgs();

const io = socketio.listen(args.port);
const SHELL = color('NetPickle$ ', 'blue');

function log(message) {
    console.log(SHELL + color(message, 'cyan'));
}

io.on('connection', function (socket) {
    log('a user connected');
    socket.on('disconnect', function () {
        log('user disconnected');
    })
});

io.sockets.on('connection', function (socket) {

    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
