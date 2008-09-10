/**
* RED5 Open Source Flash Server - http://www.osflash.org/red5
*
* Copyright (c) 2006-2008 by respective authors (see below). All rights reserved.
*
* This library is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This library is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this library; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
*/

// ** AUTO-UI IMPORT STATEMENTS **
import org.red5.utils.Connector;
import org.red5.ui.controls.IconButton;
// ** END AUTO-UI IMPORT STATEMENTS **
import com.neoarchaic.ui.Tooltip;
import org.red5.net.Stream;
import org.red5.utils.Delegate;
import com.blitzagency.xray.util.XrayLoader;

class org.red5.samples.livestream.recorder.Main extends MovieClip {
// Constants:
	public static var CLASS_REF = org.red5.samples.livestream.recorder.Main;
	public static var LINKAGE_ID:String = "org.red5.samples.livestream.recorder.Main";
// Public Properties:
// Private Properties:
	private var recordingStream:Stream;
	private var playingStream:Stream;
	private var recording:Boolean;
	private var playing:Boolean;
	private var cam:Camera;
	private var mic:Microphone;
	private var currentTimer:Number;
// UI Elements:

// ** AUTO-UI ELEMENTS **
	private var connector:Connector;
	private var playback:IconButton;
	private var publish_video:Video;
	private var startRecord:IconButton;
	private var stopPlayback:IconButton;
	private var stopRecord:IconButton;
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function Main() {XrayLoader.loadConnector("xray.swf");}
	private function onLoad():Void { configUI(); }

// Public Methods:
// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{
		// setup the tooltip defaults
		Tooltip.options = {size:10, font:"_sans", corner:0};
		
		// setupbuttons
		startRecord.tooltip = "start recording";
		stopRecord.tooltip = "stop recording";
		//playback.tooltip = "playback recording";
		//stopPlayback.tooltip = "stop playback";
		
		startRecord.addEventListener("click", Delegate.create(this, recordStream));
		stopRecord.addEventListener("click", Delegate.create(this, stopStream));
		//playback.addEventListener("click", Delegate.create(this, startStreamPlayback));
		//stopPlayback.addEventListener("click", Delegate.create(this, stopStreamPlayback));
		
		// setup cam
		cam = Camera.get();
		cam.setMode(320, 240, 30);
		cam.setQuality(0,0);
		
		// setup mic
		mic = Microphone.get();
		mic.setRate(44);
		
		// get notified of connection changes
		connector.addEventListener("connectionChange", this);
		
		// set the uri
		Connector.red5URI = "rtmp://localhost/oflaDemo";
		
		// initialize the connector
		connector.configUI();
		
		
	}
	
	/*
	private function startStreamPlayback(evtObj:Object):Void
	{
		if(playing) return;
		//stream = new Stream(connector.connection);
		
		playingStream.play("red5RecordDemo" + currentTimer + ".flv");
		publish_video.attachVideo(playingStream);
		playing = true;
	}
	
	private function stopStreamPlayback(evtObj:Object):Void
	{
		if(!playing) return;
		playing = false;
		playingStream.close();
	}
	*/
	
	private function recordStream(evtObj:Object):Void
	{
		if(!connector.connection.isConnected || recording) return;
		recording = true;
		
		// setup stream
		currentTimer = getTimer();
		recordingStream.publish("red5RecordDemo" + currentTimer, "record");
		recordingStream.attachVideo(cam);
		recordingStream.attachAudio(mic);
		publish_video.attachVideo(cam);
	}
	
	private function stopStream(evtObj:Object):Void
	{
		if(!recording) return;
		recording = false;
		recordingStream.close();
		//recordingStream.publish(false);
	}
	
	private function connectionChange(evtObj:Object):Void
	{		
		if(evtObj.connected) 
		{
			recording = false;
			//playing = false;
			recordingStream = new Stream(evtObj.connection);
			//playingStream = new Stream(connector.connection);
			//playingStream.addEventListener("streamStop", Delegate.create(this, stopStreamPlayback));
		}
	}

}