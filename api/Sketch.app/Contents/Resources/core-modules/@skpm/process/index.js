var EventEmitter = require("events");
var toObject = require("util").toObject;

var currentLocale = (function currentLocale() {
  // NSLocale.currentLocale() only returns the language that is supported by the host application
  var languageCode = String(NSLocale.preferredLanguages()[0]).split("-")[0];
  if (!languageCode) {
    return undefined;
  }
  var countryCode = String(NSLocale.currentLocale().localeIdentifier()).split(
    "_"
  )[1];
  if (!countryCode) {
    return languageCode;
  }
  return languageCode + "-" + countryCode;
})();

var processShim = new EventEmitter();

Object.defineProperties(processShim, {
  title: {
    enumerable: true,
    get() {
      return String(__command.name());
    }
  },
  version: {
    enumerable: true,
    get() {
      var pluginBundle = __command.pluginBundle();
      return pluginBundle ? String(pluginBundle.version()) : "0.0.0";
    }
  },
  versions: {
    enumerable: true,
    get() {
      return {
        plugin: this.version,
        sketch: String(MSApplicationMetadata.metadata().appVersion)
      };
    }
  },
  arch: {
    enumerable: true,
    value: "x64"
  },
  platform: {
    enumerable: true,
    value: "darwin"
  },
  cwd: {
    enumerable: true,
    value: function() {
      var pluginBundle = __command.pluginBundle();
      return pluginBundle ? String(pluginBundle.url().path()) : "/tmp";
    }
  },
  env: {
    enumerable: true,
    get() {
      var env = toObject(NSProcessInfo.processInfo().environment());
      var pluginBundle = __command.pluginBundle();
      env.command = __command;
      if (pluginBundle) {
        env.plugin = pluginBundle;
      }
      if (currentLocale) {
        env.LANG = currentLocale;
      }
      return env;
    }
  },
  pid: {
    enumerable: true,
    get() {
      return String(__command.identifier);
    }
  },
  execPath: {
    enumerable: true,
    value: String(NSBundle.mainBundle().executablePath())
  },
  type: {
    enumerable: true,
    value: "sketch"
  },
  nextTick: {
    enumerable: true,
    get() {
      return setImmediate;
    }
  },
  argv: {
    enumerable: true,
    get() {
      return [
        this.execPath,
        this.cwd(),
        typeof context !== "undefined" ? context : undefined
      ];
    }
  }
});

module.exports = processShim;
