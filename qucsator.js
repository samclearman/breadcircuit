var inGroupsOf = function(ary, n) {
  var grouped = [];
  for(i in ary) {
//    if (i % 3 == 0) { grouped[Math.floor(i / 3)] = []; }
    if (!grouped[Math.floor(i / 3)]) { grouped[Math.floor(i / 3)] = []; }
    grouped[Math.floor(i / 3)][i % 3] = ary[i];
  }
  return grouped;
}

var qucsate = function(netlist, callback, type) {
  type = type || 'qucs';
  var data = {};
  data[type || 'qucs'] = netlist;
  $.ajax({
      async: false,
      url: qucsate.serverUrl,
      data: data,
      success: qucsate.parser(callback)});
};

//
// Generate a parser, which is a function that parses the qucs data format
// and passes the data to the callback
//

qucsate.parser = function(callback) {
  return(function(data) {
    var results = {};
    
    // for jsonp we simply put the whole string into the 'result' property of the json object
    if ( data.result ) { data = data.result; }
    
    var chunks = data.split("\n")
    chunks = inGroupsOf(chunks.slice(1, chunks.length - 1), 3);
    for (var i in chunks) {
      var key = /<indep (.+)\./.exec(chunks[i][0]);
      key = key && key[1];
      if(key) {
        results[key] = parseFloat(chunks[i][1]);
      }
    }
    callback(results);
  });
};

//
// make qucs netlists from breadboard objects
//
qucsate.makeNetlist = function(board) {
  var netlist = '# QUCS Netlist\n';
  $.each(board.components, function(name, component) {
    var line = '';
    
    // Convert the connections object to an array of qucs node names
    var nodes = [];
    $.each(component.connections, function(i, hole){
      nodes.push(hole.strip.name);
    });
    
    switch (component.kind) {
      case "resistor":
        if (!(nodes.length == 2 && component.resistance && component.UID)) { return; }
        line = 'R:' + component.UID + ' ';
        line = line + nodes.join(' ');
        line = line + ' R="' + component.resistance + ' Ohm"' ;
        break;
      case "wire":
        if (!(nodes.length == 2 && component.UID)) { return; }
        line = 'TLIN:' + component.UID + ' ';
        line = line + nodes.join(' ');
        line = line + ' Z="0 Ohm" L="1 mm" Alpha="0 dB"' ;
        break;
      case "battery":
        if (!(nodes.length == 2 && component.voltage && component.UID)) { return; }
        line = 'Vdc:' + component.UID + ' ';
        line = line + nodes.join(' ');
        line = line + ' U="' + component.voltage + ' V"' ;
        break;
      case "vprobe":
        if (!(nodes.length == 2 && component.UID)) { return; }
        line = 'VProbe:' + component.UID + ' ';
        line = line + nodes.join(' ');
        break;
    }
    
    netlist = netlist + "\n" + line;
  });
  return netlist + "\n.DC:DC1"; 
}