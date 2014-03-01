var app = require('http').createServer(webRequestHandler);
var io = require('socket.io').listen(app);

COMPUTER_PORT = 7877; // STRM + 1
app.listen(COMPUTER_PORT);

var SocketServer = require('./socket_server.js');

function FrozenServer() {
    this.computerSockets = {};
    this.setupComputerSocketListeners();

    this.watchSocketServer = new SocketServer(this.onMessageFromWatch.bind(this), this.onWatchConnection.bind(this));
}

FrozenServer.prototype.setupComputerSocketListeners = function() {
    io.sockets.on('connection', function(socket) {
        console.log("Computer client connected");

        this.computerSockets['mdierker'] = socket;
        socket.on('track_update', this.sendCurrentTrackFromUpdate.bind(this));
    }.bind(this));
};

FrozenServer.prototype.sendCurrentTrackFromUpdate = function(track) {
    obj = {
        'cmd': 'track_info',
        'track': track
    };

    console.log("Sending Track Update");

    this.watchSocketServer.sendObj(obj);
};

FrozenServer.prototype.onWatchConnection = function(connection) {
    console.log("Watch connected");
};

FrozenServer.prototype.onMessageFromWatch = function(msg) {
    console.log("--> ", msg);
    this.computerSockets['mdierker'].emit('cmd', msg);

};

function webRequestHandler(req, res) {
    res.writeHead(200);
    res.end('Hello World!');
}

new FrozenServer();