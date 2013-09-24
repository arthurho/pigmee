// simpleExpressServer.js
// A simple Express server for 15-237.

var fs = require("fs");
var path = require("path");
var express = require("express");
var flash = require("connect-flash");

var passport = require('passport');
var PassportLocalStrategy = require('passport-local').Strategy;

//======================================
//      init/main
//======================================

var app = express();

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'change me!' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(app.router);
});

function processJSONCMD(request, response){
    var cmd = request.params.cmd;
    var args = request.query;
    response.header("Cache-control", "no-cache");
    cmdHandler(cmd, request.user, args, response);
}

//all so post + get
app.all('/json/:cmd', processJSONCMD);

function serveStaticFile(request, response) {
    //notify the user they're logged in. Necessary because
    //  we use the same html for logging in and when they're
    //  logged in
    if (request.user !== undefined){
        response.cookie("user", request.user.id);
    }
    else {
        response.cookie("user", "none");
    }
    console.log("user:", request.user);
    response.sendfile("static/" + request.params.staticFilename);
}

app.get("/static/:staticFilename", serveStaticFile);

app.listen(8889);

process.on("uncaughtException", onUncaughtException);

//======================================
//      passport
//======================================

app.post('/login',
  passport.authenticate('local', { successRedirect: '/static/simpleClient.html',
                                   failureRedirect: '/static/loginFail.html',
                                   failureFlash: true }));

//registering new users would be done by adding to these data structures
var idToUser = [
    { id: 0, username: 'leftPlayer', password: 'secret'},
    { id: 1, username: 'rightPlayer', password: 'secret'}
];

var usernameToId = { 'leftPlayer': 0, 'rightPlayer': 1 };

passport.use(new PassportLocalStrategy(
    function(username, password, done) {
        var user = idToUser[usernameToId[username]];
        if (user === undefined)
            return done(null, false, { message: 'Unknown user ' + username });
        if (user.password !== password)
            return done(null, false, { message: 'Invalid password' });
        return done(null, user);
    }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, idToUser[id]);
});

//======================================
//      handling uncaught exceptions
//======================================

function onUncaughtException(err) {
    var err = "uncaught exception: " + err;
    console.log(err);
}


// Initialize the socket.io library
// Start the socket.io server on port 3000
// Remember.. this also serves the socket.io.js file!
var io = require('socket.io').listen(3000);

//======================================
//      io.sockets functions
//======================================
// Listen for client connection event
// io.sockets.* is the global, *all clients* socket
// For every client that is connected, a separate callback is called
io.sockets.on('connection', function(socket){
	// Listen for this client's "send" event
	// remember, socket.* is for this particular client
	socket.on('send', function(data) {
		// Since io.sockets.* is the *all clients* socket,
		// this is a broadcast message.
      console.log(data);
		// Broadcast a "receive" event with the data received from "send"
		  io.sockets.emit('receive', {playerId: data.playerId, moveY: data.moveY});
		   
		});
});

