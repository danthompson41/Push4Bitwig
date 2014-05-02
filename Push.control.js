// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// Display Modes
var MODE_TRACK  = 0;
var MODE_VOLUME = 1;
var MODE_DEVICE = 2;
var MODE_MASTER = 3;
var MODE_PAN    = 4;
var MODE_SEND1  = 5;
var MODE_SEND2  = 6;
var MODE_SEND3  = 7;
var MODE_SEND4  = 8;
var MODE_SEND5  = 9;
var MODE_SEND6  = 10;
var MODE_SCALES = 11;

// Static  Headers
var PARAM_NAMES_MASTER = 'Volume   Pan                                                        ';
var PARAM_NAMES_TRACK  = 'Volume   Pan     Send 1   Send 2  Send 3   Send 4  Send 5   Send 6  ';
var PARAM_NAMES_VOLUME = 'Volume   Volume  Volume   Volume  Volume   Volume  Volume   Volume  ';
var PARAM_NAMES_PAN    = 'Pan      Pan     Pan      Pan     Pan      Pan     Pan      Pan     ';
var PARAM_NAMES_SEND   =
[
	'Send 1   Send 1  Send 1   Send 1  Send 1   Send 1  Send 1   Send 1  ',
	'Send 2   Send 2  Send 2   Send 2  Send 2   Send 2  Send 2   Send 2  ',
	'Send 3   Send 3  Send 3   Send 3  Send 3   Send 3  Send 3   Send 3  ',
	'Send 4   Send 4  Send 4   Send 4  Send 4   Send 4  Send 4   Send 4  ',
	'Send 5   Send 5  Send 5   Send 5  Send 5   Send 5  Send 5   Send 5  ',
	'Send 6   Send 6  Send 6   Send 6  Send 6   Send 6  Send 6   Send 6  '
];

var BITWIG_COLORS =
[
	[ 0.3294117748737335 , 0.3294117748737335 , 0.3294117748737335 , 1],	// Dark Gray
	[ 0.47843137383461   , 0.47843137383461   , 0.47843137383461   , 2],	// Gray
	[ 0.7882353067398071 , 0.7882353067398071 , 0.7882353067398071 , 3],	// Light Gray
	[ 0.5254902243614197 , 0.5372549295425415 , 0.6745098233222961 , 40], 	// Silver
	[ 0.6392157077789307 , 0.4745098054409027 , 0.26274511218070984, 11],	// Dark Brown
	[ 0.7764706015586853 , 0.6235294342041016 , 0.43921568989753723, 12],	// Brown
	[ 0.34117648005485535, 0.3803921639919281 , 0.7764706015586853 , 42],	// Dark Blue
	[ 0.5176470875740051 , 0.5411764979362488 , 0.8784313797950745 , 44],	// Light Blue
	[ 0.5843137502670288 , 0.2862745225429535 , 0.7960784435272217 , 58],	// Purple
	[ 0.8509804010391235 , 0.21960784494876862, 0.4431372582912445 , 57],	// Pink
	[ 0.8509804010391235 , 0.18039216101169586, 0.1411764770746231 , 6],	// Red
	[ 1                  , 0.34117648005485535, 0.0235294122248888 , 60],	// Orange
	[ 0.8509804010391235 , 0.615686297416687  , 0.062745101749897  , 62],	// Light Orange
	[ 0.45098039507865906, 0.5960784554481506 , 0.0784313753247261 , 18],	// Green
	[ 0                  , 0.615686297416687  , 0.27843138575553894, 26],	// Cold Green
	[ 0                  , 0.6509804129600525 , 0.5803921818733215 , 30],	// Bluish Green
	[ 0                  , 0.6000000238418579 , 0.8509804010391235 , 37],	// Light Blue
	[ 0.7372549176216125 , 0.4627451002597809 , 0.9411764740943909 , 48],	// Light Purple
	[ 0.8823529481887817 , 0.4000000059604645 , 0.5686274766921997 , 56],	// Light Pink
	[ 0.9254902005195618 , 0.3803921639919281 , 0.34117648005485535, 4],	// Skin
	[ 1                  , 0.5137255191802979 , 0.24313725531101227, 10],	// Redish Brown
	[ 0.8941176533699036 , 0.7176470756530762 , 0.30588236451148987, 61],	// Light Brown
	[ 0.6274510025978088 , 0.7529411911964417 , 0.2980392277240753 , 18],	// Light Green
	[ 0.24313725531101227, 0.7333333492279053 , 0.3843137323856354 , 25],	// Bluish Green
	[ 0.26274511218070984, 0.8235294222831726 , 0.7254902124404907 , 32],	// Light Blue
	[ 0.2666666805744171 , 0.7843137383460999 , 1                  , 41]	// Blue
];

