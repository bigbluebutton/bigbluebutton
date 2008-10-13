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
package org.bigbluebutton.modules.voiceconference
{
	import flexlib.mdi.containers.MDIWindow;  
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.Constants;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	
	/**
	 * This is the main class of the Voice Module application. It extends the ModuleBase class of the
	 * Flex Framework
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class VoiceModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = "VoiceModule";
		public static const URI:String = "rtmp://" + Constants.red5Host + "/astmeetme/"; 
		
		private var facade:VoiceConferenceFacade;
		public var activeWindow:MDIWindow;
		
		/**
		 * Creates a new VoiceModule 
		 * 
		 */		
		public function VoiceModule()
		{
			super(NAME);
			facade = VoiceConferenceFacade.getInstance();
			this.preferedX = 20;
			this.preferedY = 260;
			this.startTime = BigBlueButtonModule.START_ON_LOGIN;
		}
		
		/**
		 * Accept a Router object through which messages can be sent and received 
		 * @param router
		 * @param shell
		 * 
		 */		
		override public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			var conf:Conference = ViewersFacade.getInstance().retrieveMediator(Conference.NAME) as Conference;
			super.acceptRouter(router, shell);
			facade.startup(this, URI + conf.room);
			facade.connectToMeetMe();
		}
		
		override public function getMDIComponent():MDIWindow{
			return activeWindow;
		}
		
		override public function logout():void{
			// Do nothing for now - listeners are independent of who is logged in through the client
			facade.removeCore(VoiceConferenceFacade.ID);
		}
		
	}
}