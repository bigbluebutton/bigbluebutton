(function() {
  function parseParams() {
    var map = {};
    window.location.search.replace(/[?&#]+([^=&]+)=([^&]*)/gi, function (m, key, value) { map[key] = value; });
    window.location.hash.replace(/[?&#]+([^=&]+)=([^&]*)/gi, function (m, key, value) { map[key] = value; });
    return map;
  }

  function parseStartTime() {
    var params = parseParams();
    if (typeof(params.t) === "undefined") {
      return 0;
    }

    var startTime = 0;
    var extractNumber = /\d+/g;
    var extractUnit = /\D+/g;

    while (true) {
      var value = extractNumber.exec(params.t);
      var unit = extractUnit.exec(params.t);
      if (value == null || unit == null)
        break;

      unit = String(unit).toLowerCase();
      value = parseInt(String(value), 10);

      if (unit == "h")
        value *= 3600;
      else if (unit == "m")
        value *= 60;

      startTime += value;
    }
    return startTime;
  }

  var vjs = videojs("video", {
    techOrder: ["html5"],
    playbackRates: [1, 1.25, 1.5, 2]
  });

  vjs.ready(function() {
    var t = parseStartTime();
    if (t > 0)
      vjs.currentTime(t);

    window.addEventListener("hashchange", function() {
      var new_t = parseStartTime();
      if (new_t != t) {
        t = new_t;
        vjs.currentTime(t);
      }
    }, false);

  });
})();