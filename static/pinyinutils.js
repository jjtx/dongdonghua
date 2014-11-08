(function() {
  var applyToneToVowel, getToneNumber, main, print, removeToneMarks, replaceAllList, root, toneNumberToMark, toneNumberToMarkSingle,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  print = console.log;

  applyToneToVowel = function(vowel, num) {
    --num;
    if (vowel === 'a') {
      return 'āáǎàa'[num];
    }
    if (vowel === 'i') {
      return 'īíǐìi'[num];
    }
    if (vowel === 'e') {
      return 'ēéěèe'[num];
    }
    if (vowel === 'o') {
      return 'ōóǒòo'[num];
    }
    if (vowel === 'u') {
      return 'ūúǔùu'[num];
    }
    if (vowel === 'ü' || vowel === 'v') {
      return 'ǖǘǚǜü'[num];
    }
  };

  getToneNumber = function(word) {
    var c, _i, _len;
    for (_i = 0, _len = word.length; _i < _len; _i++) {
      c = word[_i];
      if (__indexOf.call('āīēōūǖ', c) >= 0) {
        return 1;
      }
      if (__indexOf.call('áíéóúǘ', c) >= 0) {
        return 2;
      }
      if (__indexOf.call('ǎǐěǒǔǚ', c) >= 0) {
        return 3;
      }
      if (__indexOf.call('àìèòùǜ', c) >= 0) {
        return 4;
      }
    }
    return 5;
  };

  removeToneMarks = function(word) {
    var c, output, _i, _len;
    output = [];
    for (_i = 0, _len = word.length; _i < _len; _i++) {
      c = word[_i];
      if (__indexOf.call('āáǎàa', c) >= 0) {
        output.push('a');
      } else if (__indexOf.call('īíǐìi', c) >= 0) {
        output.push('i');
      } else if (__indexOf.call('ēéěèe', c) >= 0) {
        output.push('e');
      } else if (__indexOf.call('ōóǒòo', c) >= 0) {
        output.push('o');
      } else if (__indexOf.call('ūúǔùu', c) >= 0) {
        output.push('u');
      } else if (__indexOf.call('ǖǘǚǜü', c) >= 0) {
        output.push('ü');
      } else {
        output.push(c);
      }
    }
    return output.join('');
  };

  replaceAllList = function(word, fromlist, tolist) {
    var f, i, t, _i, _ref;
    for (i = _i = 0, _ref = fromlist.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      f = fromlist[i];
      t = tolist[i];
      word = word.split(f).join(t);
    }
    return word;
  };

  toneNumberToMarkSingle = function(word) {
    var firstVowel, fl, numVowels, secondVowel, tl, toneNum, vow, x;
    word = word.trim();
    if (__indexOf.call(word, ':') >= 0) {
      fl = ['ū:', 'ú:', 'ǔ:', 'ù:', 'u:'];
      tl = ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'];
      word = replaceAllList(word, fl, tl);
    }
    toneNum = word.slice(-1);
    if (toneNum === '1' || toneNum === '2' || toneNum === '3' || toneNum === '4' || toneNum === '5') {
      toneNum = parseInt(toneNum);
      word = word.slice(0, -1);
    } else {
      return word;
    }
    vow = ['a', 'i', 'e', 'o', 'u', 'ü', 'v'];
    numVowels = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = word.length; _i < _len; _i++) {
        x = word[_i];
        if (__indexOf.call(vow, x) >= 0) {
          _results.push(x);
        }
      }
      return _results;
    })()).length;
    if (numVowels === 0) {
      return word;
    }
    firstVowel = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = word.length; _i < _len; _i++) {
        x = word[_i];
        if (__indexOf.call(vow, x) >= 0) {
          _results.push(x);
        }
      }
      return _results;
    })())[0];
    if (numVowels === 1 || firstVowel === 'a' || firstVowel === 'o' || firstVowel === 'e') {
      return word.replace(firstVowel, applyToneToVowel(firstVowel, toneNum));
    }
    secondVowel = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = word.length; _i < _len; _i++) {
        x = word[_i];
        if (__indexOf.call(vow, x) >= 0) {
          _results.push(x);
        }
      }
      return _results;
    })())[1];
    return word.replace(secondVowel, applyToneToVowel(secondVowel, toneNum));
  };

  toneNumberToMark = function(words) {
    var c, curWord, word, wordL, _i, _len;
    wordL = [];
    curWord = [];
    for (_i = 0, _len = words.length; _i < _len; _i++) {
      c = words[_i];
      if ('12345 '.indexOf(c) !== -1) {
        if (c !== ' ') {
          curWord.push(c);
        }
        wordL.push(curWord.join(''));
        curWord = [];
      } else {
        curWord.push(c);
      }
    }
    if (curWord.length > 0) {
      wordL.push(curWord.join(''));
    }
    wordL = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = wordL.length; _j < _len1; _j++) {
        word = wordL[_j];
        _results.push(toneNumberToMarkSingle(word));
      }
      return _results;
    })();
    return wordL.join(' ');
  };

  root.toneNumberToMark = toneNumberToMark;

  root.getToneNumber = getToneNumber;

  root.removeToneMarks = removeToneMarks;

  root.replaceAllList = replaceAllList;

  main = function() {
    return print(toneNumberToMark('nv3hai2zi3'));
  };

  if ((typeof require !== "undefined" && require !== null) && require.main === module) {
    main();
  }

}).call(this);
