// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PlayView ()
{
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
	// TODO: Restarting the script dies with that call:
	noteInput.setKeyTranslationTable (noteMap);
};

PlayView.prototype.onActivate = function ()
{
	output.sendCC (PUSH_BUTTON_NOTE, BUTTON_ON);
	output.sendCC (PUSH_BUTTON_SESSION, BUTTON_OFF);
	this.updateNoteMapping ();
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (false);
	for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
		output.sendCC (i, BLACK);
	updateMode ();
};

PlayView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_STOP:
		case PUSH_BUTTON_UP:
		case PUSH_BUTTON_DOWN:
		case PUSH_BUTTON_SELECT:
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_ACCENT:
		case PUSH_BUTTON_USER_MODE:
		case PUSH_BUTTON_DUPLICATE:
		case PUSH_BUTTON_FIXED_LENGTH:
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
		output.sendNote (i, isKeyboardEnabled ? this.getScaleColor (i) : BLACK);
};

PlayView.prototype.getScaleColor = function (note)
{
	return currentScale == SCALE_CHROMATIC ? 
		SCALE_CHROMATIC_COLORS[note - 36] :
		SCALES[currentScale].matrix[note - 36] % 12 == 0 ? BLUE_LGHT : WHITE_HI;
};

PlayView.prototype.onGrid = function (note, velocity)
{
	var t = getSelectedTrack ();
	if (t == null || !t.canHoldNotes)
		return;

	// Light the pad
	output.sendNote (note, velocity == 0 ? this.getScaleColor (note) : GREEN_HI);
	if (currentScale != SCALE_CHROMATIC)
	{
		var index = note - 36;
		if (index % 8 > 2 && index + 5 < 64)
		{
			var upNote = note + 5;
			output.sendNote (upNote, velocity == 0 ? this.getScaleColor (upNote) : GREEN_HI);
		}
		if (index % 8 < 5 && index - 5 > 0)
		{
			var downNote = note - 5;
			output.sendNote (downNote, velocity == 0 ? this.getScaleColor (downNote) : GREEN_HI);
		}
	}
};

PlayView.prototype.onLeft = function ()
{
	if (currentMode == MODE_DEVICE)
		device.selectPrevious ();
	else
	{
		var sel = getSelectedTrack ();
		trackBank.getTrack (sel == null ? 0 : Math.max (0, sel.index - 1)).select ();
	}
};

PlayView.prototype.onRight = function ()
{
	if (currentMode == MODE_DEVICE)
		device.selectNext ();
	else
	{
		var sel = getSelectedTrack ();
		var t = trackBank.getTrack (sel == null ? 0 : Math.min (8, sel.index + 1));
		if (t != null)
			t.select ();
	}
};
