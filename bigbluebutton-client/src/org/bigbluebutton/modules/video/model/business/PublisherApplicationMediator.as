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
	import flash.events.ActivityEvent;
	import flash.events.StatusEvent;
	import flash.media.Camera;
	import flash.media.Microphone;
	import flash.media.SoundTransform;
	import flash.media.Video;
	import flash.net.ObjectEncoding;
	
	import org.bigbluebutton.modules.video.VideoModuleConstants;
	import org.bigbluebutton.modules.video.control.notifiers.PlayStreamNotifier;
	import org.bigbluebutton.modules.video.control.notifiers.PublishNotifier;
	import org.bigbluebutton.modules.video.model.services.BroadcastStreamDelegate;
	import org.bigbluebutton.modules.video.model.services.PlayStreamDelegate;
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.bigbluebutton.modules.video.model.vo.IMedia;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.model.vo.settings.GeneralSettings;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * This is one of the mediator classes of the video module. It holds much of the business logic 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PublisherApplicationMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PublisherApplicationMediator";
					
		/**
		 * Creates a new PublisherApplicationMediator 
		 * 
		 */			
		public function PublisherApplicationMediator() {
			super(NAME);
		}
		
//		public function get model():PublisherModel{
//			return facade.retrieveProxy(PublisherModel.NAME) as PublisherModel;
//		}
		
//		public function get delegate():NetworkConnectionDelegate{
//			return facade.retrieveProxy(NetworkConnectionDelegate.NAME) as NetworkConnectionDelegate;
//		}
		
		/**
		 * Lists the notification to which this mediator listens to:
		 * 	VideoFacade.PAUSE_STREAM_COMMAND
		 * 	VideoFacade.PLAY_STREAM_COMMAND
		 * 	VideoFacade.RESUME_STREAM_COMMAND
		 * 	VideoFacade.STOP_STREAM_COMMAND 
		 * @return the array of string representing the insterests
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					VideoModuleConstants.PAUSE_STREAM_COMMAND,
					VideoModuleConstants.PLAY_STREAM_COMMAND,
					VideoModuleConstants.RESUME_STREAM_COMMAND,
					VideoModuleConstants.STOP_STREAM_COMMAND,
					VideoModuleConstants.PUBLISH_STREAM_COMMAND,
					VideoModuleConstants.UNPUBLISH_STREAM_COMMAND,
					VideoModuleConstants.STOP_MICROPHONE_COMMAND,
					VideoModuleConstants.STOP_CAMERA_COMMAND,
					VideoModuleConstants.START_CAMERA_COMMAND,
					VideoModuleConstants.START_MICROPHONE_COMMAND,
					VideoModuleConstants.SETUP_DEVICES_COMMAND
					];
		}
		
		/**
		 * Handles the notifications upon reception 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoModuleConstants.PAUSE_STREAM_COMMAND:
//					pauseStream(notification.getBody() as String);
					break;
				case VideoModuleConstants.PLAY_STREAM_COMMAND:
					var note:PlayStreamNotifier = notification.getBody() as PlayStreamNotifier;
//					playStream(note.streamName, note.enableVideo, note.enableAudio);
					break;
				case VideoModuleConstants.RESUME_STREAM_COMMAND:
//					resumeStream(notification.getBody() as String);
					break;
				case VideoModuleConstants.STOP_STREAM_COMMAND:
//					stopStream(notification.getBody() as String);
					break;
				case VideoModuleConstants.PUBLISH_STREAM_COMMAND:
					var publishNote:PublishNotifier = notification.getBody() as PublishNotifier;
//					startBroadcasting(publishNote.publishMode, publishNote.streamName);
					break;
				case VideoModuleConstants.UNPUBLISH_STREAM_COMMAND:
//					stopBroadcasting(notification.getBody() as String);
					break;
				case VideoModuleConstants.STOP_MICROPHONE_COMMAND:
//					stopMicrophone(notification.getBody() as String);
					break;
				case VideoModuleConstants.STOP_CAMERA_COMMAND:
//					stopCamera(notification.getBody() as String);
					break;
				case VideoModuleConstants.START_CAMERA_COMMAND:
//					startCamera(notification.getBody() as String);
					break;
				case VideoModuleConstants.START_MICROPHONE_COMMAND:
//					startMicrophone(notification.getBody() as String);
					break;
				case VideoModuleConstants.SETUP_DEVICES_COMMAND:
//					setupDevices();
					break;
			}
		}
		

	}
}