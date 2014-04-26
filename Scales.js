// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// Major & Minor scale coloring (rows are in reverse order)
var SCALE_MAJOR_COLORS =
[
	BLUE_LGHT, WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , BLUE_LGHT,
	WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , BLUE_LGHT, WHITE_HI , WHITE_HI , WHITE_HI ,
	WHITE_HI , BLUE_LGHT, WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI ,
	WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , BLUE_LGHT, WHITE_HI , WHITE_HI ,
	WHITE_HI , WHITE_HI , BLUE_LGHT, WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI ,
	WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , BLUE_LGHT, WHITE_HI ,
	WHITE_HI , WHITE_HI , WHITE_HI , BLUE_LGHT, WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI ,
	BLUE_LGHT, WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , WHITE_HI , BLUE_LGHT
];

// Chromatic scale coloring (rows are in reverse order)
var SCALE_CHROMATIC_COLORS =
[
	BLUE_LGHT, BLACK    , WHITE_HI , BLACK    , WHITE_HI , WHITE_HI , BLACK    , WHITE_HI ,
	BLACK    , WHITE_HI , BLACK    , WHITE_HI , BLUE_LGHT, BLACK    , WHITE_HI , BLACK    ,
	WHITE_HI , WHITE_HI , BLACK    , WHITE_HI , BLACK    , WHITE_HI , BLACK    , WHITE_HI ,
	BLUE_LGHT, BLACK    , WHITE_HI , BLACK    , WHITE_HI , WHITE_HI , BLACK    , WHITE_HI ,
	BLACK    , WHITE_HI , BLACK    , WHITE_HI , BLUE_LGHT, BLACK    , WHITE_HI , BLACK    ,
	WHITE_HI , WHITE_HI , BLACK    , WHITE_HI , BLACK    , WHITE_HI , BLACK    , WHITE_HI ,
	BLUE_LGHT, BLACK    , WHITE_HI , BLACK    , WHITE_HI , WHITE_HI , BLACK    , WHITE_HI ,
	BLACK    , WHITE_HI , BLACK    , WHITE_HI , BLUE_LGHT, BLACK    , WHITE_HI , BLACK    ,
];

var SCALE_COLORS = [SCALE_MAJOR_COLORS, SCALE_MAJOR_COLORS, SCALE_CHROMATIC_COLORS ];

var NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B' ];

var SCALE_MAJOR_NOTES =
[
	0,   2,  4,  5,  7,  9, 11, 12,
	5,   7,  9, 11, 12, 14, 16, 17,
	11, 12, 14, 16, 17, 19, 21, 23,
	16, 17, 19, 21, 23, 24, 26, 28,
	21, 23, 24, 26, 28, 29, 31, 33,
	26, 28, 29, 31, 33, 35, 36, 38,
	31, 33, 35, 36, 38, 40, 41, 43,
	36, 38, 40, 41, 43, 45, 47, 48
];

var SCALE_MINOR_NOTES =
[
	0,   2,  3,  5,  7,  9, 10, 12,
	5,   7,  9, 10, 12, 14, 15, 17,
	10, 12, 14, 15, 17, 19, 21, 22,
	15, 17, 19, 21, 22, 24, 26, 27,
	21, 22, 24, 26, 27, 29, 31, 33,
	26, 27, 29, 31, 33, 34, 36, 38,
	31, 33, 34, 36, 38, 39, 41, 43,
	36, 38, 39, 41, 43, 45, 46, 48
];

var SCALE_CHROMATIC_NOTES =
[
	0,   1,  2,  3,  4,  5,  6,  7,
	8,   9, 10, 11, 12, 13, 14, 15,
	16, 17, 18, 19, 20, 21, 22, 23,
	24, 25, 26, 27, 28, 29, 30, 31,
	32, 33, 34, 35, 36, 37, 38, 39,
	40, 41, 42, 43, 44, 45, 46, 47,
	48, 49, 50, 51, 52, 53, 54, 55,
	56, 57, 58, 59, 60, 61, 62, 63
];
var SCALE_NOTES = [SCALE_MAJOR_NOTES, SCALE_MINOR_NOTES, SCALE_CHROMATIC_NOTES ];

                   // C  G  D  A  E   H  F  Bb  Eb Ab Db Gb
var SCALE_OFFSETS = [ 0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6 ];

// Scales
var SCALE_MAJOR     = 0;
var SCALE_MINOR     = 1;
var SCALE_CHROMATIC = 2;
