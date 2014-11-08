(function() {
  var callOnceElementAvailable, callOnceMethodAvailable, ljust, print, replaceAll, rjust, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  print = console.log;

  callOnceMethodAvailable = function(method, callback) {
    if (now[method] != null) {
      return callback();
    } else {
      return setTimeout(function() {
        return callOnceMethodAvailable(method, callback);
      }, 300);
    }
  };

  callOnceElementAvailable = function(element, callback) {
    if ($(element).length > 0) {
      return callback();
    } else {
      return setTimeout(function() {
        return callOnceElementAvailable(element, callback);
      }, 300);
    }
  };

  root.toHourMinSecMillisec = function(seconds) {
    var hours, milliseconds, minutes, seconds_whole;
    hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds_whole = Math.floor(seconds);
    milliseconds = (seconds - seconds_whole) * 1000;
    milliseconds = Math.round(milliseconds);
    return [ljust(hours.toString(), 2, '0'), ljust(minutes.toString(), 2, '0'), ljust(seconds_whole.toString(), 2, '0'), rjust(milliseconds.toString(), 3, '0')];
  };

  root.toHourMinSec = function(seconds) {
    var hours, minutes;
    hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.round(seconds);
    return [ljust(hours.toString(), 2, '0'), ljust(minutes.toString(), 2, '0'), ljust(seconds.toString(), 2, '0')];
  };

  ljust = function(str, length, padchar) {
    var fill;
    if (padchar == null) {
      padchar = ' ';
    }
    fill = [];
    while (fill.length + str.length < length) {
      fill.push(padchar);
    }
    return fill.join('') + str;
  };

  rjust = function(str, length, padchar) {
    var fill;
    if (padchar == null) {
      padchar = ' ';
    }
    fill = [];
    while (fill.length + str.length < length) {
      fill.push(padchar);
    }
    return str + fill.join('');
  };

  replaceAll = function(str, from, to) {
    return str.split(from).join(to);
  };

  root.escapeHtmlQuotes = function(str) {
    var from, replacements, to, _i, _len, _ref;
    replacements = [['&', '&amp;'], ['>', '&gt;'], ['<', '&lt;'], ['"', '&quot;'], ["'", '&#8217;']];
    for (_i = 0, _len = replacements.length; _i < _len; _i++) {
      _ref = replacements[_i], from = _ref[0], to = _ref[1];
      str = replaceAll(str, from, to);
    }
    return str;
  };

  root.callOnceMethodAvailable = callOnceMethodAvailable;

  root.callOnceElementAvailable = callOnceElementAvailable;

  root.ljust = ljust;

  root.rjust = rjust;

}).call(this);
