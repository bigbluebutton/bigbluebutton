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
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	
	/**
	 * The VideoModule is the main class of the Video Application
	 * <p>
	 * This class extends the ModuleBase class of the Flex Framework
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class VideoModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "VideoModule";
		
		private var facade:VideoFacade;
		private var shell:MainApplicationShell;
		public var mediator:VideoModuleMediator;
		public var viewComponent:MDIWindow;
		public var streamName:String;
		
		/**
		 * Creates a new instance of the Video Module 
		 * 
		 */		
		public function VideoModule()
		{
			super(NAME);
			facade = VideoFacade.getInstance();
			streamName = "stream" + String( Math.floor( new Date().getTime() ) );
		}
		
		/**
		 * Accept the router from the main application to be used for sending messages back and forth 
		 * @param router
		 * @param shell
		 * 
		 */		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			super.acceptRouter(router, shell);
			facade.startup(this);
		}
		
		override public function getMDIComponent():MDIWindow{
			return viewComponent;
		}
		
		override public function logout():void{
			facade.removeCore(VideoFacade.NAME);
		}
		
		public function openViewCamera(streamName:String):void{
			mediator.addViewWindow(streamName);
		}

	}
}