(function(window, undefined) {

    var BBB = {};

    const eb = new vertx.EventBus("http://192.168.211.128:3001/eventbus");
    eb.onopen = function () {
      console.log("FOOOO!!!!!");
    };

    var token = null;

    BBB.sendAuthToken = function(data) {
    token = data;
      eb.registerHandler("to-client-" + data, function (msg) {
      	//console.log("From server: " + JSON.stringify(msg) + "\n");
        BBB.onMessageFromDS(msg);
      });

      BBB.connectedToVertx();
    }

    BBB.sendToDeepstream = function(data) {
 //   trace("SENDING " + data);
   // 	var json = JSON.parse(data);
      eb.send("to-server", data);
    };

    window.BBB = BBB;
})(this);