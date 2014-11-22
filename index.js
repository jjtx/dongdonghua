sub = {}

audioQueue = []

subLanguage = 'zh'
targetLanguage = 'vi'

function prevButtonPressed() {
  var pdn = getCurrentDialogNum()
  gotoDialog(pdn - 1)
}

function nextButtonPressed() {
  var pdn = getCurrentDialogNum()
  gotoDialog(pdn + 1)
}

function prevButtonPressedPauseAfterDialog() {
  var pdn = getCurrentDialogNum()
  gotoDialogPauseAfterDialog(pdn - 1)
}

function nextButtonPressedPauseAfterDialog() {
  var pdn = getCurrentDialogNum()
  gotoDialogPauseAfterDialog(pdn + 1)
}

var currentWordHighlighted = -1

function leftKeyPressed() {
  var pdn = getCurrentDialogNum()
  var tblWordCount = document.getElementById("tbl" + pdn).rows[0].cells.length -1
  if (checkIfCurrentWordStillHighlighted(pdn) == false) {
    onWordHover('wid_q_' + pdn +'_i_' + tblWordCount)
    currentWordHighlighted = tblWordCount
    return
  }
  if (currentWordHighlighted == 0) {
  	onWordLeave('wid_q_' + pdn +'_i_0')
  	currentWordHighlighted = -1
  } else {
    onWordLeave('wid_q_' + pdn +'_i_' + currentWordHighlighted);
    onWordHover('wid_q_' + pdn +'_i_' + (--currentWordHighlighted))
  }
}

function rightKeyPressed() {
  var pdn = getCurrentDialogNum()
  var tblWordCount = document.getElementById("tbl" + pdn).rows[0].cells.length -1
  if (checkIfCurrentWordStillHighlighted(pdn) == false) {
    currentWordHighlighted = 0
    onWordHover('wid_q_' + pdn +'_i_0')
    return
  } 
  if (currentWordHighlighted == tblWordCount) {
  	onWordLeave('wid_q_' + pdn +'_i_' + tblWordCount)
  	currentWordHighlighted = -1
  } else {
    onWordLeave('wid_q_' + pdn +'_i_' + currentWordHighlighted);
    onWordHover('wid_q_' + pdn +'_i_' + (++currentWordHighlighted))
  }
}

function checkIfCurrentWordStillHighlighted(dialogNumber) {
  if (typeof dialogNumber === "undefined" || dialogNumber === null)
    dialogNumber = getCurrentDialogNum()
  if ($($('.wid_q_' + dialogNumber +'_i_' + currentWordHighlighted)).hasClass('currentlyHighlighted')) {	// verify the word is still highlighted
    return true
  } else {
    return false
  }
}

function clearHoverTrans() {
  //$('.currentlyHighlighted').css('background-color', '')
  $('.currentlyHighlighted').css('background-color', '')
  $('.currentlyHighlighted').removeClass('currentlyHighlighted')
  $('#translation').hide()
}

function placeTranslationText(wordid) {
  var chineseChar = $('.'+ wordid + ':not(.pinyinspan)')
  var pos = chineseChar.offset()
  var width = chineseChar.width()
  var height = chineseChar.height()
  $('#translation').show()
  $('#translation').css('position', 'absolute')
  $('#translation').css({'left': (pos.left), 'top': (pos.top + 10 - videoFrameHeight + $('#bottomFrame').scrollTop() + height), })
}

function onWordLeave(wordid) {
  if ($($('#WS' + wordid)).hasClass('vocab')) {
    $($('.'+ wordid)).css('background-color', '');
    $($('.'+ wordid)).css('border-style', 'dotted');
    $($('.'+ wordid)).css('border-width', '1px');
  } else {
    $($('.'+ wordid)).css('background-color', '');
  }
  $($('.'+ wordid)).removeClass('currentlyHighlighted');

  // now.serverlog('left: wordid=' + wordid + ' word=' + $('#WS' + wordid).text())
  if (autoShowTranslation) {
    if ($('.currentlyHighlighted').length == 0)
      showFullTranslation()
  } else {
    if ($('#translation').attr('translationFor') == wordid)
      $('#translation').hide()
  }
}

function onWordHover(wordid) {
  clearHoverTrans()
  placeTranslationText(wordid)

  $($('.'+ wordid)).css('background-color', 'yellow')
  $($('.'+ wordid)).addClass('currentlyHighlighted')

  $('#translation').attr('translationFor', wordid)

  var hovertext = $('#WS'+ wordid).attr('hovertext')

  if (subLanguage == 'en') {
    $('#translation').text(hovertext)
  } else {
    definitions = hovertext.split('/')
    firstDef = definitions[0]
    nextDefs = ' <span id="transAltDefs" style="color: grey">' + definitions.slice(1).join('; ') + '</span>'
    $('#translation').html(firstDef + nextDefs)
    $('#translation').attr('isFullTranslation', 'false')
  }
  // now.serverlog('entered: wordid=' + wordid + ' word=' + $('#WS' + wordid).text())
}

