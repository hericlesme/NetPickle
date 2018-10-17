var readline = require('readline'),
socketio = require('socket.io-client'),
util = require('util'),
color = require("ansi-color").set;
 
var nick;
var socket = socketio.connect('http://localhost:3636');
var rl = readline.createInterface(process.stdin, process.stdout);

rl.question("Insira seu nick: ", function(name){
    nick = name;
    var msg = "'"+ nick + "' entrou no mundo obscuro dos sockets... ";
    socket.emit('send', {
        type: 'notice',
        message: msg
    });
    rl.prompt(true);
});

function console_out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}

rl.on('line', function (line) {
    if (line[0] == "/" && line.length > 1) {
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);
 
    } else {
        socket.emit('send', { type: 'chat', message: line, nick: nick });
        rl.prompt(true);
    }
});

function chat_command(cmd, arg) {
    switch (cmd) {
 
        case 'nick':
            var notice = nick + " mudou seu nick para " + arg;
            nick = arg;
            socket.emit('send', { type: 'notice', message: notice });
            break;
 
        case 'msg':
            var to = arg.match(/[a-z]+\b/)[0];
            var message = arg.substr(to.length, arg.length);
            socket.emit('send', { type: 'tell', message: message, to: to, from: nick });
            break;
        case 'alert':
            socket.emit('send', {type: 'alert', message: arg});
            break;
        case 'exit':
            var exiting_message = "'" + nick + "' saiu deste mundo.";
            socket.emit('send', {type: 'notice', message: exiting_message});
            socket.disconnect();
            break;
        default:
            console_out("Isto nao eh um comando valido.");
 
    }
}
    socket.on('message', function (data) {
    var leader;
    if (data.type == 'chat' && data.nick != nick) {
        leader = color("[" + data.nick+"]: ", "green");
        console_out(leader + data.message);
    }
    else if (data.type == "notice") {
        console_out(color(data.message, 'cyan'));
    }
    else if (data.type == "tell" && data.to == nick) {
        leader = color("["+data.from+"->"+data.to+"]", "red");
        console_out(leader + data.message);
    }
    else if (data.type == "alert") {
        console_out(color('!' + data.message + '!', "blink+black+yellow_bg"));
    }

    socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            socket.connect();
        }
        rl.close();
    });
});