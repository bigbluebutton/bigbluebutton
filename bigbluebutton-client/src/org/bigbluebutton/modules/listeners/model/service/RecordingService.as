/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.listeners.model.service
{
	import flash.events.*;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.rpc.IResponder;
	import mx.rpc.http.HTTPService;
	
	import org.bigbluebutton.modules.listeners.ListenersModuleConstants;
	
	        	
	/**
	 * This class directly communicates with an HTTP service in order to send and recives files (slides
	 * in this case)
	 * <p>
	 * This class extends the Proxy class of the pureMVC framework
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	        	
	public class RecordingService implements IResponder
	{  
		private var service : HTTPService;
		private var urlLoader:URLLoader;
		private var _messageSender:Function;
		private var _module:ListenersModule;
		
		public function RecordingService(module:ListenersModule)
		{
			_module = module;
			service = new HTTPService();
		}
			
		public function convertRecordedAudioToMP3():void
		{
			var confid:String = _module.conference.slice(1, _module.conference.length);
			
			var url:String = _module.recordingHost + "/cgi-bin/convert.pl?id=" + _module.voicebridge;
			LogUtil.debug("Converting recorded audio " + url);
			service.url = url;			
			urlLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);	
			urlLoader.load(new URLRequest(url));
			
		}

		public function addMessageSender(msgSender:Function):void {
			_messageSender = msgSender;
		}
		
		private function sendMessage(msg:String, body:Object=null):void {
			if (_messageSender != null) _messageSender(msg, body);
		}
		
		private function handleComplete(e:Event):void{
			LogUtil.debug("Loading complete: " + e.target.data as String);
			_module.recordedMP3Url = e.target.data as String;	
			sendMessage(ListenersModuleConstants.CONVERTED_RECORDED_MP3_EVENT);			
		}
				
		/**
		 * This is the response event. It is called when the PresentationService class sends a request to
		 * the server. This class then responds with this event 
		 * @param event
		 * 
		 */		
		public function result(event : Object):void
		{
			var xml:XML = new XML(event.result);
			var list:XMLList = xml.presentations;
			var item:XML;
						
			for each(item in list){
				LogUtil.debug("Available Modules: " + item.toXMLString() + " at " + item.text());
				
			}	
		}

		/**
		 * Event is called in case the call the to server wasn't successful. This method then gets called
		 * instead of the result() method above 
		 * @param event
		 * 
		 */
		public function fault(event : Object):void
		{
			LogUtil.debug("Got fault [" + event.fault.toString() + "]");		
		}		
	}
}