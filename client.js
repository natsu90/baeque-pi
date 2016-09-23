var net = require('net');
var say = require('say'),
    escpos = require('escpos'),
    request = require('request');
    device  = new escpos.USB(),
    printer = new escpos.Printer(device);

var HOST = '192.168.1.168';
var PORT = 13371;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
  console.log('Connected to server.');

});

client.on('data', function(data) {
    
    console.log('DATA: ' + data);
    data = tryParseJSON(data);
    if (data) {
      switch(data.action) {
        case 'printNumber':
          printNumber(data); break;
        case 'callNumber':
          callNumber(data); break;
      }
    }
    //client.destroy();
    
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
    .text(meta.premise_name + '\n' + meta.desc + '\n')
    .text('Current number: ' + meta.current_number + '\nYour number:\n\n' + meta.user_number + '\n')
    .text('Your estimated time arrival: ' + meta.estimated_time + '\n')
    .text('Scan this QR code to track your position.')
    .qrimage('http://baeque.com/?id=' + meta.queue_id, {type: 'png', mode: 'dhdw'}, function(err){
      this.text('or visit baeque.com and\nenter this code:\n\n' + meta.queue_id + '\n\nPowered by Baeque.\nGenerated on ' + meta.gen_time + '.\n\n')
      this.cut();
    });


  });
}

function callNumber(meta) {

  console.log('calling number..');
  var text = '' + meta.number.toString().split('').join('. ') + ', counter, ' + meta.counter;
  say.speak(text, 'Agnes', 1.0);
}