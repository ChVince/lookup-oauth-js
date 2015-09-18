(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  oauthd_url: "https://oauth.silkcodeapps.de",
  oauthd_api: "https://oauth.silkcodeapps.de/api",
  version: "web-0.4.4",
  options: {}
};

},{}],2:[function(require,module,exports){
"use strict";
module.exports = function(Materia) {
  var $;
  $ = Materia.getJquery();
  return {
    get: (function(_this) {
      return function(url, params) {
        var base;
        base = Materia.getOAuthdURL();
        return $.ajax({
          url: base + url,
          type: 'get',
          data: params
        });
      };
    })(this),
    post: (function(_this) {
      return function(url, params) {
        var base;
        base = Materia.getOAuthdURL();
        return $.ajax({
          url: base + url,
          type: 'post',
          data: params
        });
      };
    })(this),
    put: (function(_this) {
      return function(url, params) {
        var base;
        base = Materia.getOAuthdURL();
        return $.ajax({
          url: base + url,
          type: 'put',
          data: params
        });
      };
    })(this),
    del: (function(_this) {
      return function(url, params) {
        var base;
        base = Materia.getOAuthdURL();
        return $.ajax({
          url: base + url,
          type: 'delete',
          data: params
        });
      };
    })(this)
  };
};

},{}],3:[function(require,module,exports){
"use strict";
var Location, Url, cache, config, cookies;

config = require('../config');

Url = require("../tools/url");

Location = require('../tools/location_operations');

cookies = require("../tools/cookies");

cache = require("../tools/cache");

module.exports = function(window, document, jquery, navigator) {
  var Materia, location_operations;
  Url = Url(document);
  cookies.init(config, document);
  location_operations = Location(document);
  cache.init(cookies, config);
  Materia = {
    initialize: function(public_key, options) {
      var i;
      config.key = public_key;
      if (options) {
        for (i in options) {
          config.options[i] = options[i];
        }
      }
    },
    setOAuthdURL: function(url) {
      config.oauthd_url = url;
      config.oauthd_base = Url.getAbsUrl(config.oauthd_url).match(/^.{2,5}:\/\/[^/]+/)[0];
    },
    getOAuthdURL: function() {
      return config.oauthd_url;
    },
    getVersion: function() {
      return config.version;
    },
    extend: function(name, module) {
      return this[name] = module(this);
    },
    getConfig: function() {
      return config;
    },
    getWindow: function() {
      return window;
    },
    getDocument: function() {
      return document;
    },
    getNavigator: function() {
      return navigator;
    },
    getJquery: function() {
      return jQuery;
    },
    getUrl: function() {
      return Url;
    },
    getCache: function() {
      return cache;
    },
    getCookies: function() {
      return cookies;
    },
    getLocationOperations: function() {
      return location_operations;
    }
  };
  return Materia;
};

},{"../config":1,"../tools/cache":9,"../tools/cookies":10,"../tools/location_operations":11,"../tools/url":13}],4:[function(require,module,exports){
"use strict";
var cookies, oauthio_requests, sha1;

cookies = require("../tools/cookies");

oauthio_requests = require("./request");

sha1 = require("../tools/sha1");

module.exports = function(Materia) {
  var $, Url, cache, client_states, config, document, location_operations, oauth, oauth_result, oauthio, parse_urlfragment, providers_api, window;
  Url = Materia.getUrl();
  config = Materia.getConfig();
  document = Materia.getDocument();
  window = Materia.getWindow();
  $ = Materia.getJquery();
  cache = Materia.getCache();
  providers_api = require('./providers')(Materia);
  config.oauthd_base = Url.getAbsUrl(config.oauthd_url).match(/^.{2,5}:\/\/[^/]+/)[0];
  client_states = [];
  oauth_result = void 0;
  (parse_urlfragment = function() {
    var cookie_state, results;
    results = /[\\#&]oauthio=([^&]*)/.exec(document.location.hash);
    if (results) {
      document.location.hash = document.location.hash.replace(/&?oauthio=[^&]*/, "");
      oauth_result = decodeURIComponent(results[1].replace(/\+/g, " "));
      cookie_state = cookies.readCookie("oauthio_state");
      if (cookie_state) {
        client_states.push(cookie_state);
        cookies.eraseCookie("oauthio_state");
      }
    }
  })();
  location_operations = Materia.getLocationOperations();
  oauthio = {
    request: oauthio_requests(Materia, client_states, providers_api)
  };
  oauth = {
    initialize: function(public_key, options) {
      return Materia.initialize(public_key, options);
    },
    setOAuthdURL: function(url) {
      config.oauthd_url = url;
      config.oauthd_base = Url.getAbsUrl(config.oauthd_url).match(/^.{2,5}:\/\/[^/]+/)[0];
    },
    create: function(provider, tokens, request) {
      var i, make_res, make_res_endpoint, res;
      if (!tokens) {
        return cache.tryCache(oauth, provider, true);
      }
      if (typeof request !== "object") {
        providers_api.fetchDescription(provider);
      }
      make_res = function(method) {
        return oauthio.request.mkHttp(provider, tokens, request, method);
      };
      make_res_endpoint = function(method, url) {
        return oauthio.request.mkHttpEndpoint(provider, tokens, request, method, url);
      };
      res = {};
      for (i in tokens) {
        res[i] = tokens[i];
      }
      res.get = make_res("GET");
      res.post = make_res("POST");
      res.put = make_res("PUT");
      res.patch = make_res("PATCH");
      res.del = make_res("DELETE");
      res.me = oauthio.request.mkHttpMe(provider, tokens, request, "GET");
      return res;
    },
    popup: function(provider, opts, callback) {
      var defer, frm, getMessage, gotmessage, interval, res, url, wnd, wndTimeout, wnd_options, wnd_settings;
      gotmessage = false;
      getMessage = function(e) {
        if (!gotmessage) {
          if (e.origin !== config.oauthd_base) {
            return;
          }
          try {
            wnd.close();
          } catch (_error) {}
          opts.data = e.data;
          oauthio.request.sendCallback(opts, defer);
          return gotmessage = true;
        }
      };
      wnd = void 0;
      frm = void 0;
      wndTimeout = void 0;
      defer = $.Deferred();
      opts = opts || {};
      if (!config.key) {
        if (defer != null) {
          defer.reject(new Error("OAuth object must be initialized"));
        }
        if (callback == null) {
          return defer.promise();
        } else {
          return callback(new Error("OAuth object must be initialized"));
        }
      }
      if (arguments.length === 2 && typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      if (cache.cacheEnabled(opts.cache)) {
        res = cache.tryCache(oauth, provider, opts.cache);
        if (res) {
          if (defer != null) {
            defer.resolve(res);
          }
          if (callback) {
            return callback(null, res);
          } else {
            return defer.promise();
          }
        }
      }
      if (!opts.state) {
        opts.state = sha1.create_hash();
        opts.state_type = "client";
      }
      client_states.push(opts.state);
      url = config.oauthd_url + "/auth/" + provider + "?k=" + config.key;
      url += "&d=" + encodeURIComponent(Url.getAbsUrl("/"));
      if (opts) {
        url += "&opts=" + encodeURIComponent(JSON.stringify(opts));
      }
      if (opts.wnd_settings) {
        wnd_settings = opts.wnd_settings;
        delete opts.wnd_settings;
      } else {
        wnd_settings = {
          width: Math.floor(window.outerWidth * 0.8),
          height: Math.floor(window.outerHeight * 0.5)
        };
      }
      if (wnd_settings.width < 1000) {
        wnd_settings.width = 1000;
      }
      if (wnd_settings.height < 630) {
        wnd_settings.height = 630;
      }
      wnd_settings.left = Math.floor(window.screenX + (window.outerWidth - wnd_settings.width) / 2);
      wnd_settings.top = Math.floor(window.screenY + (window.outerHeight - wnd_settings.height) / 8);
      wnd_options = "width=" + wnd_settings.width + ",height=" + wnd_settings.height;
      wnd_options += ",toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0";
      wnd_options += ",left=" + wnd_settings.left + ",top=" + wnd_settings.top;
      opts = {
        provider: provider,
        cache: opts.cache
      };
      opts.callback = function(e, r) {
        if (window.removeEventListener) {
          window.removeEventListener("message", getMessage, false);
        } else if (window.detachEvent) {
          window.detachEvent("onmessage", getMessage);
        } else {
          if (document.detachEvent) {
            document.detachEvent("onmessage", getMessage);
          }
        }
        opts.callback = function() {};
        if (wndTimeout) {
          clearTimeout(wndTimeout);
          wndTimeout = undefined;
        }
        if (callback) {
          return callback(e, r);
        } else {
          return undefined;
        }
      };
      if (window.attachEvent) {
        window.attachEvent("onmessage", getMessage);
      } else if (document.attachEvent) {
        document.attachEvent("onmessage", getMessage);
      } else {
        if (window.addEventListener) {
          window.addEventListener("message", getMessage, false);
        }
      }
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessageExternal) {
        chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
          request.origin = sender.url.match(/^.{2,5}:\/\/[^/]+/)[0];
          return getMessage(request);
        });
      }
      if (!frm && (navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > 0)) {
        frm = document.createElement("iframe");
        frm.src = config.oauthd_url + "/auth/iframe?d=" + encodeURIComponent(Url.getAbsUrl("/"));
        frm.width = 0;
        frm.height = 0;
        frm.frameBorder = 0;
        frm.style.visibility = "hidden";
        document.body.appendChild(frm);
      }
      wndTimeout = setTimeout(function() {
        if (defer != null) {
          defer.reject(new Error("Authorization timed out"));
        }
        if (opts.callback && typeof opts.callback === "function") {
          opts.callback(new Error("Authorization timed out"));
        }
        try {
          wnd.close();
        } catch (_error) {}
      }, 1200 * 1000);
      wnd = window.open(url, "Authorization", wnd_options);
      if (wnd) {
        wnd.focus();
        interval = window.setInterval(function() {
          if (wnd === null || wnd.closed) {
            window.clearInterval(interval);
            if (!gotmessage) {
              if (defer != null) {
                defer.reject(new Error("The popup was closed"));
              }
              if (opts.callback && typeof opts.callback === "function") {
                return opts.callback(new Error("The popup was closed"));
              }
            }
          }
        }, 500);
      } else {
        if (defer != null) {
          defer.reject(new Error("Could not open a popup"));
        }
        if (opts.callback && typeof opts.callback === "function") {
          opts.callback(new Error("Could not open a popup"));
        }
      }
      return defer != null ? defer.promise() : void 0;
    },
    redirect: function(provider, opts, url) {
      var redirect_uri, res;
      if (arguments.length === 2) {
        url = opts;
        opts = {};
      }
      if (cache.cacheEnabled(opts.cache)) {
        res = cache.tryCache(oauth, provider, opts.cache);
        if (res) {
          url = Url.getAbsUrl(url) + (url.indexOf("#") === -1 ? "#" : "&") + "oauthio=cache";
          location_operations.changeHref(url);
          location_operations.reload();
          return;
        }
      }
      if (!opts.state) {
        opts.state = sha1.create_hash();
        opts.state_type = "client";
      }
      cookies.createCookie("oauthio_state", opts.state);
      redirect_uri = encodeURIComponent(Url.getAbsUrl(url));
      url = config.oauthd_url + "/auth/" + provider + "?k=" + config.key;
      url += "&redirect_uri=" + redirect_uri;
      if (opts) {
        url += "&opts=" + encodeURIComponent(JSON.stringify(opts));
      }
      location_operations.changeHref(url);
    },
    callback: function(provider, opts, callback) {
      var defer, res;
      defer = $.Deferred();
      if (arguments.length === 1 && typeof provider === "function") {
        callback = provider;
        provider = undefined;
        opts = {};
      }
      if (arguments.length === 1 && typeof provider === "string") {
        opts = {};
      }
      if (arguments.length === 2 && typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      if (cache.cacheEnabled(opts.cache) || oauth_result === "cache") {
        res = cache.tryCache(oauth, provider, opts.cache);
        if (oauth_result === "cache" && (typeof provider !== "string" || !provider)) {
          if (defer != null) {
            defer.reject(new Error("You must set a provider when using the cache"));
          }
          if (callback) {
            return callback(new Error("You must set a provider when using the cache"));
          } else {
            return defer != null ? defer.promise() : void 0;
          }
        }
        if (res) {
          if (callback) {
            if (res) {
              return callback(null, res);
            }
          } else {
            if (defer != null) {
              defer.resolve(res);
            }
            return defer != null ? defer.promise() : void 0;
          }
        }
      }
      if (!oauth_result) {
        return;
      }
      oauthio.request.sendCallback({
        data: oauth_result,
        provider: provider,
        cache: opts.cache,
        callback: callback
      }, defer);
      return defer != null ? defer.promise() : void 0;
    },
    clearCache: function(provider) {
      cookies.eraseCookie("oauthio_provider_" + provider);
    },
    http_me: function(opts) {
      if (oauthio.request.http_me) {
        oauthio.request.http_me(opts);
      }
    },
    http: function(opts) {
      if (oauthio.request.http) {
        oauthio.request.http(opts);
      }
    },
    getVersion: function() {
      return Materia.getVersion.apply(this);
    }
  };
  return oauth;
};

},{"../tools/cookies":10,"../tools/sha1":12,"./providers":5,"./request":6}],5:[function(require,module,exports){
"use strict";
var config;

config = require("../config");

module.exports = function(Materia) {
  var $, providers_api, providers_cb, providers_desc;
  $ = Materia.getJquery();
  providers_desc = {};
  providers_cb = {};
  providers_api = {
    execProvidersCb: function(provider, e, r) {
      var cbs, i;
      if (providers_cb[provider]) {
        cbs = providers_cb[provider];
        delete providers_cb[provider];
        for (i in cbs) {
          cbs[i](e, r);
        }
      }
    },
    fetchDescription: function(provider) {
      if (providers_desc[provider]) {
        return;
      }
      providers_desc[provider] = true;
      $.ajax({
        url: config.oauthd_api + "/providers/" + provider,
        data: {
          extend: true
        },
        dataType: "json"
      }).done(function(data) {
        providers_desc[provider] = data.data;
        providers_api.execProvidersCb(provider, null, data.data);
      }).always(function() {
        if (typeof providers_desc[provider] !== "object") {
          delete providers_desc[provider];
          providers_api.execProvidersCb(provider, new Error("Unable to fetch request description"));
        }
      });
    },
    getDescription: function(provider, opts, callback) {
      opts = opts || {};
      if (typeof providers_desc[provider] === "object") {
        return callback(null, providers_desc[provider]);
      }
      if (!providers_desc[provider]) {
        providers_api.fetchDescription(provider);
      }
      if (!opts.wait) {
        return callback(null, {});
      }
      providers_cb[provider] = providers_cb[provider] || [];
      providers_cb[provider].push(callback);
    }
  };
  return providers_api;
};

},{"../config":1}],6:[function(require,module,exports){
"use strict";
var Url,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Url = require('../tools/url')();

module.exports = function(Materia, client_states, providers_api) {
  var $, cache, config, extended_methods, fetched_methods;
  $ = Materia.getJquery();
  config = Materia.getConfig();
  cache = Materia.getCache();
  extended_methods = [];
  fetched_methods = false;
  return {
    retrieveMethods: function() {
      var defer;
      defer = $.Deferred();
      if (!fetched_methods) {
        $.ajax(config.oauthd_url + '/api/extended-endpoints').then(function(data) {
          extended_methods = data.data;
          fetched_methods = true;
          return defer.resolve();
        }).fail(function(e) {
          fetched_methods = true;
          return defer.reject(e);
        });
      } else {
        defer.resolve(extended_methods);
      }
      return defer.promise();
    },
    generateMethods: function(request_object, tokens, provider) {
      var k, kk, name_array, pt, v, vv, _i, _len, _results;
      if (extended_methods != null) {
        _results = [];
        for (k = _i = 0, _len = extended_methods.length; _i < _len; k = ++_i) {
          v = extended_methods[k];
          name_array = v.name.split('.');
          pt = request_object;
          _results.push((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (kk = _j = 0, _len1 = name_array.length; _j < _len1; kk = ++_j) {
              vv = name_array[kk];
              if (kk < name_array.length - 1) {
                if (pt[vv] == null) {
                  pt[vv] = {};
                }
                _results1.push(pt = pt[vv]);
              } else {
                _results1.push(pt[vv] = this.mkHttpAll(provider, tokens, v, arguments));
              }
            }
            return _results1;
          }).apply(this, arguments));
        }
        return _results;
      }
    },
    http: function(opts) {
      var defer, desc_opts, doRequest, i, options;
      doRequest = function() {
        var i, k, qs, request;
        request = options.oauthio.request || {};
        if (!request.cors) {
          options.url = encodeURIComponent(options.url);
          if (options.url[0] !== "/") {
            options.url = "/" + options.url;
          }
          options.url = config.oauthd_url + "/request/" + options.oauthio.provider + options.url;
          options.headers = options.headers || {};
          options.headers.oauthio = "k=" + config.key;
          if (options.oauthio.tokens.oauth_token && options.oauthio.tokens.oauth_token_secret) {
            options.headers.oauthio += "&oauthv=1";
          }
          for (k in options.oauthio.tokens) {
            options.headers.oauthio += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(options.oauthio.tokens[k]);
          }
          delete options.oauthio;
          return $.ajax(options);
        }
        if (options.oauthio.tokens) {
          if (options.oauthio.tokens.access_token) {
            options.oauthio.tokens.token = options.oauthio.tokens.access_token;
          }
          if (!options.url.match(/^[a-z]{2,16}:\/\//)) {
            if (options.url[0] !== "/") {
              options.url = "/" + options.url;
            }
            options.url = request.url + options.url;
          }
          options.url = Url.replaceParam(options.url, options.oauthio.tokens, request.parameters);
          if (request.query) {
            qs = [];
            for (i in request.query) {
              qs.push(encodeURIComponent(i) + "=" + encodeURIComponent(Url.replaceParam(request.query[i], options.oauthio.tokens, request.parameters)));
            }
            if (__indexOf.call(options.url, "?") >= 0) {
              options.url += "&" + qs;
            } else {
              options.url += "?" + qs;
            }
          }
          if (request.headers) {
            options.headers = options.headers || {};
            for (i in request.headers) {
              options.headers[i] = Url.replaceParam(request.headers[i], options.oauthio.tokens, request.parameters);
            }
          }
          delete options.oauthio;
          return $.ajax(options);
        }
      };
      options = {};
      i = void 0;
      for (i in opts) {
        options[i] = opts[i];
      }
      if (!options.oauthio.request || options.oauthio.request === true) {
        desc_opts = {
          wait: !!options.oauthio.request
        };
        defer = $.Deferred();
        providers_api.getDescription(options.oauthio.provider, desc_opts, function(e, desc) {
          if (e) {
            return defer.reject(e);
          }
          if (options.oauthio.tokens.oauth_token && options.oauthio.tokens.oauth_token_secret) {
            options.oauthio.request = desc.oauth1 && desc.oauth1.request;
          } else {
            options.oauthio.request = desc.oauth2 && desc.oauth2.request;
          }
          defer.resolve();
        });
        return defer.then(doRequest);
      } else {
        return doRequest();
      }
    },
    http_me: function(opts) {
      var defer, desc_opts, doRequest, k, options;
      doRequest = function() {
        var defer, k, promise, request;
        defer = $.Deferred();
        request = options.oauthio.request || {};
        options.url = config.oauthd_url + "/auth/" + options.oauthio.provider + "/me";
        options.headers = options.headers || {};
        options.headers.oauthio = "k=" + config.key;
        if (options.oauthio.tokens.oauth_token && options.oauthio.tokens.oauth_token_secret) {
          options.headers.oauthio += "&oauthv=1";
        }
        for (k in options.oauthio.tokens) {
          options.headers.oauthio += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(options.oauthio.tokens[k]);
        }
        delete options.oauthio;
        promise = $.ajax(options);
        $.when(promise).done(function(data) {
          defer.resolve(data.data);
        }).fail(function(data) {
          if (data.responseJSON) {
            defer.reject(data.responseJSON.data);
          } else {
            defer.reject(new Error("An error occured while trying to access the resource"));
          }
        });
        return defer.promise();
      };
      options = {};
      for (k in opts) {
        options[k] = opts[k];
      }
      if (!options.oauthio.request || options.oauthio.request === true) {
        desc_opts = {
          wait: !!options.oauthio.request
        };
        defer = $.Deferred();
        providers_api.getDescription(options.oauthio.provider, desc_opts, function(e, desc) {
          if (e) {
            return defer.reject(e);
          }
          if (options.oauthio.tokens.oauth_token && options.oauthio.tokens.oauth_token_secret) {
            options.oauthio.request = desc.oauth1 && desc.oauth1.request;
          } else {
            options.oauthio.request = desc.oauth2 && desc.oauth2.request;
          }
          defer.resolve();
        });
        return defer.then(doRequest);
      } else {
        return doRequest();
      }
    },
    http_all: function(options, endpoint_descriptor, parameters) {
      var doRequest;
      doRequest = function() {
        var defer, k, promise, request;
        defer = $.Deferred();
        request = options.oauthio.request || {};
        options.headers = options.headers || {};
        options.headers.oauthio = "k=" + config.key;
        if (options.oauthio.tokens.oauth_token && options.oauthio.tokens.oauth_token_secret) {
          options.headers.oauthio += "&oauthv=1";
        }
        for (k in options.oauthio.tokens) {
          options.headers.oauthio += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(options.oauthio.tokens[k]);
        }
        delete options.oauthio;
        promise = $.ajax(options);
        $.when(promise).done(function(data) {
          var error;
          if (typeof data.data === 'string') {
            try {
              data.data = JSON.parse(data.data);
            } catch (_error) {
              error = _error;
              data.data = data.data;
            } finally {
              defer.resolve(data.data);
            }
          }
        }).fail(function(data) {
          if (data.responseJSON) {
            defer.reject(data.responseJSON.data);
          } else {
            defer.reject(new Error("An error occured while trying to access the resource"));
          }
        });
        return defer.promise();
      };
      return doRequest();
    },
    mkHttp: function(provider, tokens, request, method) {
      var base;
      base = this;
      return function(opts, opts2) {
        var i, options;
        options = {};
        if (typeof opts === "string") {
          if (typeof opts2 === "object") {
            for (i in opts2) {
              options[i] = opts2[i];
            }
          }
          options.url = opts;
        } else if (typeof opts === "object") {
          for (i in opts) {
            options[i] = opts[i];
          }
        }
        options.type = options.type || method;
        options.oauthio = {
          provider: provider,
          tokens: tokens,
          request: request
        };
        return base.http(options);
      };
    },
    mkHttpMe: function(provider, tokens, request, method) {
      var base;
      base = this;
      return function(filter) {
        var options;
        options = {};
        options.type = options.type || method;
        options.oauthio = {
          provider: provider,
          tokens: tokens,
          request: request
        };
        options.data = options.data || {};
        if (filter) {
          options.data.filter = filter.join(",");
        }
        return base.http_me(options);
      };
    },
    mkHttpAll: function(provider, tokens, endpoint_descriptor) {
      var base;
      base = this;
      return function() {
        var k, options, th_param, v;
        options = {};
        options.type = endpoint_descriptor.method;
        options.url = config.oauthd_url + endpoint_descriptor.endpoint.replace(':provider', provider);
        options.oauthio = {
          provider: provider,
          tokens: tokens
        };
        options.data = {};
        for (k in arguments) {
          v = arguments[k];
          th_param = endpoint_descriptor.params[k];
          if (th_param != null) {
            options.data[th_param.name] = v;
          }
        }
        options.data = options.data || {};
        return base.http_all(options, endpoint_descriptor, arguments);
      };
    },
    sendCallback: function(opts, defer) {
      var base, data, e, err, i, make_res, request, res, tokens;
      base = this;
      data = void 0;
      err = void 0;
      try {
        data = JSON.parse(opts.data);
      } catch (_error) {
        e = _error;
        defer.reject(new Error("Error while parsing result"));
        return opts.callback(new Error("Error while parsing result"));
      }
      if (!data || !data.provider) {
        return;
      }
      if (opts.provider && data.provider.toLowerCase() !== opts.provider.toLowerCase()) {
        err = new Error("Returned provider name does not match asked provider");
        defer.reject(err);
        if (opts.callback && typeof opts.callback === "function") {
          return opts.callback(err);
        } else {
          return;
        }
      }
      if (data.status === "error" || data.status === "fail") {
        err = new Error(data.message);
        err.body = data.data;
        defer.reject(err);
        if (opts.callback && typeof opts.callback === "function") {
          return opts.callback(err);
        } else {
          return;
        }
      }
      if (data.status !== "success" || !data.data) {
        err = new Error();
        err.body = data.data;
        defer.reject(err);
        if (opts.callback && typeof opts.callback === "function") {
          return opts.callback(err);
        } else {
          return;
        }
      }
      data.state = data.state.replace(/\s+/g, "");
      i = 0;
      while (i < client_states.length) {
        client_states[i] = client_states[i].replace(/\s+/g, "");
        i++;
      }
      if (!data.state || client_states.indexOf(data.state) === -1) {
        defer.reject(new Error("State is not matching"));
        if (opts.callback && typeof opts.callback === "function") {
          return opts.callback(new Error("State is not matching"));
        } else {
          return;
        }
      }
      if (!opts.provider) {
        data.data.provider = data.provider;
      }
      res = data.data;
      res.provider = data.provider.toLowerCase();
      if (cache.cacheEnabled(opts.cache) && res) {
        cache.storeCache(data.provider, res);
      }
      request = res.request;
      delete res.request;
      tokens = void 0;
      if (res.access_token) {
        tokens = {
          access_token: res.access_token
        };
      } else if (res.oauth_token && res.oauth_token_secret) {
        tokens = {
          oauth_token: res.oauth_token,
          oauth_token_secret: res.oauth_token_secret
        };
      }
      if (!request) {
        defer.resolve(res);
        if (opts.callback && typeof opts.callback === "function") {
          return opts.callback(null, res);
        } else {
          return;
        }
      }
      if (request.required) {
        for (i in request.required) {
          tokens[request.required[i]] = res[request.required[i]];
        }
      }
      make_res = function(method) {
        return base.mkHttp(data.provider, tokens, request, method);
      };
      res.toJson = function() {
        var a;
        a = {};
        if (res.access_token != null) {
          a.access_token = res.access_token;
        }
        if (res.oauth_token != null) {
          a.oauth_token = res.oauth_token;
        }
        if (res.oauth_token_secret != null) {
          a.oauth_token_secret = res.oauth_token_secret;
        }
        if (res.expires_in != null) {
          a.expires_in = res.expires_in;
        }
        if (res.token_type != null) {
          a.token_type = res.token_type;
        }
        if (res.id_token != null) {
          a.id_token = res.id_token;
        }
        if (res.provider != null) {
          a.provider = res.provider;
        }
        if (res.email != null) {
          a.email = res.email;
        }
        return a;
      };
      res.get = make_res("GET");
      res.post = make_res("POST");
      res.put = make_res("PUT");
      res.patch = make_res("PATCH");
      res.del = make_res("DELETE");
      res.me = base.mkHttpMe(data.provider, tokens, request, "GET");
      return this.retrieveMethods().then((function(_this) {
        return function() {
          _this.generateMethods(res, tokens, data.provider);
          defer.resolve(res);
          if (opts.callback && typeof opts.callback === "function") {
            return opts.callback(null, res);
          } else {

          }
        };
      })(this)).fail((function(_this) {
        return function(e) {
          console.log('Could not retrieve methods', e);
          defer.resolve(res);
          if (opts.callback && typeof opts.callback === "function") {
            return opts.callback(null, res);
          } else {

          }
        };
      })(this));
    }
  };
};

},{"../tools/url":13}],7:[function(require,module,exports){
"use strict";
module.exports = function(Materia) {
  var $, UserObject, config, cookieStore, lastSave;
  $ = Materia.getJquery();
  config = Materia.getConfig();
  cookieStore = Materia.getCookies();
  lastSave = null;
  UserObject = (function() {
    function UserObject(data) {
      this.token = data.token;
      this.data = data.user;
      this.providers = data.providers;
      lastSave = this.getEditableData();
    }

    UserObject.prototype.getEditableData = function() {
      var data, key;
      data = [];
      for (key in this.data) {
        if (['id', 'email'].indexOf(key) === -1) {
          data.push({
            key: key,
            value: this.data[key]
          });
        }
      }
      return data;
    };

    UserObject.prototype.save = function() {
      var d, dataToSave, keyIsInLastSave, _i, _j, _len, _len1, _ref;
      dataToSave = {};
      for (_i = 0, _len = lastSave.length; _i < _len; _i++) {
        d = lastSave[_i];
        if (this.data[d.key] !== d.value) {
          dataToSave[d.key] = this.data[d.key];
        }
        if (this.data[d.key] === null) {
          delete this.data[d.key];
        }
      }
      keyIsInLastSave = function(key) {
        var o, _j, _len1;
        for (_j = 0, _len1 = lastSave.length; _j < _len1; _j++) {
          o = lastSave[_j];
          if (o.key === key) {
            return true;
          }
        }
        return false;
      };
      _ref = this.getEditableData();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        d = _ref[_j];
        if (!keyIsInLastSave(d.key)) {
          dataToSave[d.key] = this.data[d.key];
        }
      }
      this.saveLocal();
      return Materia.API.put('/api/usermanagement/user?k=' + config.key + '&token=' + this.token, dataToSave);
    };

    UserObject.prototype.select = function(provider) {
      var OAuthResult;
      OAuthResult = null;
      return OAuthResult;
    };

    UserObject.prototype.saveLocal = function() {
      var copy;
      copy = {
        token: this.token,
        user: this.data,
        providers: this.providers
      };
      cookieStore.eraseCookie('oio_auth');
      return cookieStore.createCookie('oio_auth', JSON.stringify(copy), 21600);
    };

    UserObject.prototype.hasProvider = function(provider) {
      var _ref;
      return ((_ref = this.providers) != null ? _ref.indexOf(provider) : void 0) !== -1;
    };

    UserObject.prototype.getProviders = function() {
      var defer;
      defer = $.Deferred();
      Materia.API.get('/api/usermanagement/user/providers?k=' + config.key + '&token=' + this.token).done((function(_this) {
        return function(providers) {
          _this.providers = providers.data;
          _this.saveLocal();
          return defer.resolve(_this.providers);
        };
      })(this)).fail(function(err) {
        return defer.reject(err);
      });
      return defer.promise();
    };

    UserObject.prototype.addProvider = function(oauthRes) {
      var defer;
      defer = $.Deferred();
      if (typeof oauthRes.toJson === 'function') {
        oauthRes = oauthRes.toJson();
      }
      oauthRes.email = this.data.email;
      this.providers.push(oauthRes.provider);
      Materia.API.post('/api/usermanagement/user/providers?k=' + config.key + '&token=' + this.token, oauthRes).done((function(_this) {
        return function(res) {
          _this.data = res.data;
          _this.saveLocal();
          return defer.resolve();
        };
      })(this)).fail((function(_this) {
        return function(err) {
          _this.providers.splice(_this.providers.indexOf(oauthRes.provider), 1);
          return defer.reject(err);
        };
      })(this));
      return defer.promise();
    };

    UserObject.prototype.removeProvider = function(provider) {
      var defer;
      defer = $.Deferred();
      this.providers.splice(this.providers.indexOf(provider), 1);
      Materia.API.del('/api/usermanagement/user/providers/' + provider + '?k=' + config.key + '&token=' + this.token).done((function(_this) {
        return function(res) {
          _this.saveLocal();
          return defer.resolve(res);
        };
      })(this)).fail((function(_this) {
        return function(err) {
          _this.providers.push(provider);
          return defer.reject(err);
        };
      })(this));
      return defer.promise();
    };

    UserObject.prototype.changePassword = function(oldPassword, newPassword) {
      return Materia.API.post('/api/usermanagement/user/password?k=' + config.key + '&token=' + this.token, {
        password: newPassword
      });
    };

    UserObject.prototype.isLoggued = function() {
      return Materia.User.isLogged();
    };

    UserObject.prototype.isLogged = function() {
      return Materia.User.isLogged();
    };

    UserObject.prototype.logout = function() {
      var defer;
      defer = $.Deferred();
      cookieStore.eraseCookie('oio_auth');
      Materia.API.post('/api/usermanagement/user/logout?k=' + config.key + '&token=' + this.token).done(function() {
        return defer.resolve();
      }).fail(function(err) {
        return defer.reject(err);
      });
      return defer.promise();
    };

    return UserObject;

  })();
  return {
    initialize: function(public_key, options) {
      return Materia.initialize(public_key, options);
    },
    setOAuthdURL: function(url) {
      return Materia.setOAuthdURL(url);
    },
    signup: function(data) {
      var defer;
      defer = $.Deferred();
      if (typeof data.toJson === 'function') {
        data = data.toJson();
      }
      Materia.API.post('/api/usermanagement/signup?k=' + config.key, data).done(function(res) {
        cookieStore.createCookie('oio_auth', JSON.stringify(res.data), res.data.expires_in || 21600);
        return defer.resolve(new UserObject(res.data));
      }).fail(function(err) {
        return defer.reject(err);
      });
      return defer.promise();
    },
    signin: function(email, password) {
      var defer, signinData;
      defer = $.Deferred();
      if (typeof email !== "string" && !password) {
        signinData = email;
        if (typeof signinData.toJson === 'function') {
          signinData = signinData.toJson();
        }
        Materia.API.post('/api/usermanagement/signin?k=' + config.key, signinData).done(function(res) {
          cookieStore.createCookie('oio_auth', JSON.stringify(res.data), res.data.expires_in || 21600);
          return defer.resolve(new UserObject(res.data));
        }).fail(function(err) {
          return defer.reject(err);
        });
      } else {
        Materia.API.post('/api/usermanagement/signin?k=' + config.key, {
          email: email,
          password: password
        }).done(function(res) {
          cookieStore.createCookie('oio_auth', JSON.stringify(res.data), res.data.expires_in || 21600);
          return defer.resolve(new UserObject(res.data));
        }).fail(function(err) {
          return defer.reject(err);
        });
      }
      return defer.promise();
    },
    confirmResetPassword: function(newPassword, sptoken) {
      return Materia.API.post('/api/usermanagement/user/password?k=' + config.key, {
        password: newPassword,
        token: sptoken
      });
    },
    resetPassword: function(email, callback) {
      return Materia.API.post('/api/usermanagement/user/password/reset?k=' + config.key, {
        email: email
      });
    },
    refreshIdentity: function() {
      var defer;
      defer = $.Deferred();
      Materia.API.get('/api/usermanagement/user?k=' + config.key + '&token=' + JSON.parse(cookieStore.readCookie('oio_auth')).token).done(function(res) {
        return defer.resolve(new UserObject(res.data));
      }).fail(function(err) {
        return defer.reject(err);
      });
      return defer.promise();
    },
    getIdentity: function() {
      var user;
      user = cookieStore.readCookie('oio_auth');
      if (!user) {
        return null;
      }
      return new UserObject(JSON.parse(user));
    },
    isLogged: function() {
      var a;
      a = cookieStore.readCookie('oio_auth');
      if (a) {
        return true;
      }
      return false;
    }
  };
};

},{}],8:[function(require,module,exports){
(function() {
  var Materia, jquery;
  jquery = require('./tools/jquery-lite.js');
  Materia = require('./lib/core')(window, document, jquery, navigator);
  Materia.extend('OAuth', require('./lib/oauth'));
  Materia.extend('API', require('./lib/api'));
  Materia.extend('User', require('./lib/user'));
  if (typeof angular !== "undefined" && angular !== null) {
    angular.module('oauthio', []).factory('Materia', [
      function() {
        return Materia;
      }
    ]).factory('OAuth', [
      function() {
        return Materia.OAuth;
      }
    ]).factory('User', [
      function() {
        return Materia.User;
      }
    ]);
  }
  window.Materia = Materia;
  window.User = window.Materia.User;
  return window.OAuth = window.Materia.OAuth;
})();

},{"./lib/api":2,"./lib/core":3,"./lib/oauth":4,"./lib/user":7,"./tools/jquery-lite.js":14}],9:[function(require,module,exports){
"use strict";
module.exports = {
  init: function(cookies_module, config) {
    this.config = config;
    return this.cookies = cookies_module;
  },
  tryCache: function(OAuth, provider, cache) {
    var e, i, res;
    if (this.cacheEnabled(cache)) {
      cache = this.cookies.readCookie("oauthio_provider_" + provider);
      if (!cache) {
        return false;
      }
      cache = decodeURIComponent(cache);
    }
    if (typeof cache === "string") {
      try {
        cache = JSON.parse(cache);
      } catch (_error) {
        e = _error;
        return false;
      }
    }
    if (typeof cache === "object") {
      res = {};
      for (i in cache) {
        if (i !== "request" && typeof cache[i] !== "function") {
          res[i] = cache[i];
        }
      }
      return OAuth.create(provider, res, cache.request);
    }
    return false;
  },
  storeCache: function(provider, cache) {
    this.cookies.createCookie("oauthio_provider_" + provider, encodeURIComponent(JSON.stringify(cache)), cache.expires_in - 10 || 3600);
  },
  cacheEnabled: function(cache) {
    if (typeof cache === "undefined") {
      return this.config.options.cache;
    }
    return cache;
  }
};

},{}],10:[function(require,module,exports){
"use strict";
module.exports = {
  init: function(config, document) {
    this.config = config;
    return this.document = document;
  },
  createCookie: function(name, value, expires) {
    var date;
    this.eraseCookie(name);
    date = new Date();
    date.setTime(date.getTime() + (expires || 1200) * 1000);
    expires = "; expires=" + date.toGMTString();
    this.document.cookie = name + "=" + value + expires + "; path=/";
  },
  readCookie: function(name) {
    var c, ca, i, nameEQ;
    nameEQ = name + "=";
    ca = this.document.cookie.split(";");
    i = 0;
    while (i < ca.length) {
      c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
      i++;
    }
    return null;
  },
  eraseCookie: function(name) {
    var date;
    date = new Date();
    date.setTime(date.getTime() - 86400000);
    this.document.cookie = name + "=; expires=" + date.toGMTString() + "; path=/";
  }
};

},{}],11:[function(require,module,exports){
"use strict";
module.exports = function(document) {
  return {
    reload: function() {
      return document.location.reload();
    },
    getHash: function() {
      return document.location.hash;
    },
    setHash: function(newHash) {
      return document.location.hash = newHash;
    },
    changeHref: function(newLocation) {
      return document.location.href = newLocation;
    }
  };
};

},{}],12:[function(require,module,exports){
var b64pad, hexcase;

hexcase = 0;

b64pad = "";


/* istanbul ignore next */

module.exports = {
  hex_sha1: function(s) {
    return this.rstr2hex(this.rstr_sha1(this.str2rstr_utf8(s)));
  },
  b64_sha1: function(s) {
    return this.rstr2b64(this.rstr_sha1(this.str2rstr_utf8(s)));
  },
  any_sha1: function(s, e) {
    return this.rstr2any(this.rstr_sha1(this.str2rstr_utf8(s)), e);
  },
  hex_hmac_sha1: function(k, d) {
    return this.rstr2hex(this.rstr_hmac_sha1(this.str2rstr_utf8(k), this.str2rstr_utf8(d)));
  },
  b64_hmac_sha1: function(k, d) {
    return this.rstr2b64(this.rstr_hmac_sha1(this.str2rstr_utf8(k), this.str2rstr_utf8(d)));
  },
  any_hmac_sha1: function(k, d, e) {
    return this.rstr2any(this.rstr_hmac_sha1(this.str2rstr_utf8(k), this.str2rstr_utf8(d)), e);
  },
  sha1_vm_test: function() {
    return thishex_sha1("abc").toLowerCase() === "a9993e364706816aba3e25717850c26c9cd0d89d";
  },
  rstr_sha1: function(s) {
    return this.binb2rstr(this.binb_sha1(this.rstr2binb(s), s.length * 8));
  },
  rstr_hmac_sha1: function(key, data) {
    var bkey, hash, i, ipad, opad;
    bkey = this.rstr2binb(key);
    if (bkey.length > 16) {
      bkey = this.binb_sha1(bkey, key.length * 8);
    }
    ipad = Array(16);
    opad = Array(16);
    i = 0;
    while (i < 16) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
      i++;
    }
    hash = this.binb_sha1(ipad.concat(this.rstr2binb(data)), 512 + data.length * 8);
    return this.binb2rstr(this.binb_sha1(opad.concat(hash), 512 + 160));
  },
  rstr2hex: function(input) {
    var e, hex_tab, i, output, x;
    try {
      hexcase;
    } catch (_error) {
      e = _error;
      hexcase = 0;
    }
    hex_tab = (hexcase ? "0123456789ABCDEF" : "0123456789abcdef");
    output = "";
    x = void 0;
    i = 0;
    while (i < input.length) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
      i++;
    }
    return output;
  },
  rstr2b64: function(input) {
    var e, i, j, len, output, tab, triplet;
    try {
      b64pad;
    } catch (_error) {
      e = _error;
      b64pad = "";
    }
    tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    output = "";
    len = input.length;
    i = 0;
    while (i < len) {
      triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
      j = 0;
      while (j < 4) {
        if (i * 8 + j * 6 > input.length * 8) {
          output += b64pad;
        } else {
          output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
        j++;
      }
      i += 3;
    }
    return output;
  },
  rstr2any: function(input, encoding) {
    var dividend, divisor, full_length, i, output, q, quotient, remainders, x;
    divisor = encoding.length;
    remainders = Array();
    i = void 0;
    q = void 0;
    x = void 0;
    quotient = void 0;
    dividend = Array(Math.ceil(input.length / 2));
    i = 0;
    while (i < dividend.length) {
      dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
      i++;
    }
    while (dividend.length > 0) {
      quotient = Array();
      x = 0;
      i = 0;
      while (i < dividend.length) {
        x = (x << 16) + dividend[i];
        q = Math.floor(x / divisor);
        x -= q * divisor;
        if (quotient.length > 0 || q > 0) {
          quotient[quotient.length] = q;
        }
        i++;
      }
      remainders[remainders.length] = x;
      dividend = quotient;
    }
    output = "";
    i = remainders.length - 1;
    while (i >= 0) {
      output += encoding.charAt(remainders[i]);
      i--;
    }
    full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    i = output.length;
    while (i < full_length) {
      output = encoding[0] + output;
      i++;
    }
    return output;
  },
  str2rstr_utf8: function(input) {
    var i, output, x, y;
    output = "";
    i = -1;
    x = void 0;
    y = void 0;
    while (++i < input.length) {
      x = input.charCodeAt(i);
      y = (i + 1 < input.length ? input.charCodeAt(i + 1) : 0);
      if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
        i++;
      }
      if (x <= 0x7F) {
        output += String.fromCharCode(x);
      } else if (x <= 0x7FF) {
        output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F), 0x80 | (x & 0x3F));
      } else if (x <= 0xFFFF) {
        output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
      } else {
        if (x <= 0x1FFFFF) {
          output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
        }
      }
    }
    return output;
  },
  str2rstr_utf16le: function(input) {
    var i, output;
    output = "";
    i = 0;
    while (i < input.length) {
      output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
      i++;
    }
    return output;
  },
  str2rstr_utf16be: function(input) {
    var i, output;
    output = "";
    i = 0;
    while (i < input.length) {
      output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF);
      i++;
    }
    return output;
  },
  rstr2binb: function(input) {
    var i, output;
    output = Array(input.length >> 2);
    i = 0;
    while (i < output.length) {
      output[i] = 0;
      i++;
    }
    i = 0;
    while (i < input.length * 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
      i += 8;
    }
    return output;
  },
  binb2rstr: function(input) {
    var i, output;
    output = "";
    i = 0;
    while (i < input.length * 32) {
      output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
      i += 8;
    }
    return output;
  },
  binb_sha1: function(x, len) {
    var a, b, c, d, e, i, j, olda, oldb, oldc, oldd, olde, t, w;
    x[len >> 5] |= 0x80 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;
    w = Array(80);
    a = 1732584193;
    b = -271733879;
    c = -1732584194;
    d = 271733878;
    e = -1009589776;
    i = 0;
    while (i < x.length) {
      olda = a;
      oldb = b;
      oldc = c;
      oldd = d;
      olde = e;
      j = 0;
      while (j < 80) {
        if (j < 16) {
          w[j] = x[i + j];
        } else {
          w[j] = this.bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        }
        t = this.safe_add(this.safe_add(this.bit_rol(a, 5), this.sha1_ft(j, b, c, d)), this.safe_add(this.safe_add(e, w[j]), this.sha1_kt(j)));
        e = d;
        d = c;
        c = this.bit_rol(b, 30);
        b = a;
        a = t;
        j++;
      }
      a = this.safe_add(a, olda);
      b = this.safe_add(b, oldb);
      c = this.safe_add(c, oldc);
      d = this.safe_add(d, oldd);
      e = this.safe_add(e, olde);
      i += 16;
    }
    return Array(a, b, c, d, e);
  },
  sha1_ft: function(t, b, c, d) {
    if (t < 20) {
      return (b & c) | ((~b) & d);
    }
    if (t < 40) {
      return b ^ c ^ d;
    }
    if (t < 60) {
      return (b & c) | (b & d) | (c & d);
    }
    return b ^ c ^ d;
  },
  sha1_kt: function(t) {
    if (t < 20) {
      return 1518500249;
    } else {
      if (t < 40) {
        return 1859775393;
      } else {
        if (t < 60) {
          return -1894007588;
        } else {
          return -899497514;
        }
      }
    }
  },
  safe_add: function(x, y) {
    var lsw, msw;
    lsw = (x & 0xFFFF) + (y & 0xFFFF);
    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  },
  bit_rol: function(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  },
  create_hash: function() {
    var hash;
    hash = this.b64_sha1((new Date()).getTime() + ":" + Math.floor(Math.random() * 9999999));
    return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
  }
};

},{}],13:[function(require,module,exports){
module.exports = function(document) {
  return {
    getAbsUrl: function(url) {
      var base_url;
      if (url.match(/^.{2,5}:\/\//)) {
        return url;
      }
      if (url[0] === "/") {
        return document.location.protocol + "//" + document.location.host + url;
      }
      base_url = document.location.protocol + "//" + document.location.host + document.location.pathname;
      if (base_url[base_url.length - 1] !== "/" && url[0] !== "#") {
        return base_url + "/" + url;
      }
      return base_url + url;
    },
    replaceParam: function(param, rep, rep2) {
      param = param.replace(/\{\{(.*?)\}\}/g, function(m, v) {
        return rep[v] || "";
      });
      if (rep2) {
        param = param.replace(/\{(.*?)\}/g, function(m, v) {
          return rep2[v] || "";
        });
      }
      return param;
    }
  };
};

},{}],14:[function(require,module,exports){

},{}]},{},[8])