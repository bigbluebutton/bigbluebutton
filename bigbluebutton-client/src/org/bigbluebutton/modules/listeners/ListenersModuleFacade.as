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
package org.bigbluebutton.modules.listeners
{

	
	import flash.net.NetConnection;
	
	import org.bigbluebutton.modules.listeners.control.StartupVoiceConfCommand;
	import org.bigbluebutton.modules.listeners.model.VoiceConferenceRoom;
	import org.bigbluebutton.modules.listeners.model.business.NetConnectionDelegate;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
		
	/**
	 * The  MeetMeFacade is the main Facade of the MeetMe module. It extends the Facade class of the PureMVC
	 * framework
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	
	public class ListenersModuleFacade extends Facade implements IFacade
	{
		public static const ID : String = "VoiceConferenceFacade";
		public static const STARTUP:String = "StartupVoiceConference";
		
		//EVENTS
		public static const MUTE_UNMUTE_USER_COMMAND : String = "MEETME_MUTE_UNMUTE_USER";
		public static const EJECT_USER_COMMAND : String = "MEETME_EJECT_USER";
		public static const MUTE_ALL_USERS_COMMAND : String = "MEETME_MUTE_ALL_USER";
		public static const USER_JOIN_EVENT:String = "User Join Event";
		public static const MUTE_EVENT:String = "mute event";
		
		public var meetMeRoom:VoiceConferenceRoom;
				
		/**
		 * The default constructor. Should NEVER be called directly, as this class is a singleton.
		 * Instead, use the getInstance() method 
		 * 
		 */		
		public function ListenersModuleFacade()
		{
			super(ID);		
		}
		
		/**
		 *  
		 * @return The instance of MeetMeFacade singleton class
		 * 
		 */		
		public static function getInstance() : VoiceFacade
		{
			if (instanceMap[ID] == null) instanceMap[ID] = new VoiceFacade();
			return instanceMap[ID] as VoiceFacade;
	   	}		
	   	
	   	/**
	   	 * Initializes the controller part of this MVC module 
	   	 * 
	   	 */	   	
	   	override protected function initializeController():void{
	   		super.initializeController();
	   		registerCommand(STARTUP, StartupVoiceConfCommand);
	   	}
	   	
	   	/**
	   	 * Sends out a notification to start the command which initiates the mediators and the proxies 
	   	 * @param app
	   	 * 
	   	 */	   	
	   	public function startup(app:VoiceModule, uri:String):void{
	   		meetMeRoom = new VoiceConferenceRoom(uri);
	   		sendNotification(STARTUP, app);
	   		//meetMeRoom.getConnection().connect();
	   	}
	   	
	   	/**
	   	 *  Richard: Had to create this to prevent stack overflow when done during initialize	 
	   	 * @param userRole
	   	 * 
	   	 */	   	
	   	public function setupMeetMeRoom(userRole : String) : void
	   	{
			meetMeRoom.userRole = userRole;
	   	}  	

		/**
		 * Initializes the connection to the server 
		 * 
		 */
		public function connectToMeetMe() : void
	   	{
	   		var netProxy:NetConnectionDelegate = retrieveProxy(NetConnectionDelegate.NAME) as NetConnectionDelegate;
			netProxy.connect(new NetConnection());		
	   	}
	   		   	
	   	/**
	   	 * 
	   	 * @return The MeetMeRoom of the MeetMe module
	   	 * 
	   	 */	   		   	
	   	public function getMeetMeRoom():VoiceConferenceRoom
	   	{
	   		return meetMeRoom;
	   	}
	}
}