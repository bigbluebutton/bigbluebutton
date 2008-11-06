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
package org.bigbluebutton.modules.listeners.control
{
	import org.bigbluebutton.modules.listeners.VoiceFacade;
	import org.bigbluebutton.modules.listeners.VoiceModule;
	import org.bigbluebutton.modules.listeners.VoiceModuleMediator;
	import org.bigbluebutton.modules.listeners.model.business.NetConnectionDelegate;
	import org.bigbluebutton.modules.listeners.model.business.VoiceConfConnectResponder;
	import org.bigbluebutton.modules.listeners.view.MeetMeUserItem;
	import org.bigbluebutton.modules.listeners.view.MeetMeUserItemMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * This command gets called from the facade when the application is first started 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class StartupCommand extends SimpleCommand
	{
		/**
		 * This method gets automatically called, there is no need to call it
		 * <p>
		 * This method initiates the mediators and the proxies that the application needs 
		 * @param notification
		 * 
		 */		
		override public function execute(notification:INotification):void{
			var app:VoiceModule = notification.getBody() as VoiceModule;
			facade.registerMediator(new VoiceModuleMediator(app));
			
			facade.registerProxy(new NetConnectionDelegate(VoiceFacade.getInstance().meetMeRoom.getUri()));
			facade.registerMediator(new VoiceConfConnectResponder(VoiceFacade.getInstance().meetMeRoom));
			//facade.registerMediator(new MeetMeUserItemMediator(new MeetMeUserItem()));
		}
	}
}