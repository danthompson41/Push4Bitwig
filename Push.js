// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// Push Colors
var BLACK     = 0;
var WHITE_HI  = 3;
var WHITE_LO  = 1;
var RED_HI    = 120;
var RED_LO    = 7;
var ORANGE_HI = 60;
var ORANGE_LO = 10;
var YELLOW_HI = 13;
var YELLOW_LO = 15;
var GREEN_HI  = 21;
var GREEN_LO  = 23;
var CYAN_HI   = 33;
var CYAN_LO   = 35;
var BLUE_LGHT = 41;
var BLUE_HI   = 45;
var BLUE_LO   = 47;
var INDIGO_HI = 49;
var INDIGO_LO = 51;
var VIOLET_HI = 53;
var VIOLET_LO = 55;

var PUSH_BUTTON_TAP				= 3;
var PUSH_BUTTON_CLICK           = 9;
var PUSH_BUTTON_MASTER          = 28;
var PUSH_BUTTON_STOP            = 29;
var PUSH_BUTTON_LEFT            = 44;
var PUSH_BUTTON_RIGHT           = 45;
var PUSH_BUTTON_UP              = 46;
var PUSH_BUTTON_DOWN            = 47;
var PUSH_BUTTON_SELECT          = 48;
var PUSH_BUTTON_SHIFT           = 49;
var PUSH_BUTTON_NOTE            = 50;
var PUSH_BUTTON_SESSION         = 51;
var PUSH_BUTTON_ADD_EFFECT      = 52;
var PUSH_BUTTON_ADD_TRACK       = 53;
var PUSH_BUTTON_OCTAVE_DOWN     = 54;
var PUSH_BUTTON_OCTAVE_UP       = 55;
var PUSH_BUTTON_REPEAT          = 56;
var PUSH_BUTTON_ACCENT          = 57;
var PUSH_BUTTON_SCALES          = 58;
var PUSH_BUTTON_USER_MODE       = 59;
var PUSH_BUTTON_MUTE            = 60;
var PUSH_BUTTON_SOLO            = 61;
var PUSH_BUTTON_DEVICE_LEFT     = 62;
var PUSH_BUTTON_DEVICE_RIGHT    = 63;
var PUSH_BUTTON_PLAY            = 85;
var PUSH_BUTTON_RECORD          = 86;
var PUSH_BUTTON_NEW             = 87;
var PUSH_BUTTON_DUPLICATE       = 88;
var PUSH_BUTTON_AUTOMATION      = 89;
var PUSH_BUTTON_FIXED_LENGTH    = 90;
var PUSH_BUTTON_DEVICE          = 110;
var PUSH_BUTTON_BROWSE          = 111;
var PUSH_BUTTON_TRACK           = 112;
var PUSH_BUTTON_CLIP            = 113;
var PUSH_BUTTON_VOLUME          = 114;
var PUSH_BUTTON_PAN_SEND        = 115;
var PUSH_BUTTON_QUANTIZE        = 116;
var PUSH_BUTTON_DOUBLE          = 117;
var PUSH_BUTTON_DELETE          = 118;
var PUSH_BUTTON_UNDO            = 119;

var PUSH_BUTTON_SCENE1          = 36;	// 1/4
var PUSH_BUTTON_SCENE2          = 37;	
var PUSH_BUTTON_SCENE3          = 38;
var PUSH_BUTTON_SCENE4          = 39;
var PUSH_BUTTON_SCENE5          = 40;	// ...
var PUSH_BUTTON_SCENE6          = 41;
var PUSH_BUTTON_SCENE7          = 42;
var PUSH_BUTTON_SCENE8          = 43;	// 1/32T

var BUTTON_OFF = 1;
var BUTTON_ON  = 4;

// Push character codes for value bars
var BARS_NON = String.fromCharCode (6);
var BARS_ONE = String.fromCharCode (3);
var BARS_TWO = String.fromCharCode (5);
var BARS_ONE_L = String.fromCharCode (4);
var NON_4 = BARS_NON + BARS_NON + BARS_NON + BARS_NON;
var RIGHT_ARROW = String.fromCharCode (127);


