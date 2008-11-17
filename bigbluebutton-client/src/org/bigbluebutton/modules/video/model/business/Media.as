/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/

package org.bigbluebutton.modules.video.model.business
{	 
	import flash.events.*;
	import flash.media.*;
	import flash.net.*;
	
	import mx.events.*;
	
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.bigbluebutton.modules.video.model.vo.IMedia;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.model.vo.settings.GeneralSettings;
	import org.bigbluebutton.modules.video.model.vo.settings.VideoSettings;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * The PublisherModel class holds the settings and streams for the Video Module
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class Media
	{		
		public static const NAME:String = "Media";
		[Bindable] public var connected : Boolean = false;
		
		public var playMedia : Object;
		public var broadcastMedia : Object;
				
		public var generalSettings:GeneralSettings;
		public var defaultVideoSettings:VideoSettings;
				 
		[Bindable]		
		public var cameraNames:Array = 	[ "No video" ];
		
		[Bindable]	
		public var microphoneNames:Array = [ "No audio" ];		
				 	
		public function Media()
		{
			// Create blank general settings VO.
			generalSettings = new GeneralSettings();
			defaultVideoSettings = new VideoSettings();

			playMedia  = new Object();
			broadcastMedia = new Object();
		}

		/**
		 * Creates a new broadcast media with the given name 
		 * @param streamName
		 * 
		 */		
		public function createBroadcastMedia(streamName : String) : void
		{
			broadcastMedia[streamName] = new BroadcastMedia(streamName);
		}

		/**
		 * Creates a new play media with a given name 
		 * @param streamName
		 * 
		 */		
		public function createPlayMedia(streamName : String) : void
		{
			playMedia[streamName] = new PlayMedia(streamName);
		}
		
		/**
		 * Returns the broadcast media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getBroadcastMedia(streamName : String):IMedia
		{
			return broadcastMedia[streamName];
		}

		/**
		 * Returns the play media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getPlayMedia(streamName : String) : IMedia
		{
			return playMedia[streamName];
		}
	}
}