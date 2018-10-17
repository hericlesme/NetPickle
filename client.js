/* variables */

var readline = require('readline'),
    socketio = require('socket.io-client'),
    color = require("ansi-color").set;

var nick;

var pattern = new RegExp("[^A-Za-z]");
var socket = socketio.connect('http://localhost:3636');
var rl = readline.createInterface(process.stdin, process.stdout);

/* Prototypes */

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

rl.question("Insira seu nick: ", function (name) {

    nick = name.replaceAll(pattern, "").toLowerCase();

    var msg = "'" + nick + "' entrou no mundo obscuro dos sockets... ";

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
        var arg = line.substr(cmd.length + 2, line.length);
        chat_command(cmd, arg);
    } else {
        socket.emit('send', { type: 'chat', message: line, nick: nick });
        rl.prompt(true);
    }
});

function chat_command(cmd, arg) {
    switch (cmd) {
        case 'help':
            var help = " \
            \n -- NetPickle - Comandos \
            \n\
            \n /nick [username] - Troca o nome de usuario \
            \n /msg [username] [mensagem] - Envia uma mensagem privada \
            \n /alert [mensagem] - Envia um alert para todos \
            \n /exit - Desconecta do chat \
            \n /help - Exibe esta mensagem \
            \n";
            console_out(help);
            break;
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
            socket.emit('send', { type: 'alert', message: arg });
            break;
        case 'exit':
            var exiting_message = "'" + nick + "' saiu deste mundo.";
            socket.emit('send', { type: 'notice', message: exiting_message });
            socket.disconnect();
            break;
        default:
            console_out("Oops... parece que este nao eh um comando valido.");

    }
}

socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        socket.connect();
    }
    socket.emit()
    console_out('Desconectando...');
    rl.close();
});

socket.on('message', function (data) {
    var leader;
    if (data.type == 'chat' && data.nick != nick) {
        leader = color("[" + data.nick + "]: ", "green");
        console_out(leader + data.message);
    }
    else if (data.type == "notice") {
        console_out(color(data.message, 'cyan'));
    }
    else if (data.type == "tell" && data.to == nick) {
        leader = color("[" + data.from + "->" + data.to + "]", "red");
        console_out(leader + data.message);
    }
    else if (data.type == "alert") {
        console_out(color('ALERT: ' + data.message + '!', "black+yellow_bg"));
    }
});