var subtitleGetter
var initializeNativeSubtitleText = function(subtitleText, doneCallback) {
  var nativeSubtitleGetterReal;
  subtitleGetter = new SubtitleRead(subtitleText);
  nativeSubtitleGetterReal = new SubtitleRead(subtitleText);
  var subtitleAtTimeAsync = function(deciSec, callback) {
    var end, idx, isOverHalfOfNativeOrTargetCovered, nend, nstart, nsubtext, start, subtext, translations, _ref, _ref1, _ref2;
    idx = subtitleGetter.getSubtitleIndexFromTime(deciSec);
    _ref = subtitleGetter.timesAndSubtitles[idx], start = _ref[0], end = _ref[1], subtext = _ref[2];
    idx = nativeSubtitleGetterReal.getSubtitleIndexFromTime((start + end) / 2);
    isOverHalfOfNativeOrTargetCovered = function(start_target, end_target, start_native, end_native) {
      var covered_duration, native_duration, target_duration;
      target_duration = end - start;
      native_duration = end_native - start_native;
      covered_duration = Math.min(end_native, end_target) - Math.max(start_target, start_native);
      return covered_duration * 2 > Math.min(native_duration, target_duration);
    };
    while (idx >= 0) {
      _ref1 = nativeSubtitleGetterReal.timesAndSubtitles[idx], nstart = _ref1[0], nend = _ref1[1], nsubtext = _ref1[2];
      if (!isOverHalfOfNativeOrTargetCovered(start, end, nstart, nend)) {
        break;
      }
      idx -= 1;
    }
    if (idx !== 0) {
      idx += 1;
    }
    translations = [];
    while (idx < nativeSubtitleGetterReal.timesAndSubtitles.length) {
      _ref2 = nativeSubtitleGetterReal.timesAndSubtitles[idx], nstart = _ref2[0], nend = _ref2[1], nsubtext = _ref2[2];
      if (translations.length > 0 && !isOverHalfOfNativeOrTargetCovered(start, end, nstart, nend)) {
        break;
      }
      translations.push(nsubtext);
      idx += 1;
    }
    return callback(translations.join(' '));
  }
  if (doneCallback != null) {
    return doneCallback();
  }
};

function nextAudioItem() {
  console.log(audioQueue)
  if (audioQueue.length > 0) {
    $('audio')[0].src = audioQueue.pop()
    $('audio')[0].play()
  }
}

function setClickPronounceEN(wordid, word) {
$('.'+ wordid).click(function() {
  var vid = $('video')[0]
  vid.pause()
  //now.getPrononciation(word.toLowerCase(), function(nword, prononc, prurl) {
  //  $('.'+wordid+'.pinyinspan').html(prononc)
  //  audioQueue = [prurl]
  //  nextAudioItem()
  //})
})
}

function setClickPronounceZH(wordid, pinyin) {
$('.'+ wordid).click(function() {
  var vid = $('video')[0]
  vid.pause()
  var nqueue = []
  var pinyinWords = pinyin.split(' ')
  for (var i = 0; i < pinyinWords.length; ++i) {
    var piny = pinyinWords[i].toLowerCase()
    var tonenum = getToneNumber(piny)
    if (tonenum == 5)
      tonenum = 1
    var notonemark = removeToneMarks(piny) + tonenum
    nqueue.push('http://transgame.csail.mit.edu/pinyin/' + notonemark + '.mp3')
  }
  nqueue.reverse()
  audioQueue = nqueue
  nextAudioItem()
})
}


function setNewSubPix(subpixPath) {
if (subpixPath == '')
  subpixPath = 'blank.png'
$('#subpDisplay').attr('src', subpixPath)
}

prevDialogNum = -1

dialogStartTimesDeciSeconds = []

function wordClicked(dialogNum) {
//  var pd = getCurrentDialogNum()
  gotoDialogPauseAfterDialog(dialogNum)
//  var vid = $('video')[0]
//  if (dialogNum < pd) {
//    vid.pause()
//  } else {
//    vid.play()
//  }
}

function wordClickedFromVocab(dialogNum) {
  $('#vocabBottomFrame').hide()
  $('#settingsButtonArea').show()
  gotoDialogPauseAfterDialog(dialogNum)
}

function gotoDialog(dialogNum, dontanimate) {
  gotoDialogNoVidSeek(dialogNum, dontanimate)
  $('video')[0].currentTime = dialogStartTimesDeciSeconds[dialogNum] / 10
}

var inPauseAfterDialog = false
var pausedDialogNum

function gotoDialogPauseAfterDialog(dialogNum, dontanimate) {
  pausedDialogNum = dialogNum
  gotoDialogNoVidSeek(dialogNum, dontanimate)
  $('video')[0].currentTime = dialogStartTimesDeciSeconds[dialogNum] / 10
  if ($('video')[0].paused) {
    $('video')[0].play()
  }
  playedVideo()
  inPauseAfterDialog = true
}

gotoDialogInProgress = false

