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
package org.bigbluebutton.common
{
	import flexlib.mdi.containers.MDIWindow;
	
	import mx.controls.Button;
	import mx.modules.ModuleBase;
	
	import org.bigbluebutton.common.red5.Connection;
	import org.bigbluebutton.common.red5.ConnectionEvent;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	
	/**
	 * This is an abstract-like class which is a base for a BigBlueButton Module. Extends this class if you
	 * wish to dynamicaly add your module to the MainApplicationShell.
	 * You can add the module by calling the addModule() method of the MainApplicationShellMediator
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class BigBlueButtonModule
	{
		public var preferedX:Number;
		public var preferedY:Number;
		private var MDIComponent:MDIWindow;
		public var name:String;
		public var _router:Router;
		public var mshell:MainApplicationShell;
		
		private var conn:Connection;
		private var connE:ConnectionEvent;
		
		public var startTime:String;
		public var addButton:Boolean = false;
		public var button:Button;
		
		public static const START_ON_LOGIN:String = "Start on Login";
		public static const START_ON_CREATION_COMPLETE:String = "Start on Creation Complete";
		
		public function BigBlueButtonModule(name:String)
		{
			super();
			this.name = name;
		}
		
		/**
		 *  
		 * @return - The X coordinate of the position where you'd like the module to appear on the main screen
		 * 
		 */		
		public function getXPosition():Number{
			return this.preferedX;
		}
		
		/**
		 * 
		 * @return - The X coordinate of the position where you'd like the module to appear on the main screen
		 * 
		 */		
		public function getYPosition():Number{
			return this.preferedY;
		}
		
		/**
		 * 
		 * @return - The GUI component of this module. The component must be MDI compatible, since BBB is
		 * using the Flexlib MDI library
		 * 
		 */		
		public function getMDIComponent():MDIWindow{
			return this.MDIComponent;
		}
		
		/**
		 * This method is called on all modules by the MainApplicationShell when the user logs out.
		 * Handle any module-specific logout tasks here (network connection closures, etc...)
		 * If using PureMVC, make sure you call the removeCore() method in the facade in order to
		 * clean up any leftover singletons.
		 * The GUI component of the module is removed from the MainApplicationShell prior to this method
		 * being called. 
		 * 
		 */		
		public function logout():void{
			
		}
		
		/**
		 * Accept the PureMVC piping utility router 
		 * @param router
		 * @param shell
		 * 
		 */		
		public function acceptRouter(router:Router, shell:MainApplicationShell):void{
			mshell = shell;
			_router = router;
		}
		
		public function get router():Router{
			return _router;
		}
		
		public function set router(router:Router):void{
			this._router = router;
		}
		
		public function moduleAdded():void{
			
		}

	}
}