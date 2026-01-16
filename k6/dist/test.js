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
      { duration: "10s", target: 500 },
      // Naik ke 50 user dalam 10 detik
      { duration: "30s", target: 500 },
      // Tahan 50 user selama 30 detik
      { duration: "10s", target: 0 }
      // Turun ke 0
    ],
    // Opsional: Set thresholds (batas toleransi)
    thresholds: {
      http_req_duration: ["p(95)<500"],
      // 95% request harus di bawah 500ms
      http_req_failed: ["rate<0.01"]
      // Error rate harus di bawah 1%
    }
  };
  function load_test_default() {
    const url = "https://eternityuc.com/api/contest/status";
    const res = import_http.default.get(url);
    (0, import_k6.check)(res, {
      "status is 200": (r) => r.status === 200,
      "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0"
      // Next.js support HTTP/2
    });
    (0, import_k6.sleep)(1);
  }
})();