function gotoDialogNoVidSeek(dialogNum, dontanimate, automatic) {
  var pdn = getCurrentDialogNum()
  if (dialogNum == pdn) return
  if (dialogNum < 0 || dialogNum >= dialogStartTimesDeciSeconds.length) return
  gotoDialogInProgress = true
  $('html, body').stop(true, true)
  var realPrevDialogNum = pdn
  
  clearHoverTrans()
  
  location.hash = dialogNum.toString()
  
  $('.pysactive').css('font-size', '18px')
  $('.pysactive').removeClass('pysactive')
  $('.wsactive').css('font-size', '32px')
  $('.wsactive').removeClass('wsactive')
  $('.tbactive').hide()
  $('.tbactive').css('font-size', '32px')
  $('.tbactive').removeClass('tbactive')
  $('.pys' + dialogNum).css('font-size', '28px')
  $('.pys' + dialogNum).addClass('pysactive')
  $('.ws' + dialogNum).css('font-size', '48px')
  $('.ws' + dialogNum).addClass('wsactive')
  $('.tb' + dialogNum).css('font-size', '48px')
  $('.tb' + dialogNum).addClass('tbactive')
  $('.tb' + dialogNum).show()

  var oldOffset = $('#bottomFrame').scrollTop()
  var newOffset = $('#whitespaceS' + dialogNum).offset().top - $('#bottomFrame').offset().top + $('#bottomFrame').scrollTop() - $('#bottomFrame').height()/2 - $('.tb' + dialogNum).height()/2 - $('#whitespaceS' + dialogNum).height()/2 - 2; // -2 at the end gives a little more space between the video and text
  if (Math.abs(newOffset - oldOffset) > $(window).width()) {
    $('#bottomFrame').animate({scrollTop: newOffset}, 30)
    setTimeout(function() {gotoDialogInProgress = false}, 130)
  } else {
    $('#bottomFrame').animate({scrollTop: newOffset}, 100)
    setTimeout(function() {gotoDialogInProgress = false}, 200)
  }
  
  // now.serverlog('gotodialog: dialogNum=' + dialogNum + ' prevDialogNum=' + realPrevDialogNum + ' automatic=' + automatic)
  if (autoShowTranslation) {
    showFullTranslation(dialogNum)
  }
}

dialogsSetUp = {}

function translateButtonPressed(n) {
  if ($('#translation').attr('isFullTranslation') == 'true' && $('video')[0].paused) {
    $('video')[0].play();
  } else {
    $('video')[0].pause();
  }
  showFullTranslation(n)
}

function showFullTranslation(n) {
  if (typeof n === "undefined" || n === null)
    n = getCurrentDialogNum()
  sentence = $('.tb' + n).attr('currentSentence') 
  firstWordId = $('.tb' + n).attr('firstWordId')
  console.log(sentence)
  clearHoverTrans()
  var currentTimeDeciSecs = $('.tb' + n).attr('startTimeDeciSeconds')
  getNativeSubAtTime(currentTimeDeciSecs, function(translation) {
    if ($('.currentlyHighlighted').length != 0) return
    console.log(translation)
    $('#translation').text(translation)
    $('#translation').attr('isFullTranslation', 'true')
    placeTranslationText(firstWordId)
    var offset = $('#translation').offset()
    offset.left = $(window).width()/2 - $('#translation').width()/2
    $('#translation').offset(offset)
    $('#translation').show()
  // now.serverlog('translation: firstWordId=' + firstWordId + ' translation=' + translation)
  })
}

var getNativeSubAtTime = function(time, callback) {
  var endTime, idx, midTime, startTime, subLine, _ref;
  idx = subtitleGetter.getSubtitleIndexFromTime(time);
  _ref = window.asubTimesAndSubtitles[idx], startTime = _ref[0], endTime = _ref[1], subLine = _ref[2];
  midTime = Math.floor((startTime + endTime) / 2);
  // return nativeSubtitleGetter.subtitleAtTimeAsync(midTime, callback);
  return subtitleGetter.subtitleAtTimeAsync(midTime, callback);
};

function setNewSubtitles(annotatedWordList) {
  setNewSubtitleList([[0, 1, annotatedWordList]])
}

annotatedWordListListG = []

function setNewSubtitleList(annotatedWordListListOrig) {
  var annotatedWordListList = []
  for (var q = 0; q < annotatedWordListListOrig.length; ++q) {
    if (annotatedWordListListOrig[q][2].length > 0) {
      annotatedWordListList.push(annotatedWordListListOrig[q]);
    }
  }
  setNewSubtitleListReal(annotatedWordListList);
}

// note: downloadASUBfile is not used with the local player!!!
function downloadASUBfile(annotatedWordListListOrigDL) {
  var asubDLstring ="";
  var subtitleInputTemp = $('#subtitleInput').val().trim();
  subtitleInputTemp = subtitleInputTemp.replace(/\n\n\n\n/g, "\n\n"); // in case there are extra newlines, trim them to two
  subtitleInputTemp = subtitleInputTemp.replace(/\n\n\n/g, "\n\n");
  var originalSubtitleInputForTimes = subtitleInputTemp.split("\n\n");
  while (originalSubtitleInputForTimes.indexOf("") > -1) {  // remove all null elements (this happens if there are more than two "\n" between subtitles)
    originalSubtitleInputForTimes.splice(originalSubtitleInputForTimes.indexOf(""),1);
  }
  for (var q = 0; q < annotatedWordListListOrigDL.length; ++q) {
    var newlinePositionAfterTimes = (originalSubtitleInputForTimes[q].lastIndexOf(" --> ")+16);
    asubDLstring += (originalSubtitleInputForTimes[q].slice(0,newlinePositionAfterTimes+1) + "\n");
    for (var r = 0; r < annotatedWordListListOrigDL[q][2].length; ++r) {
      asubDLstring += annotatedWordListListOrigDL[q][2][r].join(" | ");
      asubDLstring += "\n";
    }
    asubDLstring += "\n";
  }
  var uploadedSrtFilename = document.getElementById("srtInputFile").value;
  var filenameToSave = uploadedSrtFilename.slice(uploadedSrtFilename.lastIndexOf("\\") + 1, uploadedSrtFilename.lastIndexOf(".") - 1);
  var blob = new Blob([asubDLstring], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filenameToSave + ".asub");  
}

