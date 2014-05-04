// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function SessionView ()
{
	this.canScrollLeft = true;
	this.canScrollRight = true;
	this.canScrollUp = true;
	this.canScrollDown = true;
	
	trackBank.addCanScrollScenesDownObserver (doObject (this, function (canScroll)
	{
		this.canScrollUp = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	trackBank.addCanScrollScenesUpObserver (doObject (this, function (canScroll)
	{
		this.canScrollDown = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	trackBank.addCanScrollTracksDownObserver (doObject (this, function (canScroll)
	{
		this.canScrollRight = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
	trackBank.addCanScrollTracksUpObserver (doObject (this, function (canScroll)
	{
		this.canScrollLeft = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			this.updateArrows ();
	}));
}
SessionView.prototype = new BaseView ();

SessionView.prototype.onFirstRow = function (index)
{
	if (this.push.isShiftPressed())
		trackBank.getTrack(index).returnToArrangement();
	else
		BaseView.prototype.onFirstRow.call (this, index);
};

SessionView.prototype.onActivate = function ()
{
	BaseView.prototype.onActivate.call (this);

	push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_HI);
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (true);
	for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
		push.setButton (i, PUSH_COLOR_SCENE_GREEN);
};

SessionView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_ACCENT:
		case PUSH_BUTTON_USER_MODE:
		case PUSH_BUTTON_DUPLICATE:
			return false;
	}
	return true;
};

SessionView.prototype.onNew = function (isPressed)
{
	this.newPressed = isPressed;
	push.setButton (PUSH_BUTTON_NEW, isPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
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
	
	if (this.newPressed)
	{
		if (!slot.hasContent)
			slots.createEmptyClip (s, Math.pow (2, currentNewClipLength));
	}
	else if (!this.push.isSelectPressed ())
	{
		if (tracks[t].recarm)
		{
			if (slot.isRecording)
				slots.launch (s);
			else
				slots.record (s);
		}
		else
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

SessionView.prototype.drawGrid = function ()
{
	for (var i = 0; i < 8; i++)
	{
		var t = tracks[i];
		for (var j = 0; j < 8; j++)
			this.drawPad (t.slots[j], i, j, t.recarm);
	}
};

SessionView.prototype.drawPad = function (slot, x, y, isArmed)
{
	var color = slot.isRecording ? PUSH_COLOR_RED_HI : 
					(slot.hasContent ? 
						(slot.color ? slot.color : PUSH_COLOR_ORANGE_HI) : 
						(isArmed ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK));
	var n = 92 + x - 8 * y;
	push.pads.light (n, color);
	push.pads.blink (n, (slot.isQueued || slot.isPlaying) ? (slot.isRecording ? PUSH_COLOR_RED_HI : PUSH_COLOR_GREEN_HI) : PUSH_COLOR_BLACK, slot.isQueued);
};
