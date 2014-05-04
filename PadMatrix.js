// Push Colors
var PUSH_COLOR_BLACK     = 0;
var PUSH_COLOR_WHITE_HI  = 3;
var PUSH_COLOR_WHITE_LO  = 1;
var PUSH_COLOR_RED_HI    = 120;
var PUSH_COLOR_RED_LO    = 7;
var PUSH_COLOR_ORANGE_HI = 60;
var PUSH_COLOR_ORANGE_LO = 10;
var PUSH_COLOR_YELLOW_HI = 13;
var PUSH_COLOR_YELLOW_LO = 15;
var PUSH_COLOR_GREEN_HI  = 21;
var PUSH_COLOR_GREEN_LO  = 23;
var PUSH_COLOR_CYAN_HI   = 33;
var PUSH_COLOR_CYAN_LO   = 35;
var PUSH_COLOR_BLUE_LGHT = 41;
var PUSH_COLOR_BLUE_HI   = 45;
var PUSH_COLOR_BLUE_LO   = 47;
var PUSH_COLOR_INDIGO_HI = 49;
var PUSH_COLOR_INDIGO_LO = 51;
var PUSH_COLOR_VIOLET_HI = 53;
var PUSH_COLOR_VIOLET_LO = 55;

var PUSH_COLOR_SCENE_RED                  = 1
var PUSH_COLOR_SCENE_RED_BLINK            = 2
var PUSH_COLOR_SCENE_RED_BLINK_FAST       = 3
var PUSH_COLOR_SCENE_RED_HI               = 4
var PUSH_COLOR_SCENE_RED_HI_BLINK         = 5
var PUSH_COLOR_SCENE_RED_HI_BLINK_FAST    = 6
var PUSH_COLOR_SCENE_ORANGE               = 7
var PUSH_COLOR_SCENE_ORANGE_BLINK         = 8
var PUSH_COLOR_SCENE_ORANGE_BLINK_FAST    = 9
var PUSH_COLOR_SCENE_ORANGE_HI            = 10
var PUSH_COLOR_SCENE_ORANGE_HI_BLINK      = 11
var PUSH_COLOR_SCENE_ORANGE_HI_BLINK_FAST = 12
var PUSH_COLOR_SCENE_YELLOW               = 13
var PUSH_COLOR_SCENE_YELLOW_BLINK         = 14
var PUSH_COLOR_SCENE_YELLOW_BLINK_FAST    = 15
var PUSH_COLOR_SCENE_YELLOW_HI            = 16
var PUSH_COLOR_SCENE_YELLOW_HI_BLINK      = 17
var PUSH_COLOR_SCENE_YELLOW_HI_BLINK_FAST = 18
var PUSH_COLOR_SCENE_GREEN                = 19
var PUSH_COLOR_SCENE_GREEN_BLINK          = 20
var PUSH_COLOR_SCENE_GREEN_BLINK_FAST     = 21
var PUSH_COLOR_SCENE_GREEN_HI             = 22
var PUSH_COLOR_SCENE_GREEN_HI_BLINK       = 23
var PUSH_COLOR_SCENE_GREEN_HI_BLINK_FAST  = 24


function PadMatrix (output)
{
	this.output = output;

	// Note: The matrix contains only 64 pads but is more efficient to use 
	// the 128 note values the pads understand
	this.currentButtonColors = initArray (PUSH_COLOR_BLACK, 128);
	this.buttonColors = initArray (PUSH_COLOR_BLACK, 128);
	this.currentBlinkColors = initArray (PUSH_COLOR_BLACK, 128);
	this.blinkColors = initArray (PUSH_COLOR_BLACK, 128);
	this.currentBlinkFast = initArray (false, 128);
	this.blinkFast = initArray (false, 128);
}

PadMatrix.prototype.light = function (note, color)
{
	this.buttonColors[note] = color;
};

PadMatrix.prototype.lightEx = function (x, y, color)
{
	this.buttonColors[36 + x + 8 * y] = color;
};

PadMatrix.prototype.blink = function (note, color, fast)
{
	this.blinkColors[note] = color;
	this.blinkFast[note] = fast;
};

PadMatrix.prototype.blinkEx = function (x, y, color)
{
	var note = 36 + x + 8 * y;
	this.blinkColors[note] = color;
	this.blinkFast[note] = fast;
};

PadMatrix.prototype.flush = function ()
{
	for (var i = 36; i < 100; i++)
	{
		if (this.currentButtonColors[i] != this.buttonColors[i])
		{
			this.currentButtonColors[i] = this.buttonColors[i];
			this.output.sendNote (i, this.buttonColors[i]);
		}
		// No "else" here: Blinking color needs a base color
		if (this.currentBlinkColors[i] != this.blinkColors[i] || this.currentBlinkFast[i] != this.blinkFast[i])
		{
			this.currentBlinkColors[i] = this.blinkColors[i];
			this.currentBlinkFast[i] = this.blinkFast[i];
			if (this.blinkColors[i] == PUSH_COLOR_BLACK)
				this.output.sendNote (i, this.currentButtonColors[i]);
			else
				this.output.sendNoteEx (this.blinkFast[i] ? 14 : 10, i, this.blinkColors[i]);
		}
	}
};

PadMatrix.prototype.turnOff = function ()
{
	for (var i = 36; i < 100; i++)
		this.light (i, PUSH_COLOR_BLACK);
	this.flush ();
};