var INC_FRACTION_VALUE     = 1;
var INC_FRACTION_TIME      = 1.0;	    // 1 beat
var INC_FRACTION_TIME_SLOW = 1.0 / 20;	// 1/20th of a beat
var TEMPO_RESOLUTION       = 647;

var VIEW_PLAY       = 0;
var VIEW_SESSION    = 1;
var VIEW_SEQUENCER  = 2;
var VIEW_PLAY_DRUMS = 3;


loadAPI(1);
load("Utilities.js");
load("MidiOutput.js");
load("View.js");
load("BaseView.js");
load("Push.js");
load("Scales.js");
load("PlayView.js");
load("PlayViewDrums.js");
load("SessionView.js");
load("SequencerView.js");

var previousMode = null;
var currentMode = MODE_TRACK;
var tempo = 120;
var master =
{ 
	selected: false,
	canHoldNotes: false,
	sends: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }],
};

var tracks = [];
for (var i = 0; i < 8; i++)
	tracks[i] = 
	{ 
		index: i,
		selected: false,
		sends: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }],
		slots: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }, { index: 6 }, { index: 7 }]
	};
var fxparams = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
var selectedDevice =
{
	name: 'None',
	hasPreviousDevice: false, 
	hasNextDevice: false
};
var transport = null;
var application = null;
var device = null;
var masterTrack = null;
var trackBank = null;
var cursorTrack = null;
var noteInput = null;

var currentScaleOffset = 0; // C
var currentScale       = 1;	// Major
var currentOctave      = 0;

var output        = null;
var push          = null;
var playView      = null;
var playViewDrums = null;
var sessionView   = null;
var sequencerView = null;

host.defineController ("Ableton", "Push", "1.0", "D69AFBF0-B71E-11E3-A5E2-0800200C9A66");
host.defineMidiPorts (1, 1);
host.addDeviceNameBasedDiscoveryPair (["MIDIIN2 (Ableton Push)"], ["MIDIOUT2 (Ableton Push)"]);
host.addDeviceNameBasedDiscoveryPair (["Ableton Push MIDI 2"], ["Ableton Push MIDI 2"]);

