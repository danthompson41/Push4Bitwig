// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function View ()
{
	this.push = null;
}

View.prototype.attachTo = function (aPush)
{
	this.push = aPush;
};

View.prototype.usesButton = function (buttonID)
{
	return true;
};

View.prototype.onActivate = function () {};

View.prototype.drawGrid = function (x, y) {};
View.prototype.onGrid = function (note, velocity) {};

View.prototype.onPlay = function () {};
View.prototype.onRecord = function () {};
View.prototype.onNew = function () {};
View.prototype.onDuplicate = function () {};
View.prototype.onAutomation = function () {};
View.prototype.onFixedLength = function () {};

View.prototype.onQuantize = function () {};
View.prototype.onDouble = function () {};
View.prototype.onDelete = function () {};
View.prototype.onUndo = function () {};

View.prototype.onSmallKnob1 = function (increase) {};
View.prototype.onSmallKnob2 = function (increase) {};

View.prototype.onClick = function () {};
View.prototype.onTapTempo = function () {};

View.prototype.onValueKnob = function (index, value) {};
View.prototype.onValueKnob9 = function (value) {};
View.prototype.onFirstRow = function (index) {};
View.prototype.onSecondRow = function (index) {};

View.prototype.onMaster = function () {};
View.prototype.onStop = function () {};
View.prototype.onScene = function (index) {};

View.prototype.onVolume = function () {};
View.prototype.onPanAndSend = function () {};
View.prototype.onTrack = function () {};
View.prototype.onClip = function () {};
View.prototype.onDevice = function () {};
View.prototype.onBrowse = function () {};

View.prototype.onDeviceLeft = function () {};
View.prototype.onDeviceRight = function () {};
View.prototype.onMute = function () {};
View.prototype.onSolo = function () {};
View.prototype.onScales = function (isDown) {};
View.prototype.onUser = function () {};
View.prototype.onRepeat = function (isDown) {};
View.prototype.onAccent = function (isDown) {};
View.prototype.onOctaveDown = function () {};
View.prototype.onOctaveUp = function () {};

View.prototype.onAddFX = function () {};
View.prototype.onAddTrack = function () {};
View.prototype.onNote = function () {};
View.prototype.onSession = function () {};
View.prototype.onSelect = function () {};
View.prototype.onShift = function (isShiftPressed) {};

View.prototype.onUp = function () {};
View.prototype.onDown = function () {};
View.prototype.onLeft = function () {};
View.prototype.onRight = function () {};
