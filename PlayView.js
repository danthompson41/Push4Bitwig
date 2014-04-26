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
		for (var note = 36; note < 100; note++)
		{
			var n = (SCALE_NOTES[currentScale][note - 36] + SCALE_OFFSETS[currentScaleOffset] + 36 + currentOctave * 12);
			noteMap[note] = n < 0 || n > 127 ? -1 : n;
		}
	}
	noteInput.setKeyTranslationTable (noteMap);
}

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
		output.sendNote (i, isKeyboardEnabled ? SCALE_COLORS[currentScale][i - 36] : BLACK);
};

PlayView.prototype.onGrid = function (note, velocity)
{
	var t = getSelectedTrack ();
	if (t == null || !t.canHoldNotes)
		return;

	// Light the pad
	var index = note - 36;
	output.sendNote (note, velocity == 0 ? SCALE_COLORS[currentScale][index] : GREEN_HI);
	if (currentScale == SCALE_MINOR || currentScale == SCALE_MAJOR)
	{
		if (index % 8 > 2 && index + 5 < 64)
			output.sendNote (note + 5, velocity == 0 ? SCALE_COLORS[currentScale][index + 5] : GREEN_HI);
		if (index % 8 < 5 && index - 5 > 0)
			output.sendNote (note - 5, velocity == 0 ? SCALE_COLORS[currentScale][index - 5] : GREEN_HI);
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
