// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PlayView ()
{
	this.repeatPressed = false;
	this.taskRunning = false;
	this.pressedKeys = initArray (0, 128);
	this.repeatLengths = [ 1, 2/3, 1/2, 1/3, 1/4, 1/6, 1/8, 1/12 ];
	this.selectedRepeatLength = 4;
	this.oldClock = -1;
	this.oldDiff = 1;

	// Experimental Repeat code - does not work with current API
	/*transport.getPosition ().addRawValueObserver (doObject (this, function (value)
	{
		if (this.repeatPressed)
			this.doRepeat (value);
	}));*/
}
PlayView.prototype = new BaseView ();

PlayView.prototype.updateNoteMapping = function ()
{
	var noteMap = initArray (-1, 128);
	
	var t = getSelectedTrack ();
	if (t != null && t.canHoldNotes)
	{
		var matrix = SCALES[currentScale].matrix;
		for (var note = 36; note < 100; note++)
		{
			var n = (matrix[note - 36] + SCALE_OFFSETS[currentScaleOffset] + 36 + currentOctave * 12);
			noteMap[note] = n < 0 || n > 127 ? -1 : n;
		}
	}
	// Workaround by teotigraphix for
	// https://github.com/git-moss/Push4Bitwig/issues/7
	host.scheduleTask (function () { noteInput.setKeyTranslationTable (noteMap); }, null, 100);
};

PlayView.prototype.onActivate = function ()
{
	BaseView.prototype.onActivate.call (this);

	push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
	push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (false);
	this.updateSceneButtons ();
};

PlayView.prototype.updateSceneButtons = function (buttonID)
{
	for (var i = 0; i < 8; i++)
		// push.setButton (PUSH_BUTTON_SCENE1 + i, i == this.selectedRepeatLength ? PUSH_COLOR_SCENE_GREEN : PUSH_COLOR_SCENE_YELLOW);
		push.setButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_BLACK);
};

PlayView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_NEW:
		case PUSH_BUTTON_SELECT:
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_ACCENT:
		case PUSH_BUTTON_USER_MODE:
		case PUSH_BUTTON_DUPLICATE:
		case PUSH_BUTTON_CLIP:
			return false;
	}
	return true;
};

PlayView.prototype.drawGrid = function ()
{
	var t = getSelectedTrack ();
	var isKeyboardEnabled = t != null && t.canHoldNotes;
	for (var i = 36; i < 100; i++)
		push.pads.light (i, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ? PUSH_COLOR_GREEN_HI : this.getScaleColor (i)) : PUSH_COLOR_BLACK);
};

PlayView.prototype.getScaleColor = function (note)
{
	return currentScale == SCALE_CHROMATIC ? 
		SCALE_CHROMATIC_COLORS[note - 36] :
		SCALES[currentScale].matrix[note - 36] % 12 == 0 ? PUSH_COLOR_BLUE_LGHT : PUSH_COLOR_WHITE_HI;
};

PlayView.prototype.onRepeat = function (isDown)
{
	this.repeatPressed = isDown;
	// this.push.setButton (PUSH_BUTTON_REPEAT, this.repeatPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

PlayView.prototype.onGrid = function (note, velocity)
{
	var t = getSelectedTrack ();
	if (t == null || !t.canHoldNotes)
		return;

	// Remember pressed pads
	this.pressedKeys[note] = velocity;
	
	if (currentScale == SCALE_CHROMATIC)
		return;
	var index = note - 36;
	if (index % 8 > 2 && index + 5 < 64)
		this.pressedKeys[Math.min (note + 5, 127)] = velocity;
	if (index % 8 < 5 && index - 5 > 0)
		this.pressedKeys[Math.max (note - 5, 0)] = velocity;
};

PlayView.prototype.onScene = function (scene)
{
	this.selectedRepeatLength = 7 - scene;
	this.updateSceneButtons ();
};

PlayView.prototype.onUp = function ()
{
	if (this.push.isShiftPressed ())
		application.arrowKeyLeft ();
	else
		application.arrowKeyUp ();
};

PlayView.prototype.onDown = function ()
{
	if (this.push.isShiftPressed ())
		application.arrowKeyRight ();
	else
		application.arrowKeyDown ();
};

PlayView.prototype.onLeft = function ()
{
	if (currentMode == MODE_DEVICE)
		device.selectPrevious ();
	else
	{
		var sel = getSelectedTrack ();
		var index = sel == null ? 0 : sel.index - 1;
		if (index == -1)
		{
			if (!canScrollTrackUp)
				return;
			trackBank.scrollTracksPageUp ();
			host.scheduleTask (selectTrack, [7], 100);
			return;
		}
		selectTrack (index);
	}
};

PlayView.prototype.onRight = function ()
{
	if (currentMode == MODE_DEVICE)
		device.selectNext ();
	else
	{
		var sel = getSelectedTrack ();
		var index = sel == null ? 0 : sel.index + 1;
		if (index == 8)
		{
			if (!canScrollTrackDown)
				return;
			trackBank.scrollTracksPageDown ();
			host.scheduleTask (selectTrack, [0], 100);
		}
		selectTrack (index);
	}
};

PlayView.prototype.doRepeat = function (clock)
{
	if (this.oldClock == -1)
	{
		this.oldClock = clock;
		return;
	}

	var diff = Math.abs (clock - this.oldClock - this.repeatLengths[this.selectedRepeatLength]);
	if (diff > 0.01 && this.oldDiff > diff)
	{
		this.oldDiff = diff;
		return;
	}
		
	this.oldClock = clock;
	this.oldDiff = this.repeatLengths[this.selectedRepeatLength];
	
	var sel = getSelectedTrack ();
	if (sel == null)
		return;
	var t = trackBank.getTrack (sel.index);

	for (var i = 36; i < 100; i++)
	{
		if (this.pressedKeys[i] <= 0)
			continue;
		var matrix = SCALES[currentScale].matrix;
		var n = matrix[i - 36] + SCALE_OFFSETS[currentScaleOffset] + 36 + currentOctave * 12;
		t.stopNote (n, 0);
		t.startNote (n, this.pressedKeys[i]);
	}
}