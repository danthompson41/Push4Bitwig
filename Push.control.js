// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

// NOT POSSIBLE?
// - Add Effect
// - Add Track
// - Quantize
// - Toggle Monitor
// TODOs
// - Drum View

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

var VIEW_PLAY      = 0;
var VIEW_SESSION   = 1;
var VIEW_SEQUENCER = 2;


loadAPI(1);
load("Utilities.js");
load("MidiOutput.js");
load("View.js");
load("BaseView.js");
load("Push.js");
load("Scales.js");
load("PlayView.js");
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
		slots: [{}, {}, {}, {}, {}, {}, {}, {}]
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
var currentScale       = SCALE_MAJOR;
var currentOctave      = 0;

var output        = null;
var push          = null;
var playView      = null;
var sessionView   = null;
var sequencerView = null;

host.defineController ("Ableton", "Push", "1.0", "D69AFBF0-B71E-11E3-A5E2-0800200C9A66");
host.defineMidiPorts (1, 1);
host.addDeviceNameBasedDiscoveryPair (["MIDIIN2 (Ableton Push)"], ["MIDIOUT2 (Ableton Push)"]);
host.addDeviceNameBasedDiscoveryPair (["Ableton Push MIDI 2"], ["Ableton Push MIDI 2"]);


function init()
{
	output = new MidiOutput ();
	push = new Push (output);
	playView = new PlayView ();
	sessionView = new SessionView ();
	sequencerView = new SequencerView ();
	push.addView (VIEW_PLAY, playView);
	push.addView (VIEW_SESSION, sessionView);
	push.addView (VIEW_SEQUENCER, sequencerView);

	var port = host.getMidiInPort(0);
	port.setMidiCallback (onMidi);
	noteInput = host.getMidiInPort (0).createNoteInput ("Ableton Push", "80????", "90????", "E0????");
	noteInput.setShouldConsumeEvents (false);
	application = host.createApplication ();
	device = host.createCursorDevice();
	transport = host.createTransport ();
	masterTrack = host.createMasterTrack (0);
	trackBank = host.createMainTrackBankSection (8, 6, 8);
	
	// Click
	transport.addClickObserver (function (isOn)
	{
		output.sendCC (9, isOn ? BUTTON_ON : BUTTON_OFF);
	});
	// Play
	transport.addIsPlayingObserver (function (isPlaying)
	{
		output.sendCC (85, isPlaying ? BUTTON_ON : BUTTON_OFF);
	});
	// Record
	transport.addIsRecordingObserver (function (isRecording)
	{
		output.sendCC (86, isRecording ? BUTTON_ON : BUTTON_OFF);
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
		updateDisplay ();
	});
	// Master Track selection
	masterTrack.addIsSelectedObserver (function (isSelected)
	{
		master.selected = isSelected;
		if (isSelected)
			previousMode = currentMode;
		currentMode = isSelected ? MODE_MASTER : (previousMode ? previousMode : MODE_TRACK);
		updateDisplay ();
		updateMode ();
	});
	
	// Master Track Mute
	masterTrack.getMute ().addValueObserver (function (isMuted)
	{
		master.mute = isMuted;
		updateDisplay ();
	});
	// Master Track Solo
	masterTrack.getSolo ().addValueObserver (function (isSoloed)
	{
		master.solo = isSoloed;
		updateDisplay ();
	});
	// Master Track Arm
	masterTrack.getArm ().addValueObserver (function (isArmed)
	{
		master.recarm = isArmed;
		updateDisplay ();
	});
	
	// Master Track volume value & text
	var v = masterTrack.getVolume ();
	v.addValueObserver (128, function (value)
	{
		master.volume = value;
		updateDisplay (true);
	});
	v.addValueDisplayObserver (8, "", function (text)
	{
		master.volumeStr = text;
		updateDisplay (true);
	});
	
	// Master Track Pan value & text
	var p = masterTrack.getPan ();
	p.addValueObserver (128, function (value)
	{
		master.pan = value;
		updateDisplay (true);
	});
	p.addValueDisplayObserver (8, "", function (text)
	{
		master.panStr = text;
		updateDisplay (true);
	});
	
	
	trackBank.addCanScrollScenesDownObserver (function (canScroll)
	{
		sessionView.canScrollUp = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			sessionView.updateArrows ();
	});
	trackBank.addCanScrollScenesUpObserver (function (canScroll)
	{
		sessionView.canScrollDown = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			sessionView.updateArrows ();
	});
	trackBank.addCanScrollTracksDownObserver (function (canScroll)
	{
		sessionView.canScrollRight = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			sessionView.updateArrows ();
	});
	trackBank.addCanScrollTracksUpObserver (function (canScroll)
	{
		sessionView.canScrollLeft = canScroll;
		if (push.isActiveView (VIEW_SESSION))
			sessionView.updateArrows ();
	});
	
	for (var i = 0; i < 8; i++)
	{
		var t = trackBank.getTrack (i);
		
		// Track name
		t.addNameObserver (8, '', doIndex (i, function (index, name)
		{
			tracks[index].name = name;
			updateDisplay ();
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
			updateDisplay ();
			if (push.isActiveView (VIEW_PLAY))
			{
				push.redrawGrid ();
				push.getActiveView ().updateNoteMapping ();
			}
		}));
		
		// Track Mute
		t.getMute ().addValueObserver (doIndex (i, function (index, isMuted)
		{
			tracks[index].mute = isMuted;
			updateDisplay ();
		}));
		// Track Solo
		t.getSolo ().addValueObserver (doIndex (i, function (index, isSoloed)
		{
			tracks[index].solo = isSoloed;
			updateDisplay ();
		}));
		// Track Arm
		t.getArm ().addValueObserver (doIndex (i, function (index, isArmed)
		{
			tracks[index].recarm = isArmed;
			updateDisplay ();
			if (push.isActiveView (VIEW_SESSION))
				push.redrawGrid ();
		}));
		
		// Track volume value & text
		var v = t.getVolume ();
		v.addValueObserver (128, doIndex (i, function (index, value)
		{
			tracks[index].volume = value;
			updateDisplay (true);
		}));
		v.addValueDisplayObserver (8, "", doIndex (i, function (index, text)
		{
			tracks[index].volumeStr = text;
			updateDisplay (true);
		}));
		
		// Track Pan value & text
		var p = t.getPan ();
		p.addValueObserver (128, doIndex (i, function (index, value)
		{
			tracks[index].pan = value;
			updateDisplay (true);
		}));
		p.addValueDisplayObserver (8, "", doIndex (i, function (index, text)
		{
			tracks[index].panStr = text;
			updateDisplay (true);
		}));

		// Can hold note data?
		t.getCanHoldNoteData ().addValueObserver (doIndex (i, function (index, canHoldNotes)
		{
			tracks[index].canHoldNotes = canHoldNotes;
			if (push.isActiveView (VIEW_PLAY))
				push.redrawGrid ();
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
			if (push.isActiveView (VIEW_SESSION))
				push.redrawGrid (index, slot);
		}));
		cs.addColorObserver (doIndex (i, function (index, slot, red, green, blue)
		{
			tracks[index].slots[slot].color = getColorIndex (red, green, blue);
			if (push.isActiveView (VIEW_SESSION))
				push.redrawGrid (index, slot);
		}));
		cs.addIsPlayingObserver (doIndex (i, function (index, slot, isPlaying)
		{
			tracks[index].slots[slot].isPlaying = isPlaying;
			if (push.isActiveView (VIEW_SESSION))
				push.redrawGrid (index, slot);
		}));
		cs.addIsRecordingObserver (doIndex (i, function (index, slot, isRecording)
		{
			tracks[index].slots[slot].isRecording = isRecording;
			if (push.isActiveView (VIEW_SESSION))
				push.redrawGrid (index, slot);
		}));
		cs.addIsQueuedObserver (doIndex (i, function (index, slot, isQueued)
		{
			tracks[index].slots[slot].isQueued = isQueued;
			if (push.isActiveView (VIEW_SESSION))
				push.redrawGrid (index, slot);
		}));
		
		// 6 Sends values & texts
		for (var j = 0; j < 6; j++)
		{
			var s = t.getSend (j);
			s.addValueObserver (128, doDoubleIndex (i, j, function (index1, index2, value)
			{
				tracks[index1].sends[index2].volume = value;
				updateDisplay (true);
			}));
			s.addValueDisplayObserver (8, "", doDoubleIndex (i, j, function (index1, index2, text)
			{
				tracks[index1].sends[index2].volumeStr = text;
				updateDisplay (true);
			}));
		}
	}
	
	// Device
	device.addIsEnabledObserver (function (isEnabled)
	{
		selectedDevice.enabled = isEnabled;
		updateDisplay ();
	});
	device.addNameObserver (34, 'None', function (name)
	{
		selectedDevice.name = name;
		updateDisplay ();
	});
	
	for (var i = 0; i < 8; i++)
	{
		var p = device.getParameter (i);
		
		// Parameter name
		p.addNameObserver (8, '', doIndex (i, function (index, name)
		{
			fxparams[index].name = name;
			updateDisplay ();
		}));
		p.addValueObserver (128, doIndex (i, function (index, value)
		{
			fxparams[index].value = value;
			updateDisplay (true);
		}));
		// Parameter value text
		p.addValueDisplayObserver (8, "",  doIndex (i, function (index, value)
		{
			fxparams[index].valueStr = value;
			updateDisplay (true);
		}));
	}
	
	playView.onNote ();
	
	updateMode ();
	
	println ("Initialized.");
}