function Push (output)
{
	this.output = output;

	this.activeView = -1;
	this.views = [];
	this.shiftPressed = false;
	
	this.buttons =
	[
		PUSH_BUTTON_TAP,
		PUSH_BUTTON_CLICK,
		PUSH_BUTTON_MASTER,
		PUSH_BUTTON_STOP,
		PUSH_BUTTON_LEFT,
		PUSH_BUTTON_RIGHT,
		PUSH_BUTTON_UP,
		PUSH_BUTTON_DOWN,
		PUSH_BUTTON_SELECT,
		PUSH_BUTTON_SHIFT,
		PUSH_BUTTON_NOTE,
		PUSH_BUTTON_SESSION,
		PUSH_BUTTON_ADD_EFFECT,
		PUSH_BUTTON_ADD_TRACK,
		PUSH_BUTTON_OCTAVE_DOWN,
		PUSH_BUTTON_OCTAVE_UP,
		PUSH_BUTTON_REPEAT,
		PUSH_BUTTON_ACCENT,
		PUSH_BUTTON_SCALES,
		PUSH_BUTTON_USER_MODE,
		PUSH_BUTTON_MUTE,
		PUSH_BUTTON_SOLO,
		PUSH_BUTTON_DEVICE_LEFT,
		PUSH_BUTTON_DEVICE_RIGHT,
		PUSH_BUTTON_PLAY,
		PUSH_BUTTON_RECORD,
		PUSH_BUTTON_NEW,
		PUSH_BUTTON_DUPLICATE,
		PUSH_BUTTON_AUTOMATION,
		PUSH_BUTTON_FIXED_LENGTH,
		PUSH_BUTTON_DEVICE,
		PUSH_BUTTON_BROWSE,
		PUSH_BUTTON_TRACK,    
		PUSH_BUTTON_CLIP,
		PUSH_BUTTON_VOLUME,
		PUSH_BUTTON_PAN_SEND,
		PUSH_BUTTON_QUANTIZE,
		PUSH_BUTTON_DOUBLE,
		PUSH_BUTTON_DELETE,
		PUSH_BUTTON_UNDO
	];
}

Push.prototype.turnOff = function ()
{
	// Clear display
	for (var i = 0; i < 4; i++)
		this.clearRow (i);

	// Turn off all buttons
	for (var i = 0; i < this.buttons.length; i++)
		this.output.sendCC (this.buttons[i], BLACK);

	for (var i = 20; i < 27; i++)
		this.output.sendCC (i, BLACK);
	for (var i = 102; i < 110; i++)
		this.output.sendCC (i, BLACK);
		
	for (var i = 36; i < 100; i++)
		this.output.sendNote (i, BLACK);
};

Push.prototype.setActiveView = function (viewId)
{
	this.activeView = viewId;
	
	var view = this.getActiveView ();
	if (view == null)
	{
		this.turnOff ();
		return;
	}
	
	for (var i = 0; i < this.buttons.length; i++)
		this.output.sendCC (this.buttons[i], view.usesButton (this.buttons[i]) ? BUTTON_OFF : BLACK);
	
	view.onActivate ();
	view.drawGrid ();
};

Push.prototype.isActiveView = function (viewId)
{
	return this.activeView == viewId;
};

Push.prototype.addView = function (viewId, view)
{
	view.attachTo (this);
	this.views[viewId] = view;
};

Push.prototype.getActiveView = function ()
{
	if (this.activeView < 0)
		return null;
	var view = this.views[this.activeView];
	return view ? view : null;
};

Push.prototype.sendRow = function (row, str)
{
	var array = [];
	for (var i = 0; i < str.length; i++)
		array[i] = str.charCodeAt(i);
	this.output.sendSysex ("F0 47 7F 15 " + toHexStr ([24 + row]) + "00 45 00 " + toHexStr (array) + "F7");
};

Push.prototype.clearRow = function (row)
{
	this.output.sendSysex ("F0 47 7F 15 " + toHexStr ([28 + row]) + "00 00 F7");
};

Push.prototype.redrawGrid = function (x, y)
{
	var view = this.getActiveView ();
	if (view != null)
		view.drawGrid (x, y);
};

Push.prototype.isShiftPressed = function ()
{
	return this.shiftPressed;
};

Push.prototype.handleMidi = function (status, data1, data2)
{
	switch (status & 0xF0)
	{	
		case 0x80:
		case 0x90:
			if (data1 >= 36 && data1 < 100)
				this.handleGrid (data1, data2);
			break;

		case 0xB0:
			this.handleCC (data1, data2);
			break;
	}
};

Push.prototype.handleGrid = function (note, velocity)
{
	var view = this.getActiveView ();
	if (view != null)
		view.onGrid (note, velocity);
};

