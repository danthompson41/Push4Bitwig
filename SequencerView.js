// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

var NUM_ROWS = 128;
var NUM_COLS = 8; //512;
var NUM_DISPLAY_ROWS = 8;
var NUM_DISPLAY_COLS = 8;
var START_KEY = 32;

function SequencerView ()
{
	this.canScrollLeft = true;
	this.canScrollRight = true;
	this.canScrollUp = true;
	this.canScrollDown = true;
	
	
	this.offsetX = 0;
	this.offsetY = START_KEY;
	this.prevStep = -1;
	
	this.data = [];
	for (var y = 0; y < NUM_ROWS; y++)
		this.data[y] = initArray (false, NUM_COLS);
	
	this.clip = host.createCursorClip (NUM_COLS, NUM_ROWS);
	
	this.clip.addPlayingStepObserver (doObject (this, function (step)
	{
		if (this.push.isActiveView (VIEW_SEQUENCER))
			this.paintStep (step);
	}));
	
	this.clip.addStepDataObserver (doObject (this, function (column, row, state)
	{
		this.data[column][row] = state;
		if (this.push.isActiveView (VIEW_SEQUENCER))
			this.drawGrid (column, row);
	}));
	
	this.clip.scrollToKey (START_KEY);
	this.clip.scrollToStep (0);
}
SequencerView.prototype = new BaseView ();

SequencerView.prototype.paintStep = function (step)
{
	this.drawStep (step);
};

SequencerView.prototype.updateNoteMapping = function ()
{
	noteInput.setKeyTranslationTable (initArray (-1, 128));
};

SequencerView.prototype.updateArrows = function ()
{
	this.canScrollUp = this.offsetY + NUM_DISPLAY_ROWS <= NUM_ROWS - NUM_DISPLAY_ROWS;
	this.canScrollDown = this.offsetY - NUM_DISPLAY_ROWS >= 0;
	this.canScrollLeft = this.offsetX > 0;

	output.sendCC (PUSH_BUTTON_LEFT, this.canScrollLeft ? BUTTON_ON : BLACK);
	output.sendCC (PUSH_BUTTON_RIGHT, this.canScrollRight ? BUTTON_ON : BLACK);
	output.sendCC (PUSH_BUTTON_UP, this.canScrollUp ? BUTTON_ON : BLACK);
	output.sendCC (PUSH_BUTTON_DOWN, this.canScrollDown ? BUTTON_ON : BLACK);
};

SequencerView.prototype.onActivate = function ()
{
	output.sendCC (PUSH_BUTTON_NOTE, BUTTON_ON);
	output.sendCC (PUSH_BUTTON_SESSION, BUTTON_OFF);
	this.updateNoteMapping ();
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (false);
	this.updateArrows ();
	for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
		output.sendCC (i, BLACK);
	updateMode ();
};

SequencerView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_STOP:
		case PUSH_BUTTON_CLIP:
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

SequencerView.prototype.onGrid = function (note, velocity)
{
	if (velocity == 0)
		return;
	var index = note - 36;
	var x = index % 8;
	var y = Math.floor (index / 8);
	this.clip.toggleStep (x, this.offsetY + y, velocity);
};

SequencerView.prototype.onLeft = function ()
{
	var newOffset = this.offsetX - NUM_DISPLAY_COLS;
	if (newOffset < 0)
		this.offsetX = 0;
	else
	{
		this.offsetX = newOffset;
		this.clip.scrollStepsPageBackwards ();
	}
	this.updateArrows ();
};

SequencerView.prototype.onRight = function ()
{
	this.offsetX = this.offsetX + NUM_DISPLAY_COLS;
	this.clip.scrollStepsPageForward ();
	this.updateArrows ();
};

SequencerView.prototype.onUp = function ()
{
	this.offsetY = Math.min (NUM_ROWS - NUM_DISPLAY_ROWS, this.offsetY + NUM_DISPLAY_ROWS);
	this.drawGrid ();
	this.updateArrows ();
};

SequencerView.prototype.onDown = function ()
{
	this.offsetY = Math.max (0, this.offsetY - NUM_DISPLAY_ROWS);
	this.drawGrid ();
	this.updateArrows ();
};

SequencerView.prototype.drawGrid = function (x, y)
{
	var port = host.getMidiOutPort (0);

	if (x && y)
	{
		if (x && this.isInYRange (y))
			this.drawPad (port, x, y % NUM_DISPLAY_ROWS, this.data[x][y]);
	}
	else
	{
		for (var x = 0; x < NUM_DISPLAY_COLS; x++)
		{
			for (var y = 0; y < NUM_DISPLAY_ROWS; y++)
				this.drawPad (port, x, y, this.data[x][this.offsetY + y]);
		}
	}
};

SequencerView.prototype.drawStep = function (step)
{
	var drawBar  = this.isInXRange (step);
	var drawPrev = this.isInXRange (this.prevStep);

	var port = host.getMidiOutPort (0);
	for (var y = 0; y < NUM_DISPLAY_ROWS; y++)
	{
		if (drawPrev)
			this.drawPad (port, this.prevStep % NUM_DISPLAY_COLS, y, this.data[this.prevStep % NUM_DISPLAY_COLS][this.offsetY + y], false);
		if (drawBar)
			this.drawPad (port, step % NUM_DISPLAY_COLS, y, this.data[step % NUM_DISPLAY_COLS][this.offsetY + y], true);
	}
	
	this.prevStep = step;
};

SequencerView.prototype.drawPad = function (port, x, y, isSet, hilite)
{
	var n = 36 + x + NUM_DISPLAY_COLS * y;
	port.sendMidi (0x90, n, isSet ? (hilite ? ORANGE_HI : RED_HI) : hilite ? GREEN_HI : BLACK);
};

SequencerView.prototype.isInXRange = function (x)
{
	return x >= this.offsetX && x < this.offsetX + NUM_DISPLAY_COLS;
};

SequencerView.prototype.isInYRange = function (y)
{
	return y >= this.offsetY && y < this.offsetY + NUM_DISPLAY_ROWS;
};