function exit()
{
	this.push.turnOff ();
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
	output.sendCC (PUSH_BUTTON_MASTER, currentMode == MODE_MASTER ? BUTTON_ON : BUTTON_OFF);
	output.sendCC (PUSH_BUTTON_SCALES, currentMode == MODE_SCALES ? BUTTON_ON : BUTTON_OFF);
	output.sendCC (PUSH_BUTTON_DEVICE, currentMode == MODE_DEVICE ? BUTTON_ON : BUTTON_OFF);
	output.sendCC (PUSH_BUTTON_TRACK, currentMode == MODE_TRACK ? BUTTON_ON : BUTTON_OFF);
	output.sendCC (PUSH_BUTTON_VOLUME, currentMode == MODE_VOLUME ? BUTTON_ON : BUTTON_OFF);
	output.sendCC (PUSH_BUTTON_PAN_SEND, currentMode >= MODE_PAN && currentMode <= MODE_SEND6 ? BUTTON_ON : BUTTON_OFF);
}

function updateDisplay (valueChange)
{
	var t = getSelectedTrack ();
	
	switch (currentMode)
	{
		case MODE_MASTER:
			if (!valueChange)
				push.sendRow (0, PARAM_NAMES_MASTER);
			
			push.sendRow (1, 
				pad (master.volumeStr, 8, ' ') + ' ' +
				pad (master.panStr, 8, ' ') +
				pad ('', 17, ' ') +
				pad ('', 34, ' '));
		
			push.sendRow (2, 
				formatVolume (master.volume, 8) + ' ' +
				formatPan (master.pan, 8) +
				pad ('', 17, ' ') +
				pad ('', 34, ' '));
			
			if (!valueChange)
			{
				push.sendRow (3, pad (master.name, 34, ' ') + pad ('', 34, ' '));
				for (var i = 0; i < 8; i++)
				{
					output.sendCC (20 + i, BLACK);
					output.sendCC (102 + i, BLACK);
				}
			}
			return;
	
		case MODE_TRACK:
			if (!valueChange)
				push.sendRow (0, PARAM_NAMES_TRACK);
			
			if (t == null)
			{
				push.clearRow (1);
				push.clearRow (2);
			}
			else
			{
				push.sendRow (1, 
					pad (t.volumeStr, 8, ' ') + ' ' +
					pad (t.panStr, 8, ' ') +
					pad (t.sends[0].volumeStr, 8, ' ') + ' ' +
					pad (t.sends[1].volumeStr, 8, ' ') +
					pad (t.sends[2].volumeStr, 8, ' ') + ' ' +
					pad (t.sends[3].volumeStr, 8, ' ') +
					pad (t.sends[4].volumeStr, 8, ' ') + ' ' +
					pad (t.sends[5].volumeStr, 8, ' '));
			
				push.sendRow (2, 
					formatVolume (t.volume, 8) + ' ' +
					formatPan (t.pan, 8) +
					formatVolume (t.sends[0].volume) + ' ' +
					formatVolume (t.sends[1].volume) +
					formatVolume (t.sends[2].volume) + ' ' +
					formatVolume (t.sends[3].volume) +
					formatVolume (t.sends[4].volume) + ' ' +
					formatVolume (t.sends[5].volume));
			}
			break;

		case MODE_VOLUME:
			if (!valueChange)
				push.sendRow (0, PARAM_NAMES_VOLUME);
			var volumeValues = '';
			var volumeBars = '';
			for (var i = 0; i < 8; i++)
			{
				volumeValues += pad (tracks[i].volumeStr, i % 2 == 0 ? 9 : 8, ' ');
				volumeBars += formatVolume (tracks[i].volume);
				if (i % 2 == 0)
					volumeBars += ' ';
			}
			push.sendRow (1, volumeValues);
			push.sendRow (2, volumeBars);
			break;
			
		case MODE_PAN:
			if (!valueChange)
				push.sendRow (0, PARAM_NAMES_PAN);
			var panValues = '';
			var panBars = '';
			for (var i = 0; i < 8; i++)
			{
				panValues += pad (tracks[i].panStr, i % 2 == 0 ? 9 : 8, ' ');
				panBars += formatPan (tracks[i].pan);
				if (i % 2 == 0)
					panBars += ' ';
			}
			push.sendRow (1, panValues);
			push.sendRow (2, panBars);
			break;

		case MODE_SEND1:
		case MODE_SEND2:
		case MODE_SEND3:
		case MODE_SEND4:
		case MODE_SEND5:
		case MODE_SEND6:
			var sendNo = currentMode - MODE_SEND1;
			if (!valueChange)
				push.sendRow (0, PARAM_NAMES_SEND[sendNo]);
			var sendValues = '';
			var sendBars = '';
			for (var i = 0; i < 8; i++)
			{
				sendValues += pad (tracks[i].sends[sendNo].volumeStr, i % 2 == 0 ? 9 : 8, ' ');
				sendBars += formatVolume (tracks[i].sends[sendNo].volume);
				if (i % 2 == 0)
					sendBars += ' ';
			}
			push.sendRow (1, sendValues);
			push.sendRow (2, sendBars);
			break;
			
		case MODE_DEVICE:
			var row0 = '';
			var row1 = '';
			var row2 = '';
			for (var i = 0; i < 8; i++)
			{
				var isEmpty = fxparams[i].name.length == 0;
				if (!valueChange)
					row0 += pad (fxparams[i].name, 8, ' ');
				row1 += pad (isEmpty ? '' : fxparams[i].valueStr, 8, ' ');
				row2 += isEmpty ? '        ' : formatVolume (fxparams[i].value);
				if (i % 2 == 0)
				{
					if (!valueChange)
						row0 += ' ';
					row1 += ' ';
					row2 += ' ';
				}
				
				// Light up fx selection buttons
				output.sendCC (20 + i, i == 7 && selectedDevice.enabled ? GREEN_LO - 4 : BLACK);
				output.sendCC (102 + i, BLACK);
			}
			if (!valueChange)
				push.sendRow (0, row0);
			push.sendRow (1, row1);
			push.sendRow (2, row2);
			if (!valueChange)
				push.sendRow (3, 'Selected Device: ' + pad (selectedDevice.name, 34, ' ') + '         ' + (selectedDevice.enabled ? 'Enabled ' : 'Disabled'));
			break;
			
		case MODE_SCALES:
			var o = 2 + currentOctave;
			var noteName = NOTE_NAMES[SCALE_OFFSETS[currentScaleOffset]];
			var row0 =
				pad (noteName + o + ' to ' + noteName + (o + 4), 17, ' ') + '    ' +
				'                 ' +
				'                 ' +
				'                 ';
			push.sendRow (0, row0);
			
			push.clearRow (1);
			
			var row2 = 
				(currentScale == SCALE_MAJOR ? RIGHT_ARROW : ' ') + 'Major     ' +
				(currentScaleOffset == 0 ? RIGHT_ARROW : ' ') + 'C      ' +
				(currentScaleOffset == 1 ? RIGHT_ARROW : ' ') + 'G       ' +
				(currentScaleOffset == 2 ? RIGHT_ARROW : ' ') + 'D      ' +
				(currentScaleOffset == 3 ? RIGHT_ARROW : ' ') + 'A       ' +
				(currentScaleOffset == 4 ? RIGHT_ARROW : ' ') + 'E      ' + 
				(currentScaleOffset == 5 ? RIGHT_ARROW : ' ') + 'B     ' + 
				(currentScale == SCALE_CHROMATIC ? RIGHT_ARROW : ' ') + 'Chromat';
			var row3 = 
				(currentScale == SCALE_MINOR ? RIGHT_ARROW : ' ') + 'Minor     ' +
				(currentScaleOffset == 6 ? RIGHT_ARROW : ' ') + 'F      ' +
				(currentScaleOffset == 7 ? RIGHT_ARROW : ' ') + 'Bb      ' +
				(currentScaleOffset == 8 ? RIGHT_ARROW : ' ') + 'Eb     ' +
				(currentScaleOffset == 9 ? RIGHT_ARROW : ' ') + 'Ab      ' +
				(currentScaleOffset == 10 ? RIGHT_ARROW : ' ') + 'Db     ' +
				(currentScaleOffset == 11 ? RIGHT_ARROW : ' ') + 'Gb            ';
			push.sendRow (2, row2);
			push.sendRow (3, row3);

			for (var i = 0; i < 8; i++)
			{
				output.sendCC (20 + i, i == 0 || i == 7 ? ORANGE_LO : GREEN_LO-4);
				output.sendCC (102 + i, i == 0 || i == 7 ? ORANGE_LO : GREEN_LO);
			}
			break;
	}
	
	if (valueChange || currentMode == MODE_DEVICE || currentMode == MODE_SCALES || currentMode == MODE_MASTER)
		return;

	// Send, Mute, Automation
	if (t == null)
	{
		output.sendCC (60, BLACK);
		output.sendCC (61, BLACK);
		output.sendCC (89, BLACK);
	}
	else
	{
		output.sendCC (60, t.mute ? BUTTON_ON : BUTTON_OFF);
		output.sendCC (61, t.solo ? BUTTON_ON : BUTTON_OFF);
		output.sendCC (89, t.autowrite ? BUTTON_ON : BUTTON_OFF);
	}

	// Format track names
	var sel = t == null ? -1 : t.index;
	var row = '';
	for (var i = 0; i < 8; i++)
	{
		var isSel = i == sel;
		var n = optimizeName (tracks[i].name, isSel ? 7 : 8);
		// Add the selection arrow
		if (isSel)
			n = RIGHT_ARROW + n;
		row += pad (n, 8, ' ');
		if (i % 2 == 0)
			row += ' ';
		
		// Light up selection and record/monitor buttons
		output.sendCC (20 + i, isSel ? ORANGE_LO : BLACK);
		if (push.isShiftPressed ())
			output.sendCC (102 + i, tracks[i].monitor ? GREEN_LO : BLACK);
		else
			output.sendCC (102 + i, tracks[i].recarm ? RED_LO : BLACK);
	}
	push.sendRow (3, row);
}