function setNewSubtitleListReal(annotatedWordListList) {
  annotatedWordListListG = annotatedWordListList
  $('#translationTriangle').hide()
  $('#translation').text('')
  $('#translation').attr('isFullTranslation', 'false')
  var nhtml = []
  dialogStartTimesDeciSeconds = []
  var wordToId = {}
  for (var q = 0; q < annotatedWordListList.length; ++q) {
    var startTimeDeciSeconds = annotatedWordListList[q][0]
    var endTimeDeciSeconds = annotatedWordListList[q][1]
    dialogStartTimesDeciSeconds[q] = startTimeDeciSeconds
    var startHMS = toHourMinSec(Math.round(startTimeDeciSeconds/10))
    var annotatedWordList = annotatedWordListList[q][2]
    //nhtml.push('<table border="0" cellspacing="0">')
    nhtml.push('<table id = tbl' + q + ' border="0" cellspacing="0">')
    var pinyinRow = []
    var wordRow = []
    var whitespaceRow = []
    var allWords = []
    for (var i = 0; i < annotatedWordList.length; ++i) {
      allWords.push(annotatedWordList[i][0])
    }
    var currentSentence = escapeHtmlQuotes(allWords.join(''))
    var firstWordId = ''
    for (var i = 0; i < annotatedWordList.length; ++i) {
      var word = annotatedWordList[i][0]
      var pinyin = annotatedWordList[i][1]
      var english = annotatedWordList[i][2]
      var wordMatchesVocabListAllMatches = []  // additional possible future use - go to vocab from the subtitle
      var wordMatchesVLPosition = -1
      vocabArrayWordsOnly4FastSearch.indexOf(word);
      if (word != ' ') wordMatchesVLPosition = vocabArrayWordsOnly4FastSearch.indexOf(word);
      while (wordMatchesVLPosition != -1) {
        vocabArray[wordMatchesVLPosition].push([q,i]) // q = tbl# (subtitle), i = word # (in that subtitle)
        wordMatchesVocabListAllMatches.push(wordMatchesVLPosition)
        wordMatchesVLPosition = vocabArrayWordsOnly4FastSearch.indexOf(word,wordMatchesVLPosition+1);
      }
      if (english == null) english = ''
      else english = escapeHtmlQuotes(english)
      if (wordToId[word] == null) wordToId[word] = Math.round(Math.random() * 1000000)
      var randid = 'wid_q_' + q + '_i_' + i
      if (i == 0) firstWordId = randid;
      coloredSpans = []
      var pinyinspan = '<td style="font-size: xx-small"></td>'
      if (pinyin) {
        pinyinWords = pinyin.split(' ')
        for (var j = 0; j < pinyinWords.length; ++j) {
          var curWord = pinyinWords[j]
          var tonecolor = ['red', '#AE5100', 'green', 'blue', 'black'][getToneNumber(curWord)-1]
          coloredSpans.push('<span style="color: ' + tonecolor + '">' + curWord + '</span>')
        }
        if (wordMatchesVocabListAllMatches.length == 0) {
          pinyinspan = '<td nowrap="nowrap" style="text-align: center;" class="' + randid + ' hoverable pinyinspan pys' + q + ' PS' + randid + '" onmouseover="onWordHover(\'' + randid + '\')" onmouseout="onWordLeave(\'' + randid + '\')" onclick="wordClicked(' + q + ')">' + coloredSpans.join(' ') + '</td>'
        } else {
          pinyinspan = '<td nowrap="nowrap" style="text-align: center; border-style: dotted; border-width: 1px" class="' + randid + ' hoverable pinyinspan pys' + q + ' PS' + randid + '" onmouseover="onWordHover(\'' + randid + '\')" onmouseout="onWordLeave(\'' + randid + '\')" onclick="wordClicked(' + q + ')">' + coloredSpans.join(' ') + '</td>'
        }
      }
      if (wordMatchesVocabListAllMatches.length == 0) {
        var wordspan = '<td nowrap="nowrap" dialognum=' + q + ' style="text-align: center;" hovertext="' + english + '" id="WS' + randid + '" class="' + randid + ' hoverable wordspan ws' + q + '" onmouseover="onWordHover(\'' + randid + '\')" onmouseout="onWordLeave(\'' + randid + '\')" onclick="wordClicked(' + q + ')">' + word + '</td>';
      } else {
        var wordspan = '<td nowrap="nowrap" dialognum=' + q + ' style="text-align: center; border-style: dotted; border-width: 1px" hovertext="' + english + '" id="WS' + randid + '" class="' + randid + ' hoverable wordspan ws' + q + ' vocab WS' + randid + '" onmouseover="onWordHover(\'' + randid + '\')" onmouseout="onWordLeave(\'' + randid + '\')" onclick="wordClicked(' + q + ')">' + word + '</td>';
        for (var k = 0; k < wordMatchesVocabListAllMatches.length; ++k) {
          $('<span onclick="wordClickedFromVocab(' + q + ')">' + q + ' </span>').appendTo('.vcbi' + wordMatchesVocabListAllMatches[k]);
        }
      }
      if (word == ' ') {
        wordspan = '<td style="font-size: xx-small">　</td>'
      }
      pinyinRow.push(pinyinspan)
      wordRow.push(wordspan)
      whitespaceRow.push('<td id="whitespaceS' + q + '" style="font-size: 32px">　</td>')
    }
    // wordRow.push('<td id="translate"' + q + '" style="font-size: 32px">　</td>') // remove translate button here (also remove the "translate" from this at the end of the next line: "(' + q + ')">translate</button>")
    wordRow.push('<td><button id="translate"' + q + '" style="font-size: 32px; display: none; white-space: nowrap" dialogNum="' + q + '" class="translateButton tb' + q + '" startTimeDeciSeconds="' + startTimeDeciSeconds + '" endTimeDeciSeconds="' + endTimeDeciSeconds + '" currentSentence="' + currentSentence + '" firstWordId="' + firstWordId + '" onclick="translateButtonPressed(' + q + ')"></button></td>') // remove translate button here - may cause issues
    nhtml.push('<col>' + pinyinRow.join('') + '</col>')
    nhtml.push('<col>' + wordRow.join('') + '</col>')
    nhtml.push('<col>' + whitespaceRow.join('') + '</col>')
    nhtml.push('</table>')
  }
  $('#caption').html(nhtml.join(''))
}

