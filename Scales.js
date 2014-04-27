// Written by Jürgen Moßgraber - mossgrabers.de
// Additional scales by Alexandre Bique
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

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

var NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B' ];

//                    C  G  D  A  E   H  F  Bb  Eb Ab Db Gb
var SCALE_OFFSETS = [ 0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6 ];


var SCALE_MAJOR_NOTES =
[
	00, 02, 04, 05, 07, 09, 11, 12,
	05, 07, 09, 11, 12, 14, 16, 17,
	11, 12, 14, 16, 17, 19, 21, 23,
	16, 17, 19, 21, 23, 24, 26, 28,
	21, 23, 24, 26, 28, 29, 31, 33,
	26, 28, 29, 31, 33, 35, 36, 38,
	31, 33, 35, 36, 38, 40, 41, 43,
	36, 38, 40, 41, 43, 45, 47, 48
];

var SCALE_MINOR_NOTES =
[
	00, 02, 03, 05, 07, 08, 10, 12,
	05, 07, 08, 10, 12, 14, 15, 17,
	10, 12, 14, 15, 17, 19, 20, 22,
	15, 17, 19, 20, 22, 24, 26, 27,
	20, 22, 24, 26, 27, 29, 31, 32,
	26, 27, 29, 31, 32, 34, 36, 38,
	31, 32, 34, 36, 38, 39, 41, 43,
	36, 38, 39, 41, 43, 44, 46, 48
];

var SCALE_PHRYGIAN_NOTES =
[
	00, 01, 03, 05, 07, 08, 10, 12,
	05, 07, 08, 10, 12, 13, 15, 17,
	10, 12, 13, 15, 17, 19, 20, 22,
	15, 17, 19, 20, 22, 24, 25, 27,
	20, 22, 24, 25, 27, 29, 31, 32,
	25, 27, 29, 31, 32, 34, 36, 37,
	31, 32, 34, 36, 37, 39, 41, 43,
	36, 37, 39, 41, 43, 44, 46, 48
];

var SCALE_MIXOLYDIAN_NOTES =
[
	00, 02, 04, 05, 07, 09, 10, 12,
	05, 07, 09, 10, 12, 14, 16, 17,
	10, 12, 14, 16, 17, 19, 21, 22,
	16, 17, 19, 21, 22, 24, 26, 28,
	21, 22, 24, 26, 28, 29, 31, 33,
	26, 28, 29, 31, 33, 34, 36, 38,
	31, 33, 34, 36, 38, 40, 41, 43,
	36, 38, 40, 41, 43, 45, 46, 48
];

var SCALE_DORIAN_NOTES =
[
	00, 02, 03, 05, 07, 09, 10, 12,
	05, 07, 09, 10, 12, 14, 15, 17,
	10, 12, 14, 15, 17, 19, 21, 22,
	15, 17, 19, 21, 22, 24, 26, 27,
	21, 22, 24, 26, 27, 29, 31, 33,
	26, 27, 29, 31, 33, 34, 36, 38,
	31, 33, 34, 36, 38, 39, 41, 43,
	36, 38, 39, 41, 43, 45, 46, 48
];

var SCALE_LYDIAN_NOTES =
[
	00, 02, 04, 06, 07, 09, 11, 12,
	06, 07, 09, 11, 12, 14, 16, 18,
	11, 12, 14, 16, 18, 19, 21, 23,
	16, 18, 19, 21, 23, 24, 26, 28,
	21, 23, 24, 26, 28, 30, 31, 33,
	26, 28, 30, 31, 33, 35, 36, 38,
	31, 33, 35, 36, 38, 40, 42, 43,
	36, 38, 40, 42, 43, 45, 47, 48
];

var SCALE_LOCRIAN_NOTES =
[
	00, 01, 03, 04, 06, 08, 10, 12,
	04, 06, 08, 10, 12, 13, 15, 16,
	10, 12, 13, 15, 16, 18, 20, 22,
	15, 16, 18, 20, 22, 24, 25, 27,
	20, 22, 24, 25, 27, 28, 30, 32,
	25, 27, 28, 30, 32, 34, 36, 37,
	30, 32, 34, 36, 37, 39, 40, 42,
	36, 37, 39, 40, 42, 44, 46, 48
];

var SCALE_MINOR_GYPSY_NOTES =
[
	00, 01, 04, 05, 07, 08, 10, 12,
	05, 07, 08, 10, 12, 13, 16, 17,
	10, 12, 13, 16, 17, 19, 20, 22,
	16, 17, 19, 20, 22, 24, 25, 28,
	20, 22, 24, 25, 28, 29, 31, 32,
	25, 28, 29, 31, 32, 34, 36, 37,
	31, 32, 34, 36, 37, 40, 41, 43,
	36, 37, 40, 41, 43, 44, 46, 48
];

