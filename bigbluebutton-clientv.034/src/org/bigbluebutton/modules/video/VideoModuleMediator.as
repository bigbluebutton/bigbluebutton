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
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.video.model.business.PublisherApplicationMediator;
	import org.bigbluebutton.modules.video.model.vo.BroadcastMedia;
	import org.bigbluebutton.modules.video.model.vo.PlayMedia;
	import org.bigbluebutton.modules.video.view.MyCameraWindow;
	import org.bigbluebutton.modules.video.view.ViewCameraWindow;
	import org.bigbluebutton.modules.video.view.mediators.MyCameraWindowMediator;
	import org.bigbluebutton.modules.video.view.mediators.ViewCameraWindowMediator;
	import org.bigbluebutton.modules.viewers.ViewersConstants;
	import org.bigbluebutton.modules.viewers.model.vo.User;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
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
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		private var module:VideoModule;
		
		public var videoWindow:MyCameraWindow;
		public var viewWindow:ViewCameraWindow;
		
		/**
		 * The constructor. Registers the VideoModule with this mediator class 
		 * @param module
		 * 
		 */		
		public function VideoModuleMediator(module:VideoModule)
		{
			super(NAME, module);
			this.module = module;
			router = module.router;
			inpipe = new InputPipe(VideoConstants.TO_VIDEO_MODULE);
			outpipe = new OutputPipe(VideoConstants.FROM_VIDEO_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			inpipe.connect(inpipeListener);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG as String;
		}  
		
		/**
		 * Adds the gui window of this module to the main application shell. The component is sent
		 * through the puremvc piping utility 
		 * 
		 */		
		private function addVideoWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: VideoConstants.FROM_VIDEO_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			videoWindow = new MyCameraWindow();
   			videoWindow.title = "My Camera";
   			videoWindow.showCloseButton = true;
   			var publisher:PublisherApplicationMediator 
   				= facade.retrieveMediator(PublisherApplicationMediator.NAME) as PublisherApplicationMediator;
   			var media:BroadcastMedia = publisher.getBroadcastMedia(module.streamName) as BroadcastMedia;
   			videoWindow.media = media;
   			
   			videoWindow.title = ViewCameraWindow.TITLE;
   			module.viewComponent = videoWindow;
   			facade.registerMediator(new MyCameraWindowMediator(videoWindow));
   			msg.setBody(viewComponent as VideoModule);
   			outpipe.write(msg);
   			
		}
		
		public function addViewWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: VideoConstants.FROM_VIDEO_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			viewWindow = new ViewCameraWindow();
   			var publisher:PublisherApplicationMediator 
   				= facade.retrieveMediator(PublisherApplicationMediator.NAME) as PublisherApplicationMediator;
   			
			viewWindow.showCloseButton = true;
			viewWindow.title = "Viewing...";
			publisher.createPlayMedia(module.streamName);
			module.viewComponent = viewWindow;
			facade.registerMediator(new ViewCameraWindowMediator(viewWindow));
			
			var media : PlayMedia = publisher.getPlayMedia(module.streamName) as PlayMedia;
			viewWindow.media = media;
			
			publisher.setupStream(module.streamName);
			
			msg.setBody(viewComponent as VideoModule);
   			outpipe.write(msg);
		}
		
		/**
		 * Initialize the notifier key of this mediator. This method need not be called, it is executed
		 * automatically. It is needed because in the multicore version of puremvc one cannot communicate
		 * directly with the facade through the constructor. 
		 * @param key
		 * 
		 */		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			if (module.type == VideoModule.RECORDER){
				addVideoWindow();
			} else if (module.type == VideoModule.VIEWER){
				addViewWindow();
			}
		}
		
		/**
		 * Lists the notifications that this class listens to 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					VideoFacade.CLOSE_RECORDING
					];
		}
		
		/**
		 * Handles the notifications upon receiving them 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoFacade.CLOSE_RECORDING:
					facade.removeCore(VideoFacade.NAME);
					break;
			}
		}		

	}
}