window.onresize = function(event) {
  videoLoaded();
};

var videoFrameHeight

function videoLoaded() {            // This function automatically resizes the video when the window is resized
  var minimumBottomFrameHeight = 340; // 140 for 1 subtitle line, 340 for 3 subtitle lines, 540 for 5 subtitle lines
  var nowVideoWidth;
  var vfhWithoutNarrowing = Math.max(0,Math.round(window.innerHeight - minimumBottomFrameHeight));
  var videoWidthInFrameWithoutNarrowing = (vfhWithoutNarrowing / document.getElementById("videoControls").videoHeight) * document.getElementById("videoControls").videoWidth;
  if ($('#fixedVideoFrame').width() < videoWidthInFrameWithoutNarrowing) {
    vfhAdjusted = Math.round(vfhWithoutNarrowing * ($('#fixedVideoFrame').width()/videoWidthInFrameWithoutNarrowing));
    videoFrameHeight = vfhAdjusted;
  } else {
    videoFrameHeight = vfhWithoutNarrowing;
  }
  document.getElementById("videoControls").style.height=videoFrameHeight + "px";
  $('#fixedVideoFrame').height(videoFrameHeight + "px");
  document.getElementById("bottomFrame").style.top=(videoFrameHeight) + "px";
  document.getElementById("settingsButtonArea").style.top=(videoFrameHeight) + "px";
  document.getElementById("vocabBottomFrame").style.top=(videoFrameHeight) + "px";
  nowVideoWidth = $('video')[0].clientWidth;
  $('video').css('margin-left', Math.round(Math.max(0,(fixedVideoFrame.clientWidth-nowVideoWidth)/2)));
}

function dialogEndTimeSec(dialogNum) {
  if (typeof dialogNum === "undefined" || dialogNum === null)
    dialogNum = getCurrentDialogNum()
  return parseFloat($('.tb'+dialogNum).attr('endTimeDeciSeconds')) / 10.0
}

function dialogStartTimeSec(dialogNum) {
  if (typeof dialogNum === "undefined" || dialogNum === null)
    dialogNum = getCurrentDialogNum()
  return parseFloat($('.tb'+dialogNum).attr('startTimeDeciSeconds')) / 10.0
}

function onTimeChanged(s) {
  if (gotoDialogInProgress) return
  if (inPauseAfterDialog) {
  	if ((s.currentTime > dialogStartTimeSec(pausedDialogNum + 1)) || (s.currentTime > (dialogEndTimeSec() + 1))) {   // Pause if past (end of dialog time + 1 second) or start of next dialog
      $('video')[0].pause()
      inPauseAfterDialog = false
      return
    }
  } else if (s.currentTime > dialogEndTimeSec()) {
    var sinceEndOfDialog = s.currentTime - dialogEndTimeSec()
    var toNextDialog = dialogStartTimeSec(getCurrentDialogNum() + 1) - s.currentTime
    var betweenDialogs = Math.min(sinceEndOfDialog, toNextDialog)
    var pbrate = 0.8 + betweenDialogs/10.0
    console.log('end of dialog')
    $('video')[0].playbackRate = Math.min(1.0, pbrate)
  } else {
    console.log('in dialog')
    $('video')[0].playbackRate = 0.8
  }
  var targetTimeDeciSecs = Math.round(s.currentTime*10)
  var lidx = 0
  var ridx = dialogStartTimesDeciSeconds.length-1
  while (lidx < ridx+1) {
    var midx = Math.floor((lidx + ridx)/2)
    var ctime = dialogStartTimesDeciSeconds[midx]
    if (ctime > targetTimeDeciSecs)
      ridx = midx - 1
    else
      lidx = midx + 1
  }
  if (ridx < 0) ridx = 0
  if (gotoDialogInProgress || inPauseAfterDialog || $('video')[0].paused) return
  gotoDialogNoVidSeek(ridx, false, true)
}

function relMouseCoords(event, htmlelem){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = htmlelem;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}

function flipPause() {
  var vid = $('video')[0]
  if (vid.paused) {
    vid.play()
    playedVideo()
  } else {
    vid.pause()
    pausedVideo()
  }
}

function playedVideo() {
  // now.serverlog('playing: currentIdx=' )
}

function pausedVideo() {
  // now.serverlog('paused: currentIdx=' )
}

function videoPlaying() {
}

function videoPaused() {
}

