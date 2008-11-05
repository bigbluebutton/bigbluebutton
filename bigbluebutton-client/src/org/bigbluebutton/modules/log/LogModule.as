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
package org.bigbluebutton.modules.log
{  
	import flash.system.Capabilities;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.messaging.IRouterAware;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.log.view.LogModuleMediator;
	
	/**
	 * 
	 * view component class for LogModuleMediator
	 * 
	 */	
	public class LogModule extends BigBlueButtonModule
	{
		public static const NAME:String = 'LogModule';
		
		private var facade : LogModuleFacade;	
		public var mediator:LogModuleMediator;	

		/**
		 * Constructor 
		 * Gets an instance of facade
		 */		
		public function LogModule()
		{
			super(NAME);
			facade = LogModuleFacade.getInstance(NAME);		
			this.preferedX = Capabilities.screenResolutionX - 500;
			this.preferedY = Capabilities.screenResolutionY - 500;	
		}
		/**
		 * setting up the router for the shell 
		 * @param router:Router
		 * @param shell:MAinApplicationShell
		 * 
		 */        
		override public function acceptRouter(router : Router) : void
		{
			super.acceptRouter(router);
			trace('In LogModule');
			facade.startup(this);			
			trace('In LogModule 3');
		}
		
		override public function getMDIComponent():MDIWindow{
			//var mediator:LogModuleMediator = facade.retrieveMediator(LogModuleMediator.NAME) as LogModuleMediator;
			return mediator.logWindow;
		}
		
		public function openLogWindow():void{
			mediator.addWindow();
		}
	}
}