function formatVolume (volume)
{
	var noOfBars = Math.round (16 * volume / 128);
	var n = '';
	for (var j = 0; j < Math.floor (noOfBars / 2); j++)
		n += BARS_TWO;
	if (noOfBars % 2 == 1)
		n += BARS_ONE;
	return pad (n, 8, BARS_NON);
}

function formatPan (pan)
{
	if (pan == 64)
	 	return NON_4 + NON_4;
	
	var n = '';
	
	if (pan < 64)
	{
		var pos = 64 - pan;
		var noOfBars = Math.round (16 * pos/128);
		for (var j = 0; j < Math.floor (noOfBars / 2); j++)
			n += BARS_TWO;
		if (noOfBars % 2 == 1)
			n += BARS_ONE_L;
		return reverseStr (NON_4 + pad (n, 4, BARS_NON));
	}	

	var pos = pan - 64;
	var noOfBars = Math.round (16 * pos/128);
	for (var j = 0; j < Math.floor (noOfBars / 2); j++)
		n += BARS_TWO;
	if (noOfBars % 2 == 1)
		n += BARS_ONE;
	return NON_4 + pad (n, 4, BARS_NON);
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
	'         ',
	'          ',
	'           ',
	'            ',
	'             ',
	'              ',
	'               ',
	'                ',
	'                 ',
	'                  ',
	'                   ',
	'                    ',
	'                     ',
	'                      ',
	'                       ',
	'                        ',
	'                         ',
	'                          ',
	'                           ',
	'                            ',
	'                             ',
	'                              ',
	'                               ',
	'                                ',
	'                                 ',
	'                                  '
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
function pad (str, length, character)
{
	if (typeof (str) == 'undefined')
		str = '';
	
	var diff = length - str.length;
	
	if (diff < 0)
		return str.substr (0, length);
		
	if (diff > 0)
		return str + (character == ' ' ? SPACES[diff] : DASHES[diff]);

	return str;
}
