/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.playback
{
	import flash.system.Capabilities;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	
	public class PlaybackModule extends BigBlueButtonModule
	{
		public static const NAME:String = "PlaybackModule";
		
		private var facade:PlaybackFacade;
		public var activeWindow:MDIWindow;
		
		public function PlaybackModule()
		{
			super(NAME); 
			facade = PlaybackFacade.getInstance();
			this.preferedX = Capabilities.screenResolutionX/2 - 350;
			this.preferedY = Capabilities.screenResolutionY - 600;
			this.startTime = BigBlueButtonModule.START_ON_LOGIN;
		}
		
		override public function acceptRouter(router:Router):void{
			super.acceptRouter(router);
			facade.startup(this);
		}
		
		override public function getMDIComponent():MDIWindow{
			return activeWindow;
		}
		
		override public function logout():void{
			facade.removeCore(PlaybackFacade.NAME);
		}

	}
}