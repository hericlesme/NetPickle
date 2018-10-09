var PORT = 3636;

var socketio = require('socket.io');
var io = socketio.listen(PORT);
color = require('ansi-color').set;

var SHELL = color('NetPickle$ ', 'blue');


function log(message) {
    console.log(SHELL + color(message, 'cyan'));
}

io.on('connection', function(socket){
    log('a user connected');
    socket.on('disconnect', function(){
        log('user disconnected');
    })
});

io.sockets.on('connection', function (socket) {
 
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
