#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http = require('http');

WATCH_PORT = 7876; // STRM (LET THE STORM RAGE OOOOOOOOON!)

function SocketServer(messageCallback, onConnectedCallback) {
    this.messageCallback = messageCallback;
    this.onConnectedCallback = onConnectedCallback;
    this.connection = null;
    this.setupServer();

    console.log("Watch socket server started");
}

SocketServer.prototype.setupServer = function() {
    var server = http.createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    server.listen(WATCH_PORT, function() {
        console.log((new Date()) + ' Server is listening on port ' + WATCH_PORT);
    });

    wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: true
    });

    wsServer.on('connect', function(connection) {
        this.onConnection(connection);
    }.bind(this));
};

SocketServer.prototype.onConnection = function(connection) {
    console.log((new Date()) + ' Connection accepted.');

    this.connection = connection;

    connection.on('message', function(message) {
        this.messageCallback(message);
    }.bind(this));

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    }.bind(this));

    this.onConnectedCallback(connection);
};

SocketServer.prototype.isConnected = function() {
    return Boolean(this.connection);
};

SocketServer.prototype.sendObj = function(obj) {
    if (this.isConnected()) {
        var msg = JSON.stringify(obj);
        this.connection.sendUTF(msg);
    } else {
        console.error("Warning: Trying to send message without a connected socket");
    }
};

module.exports = SocketServer;
