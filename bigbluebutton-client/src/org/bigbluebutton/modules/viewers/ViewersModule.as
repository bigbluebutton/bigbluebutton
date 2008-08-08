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
package org.bigbluebutton.modules.viewers
{
	import flash.system.Capabilities;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.viewers.model.services.SharedObjectConferenceDelegate;
	
	/**
	 * This is the main class of the ViewersModule. It extends the ModuleBase class of the Flex Framework 
	 * @author dzgonjan
	 * 
	 */	
	public class ViewersModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "VoiceModule";
		
		private var facade:ViewersFacade;
		public var activeWindow:MDIWindow;
		
		public function ViewersModule()
		{
			super(NAME);
			facade = ViewersFacade.getInstance();
			this.preferedX = Capabilities.screenResolutionX/2 - 328/2;
			this.preferedY = Capabilities.screenResolutionY/2 - 265;
		}
		
		/**
		 * Accept the Router object through which this class can send and receive messages to other modules 
		 * @param router
		 * @param shell
		 * 
		 */		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			super.acceptRouter(router, shell);
			facade.startup(this);
		}
		
		override public function getMDIComponent():MDIWindow{
			return activeWindow;
		}
		
		override public function logout():void{
			
			var delegate:SharedObjectConferenceDelegate = 
				facade.retrieveProxy(SharedObjectConferenceDelegate.NAME) as SharedObjectConferenceDelegate;
			
			delegate.leave();
			
			facade.removeCore(ViewersFacade.NAME);
		}
	}
}