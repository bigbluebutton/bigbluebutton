const express = require("express");
const cors = require("cors");

const router = express.Router();

const axios = require("axios");

var config = require("../config.json");
var ping = require("ping");
router.get("/download", cors(), (req, res) => {
  res.send("download API");
});

router.post("/upload", cors(), (req, res) => {
  req.on("data", watchUpload.bind(this, req, res));
  req.on("end", res.end.bind(res, ""));
  req.resume();
  res.send("upload API");
});

var watchUpload = function (req, res) {
  if (req.socket.bytesRead >= config.limits.maxUploadSize)
    req.connection.destroy();
};
router.get("/ping", cors(), (req, res) => {
  ping.promise.probe("localhost").then(function (result) {
    res.send(result);
  });
});

router.get("/downloadResults", cors(), async (req, res) => {
  var state = {
    lastRuntime: 0,
  };

  var tests = new Array(10);
  tests[0] = parseInt(config.limits.downloadStartSize);
  for (var i = 1; i < tests.length; i++) {
    tests[i] = tests[i - 1] * config.limits.downloadSizeModifier;
  }
  let results = [];
  var testBinds = tests
    .filter(function (v) {
      return v <= config.limits.maxDownloadSize;
    })
    .map(async function (v) {
      const result = await speedTest("down", Math.floor(v), state);

      return result;
    });

  Promise.all(testBinds).then((results) => {
    const result_speed = { speed: { bps: 0, kbps: 0, mbps: 0, gbps: 0 } };

    results.forEach((result) => {
      result_speed.speed.bps += result.speed.bps / results.length;
      result_speed.speed.kbps += result.speed.kbps / results.length;
      result_speed.speed.mbps += result.speed.mbps / results.length;
      result_speed.speed.gbps += result.speed.gbps / results.length;
    });

    res.send(result_speed);
  });
});
router.get("/uploadResults", cors(), async (req, res) => {
  var state = {
    lastRuntime: 0,
  };

  var tests = new Array(10);
  tests[0] = parseInt(config.limits.uploadStartSize);

  for (var i = 1; i < tests.length; i++) {
    tests[i] = tests[i - 1] * config.limits.uploadSizeModifier;
  }

  let results = [];
  var testBinds = tests
    .filter(function (v) {
      return v <= config.limits.maxUploadSize;
    })
    .map(async function (v) {
      const result = await speedTest("up", Math.floor(v), config, state);

      return result;
    });

  Promise.all(testBinds).then((results) => {
    const result_speed = { speed: { bps: 0, kbps: 0, mbps: 0, gbps: 0 } };

    results.forEach((result) => {
      result_speed.speed.bps += result.speed.bps / results.length;
      result_speed.speed.kbps += result.speed.kbps / results.length;
      result_speed.speed.mbps += result.speed.mbps / results.length;
      result_speed.speed.gbps += result.speed.gbps / results.length;
    });

    res.send(result_speed);
  });
});
async function speedTest(dir, size, rootScope, state) {
  function calc(results, e) {
    e ||
      (e = {
        loaded: size,
        total: size,
      });
    results.dl = e.loaded;
    results.end = Date.now();
    results.time = results.end - results.start;
    results.percent = (e.loaded / (e.total || size)) * 100;

    var bpms = (results.dl * 8) / results.time;

    results.speed.bps = bpms * 1000;
    results.speed.kbps = (bpms / 1000) * 1000;
    results.speed.mbps = (bpms / 1000 / 1000) * 1000;
    results.speed.gbps = (bpms / 1000 / 1000 / 1000) * 1000;

    results.bitrate = results.speed.bps;
    results.bittype = "b";

    if (results.speed.kbps > 1) {
      results.bitrate = results.speed.kbps;
      results.bittype = "Kb";
    }
    if (results.speed.mbps > 1) {
      results.bitrate = results.speed.mbps;
      results.bittype = "Mb";
    }
    if (results.speed.gbps > 1) {
      results.bitrate = results.speed.gbps;
      results.bittype = "Gb";
    }

    var fdlsize = (function (b) {
      if (b < 1000) return b + "b";
      if (b >= 1000 && b < 1000000) return b / 1000 + "KB";
      if (b >= 1000000 && b < 1000000000) return b / 1000000 + "MB";
      if (b >= 1000000000) return b / 1000000000 + "GB";
    })(results.dl);

    (function (f) {
      results.fdl = new Number(f.replace(/[a-z]/gi, ""));
      results.fdltype = f.replace(/[0-9\.]/gi, "");
    })(fdlsize);

    var fsize = (function (b) {
      if (b < 1000) return b + "b";
      if (b >= 1000 && b < 1000000) return b / 1000 + "KB";
      if (b >= 1000000 && b < 1000000000) return b / 1000000 + "MB";
      if (b >= 1000000000) return b / 1000000000 + "GB";
    })(results.size);

    (function (f) {
      results.fsize = new Number(f.replace(/[a-z]/gi, ""));
      results.fsizetype = f.replace(/[0-9\.]/gi, "");
    })(fsize);

    results.id = results.dir + results.size + results.start;
    return results;
  }
  var state = {
    lastRuntime: 0,
  };
  var results = {
    dir: dir,
    start: Date.now(),
    end: 0,
    size: size,
    dl: 0,
    percent: 0,
    time: 0,
    speed: {
      bps: 0,
      kbps: 0,
      mbps: 0,
    },
    bitrate: "b",
  };

  if (dir == "down" && state.lastRuntime > config.limits.maxDownloadTime * 1000)
    return resolve(null);
  if (dir == "up" && state.lastRuntime > config.limits.maxUploadTime * 1000)
    return resolve(null);

  results.start = Date.now();
  var ropts = {
    url: "http://localhost:8000/api/" + dir + "load?size=" + size,
    method: dir == "down" ? "GET" : "POST",
  };

  if (dir == "up") {
    var ua = new Uint8Array(size);
    ua.fill(0);
    ropts.data = ua;
    ropts.headers = { "Content-Type": "application/octet-stream" };
  }

  const response = await axios(ropts);

  if (response.data) {
    results = calc(results);
    results.bitrate =
      results.speed.gbps > 1
        ? "Gbps"
        : results.speed.mbps > 1
        ? "Mbps"
        : results.speed.kbps > 1
        ? "Kbps"
        : "bps";

    return results;
  }
}
module.exports = router;
