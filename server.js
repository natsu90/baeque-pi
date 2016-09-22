var net = require('net');

var HOST = '192.168.1.168';
var PORT = 13371;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection

var content = "";
var pubsock = false;
net.createServer(function(sock) {
    
    pubsock = sock;
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data + '"');
        
    });
    


    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

net.createServer(function(socky) {
    

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED PHP: ' + socky.remoteAddress +':'+ socky.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    socky.on('data', function(data) {
        
        console.log('DATA ' + socky.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data + '"');
        console.log('sending data');

        if (pubsock != false) {
          pubsock.write(data);
        } else {
          console.log('socket is inv');
        }
    });
    
    // Add a 'close' event handler to this instance of socket
    socky.on('close', function(data) {
        console.log('CLOSED PHP: ' + socky.remoteAddress +' '+ socky.remotePort);
    });
    
}).listen(13372, '127.0.0.1');


console.log('Server listening on ' + HOST +':'+ PORT);