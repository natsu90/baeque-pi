#!/usr/bin/env node

// refs: http://www.simonewebdesign.it/101-web-socket-protocol-handshake/

var WebSocketServer = require('websocket').server;
var http = require('http');
var say = require('say'),
    escpos = require('escpos'),
    request = require('request');
    device  = new escpos.USB(),
    printer = new escpos.Printer(device);

var server = http.createServer(function(request, response) {
  console.log('Received request from ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(1337, function() {
    console.log('Server is listening on port 1337.');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false // because security matters
});

function isAllowedOrigin(origin) {
  console.log('Connection requested from origin ' + origin);

  valid_origins = [
    'http://localhost:8080',
    '127.0.0.1',
    'null',
    'http://stackoverflow.com',
    'chrome-extension://pfdhoblngboilpfeibdedpjgfnlcodoo'
  ];

  if (valid_origins.indexOf(origin) != -1) {
    console.log('Connection accepted from origin ' + origin);
    return true;
  }

  console.log('Origin ' + origin + ' is not allowed.')
  return false;
}

wsServer.on('connection', function(webSocketConnection) {
  console.log('Connection started.');
});

wsServer.on('request', function(request) {

  var connection = isAllowedOrigin(request.origin) ?
    request.accept('echo-protocol', request.origin)
    : request.reject();

  connection.on('message', function(message) {

    var response = 'OK',
        data = tryParseJSON(message.utf8Data);
    console.log('Received Message:', data);

    if (data) {

      switch (data.action) {
        case 'printNumber':
          printNumber(data); break;
        case 'callNumber':
          callNumber(data); break;
      }
    } else {
      response = 'data not a valid json';
    }
    connection.sendUTF(response);

  });
  connection.on('close', function(reasonCode, description) {
      console.log(connection.remoteAddress + ' has been disconnected.');
  });
});

function tryParseJSON (jsonString){
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }

    return false;
};

function printNumber(meta) {

  device.open(function() {

    printer
    .font('b')
    .align('ct')
    .size(1, 1)
    .text('Pejabat Pos Semenyih\n(SA-00103041A)\n')
    .text('Current number: 1023\nYour number:\n\n1026\n')
    .text('Your estimated time arrival: 12:50 AM\n')
    .text('Scan this QR code to track your position.')
    .qrimage('https://github.com/song940/node-escpos', {type: 'png', mode: 'dhdw'}, function(err){
      this.text('or visit baeque.com and\nenter this code:\n\n107-131-511\n\nPowered by Baeque.\nGenerated on 12 August 2016 12:10 AM.\n\n')
      this.cut();
    });

  });
}

function callNumber(meta) {

  console.log('calling number..');
  var text = 'Number, 3, 0, 7, 2, counter, 5';
  say.speak(text, 'Agnes', 1.0);
}