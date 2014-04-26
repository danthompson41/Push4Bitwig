// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseView ()
{
	this.ttLastMillis = -1;
	this.ttLastBPM = -1;
	this.ttHistory = [];
}
BaseView.prototype = new View ();
BaseView.prototype.constructor = BaseView;

BaseView.prototype.updateNoteMapping = function () {};

BaseView.prototype.onNew = function ()
{
	// TODO
	host.showPopupNotification ("New: Function not supported (yet).");
};

BaseView.prototype.onPlay = function ()
{
	if (this.push.isShiftPressed ())
		transport.toggleLoop ();
	else
		transport.play ();
};

BaseView.prototype.onRecord = function ()
{
	transport.record ();
};

BaseView.prototype.onDuplicate = function ()
{
	// TODO Not possible?
	host.showPopupNotification ("Duplicate: Function not supported (yet).");
};

BaseView.prototype.onAutomation = function ()
{
	var selectedTrack = getSelectedTrack ();
	if (selectedTrack != null)
		transport.toggleWriteArrangerAutomation ();
};

BaseView.prototype.onFixedLength = function ()
{
	// TODO Not possible?
	host.showPopupNotification ("Fixed Length: Function not supported (yet).");
};

BaseView.prototype.onQuantize = function ()
{
	// TODO Not possible?
	host.showPopupNotification ("Quantize: Function not supported (yet).");
};

BaseView.prototype.onDouble = function ()
{
	application.duplicate ();
};

BaseView.prototype.onDelete = function ()
{
	// Weird workaround as 'delete' is a reserved word in JS
	var deleteFunction = application['delete'];
	deleteFunction.call (application);
};

BaseView.prototype.onUndo = function ()
{
	if (this.push.isShiftPressed ())
		application.redo ();
	else
		application.undo ();
};

// Set tempo
BaseView.prototype.onSmallKnob1 = function (increase)
{
	tempo = increase ? Math.min (tempo + 1, TEMPO_RESOLUTION) : Math.max (0, tempo - 1);
	transport.getTempo ().set (tempo, TEMPO_RESOLUTION);
};

// Change time (play position)
BaseView.prototype.onSmallKnob2 = function (increase)
{
	var frac = this.push.isShiftPressed () ? INC_FRACTION_TIME_SLOW : INC_FRACTION_TIME;
	transport.incPosition (delta = increase ? frac : -frac, false);			
};

BaseView.prototype.onClick = function ()
{
	transport.toggleClick ();
};

BaseView.prototype.onTapTempo = function ()
{
	var millis = new Date ().getTime ();
	
	// First press?
	if (this.ttLastMillis == -1)
	{
		this.ttLastMillis = millis;
		return;
	}	
	
	// Calc the difference
	var diff = millis - this.ttLastMillis;
	this.ttLastMillis = millis;
	
	// Store up to 8 differences for average calculation
	this.ttHistory.push (diff);
	if (this.ttHistory.length > 8)
		this.ttHistory.shift ();

	// Calculate the new average difference
	var sum = 0;
	for (var i = 0; i < this.ttHistory.length; i++)
		sum += this.ttHistory[i];
	var average = sum / this.ttHistory.length;
	var bpm = 60000 / average;
	
	// If the deviation is greater 20bpm, reset history
	if (this.ttLastBPM != -1 && Math.abs (this.ttLastBPM - bpm) > 20)
	{
		this.ttHistory.length = 0;
		this.ttLastBPM = -1;
	}
	else
	{
		this.ttLastBPM = bpm;
		// Rescale to Bitwig
		var scaled = (bpm - 20) / 646 * TEMPO_RESOLUTION;
		transport.getTempo ().set (Math.min (Math.max (0, scaled), TEMPO_RESOLUTION), TEMPO_RESOLUTION);
	}
};

BaseView.prototype.onValueKnob = function (index, value)
{
	switch (currentMode)
	{
		case MODE_MASTER:
			if (index == 0)
			{
				// Volume
				master.volume = changeValue (value, master.volume);
				masterTrack.getVolume ().set (master.volume, 128);
			}
			else if (index == 1)
			{
				// Pan
				master.pan = changeValue (value, master.pan);
				masterTrack.getPan ().set (master.pan, 128);
			}
			break;
	
		case MODE_TRACK:
			var selectedTrack = getSelectedTrack ();
			if (selectedTrack == null)
				return;
				
			var t = trackBank.getTrack (selectedTrack.index);
			if (index == 0)
			{
				// Volume
				selectedTrack.volume = changeValue (value, selectedTrack.volume);
				t.getVolume ().set (selectedTrack.volume, 128);
			}
			else if (index == 1)
			{
				// Pan
				selectedTrack.pan = changeValue (value, selectedTrack.pan);
				t.getPan ().set (selectedTrack.pan, 128);
			}
			else
			{
				// Send 1-6 Volume
				var sel = index - 2;
				var send = selectedTrack.sends[sel];
				send.volume = changeValue (value, send.volume);
				t.getSend (send.index).set (send.volume, 128);
			}
			break;
		
		case MODE_VOLUME:
			var t = tracks[index];
			t.volume = changeValue (value, t.volume);
			trackBank.getTrack (t.index).getVolume ().set (t.volume, 128);
			break;
			
		case MODE_PAN:
			var t = tracks[index];
			t.pan = changeValue (value, t.pan);
			trackBank.getTrack (t.index).getPan ().set (t.pan, 128);
			break;
			
		case MODE_SEND1:
		case MODE_SEND2:
		case MODE_SEND3:
		case MODE_SEND4:
		case MODE_SEND5:
		case MODE_SEND6:
			var sendNo = currentMode - MODE_SEND1;
			var t = tracks[index];
			var send = t.sends[sendNo];
			send.volume = changeValue (value, send.volume);
			trackBank.getTrack (t.index).getSend (sendNo).set (send.volume, 128);
			break;
		
		case MODE_DEVICE:
			fxparams[index].value = changeValue (value, fxparams[index].value);
			device.getParameter (index).set (fxparams[index].value, 128);
			break;
			
		case MODE_SCALES:
			// Not used
			break;
	}
};