function checkKey(x) {
  var vid = $('video')[0]
  console.log(x.keyCode)
  if (x.keyCode == 32) { // space
    if(autoShowTranslation) {
      autoShowTranslation = false
      clearHoverTrans()
    } else {
      autoShowTranslation = true
      showFullTranslation()
    }
    //if (vid.paused) {
    //  vid.play()
    //  playedVideo()
    //} else {
    //  vid.pause()
    //  pausedVideo()
    //}
    x.preventDefault()
    return false
  } else if (x.keyCode == 13) { // enter
  	gotoDialogPauseAfterDialog(getCurrentDialogNum())
  } else if (x.keyCode == 37) { // left arrow
    //if (x.ctrlKey) {
      // prevButtonPressed()
    //} else {
      // vid.currentTime -= 5
    // }
    leftKeyPressed()
    x.preventDefault()
    return false
  } else if (x.keyCode == 39) { // right arrow
    //if (x.ctrlKey) {
     // nextButtonPressed()
    //} else {
     // vid.currentTime += 5
    //}
    rightKeyPressed()
    x.preventDefault()
    return false
  } else if (x.keyCode == 38 || x.keyCode == 33) { // up arrow, page up
    if (checkIfCurrentWordStillHighlighted() == true) {
      showFullTranslation()
    } else if (x.ctrlKey) {
      prevButtonPressed()
    } else {
      prevButtonPressedPauseAfterDialog()
    }
    x.preventDefault()
  } else if (x.keyCode == 40 || x.keyCode == 34) { // down arrow, page down
    if (checkIfCurrentWordStillHighlighted() == true) {
      if (autoShowTranslation = false) {
        showFullTranslation()
      }
    } else if (x.ctrlKey) {
      nextButtonPressed()
    } else {
      nextButtonPressedPauseAfterDialog()
    }
    x.preventDefault()
  }
}

$(document).keydown(checkKey)

function getCurrentDialogNum() {
  return parseInt($('.tbactive').attr('dialogNum'))
}

mouseWheelMoveInProgress = false

function mouseWheelMove(event, delta) {
  if (document.getElementById("settingsButtonArea").style.display != "none") {  
    event.preventDefault()
    if (gotoDialogInProgress) {
      return false
    }
    mouseWheelMoveInProgress = true
    var currentDialogNum = getCurrentDialogNum()
    if (delta > 0) {
      gotoDialog(currentDialogNum - 1)
    } else {
      gotoDialog(currentDialogNum + 1)
    }
    mouseWheelMoveInProgress = false
    return false
  }
}

$(document).mousewheel(mouseWheelMove)

function mouseDown(event) {
  if (event.which == 2) { // middle button
    flipPause()
    event.preventDefault()
  }
  if (event.which == 3) { // right button
    flipPause()
    event.preventDefault()
  }
}

//$(document).mousedown(mouseDown)

function videoClicked(x) {
  var vid = $('video')[0]
  if (vid.paused) {
    vid.play()
    playedVideo()
  } else {
    vid.pause()
    pausedVideo()
  }
  return false
}

callOnceElementAvailable('video', function() {
  $('video').click(videoClicked)
})

function onScroll() {
  console.log('scrolling!')
  if (gotoDialogInProgress || mouseWheelMoveInProgress) return
  $.doTimeout('scroll', 100, function() {
    if (gotoDialogInProgress || mouseWheelMoveInProgress) return
    var dialognum = $($.nearest({x: $(window).width()/2, y: $(window).height() - $('#bottomFrame').height()/2}, '.wordspan')[0]).attr('dialognum')
    console.log(dialognum)
    gotoDialog(dialognum, true)
  })
}

callOnceElementAvailable('#bottomFrame', function() {
  $('#bottomFrame').scroll(onScroll)
})

// $(document)[0].addEventListener('contextmenu', function(event) {
//   event.preventDefault()
// })

$(window).bind('hashchange',function(event){
    var anchorhash = location.hash.replace('#', '');
    if (anchorhash == '')
      return
    if (gotoDialogInProgress)
      return
    gotoDialog(parseInt(anchorhash))
});

function startPlayback() {
  if (isLocalFile()) {
    var file = $('#videoInputFile')[0].files[0]
    var type = file.type
    var videoNode = $('video')[0]
    var canPlay = videoNode.canPlayType(type)
    canPlay = (canPlay === '' ? 'no' : canPlay)
    var isError = canPlay === 'no'
    var URL = window.URL
    if (!URL)
      URL = window.webkitURL
    var fileURL = URL.createObjectURL(file)
    videoNode.src = fileURL
  } else {
    var videoSource = $('#videoInputURL').val().trim()
    $('video')[0].src = videoSource
  }
  $('#inputRegion').hide()
  $('#viewingRegion').show()
  $('#settingsButtonArea').show()
  var subtitleText = $('#subtitleInput').val().trim()
  var nativeSubtitleText = $('#nativeSubtitleInput').val().trim()
  var vocabularyText = $('#vocabularyInput').val().trim()
  var uploadedSRTorASUBFilename = document.getElementById("srtInputFile").value
  var uploadedSRTorASUBextension = uploadedSRTorASUBFilename.slice(uploadedSRTorASUBFilename.lastIndexOf(".") + 1, uploadedSRTorASUBFilename.length)
  if (vocabularyText != '') {
    var vocabularyArray = new parseVocabFile(vocabularyText);
    setNewVocabList(vocabArray);
  }
  if (uploadedSRTorASUBextension.toLowerCase() === "asub") {
  //  setNewSubtitleList(parseASUBfile(subtitleText))
    var asubLoadedArray = new parseASUBfile(subtitleText);
    setNewSubtitleList(asubLoadedArray.asubTimesAndSubtitles)
    initializeNativeSubtitleText(nativeSubtitleText)
  } else {
    //now.initializeSubtitleText(subtitleText, subLanguage, targetLanguage, function() {
    //  now.getFullAnnotatedSub(setNewSubtitleList)
    //  now.initializeNativeSubtitleText(nativeSubtitleText)
    //})
  }
  var subpixSource = getUrlParameters()['subpix']
  if (subpixSource != null) {
  //  now.initializeSubPix(subpixSource)
  }
}