Push.prototype.handleCC = function (cc, value)
{
	var view = this.getActiveView ();
	if (view == null)
		return;
		
	switch (cc)
	{
		// Tap Tempo
		case 3:
			if (value == 127)
				view.onTapTempo ();
			break;
	
		// Click
		case 9:
			if (value == 127)
				view.onClick ();
			break;

		// Small knob 1 (rastered)
		case 14:
			view.onSmallKnob1 (value == 1);
			break;

		// Small knob 2 (not rastered)
		case 15:
			view.onSmallKnob2 (value <= 61);
			break;
			
		// 1st button row below display
		case 20:
		case 21:
		case 22:
		case 23:
		case 24:
		case 25:
		case 26:
		case 27:
			if (value == 127)
				view.onFirstRow (cc - 20);
			break;
			
		// Select Master track
		case 28:
			if (value == 127)
				view.onMaster ();
			break;

		// Stop
		case 29:
			if (value == 127)
				view.onStop ();
			break;

		// Scene buttons
		case 36:	// 1/4
		case 37:	
		case 38:
		case 39:
		case 40:	// ...
		case 41:
		case 42:
		case 43:	// 1/32T
			if (value == 127)
				view.onScene (7 - (cc - 36));
			break;

		// Left
		case 44:
			if (value == 127)
				view.onLeft ();
			break;
			
		// Right
		case 45:
			if (value == 127)
				view.onRight ();
			break;

		// Up
		case 46:
			if (value == 127)
				view.onUp ();
			break;

		// Down
		case 47:
			if (value == 127)
				view.onDown ();
			break;

		// Select
		case 48:
			if (value == 127)
				view.onSelect ();
			break;

		// Shift Key
		case 49:
			this.shiftPressed = value == 127;
			this.output.sendCC (49, this.shiftPressed ? BUTTON_ON : BUTTON_OFF);
			view.onShift (this.shiftPressed);
			break;
			
		// Play Note Mode
		case 50:
			if (value == 127)
				view.onNote ();
			break;

		// Play Session Mode
		case 51:
			if (value == 127)
				view.onSession ();
			break;

		// Add FX
		case 52:
			if (value == 127)
				view.onAddFX ();
			break;
			
		// Add Track
		case 53:	
			if (value == 127)
				view.onAddTrack ();
			break;

		// Octave Down
		case 54:
			if (value == 127)
				view.onOctaveDown ();
			break;
			
		// Octave Up
		case 55:
			if (value == 127)
				view.onOctaveUp ();
			break;

		// Repeat
		case 56:
			view.onRepeat (value == 127);
			break;

		// Accent
		case 57:
			view.onAccent (value == 127);
			break;
			
		// Scales
		case 58:
			view.onScales (value == 127);
			break;

		// User Mode
		case 59:
			if (value == 127)
				view.onUser ();
			break;

		// Mute
		case 60:
			if (value == 127)
				view.onMute ();
			break;
			
		// Solo
		case 61:
			if (value == 127)
				view.onSolo ();
			break;

		// Decrease selected device
		case 62:
			if (value == 127)
				view.onDeviceLeft ();
			break;
		
		// Increase selected device
		case 63:
			if (value == 127)
				view.onDeviceRight ();
			break;
			
		// Value Knobs 1-8
		case 71:
		case 72:
		case 73:
		case 74:
		case 75:
		case 76:
		case 77:
		case 78:
			view.onValueKnob (cc - 71, value);
			break;
			
		// Value knob 9
		case 79:
			view.onValueKnob9 (value);
			break;
			
		// Play
		case 85:
			if (value == 127)
				view.onPlay ();
			break;
			
		// Record
		case 86:
			if (value == 127)
				view.onRecord ();
			break;
			
		// New
		case 87:
			if (value == 127)
				view.onNew ();
			break;
			
		// Duplicate
		case 88:
			if (value == 127)
				view.onDuplicate ();
			break;
			
		// Automation
		case 89:
			if (value == 127)
				view.onAutomation ();
			break;
			
		// Fixed Length
		case 90:
			if (value == 127)
				view.onFixedLength ();
			break;
			
		// 2nd button row below display
		case 102:
		case 103:
		case 104:
		case 105:
		case 106:
		case 107:
		case 108:
		case 109:
			if (value == 127)
				view.onSecondRow (cc - 102);
			break;
			
		// Device Mode
		case 110:
			if (value == 127)
				view.onDevice ();
			break;
			
		// Browse
		case 111:
			if (value == 127)
				view.onBrowse ();
			break;
			
	 	// Track Mode
		case 112:
			if (value == 127)
				view.onTrack ();
			break;

	 	// Clip Mode
		case 113:
			if (value == 127)
				view.onClip ();
			break;

		// Volume Mode
		case 114:
			if (value == 127)
				view.onVolume ();
			break;
			
		// Pan & Send Mode
		case 115:
			if (value == 127)
				view.onPanAndSend ();
			break;
		
		// Quantize
		case 116:
			if (value == 127)
				view.onQuantize ();
			break;

		// Double
		case 117:
			if (value == 127)
				view.onDouble ();
			break;
			
		// Delete
		case 118:
			if (value == 127)
				view.onDelete ();
			break;
			
		// Undo
		case 119:
			if (value == 127)
				view.onUndo ();
			break;
			
		default:
			println (cc);
			break;
	}
};