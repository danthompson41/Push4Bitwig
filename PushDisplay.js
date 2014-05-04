// Push character codes for value bars
var BARS_NON = String.fromCharCode (6);
var BARS_ONE = String.fromCharCode (3);
var BARS_TWO = String.fromCharCode (5);
var BARS_ONE_L = String.fromCharCode (4);
var NON_4 = BARS_NON + BARS_NON + BARS_NON + BARS_NON;
var RIGHT_ARROW = String.fromCharCode (127);

var SPACES =
[
	'',
	' ',
	'  ',
	'   ',
	'    ',
	'     ',
	'      ',
	'       ',
	'        ',
	'         '
];

var DASHES =
[
	'',
	BARS_NON,
	BARS_NON + BARS_NON,
	BARS_NON + BARS_NON + BARS_NON,
	BARS_NON + BARS_NON + BARS_NON + BARS_NON,
	BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON,
	BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON,
	BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON,
	BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON,
	BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON + BARS_NON
];

var SYSEX_CLEAR =
[
	"F0 47 7F 15 18 00 45 00 ",
	"F0 47 7F 15 19 00 45 00 ",
	"F0 47 7F 15 1A 00 45 00 ",
	"F0 47 7F 15 1B 00 45 00 "
];

var SYSEX_MESSAGE =
[
	"F0 47 7F 15 1C 00 00 F7",
	"F0 47 7F 15 1D 00 00 F7",
	"F0 47 7F 15 1E 00 00 F7",
	"F0 47 7F 15 1F 00 00 F7"
];


PushDisplay.FORMAT_RAW   = 0;
PushDisplay.FORMAT_VALUE = 1;
PushDisplay.FORMAT_PAN   = 2;

// 4 rows (0-3) with 4 blocks (0-3). Each block consists of 
// 17 characters or 2 cells (0-7).
function PushDisplay (output)
{
	this.output = output;
	this.currentMessage = initArray (null, 4);
	this.message = initArray (null, 4);
	
	this.cells = initArray (null, 4 * 8);
}

PushDisplay.prototype.setRow = function (row, str)
{
	this.message[row] = str;
	return this;
};

PushDisplay.prototype.clearRow = function (row)
{
	for (var i = 0; i < 4; i++)
		this.clearBlock (row, i);
	return this;
};

PushDisplay.prototype.setBlock = function (row, block, value)
{
	var cell = 2 * block;
	if (value.length > 9)
	{
		this.cells[row * 8 + cell]     = value.substr (0, 9);
		this.cells[row * 8 + cell + 1] = this.pad (value.substring (9), 8, ' ');
	}
	else
	{
		this.cells[row * 8 + cell] = this.pad (value, 9, ' ');
		this.clearCell (row, cell + 1);
	}
	return this;
};

PushDisplay.prototype.clearBlock = function (row, block)
{
	var cell = 2 * block;
	this.clearCell (row, cell);
	this.clearCell (row, cell + 1);
	return this;
};

PushDisplay.prototype.setCell = function (row, cell, value, format)
{
	this.cells[row * 8 + cell] = this.pad (this.formatStr (value, format), 8, ' ') + (cell % 2 == 0 ? ' ' : '');
	return this;
};

PushDisplay.prototype.clearCell = function (row, cell)
{
	this.cells[row * 8 + cell] = cell % 2 == 0 ? '         ' : '        ';
	return this;
};

PushDisplay.prototype.done = function (row)
{
	var index = row * 8;
	this.message[row] = '';
	for (var i = 0; i < 8; i++)
		this.message[row] += this.cells[index + i];
	return this;
};

PushDisplay.prototype.flush = function (row)
{
	for (var row = 0; row < 4; row++)
	{
		if (this.currentMessage[row] == this.message[row])
			continue;
		this.currentMessage[row] = this.message[row];
		if (this.currentMessage[row] == null)
			this.output.sendSysex (SYSEX_CLEAR[row]);
		else
		{
			var array = [];
			for (var i = 0; i < this.currentMessage[row].length; i++)
				array[i] = this.currentMessage[row].charCodeAt(i);
			this.output.sendSysex (SYSEX_CLEAR[row] + toHexStr (array) + "F7");
		}
	}
};

PushDisplay.prototype.formatValue = function (value)
{
	var noOfBars = Math.round (16 * value / 128);
	var n = '';
	for (var j = 0; j < Math.floor (noOfBars / 2); j++)
		n += BARS_TWO;
	if (noOfBars % 2 == 1)
		n += BARS_ONE;
	return this.pad (n, 8, BARS_NON);
};

PushDisplay.prototype.formatPan = function (pan)
{
	if (pan == 64)
	 	return NON_4 + NON_4;
	var isLeft = pan < 64;
	var pos = isLeft ? 64 - pan : pan - 64;
	var noOfBars = Math.round (16 * pos / 128);
	var n = '';
	for (var i = 0; i < Math.floor (noOfBars / 2); i++)
		n += BARS_TWO;
	if (noOfBars % 2 == 1)
		n += isLeft ? BARS_ONE_L : BARS_ONE;
	n = NON_4 + this.pad (n, 4, BARS_NON);
	return isLeft ? this.reverseStr (n) : n;
};

PushDisplay.prototype.pad = function (str, length, character)
{
	if (typeof (str) == 'undefined' || str == null)
		str = '';
	var diff = length - str.length;
	if (diff < 0)
		return str.substr (0, length);
	if (diff > 0)
		return str + (character == ' ' ? SPACES[diff] : DASHES[diff]);
	return str;
};

PushDisplay.prototype.formatStr = function (value, format)
{
	switch (format)
	{
		case PushDisplay.FORMAT_VALUE:
			return this.formatValue (value);
		case PushDisplay.FORMAT_PAN:
			return this.formatPan (value);
		default:
			return value;
	}
};

PushDisplay.prototype.reverseStr = function (str)
{
	var r = '';
	for (var i = 0; i < str.length; i++)
		r = str[i] + r;
	return r;
};
