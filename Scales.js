// Written by Jürgen Moßgraber - mossgrabers.de
// Additional scales by Alexandre Bique
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// Chromatic scale coloring (rows are in reverse order)
var SCALE_CHROMATIC_COLORS =
[
	PUSH_COLOR_BLUE_LGHT, PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI ,
	PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLUE_LGHT, PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    ,
	PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI ,
	PUSH_COLOR_BLUE_LGHT, PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI ,
	PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLUE_LGHT, PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    ,
	PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI ,
	PUSH_COLOR_BLUE_LGHT, PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI ,
	PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLUE_LGHT, PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    ,
];


var SCALE_DRUM_COLORS =
[
	PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK ,
	PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK ,
	PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI,
	PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI,
	PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK ,
	PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK ,
	PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI,
	PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI , PUSH_COLOR_BLACK    , PUSH_COLOR_BLACK    , PUSH_COLOR_WHITE_HI , PUSH_COLOR_WHITE_HI
];

var NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B' ];

//                    C  G  D  A  E   H  F  Bb  Eb Ab Db Gb
var SCALE_OFFSETS = [ 0, 7, 2, 9, 4, 11, 5, 10, 3, 8, 1, 6 ];
var SCALE_BASES = [ 'C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb' ];

//Scales
var SCALE_CHROMATIC = 0;

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

var SCALE_DRUM =
[
	00, 00, 01, 01, 02, 02, 03, 03,
	00, 00, 01, 01, 02, 02, 03, 03,
	04, 04, 05, 05, 06, 06, 07, 07,
	04, 04, 05, 05, 06, 06, 07, 07,
	08, 08, 09, 09, 10, 10, 11, 11,
	08, 08, 09, 09, 10, 10, 11, 11,
	12, 12, 13, 13, 14, 14, 15, 15,
	12, 12, 13, 13, 14, 14, 15, 15
];

var scaleIntervals = [
	{ name: 'Major', notes: [0, 2, 4, 5, 7, 9, 11] },
	{ name: 'Minor', notes: [0, 2, 3, 5, 7, 8, 10] },
	{ name: 'Dorian', notes: [0, 2, 3, 5, 7, 9, 10] },
	{ name: 'Mixolydian', notes: [0, 2, 4, 5, 7, 9, 10] },
	{ name: 'Lydian', notes: [0, 2, 4, 6, 7, 9, 11] },
	{ name: 'Phrygian', notes: [0, 1, 3, 5, 7, 8, 10] },
	{ name: 'Locrian', notes: [0, 1, 3, 4, 6, 8, 10] },
	// { name: 'Diminished', notes:  },
	// { name: 'Whole-half', notes:  },
	// { name: 'Whole Tone', notes:  },
	// { name: 'Minor Blues', notes:  },
	// { name: 'Minor Pentatonic', notes:  },
	// { name: 'Major Pentatonic', notes:  },
	{ name: 'Harmonic Minor', notes: [0, 2, 3, 5, 7, 8, 11] },
	{ name: 'Melodic Minor', notes: [0, 2, 3, 5, 7, 9, 11] },
	{ name: 'Super Locrian', notes: [0, 1, 3, 4, 6, 8, 10] },
	{ name: 'Bhairav', notes: [0, 1, 4, 5, 7, 8, 11] },
	{ name: 'Hungarian Minor', notes: [0, 2, 3, 6, 7, 8, 11] },
	{ name: 'Minor Gypsy', notes: [0, 1, 4, 5, 7, 8, 10] }//,
	// { name: 'Hirojoshi', notes:  },
	// { name: 'In-Sen', notes:  },
	// { name: 'Iwato', notes:  },
	// { name: 'Kumoi', notes:  },
	// { name: 'Pelog', notes:  },
	// { name: 'Spanish', notes:  }
	
];

function Scales()
{
}

// TODO eventually refactor all scales and constants into Scales class
var SCALES = [
    {name: 'Chromatic', matrix: SCALE_CHROMATIC_NOTES},
];

Scales.createScales = function()
{
	for (var i = 0; i < scaleIntervals.length; i++)
		Scales.createScale(scaleIntervals[i]);
};

Scales.createScale = function(scale)
{
	var len = scale.notes.length;
	var matrix = [];
	for (var row = 0; row < 8; row++)
	{
		for (var column = 0; column < 8; column++)
		{
			var offset = row * 3 + column;
			matrix.push((Math.floor(offset / len)) * 12 + scale.notes[offset % len]);			
		}
	}
	SCALES.push({name:scale.name, matrix:matrix});
};
var DRUM = [
    {name: 'Drums', matrix: SCALE_DRUM},
]

//for (var i = 0; i < scaleIntervals.length; i++) {
//	println("----------------------------------");
//	println(SCALES[i].name);
//	println(SCALES[i].matrix);
//}
