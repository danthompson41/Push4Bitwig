// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

load ('PadMatrix.js');
load ('PushDisplay.js');

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

var PUSH_KNOB1_TOUCH       = 0;
var PUSH_KNOB2_TOUCH       = 1;
var PUSH_KNOB3_TOUCH       = 2;
var PUSH_KNOB4_TOUCH       = 3;
var PUSH_KNOB5_TOUCH       = 4;
var PUSH_KNOB6_TOUCH       = 5;
var PUSH_KNOB7_TOUCH       = 6;
var PUSH_KNOB8_TOUCH       = 7;
var PUSH_KNOB9_TOUCH       = 8;
var PUSH_SMALL_KNOB1_TOUCH = 10;
var PUSH_SMALL_KNOB2_TOUCH = 9;

var PUSH_BUTTON_STATE_OFF = 0;
var PUSH_BUTTON_STATE_ON  = 1;
var PUSH_BUTTON_STATE_HI  = 4;


function Push (output)
{
	this.output = output;
	this.pads = new PadMatrix (output);
	this.display = new PushDisplay (output);

	this.activeView = -1;
	this.views = [];
	this.shiftPressed = false;
	this.selectPressed = false;
	
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
	
	// create the static scale matrices from scale intervals
	Scales.createScales();
}

Push.prototype.turnOff = function ()
{
	// Clear display
	for (var i = 0; i < 4; i++)
		this.display.clearRow (i);

	// Turn off all buttons
	for (var i = 0; i < this.buttons.length; i++)
		this.setButton (this.buttons[i], PUSH_BUTTON_STATE_OFF);

	for (var i = 20; i < 27; i++)
		this.setButton (i, PUSH_BUTTON_STATE_OFF);
	for (var i = 102; i < 110; i++)
		this.setButton (i, PUSH_BUTTON_STATE_OFF);
		
	this.pads.turnOff ();
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
		this.setButton (this.buttons[i], view.usesButton (this.buttons[i]) ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_OFF);
	
	view.onActivate ();
};

