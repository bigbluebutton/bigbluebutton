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
package org.bigbluebutton.modules.presentation
{
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.playback.PlaybackModuleConstants;
	import org.bigbluebutton.modules.presentation.model.business.PresentationDelegate;
	import org.bigbluebutton.modules.presentation.model.business.PresentationPlaybackProxy;
	import org.bigbluebutton.modules.presentation.view.PresentationWindow;
	import org.bigbluebutton.modules.presentation.view.PresentationWindowMediator;
	import org.bigbluebutton.modules.presentation.view.ThumbnailViewMediator;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	/**
	 * The mediator for the PresentationModule class
	 * <p>
	 * This class extends the Mediator object of the PureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PresentationModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "Presentation Module Mediator";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		
		private var presentationWindow:PresentationWindow = new PresentationWindow();
		private var module:PresentationModule;
		
		/**
		 * The constructor. Associates this mediator with the PresentationModule class
		 * The constructor does the work of registering the PresentationModule with input/output pipes
		 * of the MainApplicationShell within BigBlueButton
		 * @param view
		 * 
		 */		
		public function PresentationModuleMediator(view:PresentationModule)
		{
			super(NAME, view);
			module = view;
			router = view.router;
			inpipe = new InputPipe(PresentationConstants.TO_PRESENTATION_MODULE);
			outpipe = new OutputPipe(PresentationConstants.FROM_PRESENTATION_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			inpipe.connect(inpipeListener);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addWindow();
		}
		
		/**
		 * Receives a message from the puremvc piping 
		 * @param message
		 * 
		 */		
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case PlaybackModuleConstants.PLAYBACK_MODE:
					facade.removeProxy(PresentationDelegate.ID);
					facade.registerProxy(new PresentationPlaybackProxy(null));
					break;
				case PlaybackModuleConstants.PLAYBACK_MESSAGE:
					playMessage(message.getBody() as XML);
					break;
			}
		}
		
		private function playMessage(message:XML):void{
			var playbackProxy:PresentationPlaybackProxy = 
					facade.retrieveProxy(PresentationDelegate.ID) as PresentationPlaybackProxy;
			switch(message.@event){
				case PresentationPlaybackProxy.CHANGE_SLIDE:
					playbackProxy.changeSlide(message);
					break;
				case PresentationPlaybackProxy.CONVERSION:
					playbackProxy.conversionComplete(message);
					break;
				case PresentationPlaybackProxy.PRESENTER:
					playbackProxy.presenterAssigned(message);
					break;
				case PresentationPlaybackProxy.SHARING:
					playbackProxy.startSharing(message);
					break;
				case PresentationPlaybackProxy.SLIDE:
					playbackProxy.slideCreated(message);
					break;
			}
		}
		
		/**
		 * Adds the GUI component of the Presentation Module to the MainApplicationShell
		 * The component is sent through the piping
		 * 
		 */		
		private function addWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: PresentationConstants.FROM_PRESENTATION_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			   			
   			presentationWindow.height = 378;
   			presentationWindow.width = 480;
   			presentationWindow.title = PresentationWindow.TITLE;
   			presentationWindow.showCloseButton = false;
   			module.activeWindow = presentationWindow;
   			msg.setBody(viewComponent as PresentationModule);
   			outpipe.write(msg);
		}
		
		/**
		 * Initializes the notifier of this mediator.
		 * This method is needed in the multicore puremvc, because we can't communicate with the
		 * facade within the constructor anymore. 
		 * @param key
		 * 
		 */		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			facade.registerMediator(new PresentationWindowMediator(presentationWindow));
   			facade.registerMediator(new ThumbnailViewMediator(presentationWindow.thumbnailView));
   			//facade.registerMediator(new ImageZoomMediator(presentationWindow));
		}
		
		/**
		 * Returns the PresentationModule object which this class 'mediates' 
		 * @return the PresentationModule
		 * 
		 */		
		protected function get presentationModule():PresentationModule{
			return viewComponent as PresentationModule;
		}

	}
}