// Master Volume
BaseView.prototype.onValueKnob9 = function (value)
{
	masterTrack.getVolume ().inc (value <= 61 ? 1 : -1, 128);
};

BaseView.prototype.onFirstRow = function (index)
{
	if (currentMode == MODE_DEVICE)
	{
		if (index == 7)
			device.toggleEnabledState ();
	}
	else if (currentMode == MODE_SCALES)
	{
		if (index == 0)
			currentScale = SCALE_MAJOR;
		else if (index == 7)
			currentScale = SCALE_CHROMATIC;
		else
			currentScaleOffset = index - 1;
		this.updateNoteMapping ();
		updateDisplay ();
		this.drawGrid ();
	}
	else if (currentMode != MODE_MASTER)
		trackBank.getTrack (index).select ();
};

// Rec arm / enable monitor buttons
BaseView.prototype.onSecondRow = function (index)
{
	if (currentMode == MODE_SCALES)
	{
		if (index == 0)
		{
			currentScale = SCALE_MINOR;
			this.drawGrid ();
		}
		else if (index != 7)
			currentScaleOffset = index + 5;
		this.updateNoteMapping ();
		updateDisplay ();
	}
	else if (currentMode != MODE_DEVICE && currentMode != MODE_MASTER)
	{
		var t = trackBank.getTrack (index);
		if (this.push.isShiftPressed ())
			; // TODO Toggle monitor; Possible?
		else
			 t.getArm ().set (toggleValue (tracks[index].recarm));
	}
};

BaseView.prototype.onMaster = function ()
{
	previousMode = currentMode;
	currentMode = MODE_MASTER;
	masterTrack.select ();
};

BaseView.prototype.onVolume = function ()
{
	currentMode = MODE_VOLUME;
	updateMode ();
	updateDisplay ();
};

BaseView.prototype.onPanAndSend = function ()
{
	currentMode++;
	if (currentMode < MODE_PAN || currentMode > MODE_SEND6)
		currentMode = MODE_PAN;
	updateMode ();
	updateDisplay ();
};

BaseView.prototype.onTrack = function ()
{
	currentMode = MODE_TRACK;
	updateMode ();
	updateDisplay ();
};

BaseView.prototype.onDevice = function ()
{
	currentMode = MODE_DEVICE;
	updateMode ();
	updateDisplay ();
};

BaseView.prototype.onBrowse = function ()
{
	application.toggleBrowserVisibility ();
};

// Dec Track or Device Parameter Bank
BaseView.prototype.onDeviceLeft = function ()
{
	if (currentMode == MODE_DEVICE)
		device.previousParameterPage ();
	else
		trackBank.scrollTracksPageUp ();
};

// Inc Track or Device Parameter Bank
BaseView.prototype.onDeviceRight = function ()
{
	if (currentMode == MODE_DEVICE)
		device.nextParameterPage ();
	else
		trackBank.scrollTracksPageDown ();
};

BaseView.prototype.onMute = function ()
{
	var selectedTrack = getSelectedTrack ();
	if (selectedTrack == null)
		return;
	selectedTrack.mute = toggleValue (selectedTrack.mute);
	trackBank.getTrack (selectedTrack.index).getMute ().set (selectedTrack.mute);
	sendCC (60, selectedTrack.mute ? BUTTON_ON : BUTTON_OFF);
};

BaseView.prototype.onSolo = function ()
{
	var selectedTrack = getSelectedTrack ();
	if (selectedTrack == null)
		return;
	selectedTrack.solo = toggleValue (selectedTrack.solo);
	trackBank.getTrack (selectedTrack.index).getSolo ().set (selectedTrack.solo);
	sendCC (61, selectedTrack.solo ? BUTTON_ON : BUTTON_OFF);
};

BaseView.prototype.onScales = function (isDown)
{
	if (isDown)
	{
		previousMode = currentMode;
		currentMode = MODE_SCALES;
	}
	else
	{
		currentMode = previousMode;
		previousMode = null;
	}
	updateMode ();
	updateDisplay ();
};

BaseView.prototype.onOctaveDown = function ()
{
	currentOctave = Math.max (-3, currentOctave - 1);
	this.updateNoteMapping ();
	if (currentMode == MODE_SCALES)
		updateDisplay ();
};

BaseView.prototype.onOctaveUp = function ()
{
	currentOctave = Math.min (3, currentOctave + 1);
	this.updateNoteMapping ();
	if (currentMode == MODE_SCALES)
		updateDisplay ();
};

BaseView.prototype.onAddFX = function ()
{
	// TODO Not possible?
	host.showPopupNotification ("Add Effect: Function not supported (yet).");
};

BaseView.prototype.onAddTrack = function ()
{
	// TODO Not possible?
	host.showPopupNotification ("Add Track: Function not supported (yet).");
};

BaseView.prototype.onNote = function ()
{
	this.push.setActiveView (VIEW_PLAY);
};

BaseView.prototype.onSession = function ()
{
	this.push.setActiveView (VIEW_SESSION);
};

BaseView.prototype.onShift = function (isShiftPressed)
{
	updateDisplay ();
};