Push.prototype.getActiveView = function ()
{
	if (this.activeView < 0)
		return null;
	var view = this.views[this.activeView];
	return view ? view : null;
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

Push.prototype.isSelectPressed = function ()
{
	return this.selectPressed;
};

Push.prototype.isShiftPressed = function ()
{
	return this.shiftPressed;
};

Push.prototype.setButton = function (button, state)
{
	this.output.sendCC (button, state);
};

Push.prototype.redrawGrid = function ()
{
	var view = this.getActiveView ();
	if (view == null)
		return;
	view.drawGrid ();
	this.pads.flush ();
};

Push.prototype.handleMidi = function (status, data1, data2)
{
	switch (status & 0xF0)
	{	
		case 0x80:
		case 0x90:
			if (data1 >= 36 && data1 < 100)
				this.handleGrid (data1, data2);
			else
				this.handleTouch (data1, data2);
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
		case PUSH_BUTTON_TAP:
			if (value == 127)
				view.onTapTempo ();
			break;
	
		// Click
		case PUSH_BUTTON_CLICK:
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
		case PUSH_BUTTON_MASTER:
			if (value == 127)
				view.onMaster ();
			break;

		// Stop
		case PUSH_BUTTON_STOP:
			view.onStop (value == 127);
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
		case PUSH_BUTTON_LEFT:
			if (value == 127)
				view.onLeft ();
			break;
			
		// Right
		case PUSH_BUTTON_RIGHT:
			if (value == 127)
				view.onRight ();
			break;

		// Up
		case PUSH_BUTTON_UP:
			if (value == 127)
				view.onUp ();
			break;

		// Down
		case PUSH_BUTTON_DOWN:
			if (value == 127)
				view.onDown ();
			break;

		// Select
		case PUSH_BUTTON_SELECT:
			this.selectPressed = value == 127;
			this.setButton (PUSH_BUTTON_SELECT, this.selectPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
			view.onSelect (this.selectPressed);
			break;

		// Shift Key
		case PUSH_BUTTON_SHIFT:
			this.shiftPressed = value == 127;
			this.setButton (PUSH_BUTTON_SHIFT, this.shiftPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
			view.onShift (this.shiftPressed);
			break;
			
		// Play Note Mode
		case PUSH_BUTTON_NOTE:
			if (value == 127)
				view.onNote ();
			break;

		// Play Session Mode
		case PUSH_BUTTON_SESSION:
			if (value == 127)
				view.onSession ();
			break;

		// Add FX
		case PUSH_BUTTON_ADD_EFFECT:
			if (value == 127)
				view.onAddFX ();
			break;
			
		// Add Track
		case PUSH_BUTTON_ADD_TRACK:
			if (value == 127)
				view.onAddTrack ();
			break;

		// Octave Down
		case PUSH_BUTTON_OCTAVE_DOWN:
			if (value == 127)
				view.onOctaveDown ();
			break;
			
		// Octave Up
		case PUSH_BUTTON_OCTAVE_UP:
			if (value == 127)
				view.onOctaveUp ();
			break;

		// Repeat
		case PUSH_BUTTON_REPEAT:
			view.onRepeat (value == 127);
			break;

		// Accent
		case PUSH_BUTTON_ACCENT:
			view.onAccent (value == 127);
			break;
			
		// Scales
		case PUSH_BUTTON_SCALES:
			view.onScales (value == 127);
			break;

		// User Mode
		case PUSH_BUTTON_USER_MODE:
			if (value == 127)
				view.onUser ();
			break;

		// Mute
		case PUSH_BUTTON_MUTE:
			if (value == 127)
				view.onMute ();
			break;
			
		// Solo
		case PUSH_BUTTON_SOLO:
			if (value == 127)
				view.onSolo ();
			break;

		// Decrease selected device
		case PUSH_BUTTON_DEVICE_LEFT:
			if (value == 127)
				view.onDeviceLeft ();
			break;
		
		// Increase selected device
		case PUSH_BUTTON_DEVICE_RIGHT:
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
		case PUSH_BUTTON_PLAY:
			if (value == 127)
				view.onPlay ();
			break;
			
		// Record
		case PUSH_BUTTON_RECORD:
			if (value == 127)
				view.onRecord ();
			break;
			
		// New
		case PUSH_BUTTON_NEW:
			view.onNew (value == 127);
			break;
			
		// Duplicate
		case PUSH_BUTTON_DUPLICATE:
			if (value == 127)
				view.onDuplicate ();
			break;
			
		// Automation
		case PUSH_BUTTON_AUTOMATION:
			if (value == 127)
				view.onAutomation ();
			break;
			
		// Fixed Length
		case PUSH_BUTTON_FIXED_LENGTH:
			view.onFixedLength (value == 127);
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
		case PUSH_BUTTON_DEVICE:
			if (value == 127)
				view.onDevice ();
			break;
			
		// Browse
		case PUSH_BUTTON_BROWSE:
			if (value == 127)
				view.onBrowse ();
			break;
			
	 	// Track Mode
		case PUSH_BUTTON_TRACK:
			if (value == 127)
				view.onTrack ();
			break;

	 	// Clip Mode
		case PUSH_BUTTON_CLIP:
			if (value == 127)
				view.onClip ();
			break;

		// Volume Mode
		case PUSH_BUTTON_VOLUME:
			if (value == 127)
				view.onVolume ();
			break;
			
		// Pan & Send Mode
		case PUSH_BUTTON_PAN_SEND:
			if (value == 127)
				view.onPanAndSend ();
			break;
		
		// Quantize
		case PUSH_BUTTON_QUANTIZE:
			if (value == 127)
				view.onQuantize ();
			break;

		// Double
		case PUSH_BUTTON_DOUBLE:
			if (value == 127)
				view.onDouble ();
			break;
			
		// Delete
		case PUSH_BUTTON_DELETE:
			if (value == 127)
				view.onDelete ();
			break;
			
		// Undo
		case PUSH_BUTTON_UNDO:
			if (value == 127)
				view.onUndo ();
			break;
			
		default:
			println (cc);
			break;
	}
};

Push.prototype.handleTouch = function (knob, value)
{
	var view = this.getActiveView ();
	if (view == null)
		return;
		
	switch (knob)
	{
		case PUSH_KNOB1_TOUCH:
		case PUSH_KNOB2_TOUCH:
		case PUSH_KNOB3_TOUCH:
		case PUSH_KNOB4_TOUCH:
		case PUSH_KNOB5_TOUCH:
		case PUSH_KNOB6_TOUCH:
		case PUSH_KNOB7_TOUCH:
		case PUSH_KNOB8_TOUCH:
			view.onValueKnobTouch (knob, value == 127);
			break;

		case PUSH_KNOB9_TOUCH:
			view.onValueKnob9Touch (value == 127);
			break;
			
		case PUSH_SMALL_KNOB1_TOUCH:
			view.onSmallKnob1Touch (value == 127);
			break;
			
		case PUSH_SMALL_KNOB2_TOUCH:
			view.onSmallKnob1Touch (value == 127);
			break;
	}
};