function parseASUBfile(subtitleText) {  // copied (but modified) from SubtitleRead() (inside subtitleread.js used on node.js server side)
  var currentSub, subIndex, awaitingTime, endTime, lastStartTime, line, subContents, startTime, timeToSubtitle, triplet, _i, _j, _len, _len1, _ref, _ref1;
  var asubTimesAndSubtitles = [];
  this.subtitleText = subtitleText;
  lastStartTime = 0;
  timeToSubtitle = {};
  awaitingTime = true;
  startTime = 0.0;
  endTime = 0.0;
  subContents = [];
  subIndex = '0';
  currentSub = [];
  _ref = subtitleText.split('\n');
  for (_i = 0, _len = _ref.length; _i <= _len; _i++) {
    if (_i < _ref.length) {
      line = _ref[_i];
      line = line.trim();
    }
    if ((line === '') || (_i === _ref.length)) {
      if ((subContents !== '') & (awaitingTime === false)) {
        asubTimesAndSubtitles.push([startTime, endTime, subContents]);
      //  asubTimesAndSubtitles[subIndex].push(subContents.split('\n'))
      }
      if (awaitingTime === false) {subIndex++};
      awaitingTime = true;
      subContents = []
    } else if (awaitingTime) {
      if (line.indexOf(' --> ') !== -1) {
        awaitingTime = false;
        _ref1 = line.split(' --> '), startTime = _ref1[0], endTime = _ref1[1];
        startTime = toDeciSeconds(startTime);
        endTime = toDeciSeconds(endTime);
        awaitingTime = false;
      }
    } else if (_i < _ref.length) {
    //  subContents = (subContents + '\n' + line).trim();
    //  subContents.push(line.trim().split('|', 3));
      var workingLine = []
      workingLine = line.trim().split('|', 2)  // put the chinese and pinyin elements into workingLine
      workingLine.push(line.slice(workingLine[0].length + workingLine[1].length + 2))  // put the definitions (remainder of the line) into workingLine.  Cannot use split('|') for this, because the definitions can contain the pipe.
      subContents.push($.map(workingLine, $.trim)); // trim the three elements of workingLine, and add to subContents.
    }
  }
  this.asubTimesAndSubtitles = asubTimesAndSubtitles;
  window.asubTimesAndSubtitles = this.asubTimesAndSubtitles
}

var vocabArray = []
var vocabArrayWordsOnly4FastSearch = []
var vocabSectionTitleArray = [];

function parseVocabFile(vocabularyText) {
 var _i, _len, _i2, _len2;
  vocabularyText = vocabularyText.replace(/\n\n\n\n/g, "\n\n"); // in case there are extra newlines, trim them to two
  vocabularyText = vocabularyText.replace(/\n\n\n/g, "\n\n");
  var vocabSplitBySection = vocabularyText.split("\n\n");
  var currentVocabSection = []
  for(_i = 0, _len = vocabSplitBySection.length; _i < _len; _i++) {
    currentVocabSection = vocabSplitBySection[_i].split("\n")
    vocabSectionTitleArray.push(currentVocabSection[0])
    for(_i2 = 1, _len2 = currentVocabSection.length; _i2 < _len2; _i2++) {
      var currentLine = currentVocabSection[_i2].split('\t');
      var chineseWord = currentLine[0]
      var definition = currentLine[1]
      vocabArray.push([chineseWord, definition, _i])  // _i can be used later as an index to get the vocabSectionTitle
      vocabArrayWordsOnly4FastSearch.push(chineseWord);
    }
  }
}

