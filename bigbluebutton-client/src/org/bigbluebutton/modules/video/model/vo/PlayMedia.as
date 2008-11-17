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
package org.bigbluebutton.modules.video.model.vo
{
	import flash.media.Video;
	
	import org.bigbluebutton.modules.video.model.business.MediaType;
	import org.bigbluebutton.modules.video.model.services.PlayStreamDelegate;
	import org.bigbluebutton.modules.video.model.vo.settings.VideoSettings;
	
	/**
	 * Holds the various settings of the play media, as well as the media stream itself 
	 * @author dzgonjan
	 * 
	 */	
	[Bindable]	
	public class PlayMedia implements IMedia
	{
		private static const _type : MediaType = MediaType.PLAY;		
		public var streamName : String;
		public var uri : String;
		
		public var remoteVideo : Video;
		public var defaultVideoSettings:VideoSettings = new VideoSettings();
		
		public var playState : PlaybackState = PlaybackState.STOPPED;
		
		public var playStreamDelegate:PlayStreamDelegate;
		
		public function PlayMedia(streamName : String)
		{
			this.streamName = streamName;
		}

		public function get type():MediaType
		{
			return _type;
		}
	}
}