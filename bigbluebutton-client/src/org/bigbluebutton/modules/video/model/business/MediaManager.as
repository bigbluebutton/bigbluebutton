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
	
	import mx.collections.ArrayCollection;
	import mx.events.*;
	
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.bigbluebutton.modules.video.model.vo.IMedia;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.model.vo.settings.VideoSettings;
	
	/**
	 * The class holds the settings and streams for the Video Module
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class MediaManager
	{		
		public static const NAME:String = "Media";
		[Bindable] public var connected : Boolean = false;
		
		private var playMedia:MediaCollection;
		private var broadcastMedia:MediaCollection;
						
		public var defaultVideoSettings:VideoSettings;
				 
		[Bindable]		
		public var cameraNames:Array = 	[ "No video" ];
		
		[Bindable]	
		public var microphoneNames:Array = [ "No audio" ];		
				 	
		public function MediaManager()
		{
			defaultVideoSettings = new VideoSettings();

			playMedia  = new MediaCollection();
			broadcastMedia = new MediaCollection();
		}

		/**
		 * Creates a new broadcast media with the given name 
		 * @param streamName
		 * 
		 */		
		public function createBroadcastMedia(streamName:String):void
		{
			broadcastMedia.addMedia(new BroadcastMedia(streamName));
		}

		/**
		 * Creates a new play media with a given name 
		 * @param streamName
		 * 
		 */		
		public function createPlayMedia(streamName:String):void
		{
			playMedia.addMedia(new PlayMedia(streamName)); 							
		}
		
		/**
		 * Returns the broadcast media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getBroadcastMedia(streamName:String):IMedia
		{
			return broadcastMedia.getMedia(streamName);
		}

		/**
		 * Returns the play media with the given name 
		 * @param streamName
		 * @return 
		 * 
		 */		
		public function getPlayMedia(streamName:String):IMedia
		{
			return playMedia.getMedia(streamName);
		}
		
		public function removeMedia(type:MediaType, streamName:String):void {
			if (type.name == MediaType.BROADCAST.name) {
				broadcastMedia.removeMedia(streamName);
			} else {
				playMedia.removeMedia(streamName);
			}
		}
		
		public function stopAllMedia():void {
			stopAllPlayMedia();
			stopAllBroadcastMedia();
		}
		
		public function stopAllPlayMedia():void {
			var c:ArrayCollection = playMedia.getAll();						
			for (var i:int=0; i<c.length;i++)
			{
				var m:PlayMedia =  playMedia.getMedia(m.streamName) as PlayMedia;			
				m.stop();
			}	
		}
		
		public function stopAllBroadcastMedia():void {
			var c:ArrayCollection = broadcastMedia.getAll();						
			for (var i:int=0; i<c.length;i++)
			{
				var m:BroadcastMedia =  broadcastMedia.getMedia(m.streamName) as BroadcastMedia;			
				m.stop();
			}	
		}
	}
}