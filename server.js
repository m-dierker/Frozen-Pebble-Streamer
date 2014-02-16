var Firebase = require('firebase');
var firebase = new Firebase('https://frozenpebble.firebaseio.com/');

var userBase = firebase.child('users/mdierker');
var trackBase = userBase.child('track');

PORT = 58484; // LT-IT-G (LET IT GOOOOOO!)

var SocketServer = require('./socket_server.js');

function FrozenServer() {
    this.socketServer = new SocketServer(this.onMessage.bind(this), this.onClientConnection.bind(this));

    this.setupFirebaseListeners();
}

FrozenServer.prototype.onMessage = function(msg) {
    console.log("--> ", msg);
};

FrozenServer.prototype.onClientConnection = function(connection) {
    this.sendCurrentTrack();
};

FrozenServer.prototype.setupFirebaseListeners = function() {
    userBase.on('child_added', this.sendCurrentTrackFromSnapshot.bind(this));
    userBase.on('child_changed', this.sendCurrentTrackFromSnapshot.bind(this));
};

FrozenServer.prototype.onUserDataChange = function(snapshot) {
    // Add all methods that should subscribe to any user changes directly, and just return from them if no action is necessary
    this.sendCurrentTrackFromSnapshot(snapshot);
    this.sendCurrentPlayPauseFromSnapshot(snapshot);
};

FrozenServer.prototype.sendCurrentPlayPauseFromSnapshot = function(snapshot) {
    if (snapshot.name() != 'desktop_status') {
        return;
    }

    var msg = {
        'cmd': 'playpause_info',
        'desktop_status': snapshot.val()
    };

    if (this.socketServer.isConnected()) {
        this.socketServer.sendObj(message);
    }
};

FrozenServer.prototype.sendCurrentTrack = function() {
    trackBase.once('value', function(snapshot) {
        this.sendCurrentTrackFromSnapshot(snapshot);
    }.bind(this));
};

FrozenServer.prototype.sendCurrentTrackFromSnapshot = function(snapshot) {
    if (snapshot.name() != 'track') {
        return;
    }

    var track = snapshot.val();
    console.log("Val from the track snapshot: ", JSON.stringify(track));
    var msg = {
        'cmd': 'track_info',
        'track': track
    };

    console.log("Sending: ", JSON.stringify(msg));

    if (this.socketServer.isConnected()) {
        this.socketServer.sendObj(msg);
    }
};

FrozenServer.prototype.sendCurrentPlayingStatus = function() {

};

module.exports = FrozenServer;

function main() {
    var server = new FrozenServer();
}
main();