function init()
{
	var port = host.getMidiInPort(0);
	port.setMidiCallback (onMidi);
	noteInput = port.createNoteInput ("Ableton Push", "80????", "90????", "E0????");
	noteInput.setShouldConsumeEvents (false);
	
	application = host.createApplication ();
	device = host.createCursorDevice();
	transport = host.createTransport ();
	masterTrack = host.createMasterTrack (0);
	trackBank = host.createMainTrackBankSection (8, 6, 8);

	output = new MidiOutput ();
	push = new Push (output);
	playView = new PlayView ();
	playViewDrums = new PlayViewDrums ();
	sessionView = new SessionView ();
	sequencerView = new SequencerView ();
	push.addView (VIEW_PLAY, playView);
	push.addView (VIEW_PLAY_DRUMS, playViewDrums);
	push.addView (VIEW_SESSION, sessionView);
	push.addView (VIEW_SEQUENCER, sequencerView);


	
	// Click
	transport.addClickObserver (function (isOn)
	{
		push.setButton (PUSH_BUTTON_CLICK, isOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	});
	// Play
	transport.addIsPlayingObserver (function (isPlaying)
	{
		push.setButton (PUSH_BUTTON_PLAY, isPlaying ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	});
	// Record
	transport.addIsRecordingObserver (function (isRecording)
	{
		push.setButton (PUSH_BUTTON_RECORD, isRecording ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	});
	// Tempo
	transport.getTempo ().addValueObserver(TEMPO_RESOLUTION, function (value)
	{
		tempo = value;
	});
	
	// Master Track name
	masterTrack.addNameObserver (8, '', function (name)
	{
		master.name = name;
	});
	// Master Track selection
	masterTrack.addIsSelectedObserver (function (isSelected)
	{
		master.selected = isSelected;
		if (isSelected)
			previousMode = currentMode;
		currentMode = isSelected ? MODE_MASTER : (previousMode ? previousMode : MODE_TRACK);
		updateMode ();
	});
	
	// Master Track Mute
	masterTrack.getMute ().addValueObserver (function (isMuted)
	{
		master.mute = isMuted;
	});
	// Master Track Solo
	masterTrack.getSolo ().addValueObserver (function (isSoloed)
	{
		master.solo = isSoloed;
	});
	// Master Track Arm
	masterTrack.getArm ().addValueObserver (function (isArmed)
	{
		master.recarm = isArmed;
	});
	
	// Master Track volume value & text
	var v = masterTrack.getVolume ();
	v.addValueObserver (128, function (value)
	{
		master.volume = value;
	});
	v.addValueDisplayObserver (8, "", function (text)
	{
		master.volumeStr = text;
	});
	
	// Master Track Pan value & text
	var p = masterTrack.getPan ();
	p.addValueObserver (128, function (value)
	{
		master.pan = value;
	});
	p.addValueDisplayObserver (8, "", function (text)
	{
		master.panStr = text;
	});
	
	for (var i = 0; i < 8; i++)
	{
		var t = trackBank.getTrack (i);
		
		// Track name
		t.addNameObserver (8, '', doIndex (i, function (index, name)
		{
			tracks[index].name = name;
		}));
		// Track selection
		t.addIsSelectedObserver (doIndex (i, function (index, isSelected)
		{
			tracks[index].selected = isSelected;
			if (isSelected)
			{
				if (currentMode == MODE_MASTER)
				{
					if (previousMode != MODE_MASTER && previousMode != MODE_SCALES)
						currentMode = previousMode;
					else
						currentMode = MODE_TRACK;
				}
				updateMode ();
			}
			if (push.isActiveView (VIEW_PLAY))
				push.getActiveView ().updateNoteMapping ();
		}));
		
		// Track Mute
		t.getMute ().addValueObserver (doIndex (i, function (index, isMuted)
		{
			tracks[index].mute = isMuted;
		}));
		// Track Solo
		t.getSolo ().addValueObserver (doIndex (i, function (index, isSoloed)
		{
			tracks[index].solo = isSoloed;
		}));
		// Track Arm
		t.getArm ().addValueObserver (doIndex (i, function (index, isArmed)
		{
			tracks[index].recarm = isArmed;
		}));
		
		// Track volume value & text
		var v = t.getVolume ();
		v.addValueObserver (128, doIndex (i, function (index, value)
		{
			tracks[index].volume = value;
		}));
		v.addValueDisplayObserver (8, "", doIndex (i, function (index, text)
		{
			tracks[index].volumeStr = text;
		}));
		
		// Track Pan value & text
		var p = t.getPan ();
		p.addValueObserver (128, doIndex (i, function (index, value)
		{
			tracks[index].pan = value;
		}));
		p.addValueDisplayObserver (8, "", doIndex (i, function (index, text)
		{
			tracks[index].panStr = text;
		}));

		// Can hold note data?
		t.getCanHoldNoteData ().addValueObserver (doIndex (i, function (index, canHoldNotes)
		{
			tracks[index].canHoldNotes = canHoldNotes;
		}));
		
		// Slot content changes
		var cs = t.getClipLauncherSlots ();
		cs.addIsSelectedObserver (doIndex (i, function (index, slot, isSelected)
		{
			tracks[index].slots[slot].isSelected = isSelected;
		}));
		cs.addHasContentObserver (doIndex (i, function (index, slot, hasContent)
		{
			tracks[index].slots[slot].hasContent = hasContent;
		}));
		cs.addColorObserver (doIndex (i, function (index, slot, red, green, blue)
		{
			tracks[index].slots[slot].color = getColorIndex (red, green, blue);
		}));
		cs.addIsPlayingObserver (doIndex (i, function (index, slot, isPlaying)
		{
			tracks[index].slots[slot].isPlaying = isPlaying;
		}));
		cs.addIsRecordingObserver (doIndex (i, function (index, slot, isRecording)
		{
			tracks[index].slots[slot].isRecording = isRecording;
		}));
		cs.addIsQueuedObserver (doIndex (i, function (index, slot, isQueued)
		{
			tracks[index].slots[slot].isQueued = isQueued;
		}));
		
		// 6 Sends values & texts
		for (var j = 0; j < 6; j++)
		{
			var s = t.getSend (j);
			s.addValueObserver (128, doDoubleIndex (i, j, function (index1, index2, value)
			{
				tracks[index1].sends[index2].volume = value;
			}));
			s.addValueDisplayObserver (8, "", doDoubleIndex (i, j, function (index1, index2, text)
			{
				tracks[index1].sends[index2].volumeStr = text;
			}));
		}
	}
	
	// Device
	device.addIsEnabledObserver (function (isEnabled)
	{
		selectedDevice.enabled = isEnabled;
	});
	device.addNameObserver (34, 'None', function (name)
	{
		selectedDevice.name = name;
	});
	
	for (var i = 0; i < 8; i++)
	{
		var p = device.getParameter (i);
		
		// Parameter name
		p.addNameObserver (8, '', doIndex (i, function (index, name)
		{
			fxparams[index].name = name;
		}));
		p.addValueObserver (128, doIndex (i, function (index, value)
		{
			fxparams[index].value = value;
		}));
		// Parameter value text
		p.addValueDisplayObserver (8, "",  doIndex (i, function (index, value)
		{
			fxparams[index].valueStr = value;
		}));
	}
	
	updateMode ();
	push.setActiveView (VIEW_PLAY);
	
	println ("Initialized.");
}

function exit()
{
	this.push.turnOff ();
}

function flush ()
{
	updateDisplay ();
	push.display.flush ();
	push.redrawGrid ();
}

function onMidi (status, data1, data2)
{
	push.handleMidi (status, data1, data2);
}

function getSelectedTrack ()
{
	for (var i = 0; i < 8; i++)
		if (tracks[i].selected)
			return tracks[i];
	return null;
}

function getSelectedSlot (track)
{
	for (var i = 0; i < track.slots.length; i++)
		if (track.slots[i].isSelected)
			return i;
	return -1;
}

function updateMode ()
{
	push.setButton (PUSH_BUTTON_MASTER, currentMode == MODE_MASTER ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_SCALES, currentMode == MODE_SCALES ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_DEVICE, currentMode == MODE_DEVICE ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_TRACK, currentMode == MODE_TRACK ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_VOLUME, currentMode == MODE_VOLUME ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	push.setButton (PUSH_BUTTON_PAN_SEND, currentMode >= MODE_PAN && currentMode <= MODE_SEND6 ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
}

function updateDisplay ()
{
	var t = getSelectedTrack ();
	var d = push.display;
	
	switch (currentMode)
	{
		case MODE_MASTER:
			d.setRow (0, PARAM_NAMES_MASTER)
			 .setCell (1, 0, master.volumeStr, PushDisplay.FORMAT_RAW)
			 .setCell (1, 1, master.panStr, PushDisplay.FORMAT_RAW)
			 .clearCell (1, 2).clearCell (1, 3).clearCell (1, 4).clearCell (1, 5)
			 .clearCell (1, 6).clearCell (1, 7).done (1)
			
			 .setCell (2, 0, master.volume, PushDisplay.FORMAT_VALUE)
			 .setCell (2, 1, master.pan, PushDisplay.FORMAT_PAN)
			 .clearCell (2, 2).clearCell (2, 3).clearCell (2, 4).clearCell (2, 5)
			 .clearCell (2, 6).clearCell (2, 7).done (2)
			
			 .setCell (3, 0, master.name, PushDisplay.FORMAT_RAW)
			 .clearCell (3, 1).clearCell (3, 2).clearCell (3, 3).clearCell (3, 4).clearCell (3, 5)
			 .clearCell (3, 6).clearCell (3, 7).done (3);

			for (var i = 0; i < 8; i++)
			{
				push.setButton (20 + i, PUSH_COLOR_BLACK);
				push.setButton (102 + i, PUSH_COLOR_BLACK);
			}
			return;
	
		case MODE_TRACK:
			d.setRow (0, PARAM_NAMES_TRACK);
			if (t == null)
				d.clearRow (1).clearRow (2);
			else
			{
				d.setCell (1, 0, t.volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (1, 1, t.panStr, PushDisplay.FORMAT_RAW)
				 .setCell (1, 2, t.sends[0].volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (1, 3, t.sends[1].volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (1, 4, t.sends[2].volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (1, 5, t.sends[3].volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (1, 6, t.sends[4].volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (1, 7, t.sends[5].volumeStr, PushDisplay.FORMAT_RAW)
				 .done (1)
				
				 .setCell (2, 0, t.volume, PushDisplay.FORMAT_VALUE)
				 .setCell (2, 1, t.pan, PushDisplay.FORMAT_PAN)
				 .setCell (2, 2, t.sends[0].volume, PushDisplay.FORMAT_VALUE)
				 .setCell (2, 3, t.sends[1].volume, PushDisplay.FORMAT_VALUE)
				 .setCell (2, 4, t.sends[2].volume, PushDisplay.FORMAT_VALUE)
				 .setCell (2, 5, t.sends[3].volume, PushDisplay.FORMAT_VALUE)
				 .setCell (2, 6, t.sends[4].volume, PushDisplay.FORMAT_VALUE)
				 .setCell (2, 7, t.sends[5].volume, PushDisplay.FORMAT_VALUE)
				 .done (2);
			}
			break;

		case MODE_VOLUME:
			for (var i = 0; i < 8; i++)
			{
				d.setCell (1, i, tracks[i].volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (2, i, tracks[i].volume, PushDisplay.FORMAT_VALUE);
			}
			d.setRow (0, PARAM_NAMES_VOLUME).done (1).done (2);
			break;
			
		case MODE_PAN:
			for (var i = 0; i < 8; i++)
			{
				d.setCell (1, i, tracks[i].panStr, PushDisplay.FORMAT_RAW)
				 .setCell (2, i, tracks[i].pan, PushDisplay.FORMAT_PAN);
			}
			d.setRow (0, PARAM_NAMES_PAN).done (1).done (2);
			break;

		case MODE_SEND1:
		case MODE_SEND2:
		case MODE_SEND3:
		case MODE_SEND4:
		case MODE_SEND5:
		case MODE_SEND6:
			var sendNo = currentMode - MODE_SEND1;
			for (var i = 0; i < 8; i++)
			{
				d.setCell (1, i, tracks[i].sends[sendNo].volumeStr, PushDisplay.FORMAT_RAW)
				 .setCell (2, i, tracks[i].sends[sendNo].volume, PushDisplay.FORMAT_VALUE);
			}
			d.setRow (0, PARAM_NAMES_SEND[sendNo]).done (1).done (2);
			break;
			
		case MODE_DEVICE:
			for (var i = 0; i < 8; i++)
			{
				var isEmpty = fxparams[i].name.length == 0;
				d.setCell (0, i, fxparams[i].name, PushDisplay.FORMAT_RAW)
				 .setCell (1, i, isEmpty ? '' : fxparams[i].valueStr, PushDisplay.FORMAT_RAW);
				if (isEmpty)
					d.clearCell (2, i);
				else				
					d.setCell (2, i, fxparams[i].value, PushDisplay.FORMAT_VALUE);
							
				// Light up fx selection buttons
				push.setButton (20 + i, i == 7 && selectedDevice.enabled ? PUSH_COLOR_GREEN_LO - 4 : PUSH_COLOR_BLACK);
				push.setButton (102 + i, PUSH_COLOR_BLACK);
			}
			d.done (0).done (1).done (2)
			 .setCell (3, 0, 'Selected', PushDisplay.FORMAT_RAW).setCell (3, 1, 'Device: ', PushDisplay.FORMAT_RAW)
			 .setBlock (3, 1, selectedDevice.name)
			 .clearBlock (3, 2).clearCell (3, 6)
			 .setCell (3, 7, selectedDevice.enabled ? 'Enabled' : 'Disabled').done (3);
			break;
			
		case MODE_SCALES:
			var o = 2 + currentOctave;
			var noteName = NOTE_NAMES[SCALE_OFFSETS[currentScaleOffset]];
			d.setBlock (0, 0, RIGHT_ARROW + SCALES[currentScale].name)
			 .clearBlock (0, 1)
			 .clearBlock (0, 2)
			 .setBlock (0, 3, noteName + o + ' to ' + noteName + (o + 4))
			 .done (0);
			 
			d.setBlock (1, 0, currentScale + 1 < SCALES.length ? ' ' + SCALES[currentScale + 1].name : '')
			 .clearBlock (1, 1)
			 .clearBlock (1, 2)
			 .clearBlock (1, 3)
			 .done (1);
			 
			d.setCell (2, 0, currentScale + 2 < SCALES.length ? ' ' + SCALES[currentScale + 2].name : '');
			for (var i = 0; i < 6; i++)
				d.setCell (2, i + 1, '  ' + (currentScaleOffset == i ? RIGHT_ARROW : ' ') + SCALE_BASES[i]);
			d.clearCell (2, 7).done (2);
			 
			d.setCell (3, 0, currentScale + 3 < SCALES.length ? ' ' + SCALES[currentScale + 3].name : '');
			for (var i = 6; i < 12; i++)
				d.setCell (3, i - 5, '  ' + (currentScaleOffset == i ? RIGHT_ARROW : ' ') + SCALE_BASES[i]);
			d.clearCell (3, 7).done (3);

			for (var i = 0; i < 8; i++)
			{
				push.setButton (20 + i, i == 0 || i == 7 ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_GREEN_LO-4);
				push.setButton (102 + i, i == 0 || i == 7 ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_GREEN_LO);
			}
			break;
	}
	
	if (currentMode == MODE_DEVICE || currentMode == MODE_SCALES || currentMode == MODE_MASTER)
		return;

	// Send, Mute, Automation
	if (t == null)
	{
		push.setButton (PUSH_BUTTON_MUTE, PUSH_BUTTON_STATE_OFF);
		push.setButton (PUSH_BUTTON_SOLO, PUSH_BUTTON_STATE_OFF);
		push.setButton (PUSH_BUTTON_AUTOMATION, PUSH_BUTTON_STATE_OFF);
	}
	else
	{
		push.setButton (PUSH_BUTTON_MUTE, t.mute ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		push.setButton (PUSH_BUTTON_SOLO, t.solo ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		push.setButton (PUSH_BUTTON_AUTOMATION, t.autowrite ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	}

	// Format track names
	var sel = t == null ? -1 : t.index;
	for (var i = 0; i < 8; i++)
	{
		var isSel = i == sel;
		var n = optimizeName (tracks[i].name, isSel ? 7 : 8);
		d.setCell (3, i, isSel ? RIGHT_ARROW + n : n, PushDisplay.FORMAT_RAW)
		
		// Light up selection and record/monitor buttons
		push.setButton (20 + i, isSel ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
		if (push.isShiftPressed ())
			push.setButton (102 + i, tracks[i].monitor ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLACK);
		else
			push.setButton (102 + i, tracks[i].recarm ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK);
	}
	d.done (3);
}

function getColorIndex (red, green, blue)
{
	for (var i = 0; i < BITWIG_COLORS.length; i++)
	{
		var color = BITWIG_COLORS[i];
		if (Math.abs (color[0] - red ) < 0.0001 &&
			Math.abs (color[1] - green) < 0.0001 &&
			Math.abs (color[2] - blue) < 0.0001)
			return color[3];
	}
	return null;
}

function changeValue (control, value)
{
	return control <= 61 ? Math.min (value + INC_FRACTION_VALUE, 127) : Math.max (value - INC_FRACTION_VALUE, 0);
}