function setNewVocabList(vocabularyArray) {
  vocabularyArrayG = vocabularyArray
  //$('#translationTriangle').hide()
  //$('#translation').text('')
  //$('#translation').attr('isFullTranslation', 'false')
  var vhtml = []
  var wordToId = {}
  var currentSectionIndex = -1
  var sectionX_WordCounter = 0
  for (var q = 0; q < vocabularyArray.length; ++q) {
    var word = vocabularyArray[q][0]
    var translation = vocabularyArray[q][1]
    var SectionIndex = vocabularyArray[q][2]
    var numberOfInstancesInVideo = 'not yet calculated'
    if (SectionIndex != currentSectionIndex) {
      currentSectionIndex = SectionIndex;
      sectionX_WordCounter = 0;
      if (currentSectionIndex > 0) {
        vhtml.push('</div>') // close div for vSectX_Words
      }
      vhtml.push('<div id = "vSect' + (currentSectionIndex) + '_Title"; style="font-size: 32px; border-style: solid;">' + vocabSectionTitleArray[currentSectionIndex] + '</div>'); // <div id = vSectX_Title>Lesson 1</div>
      vhtml.push('<div id = "vSect' + (currentSectionIndex) + '_Words">') // <div id = "vSectX_Words">
    }
    vhtml.push('<div id = "vS' + (currentSectionIndex) + 'W' + sectionX_WordCounter + '_Word" class = "vcbn' + q + '">'); // <div id="vSXWY_Word" class="vcbnQ">
    vhtml.push(word + '   ' + translation + '   ' + 'Instances: '); // 你   nǐ - you  36  <-- click to expand, showing all instances
    vhtml.push('</div>') // close div for vSXWY_Instances
    vhtml.push('<div id = "vS' + currentSectionIndex + 'W' + sectionX_WordCounter + '_Instances" class = "vcbi' + q + '">') // <div id="vSXWY_Instances" class="vcbiQ">
    // instances will be inserted here later
    vhtml.push('</div>') // close div for vSXWY_Word
    ++sectionX_WordCounter;
  }
  vhtml.push('</div>') // close div for vSectX_Words
  $('#vocabRegion').html(vhtml.join(''))
}

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
    ridx = window.asubTimesAndSubtitles.length - 1;
    while (lidx < ridx + 1) {
      midx = Math.floor((lidx + ridx) / 2);
      ctime = window.asubTimesAndSubtitles[midx][0];
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

function isLocalFile() {
  return ($('#urlOrFile').val() == 'file')
}

function loadVideo(videourl, suburl) {
  if (videourl.indexOf('{m4v|webm}') != -1) {
    if (Modernizr.video.webm && !Modernizr.video.h264) {
      videourl = videourl.replace('{m4v|webm}', 'webm')
    } else {
      videourl = videourl.replace('{m4v|webm}', 'm4v')
    }
  }
  if (videourl.indexOf('{mp4|webm}') != -1) {
    if (Modernizr.video.webm && !Modernizr.video.h264) {
      videourl = videourl.replace('{mp4|webm}', 'webm')
    } else {
      videourl = videourl.replace('{mp4|webm}', 'mp4')
    }
  }
  $('#urlOrFile').val('url')
  urlOrFileChanged()
  $('#videoInputURL').val(videourl)
  $('#subtitleInput').val('')
  textChanged()
  $('#subtitleInput').val('Loading subtitles from ' + suburl)
  //now.downloadSubtitleText(suburl, function(subText) {
  //  $('#subtitleInput').val(subText)
  //  textChanged()
  //})
}

function urlOrFileChanged() {
  if (isLocalFile()) {
    $('#videoInputURL').hide()
    $('#videoInputFile').show()
  } else {
    $('#videoInputFile').hide()
    $('#videoInputURL').show()
  }
}

function subtitleUploaded() {
var reader = new FileReader()
reader.onloadend = function( ){
  $('#subtitleInput').val(reader.result)
  textChanged()
}
var srtfile = $('#srtInputFile')[0].files[0]
reader.readAsText(srtfile)
}


function nativeSubtitleUploaded() {
var reader = new FileReader()
reader.onloadend = function( ){
  $('#nativeSubtitleInput').val(reader.result)
  textChanged()
}
var srtfile = $('#nativeSrtInputFile')[0].files[0]
reader.readAsText(srtfile)
}

function vocabularyFileUploaded() {
var reader = new FileReader()
reader.onloadend = function( ){
  $('#vocabularyInput').val(reader.result)
  textChanged()
}
var vocabfile = $('#vocabularyInputFile')[0].files[0]
reader.readAsText(vocabfile)
}

function textChanged() {
  if (isLocalFile()) {
    if ($('#videoInputFile').val() && $('#subtitleInput').val()) {
      $('#startPlaybackButton')[0].disabled = false
    } else {
      $('#startPlaybackButton')[0].disabled = true
    }
  } else {
    if ($('#videoInputURL').val() && $('#subtitleInput').val()) {
      $('#startPlaybackButton')[0].disabled = false
    } else {
      $('#startPlaybackButton')[0].disabled = true
    }
  }
}

function displaySettings() {
}

function displayVocabFrame() {
  var vid = $('video')[0];
  vid.pause()
  pausedVideo()
  //$('#viewingRegion').hide()
  //$('#bottomFrame').hide()
  
  $('#settingsButtonArea').hide()
  $('#vocabBottomFrame').show()
}

function displayQuizFrame() {
}

function returnToViewingRegion() {
  $('#vocabBottomFrame').hide()
  $('#settingsButtonArea').show()
  //$('#viewingRegion').show()
  //$('#bottomFrame').show()
}

function onVideoError(s) {
  var videoPlaybackError = s.error
  if (videoPlaybackError) {
    var videoSource = s.src
    var errorMessage = ''
    if (videoPlaybackError.code == 0) errorMessage = 'MEDIA_ERR_ABORTED - fetching process aborted by user'
    if (videoPlaybackError.code == 1) errorMessage = 'MEDIA_ERR_NETWORK - error occurred when downloading'
    if (videoPlaybackError.code == 3) errorMessage = 'MEDIA_ERR_DECODE - error occurred when decoding'
    if (videoPlaybackError.code == 4) errorMessage = 'MEDIA_ERR_SRC_NOT_SUPPORTED - audio/video format not supported by browser'
    var printableError =  JSON.stringify(videoPlaybackError, null, 4)
    $('#errorRegion').text('Error playing ' + videoSource + ': ' + errorMessage + ' ' + printableError)
  }
}

function getUrlParameters() {
var map = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
map[key] = value;
});
return map; 
}

//now.clientlog = function(text) {
//  console.log(text)
//}

