"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // k6/load-test.ts
  var import_http = __toESM(__require("k6/http"));
  var import_k6 = __require("k6");
  var options = {
    stages: [
      { duration: "30s", target: 100 },
      { duration: "1m", target: 500 },
      // Puncak 500 user melakukan request HTTP
      { duration: "10s", target: 0 }
    ]
  };
  function load_test_default() {
    const url = "https://eternityuc.com/api/rally/period";
    const params = {
      headers: {
        "Content-Type": "application/json",
        "Cookie": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Xfg_TWcjOcvUsJn5.cpkO8NZoQoPYPOmi-sGzK_woEvCXidkaF8Qbtkj5I-cFk1E5gSPbMQJE0luBakciFz2rdg-JKew6WT45NxEcE5zvZMJsaUR_MY__UqyJG-Xr6Uekmo8-GV_0f9AnYAms_AF4oPbwRnWDrLKNbiE2_FjJmfxWHYt17kjYa4TTTKXcmnVyVe8DkazSNrIyCPZu_033DnQuxv0ul1_DINToz5hF7azDLRG-aBpRUHwmh9mD.N_H6V-id2PixnLso9QDsSw"
      }
    };
    const payload = JSON.stringify({
      someData: "test"
    });
    const res = import_http.default.post(url, payload, params);
    (0, import_k6.check)(res, {
      "status is 200 or 201": (r) => r.status === 200 || r.status === 201,
      "duration < 2000ms": (r) => r.timings.duration < 2e3
      // Toleransi 2 detik
    });
    (0, import_k6.sleep)(1);
  }
})();
