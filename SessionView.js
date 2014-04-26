// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function SessionView ()
{
	this.canScrollLeft = true;
	this.canScrollRight = true;
	this.canScrollUp = true;
	this.canScrollDown = true;
}
SessionView.prototype = new BaseView ();

SessionView.prototype.updateNoteMapping = function ()
{
	noteInput.setKeyTranslationTable (initArray (-1, 128));
}

SessionView.prototype.updateArrows = function ()
{
	output.sendCC (PUSH_BUTTON_LEFT, this.canScrollLeft ? BUTTON_ON : BLACK);
	output.sendCC (PUSH_BUTTON_RIGHT, this.canScrollRight ? BUTTON_ON : BLACK);
	output.sendCC (PUSH_BUTTON_UP, this.canScrollUp ? BUTTON_ON : BLACK);
	output.sendCC (PUSH_BUTTON_DOWN, this.canScrollDown ? BUTTON_ON : BLACK);
};

SessionView.prototype.onActivate = function ()
{
	output.sendCC (PUSH_BUTTON_NOTE, BUTTON_OFF);
	output.sendCC (PUSH_BUTTON_SESSION, BUTTON_ON);
	this.updateNoteMapping ();
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (true);
	this.updateArrows ();
	for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
		output.sendCC (i, 19);
	updateMode ();
};

SessionView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_SELECT:
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_ACCENT:
		case PUSH_BUTTON_USER_MODE:
		case PUSH_BUTTON_DUPLICATE:
		case PUSH_BUTTON_FIXED_LENGTH:
			return false;
	}
	return true;
};

SessionView.prototype.onGrid = function (note, velocity)
{
	if (velocity == 0)
		return;

	var index = note - 36;
	var t = index % 8;
	var s = 7 - Math.floor (index / 8);
	
	var slot = tracks[t].slots[s];
	var slots = trackBank.getTrack (t).getClipLauncherSlots ();
	if (tracks[t].recarm)
	{
		if (slot.isRecording)
			slots.launch (s);
		else
			slots.record (s);
	}
	else
	{
		slots.launch (s);
	}
 	slots.select (s);
};

SessionView.prototype.onClip = function ()
{
	var t = getSelectedTrack ();
	if (t == null)
		return;
	var slot = getSelectedSlot (t);
	if (slot != -1)
		trackBank.getTrack (t.index).getClipLauncherSlots ().showInEditor (slot);
};

SessionView.prototype.onLeft = function ()
{
	if (this.push.isShiftPressed ())
		trackBank.scrollTracksPageUp ();
	else
		trackBank.scrollTracksUp ();
};

SessionView.prototype.onRight = function ()
{
	if (this.push.isShiftPressed ())
		trackBank.scrollTracksPageDown ();
	else
		trackBank.scrollTracksDown ();
};

SessionView.prototype.onUp = function ()
{
	if (this.push.isShiftPressed ())
		trackBank.scrollScenesPageUp ();
	else
		trackBank.scrollScenesUp ();
};

SessionView.prototype.onDown = function ()
{
	if (this.push.isShiftPressed ())
		trackBank.scrollScenesPageDown ();
	else
		trackBank.scrollScenesDown ();
};

SessionView.prototype.onScene = function (scene)
{
	trackBank.launchScene (scene);
};

SessionView.prototype.onStop = function ()
{
	trackBank.getClipLauncherScenes ().stop ();
};

SessionView.prototype.drawGrid = function (x, y)
{
	var port = host.getMidiOutPort (0);
	if (x && y)
		this.drawPad (port, tracks[x].slots[y], x, y, tracks[x].recarm);
	else
	{
		for (var i = 0; i < 8; i++)
		{
			var t = tracks[i];
			for (var j = 0; j < 8; j++)
				this.drawPad (port, t.slots[j], i, j, t.recarm);
		}
	}
};

SessionView.prototype.drawPad = function (port, slot, x, y, isArmed)
{
	var color = slot.hasContent ? (slot.color ? slot.color : ORANGE_HI) : (isArmed ? RED_LO : BLACK);
	var n = 92 + x - 8 * y;
	port.sendMidi (0x90, n, color);
	if (slot.isQueued)
		port.sendMidi (0x90 + 14, n, slot.isRecording ? RED_HI : GREEN_HI);
	else if (slot.isPlaying)
		port.sendMidi (0x90 + 10, n, GREEN_HI);
	else if (slot.isRecording)
		port.sendMidi (0x90, n, RED_HI);
}