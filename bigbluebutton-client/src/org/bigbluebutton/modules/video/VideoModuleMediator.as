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
	import org.bigbluebutton.modules.video.view.ToolbarButtonMediator;
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
		
		/**
		 * The constructor. Registers the VideoModule with this mediator class 
		 * @param module
		 * 
		 */		
		public function VideoModuleMediator(module:VideoModule)
		{
			super(NAME, module);
			this.module = module;
		}
			
		override public function listNotificationInterests():Array{
			return [
					VideoModuleConstants.CONNECTED,
					VideoModuleConstants.DISCONNECTED
					];
		}
			
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case VideoModuleConstants.CONNECTED:
					if (facade.hasProxy(MediaProxy.NAME)) {
						var p:MediaProxy = facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
						p.setup();
						facade.registerMediator(new ToolbarButtonMediator());
					}
					break;
				case VideoModuleConstants.DISCONNECTED:
					if (facade.hasProxy(MediaProxy.NAME)) {
						var mp:MediaProxy = facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
						mp.stopAllStreams();
						if (facade.hasMediator(ToolbarButtonMediator.NAME)) {
							facade.removeMediator(ToolbarButtonMediator.NAME);
						}
					}
					break;
			}
		}		

	}
}