var SCALE_HUNGARIAN_MINOR_NOTES =
[
	00, 02, 03, 06, 07, 08, 11, 12,
	06, 07, 08, 11, 12, 14, 15, 18,
	11, 12, 14, 15, 18, 19, 20, 23,
	15, 18, 19, 20, 23, 24, 26, 27,
	20, 23, 24, 26, 27, 30, 31, 32,
	26, 27, 30, 31, 32, 35, 36, 38,
	31, 32, 35, 36, 38, 39, 42, 43,
	36, 38, 39, 42, 43, 44, 47, 48
];

var SCALE_BHAIRAV_NOTES =
[
	00, 01, 04, 05, 07, 08, 11, 12,
	05, 07, 08, 11, 12, 13, 16, 17,
	11, 12, 13, 16, 17, 19, 20, 23,
	16, 17, 19, 20, 23, 24, 25, 28,
	20, 23, 24, 25, 28, 29, 31, 32,
	25, 28, 29, 31, 32, 35, 36, 37,
	31, 32, 35, 36, 37, 40, 41, 43,
	36, 37, 40, 41, 43, 44, 47, 48
];

var SCALE_SUPER_LOCRIAN_NOTES =
[
	00, 01, 03, 04, 06, 08, 10, 12,
	04, 06, 08, 10, 12, 13, 15, 16,
	10, 12, 13, 15, 16, 18, 20, 22,
	15, 16, 18, 20, 22, 24, 25, 27,
	20, 22, 24, 25, 27, 28, 30, 32,
	25, 27, 28, 30, 32, 34, 36, 37,
	30, 32, 34, 36, 37, 39, 40, 42,
	36, 37, 39, 40, 42, 44, 46, 48
];

var SCALE_MELODIC_MINOR_NOTES =
[
	00, 02, 03, 05, 07, 09, 11, 12,
	05, 07, 09, 11, 12, 14, 15, 17,
	11, 12, 14, 15, 17, 19, 21, 23,
	15, 17, 19, 21, 23, 24, 26, 27,
	21, 23, 24, 26, 27, 29, 31, 33,
	26, 27, 29, 31, 33, 35, 36, 38,
	31, 33, 35, 36, 38, 39, 41, 43,
	36, 38, 39, 41, 43, 45, 47, 48
];

var SCALE_HARMONIC_MINOR_NOTES =
[
	00, 02, 03, 05, 07, 08, 11, 12,
	05, 07, 08, 11, 12, 14, 15, 17,
	11, 12, 14, 15, 17, 19, 20, 23,
	15, 17, 19, 20, 23, 24, 26, 27,
	20, 23, 24, 26, 27, 29, 31, 32,
	26, 27, 29, 31, 32, 35, 36, 38,
	31, 32, 35, 36, 38, 39, 41, 43,
	36, 38, 39, 41, 43, 44, 47, 48
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


// Scales
var SCALE_CHROMATIC = 0;

var SCALES =
[
	{ name: 'Chromatic', matrix: SCALE_CHROMATIC_NOTES },
	{ name: 'Major', matrix: SCALE_MAJOR_NOTES },
	{ name: 'Minor', matrix: SCALE_MINOR_NOTES },
	{ name: 'Dorian', matrix: SCALE_DORIAN_NOTES },
	{ name: 'Mixolydian', matrix: SCALE_MIXOLYDIAN_NOTES },
	{ name: 'Lydian', matrix: SCALE_LYDIAN_NOTES },
	{ name: 'Phrygian', matrix: SCALE_PHRYGIAN_NOTES },
	{ name: 'Locrian', matrix: SCALE_LOCRIAN_NOTES },
	// { name: 'Diminished', matrix: SCALE_ },
	// { name: 'Whole-half', matrix: SCALE_ },
	// { name: 'Whole Tone', matrix: SCALE_ },
	// { name: 'Minor Blues', matrix: SCALE_ },
	// { name: 'Minor Pentatonic', matrix: SCALE_ },
	// { name: 'Major Pentatonic', matrix: SCALE_ },
	{ name: 'Harmonic Minor', matrix: SCALE_HARMONIC_MINOR_NOTES },
	{ name: 'Melodic Minor', matrix: SCALE_MELODIC_MINOR_NOTES },
	{ name: 'Super Locrian', matrix: SCALE_SUPER_LOCRIAN_NOTES },
	{ name: 'Bhairav', matrix: SCALE_BHAIRAV_NOTES },
	{ name: 'Hungarian Minor', matrix: SCALE_HUNGARIAN_MINOR_NOTES },
	{ name: 'Minor Gypsy', matrix: SCALE_MINOR_GYPSY_NOTES }//,
	// { name: 'Hirojoshi', matrix: SCALE_ },
	// { name: 'In-Sen', matrix: SCALE_ },
	// { name: 'Iwato', matrix: SCALE_ },
	// { name: 'Kumoi', matrix: SCALE_ },
	// { name: 'Pelog', matrix: SCALE_ },
	// { name: 'Spanish', matrix: SCALE_ }
];