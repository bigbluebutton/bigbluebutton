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
package org.bigbluebutton.modules.video
{

	import org.bigbluebutton.modules.video.model.MediaProxy;
	import org.bigbluebutton.modules.video.view.ViewCameraWindowMediator;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The VideoModuleMediator is a mediator class for the VideoModule
	 * <p>
	 * This class extends the Mediator class of the puremvc framework 
	 * @author dzgonjan
	 * 
	 */	
	public class VideoModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "VideoModuleMediator";
		
		private var module:VideoModule;
			
		public function VideoModuleMediator(module:VideoModule)
		{
			super(NAME, module);
			this.module = module;
		}
			
		override public function listNotificationInterests():Array{
			return [
					VideoModuleConstants.CONNECTED,
					VideoModuleConstants.DISCONNECTED,
					VideoModuleConstants.START_VIEW_CAMERA,
					VideoModuleConstants.STOP_VIEW_CAMERA
					];
		}
			
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoModuleConstants.CONNECTED:
					if (facade.hasProxy(MediaProxy.NAME)) {
						var p:MediaProxy = facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
						p.setup();					
						facade.sendNotification(VideoModuleConstants.SETUP_COMPLETE);
					}
					break;
				case VideoModuleConstants.DISCONNECTED:
					facade.sendNotification(VideoModuleConstants.STOP_ALL_STREAM);
					break;
				case VideoModuleConstants.START_VIEW_CAMERA:
					var streamName:String = notification.getBody().streamName;
					// Append the streamName to the mediator name so we can know which mediator is for which stream.
					facade.registerMediator(new ViewCameraWindowMediator(ViewCameraWindowMediator.NAME + streamName, streamName));
					facade.sendNotification(VideoModuleConstants.PLAY_STREAM, notification.getBody());
					break;
				case VideoModuleConstants.STOP_VIEW_CAMERA:
					var stream:String = notification.getBody().streamName;
					facade.sendNotification(VideoModuleConstants.STOP_STREAM, notification.getBody());
					facade.removeMediator(ViewCameraWindowMediator.NAME + stream);
					break;
			}
		}		
	}
}