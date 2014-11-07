(function() {
  var SubtitleRead, print, root, toDeciSeconds;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  print = console.log;

  toDeciSeconds = function(time) {
    var hour, min, sec, _ref;
    time = time.split(',').join('.');
    _ref = time.split(':'), hour = _ref[0], min = _ref[1], sec = _ref[2];
    hour = parseFloat(hour);
    min = parseFloat(min);
    sec = parseFloat(sec);
    return Math.round((hour * 3600 + min * 60 + sec) * 10);
  };

  SubtitleRead = (function() {
    function SubtitleRead(subtitleText) {
      var awaitingTime, endTime, lastStartTime, line, lineContents, startTime, timeToSubtitle, timesAndSubtitles, triplet, _i, _j, _len, _len1, _ref, _ref1;
      this.subtitleText = subtitleText;
      lastStartTime = 0;
      timeToSubtitle = {};
      timesAndSubtitles = [];
      awaitingTime = true;
      startTime = 0.0;
      endTime = 0.0;
      lineContents = '';
      _ref = subtitleText.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line = line.trim();
        if (line === '') {
          if (lineContents !== '') {
            timesAndSubtitles.push([startTime, endTime, lineContents]);
          }
          awaitingTime = true;
          lineContents = '';
        } else if (awaitingTime) {
          if (line.indexOf(' --> ') !== -1) {
            awaitingTime = false;
            _ref1 = line.split(' --> '), startTime = _ref1[0], endTime = _ref1[1];
            startTime = toDeciSeconds(startTime);
            endTime = toDeciSeconds(endTime);
            awaitingTime = false;
          }
        } else {
          lineContents = (lineContents + ' ' + line).trim();
        }
      }
      if (lineContents !== '') {
        timesAndSubtitles.push([startTime, endTime, lineContents]);
      }
      for (_j = 0, _len1 = timesAndSubtitles.length; _j < _len1; _j++) {
        triplet = timesAndSubtitles[_j];
        startTime = triplet[0], endTime = triplet[1], lineContents = triplet[2];
        if (startTime > lastStartTime) {
          lastStartTime = startTime;
        }
        while (startTime < endTime + 50) {
          timeToSubtitle[startTime] = lineContents;
          ++startTime;
        }
      }
      this.timeToSubtitle = timeToSubtitle;
      this.timesAndSubtitles = timesAndSubtitles;
      this.lastStartTime = lastStartTime;
    }

    SubtitleRead.prototype.getSubtitleIndexFromTime = function(deciSec) {
      var ctime, lidx, midx, ridx;
      lidx = 0;
      ridx = this.timesAndSubtitles.length - 1;
      while (lidx < ridx + 1) {
        midx = Math.floor((lidx + ridx) / 2);
        ctime = this.timesAndSubtitles[midx][0];
        if (ctime > deciSec) {
          ridx = midx - 1;
        } else {
          lidx = midx + 1;
        }
      }
      if (ridx < 0) {
        ridx = 0;
      }
      return ridx;
    };

    SubtitleRead.prototype.getTimesAndSubtitles = function() {
      return this.timesAndSubtitles;
    };

    SubtitleRead.prototype.subtitleAtTime = function(deciSec) {
      var retv;
      retv = this.timeToSubtitle[deciSec];
      if (retv) {
        return retv;
      } else {
        return '';
      }
    };

    SubtitleRead.prototype.subtitleAtTimeAsync = function(deciSec, callback) {
      return callback(this.subtitleAtTime(deciSec));
    };

    return SubtitleRead;

  })();

  root.SubtitleRead = SubtitleRead;

  root.toDeciSeconds = toDeciSeconds;

}).call(this);
