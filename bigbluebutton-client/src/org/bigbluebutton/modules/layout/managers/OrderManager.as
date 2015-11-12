/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.modules.layout.managers
{
	import flash.utils.Dictionary;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.modules.layout.model.LayoutDefinition;
	import org.bigbluebutton.modules.layout.model.WindowLayout;

	public class OrderManager {
		private static var _instance:OrderManager = null;
		private var _windowsOrder:Dictionary = new Dictionary();
	
		/**
		 * This class is a singleton. Please initialize it using the getInstance() method.
		 * 
		 */		
		public function OrderManager(enforcer:SingletonEnforcer) {
			if (enforcer == null){
				throw new Error("There can only be 1 OrderManager instance");
			}
			initialize();
		}
		
		private function initialize():void{
		}
		
		/**
		 * Return the single instance of the UserManager class
		 */
		public static function getInstance():OrderManager{
			if (_instance == null){
				_instance = new OrderManager(new SingletonEnforcer());
			}
			return _instance;
		}

		public function bringToFront(window:MDIWindow):void {
			if (LayoutDefinition.ignoreWindow(window))
				return;
			
			var type:String = WindowLayout.getType(window);
			var currentOrder:int = int.MAX_VALUE;
			if (_windowsOrder.hasOwnProperty(type))
				currentOrder = _windowsOrder[type].order;

			for (var key:Object in _windowsOrder) {
				var tmpOrder:int = _windowsOrder[key].order;
				if (tmpOrder <= currentOrder)
					_windowsOrder[key].order = tmpOrder + 1;
//				LogUtil.debug("==========> " + key + " order: " + _windowsOrder[key].order);
			}
			_windowsOrder[type] = { order: 0 };
		}
		
		public function getOrderByType(type:String):int {
			if (_windowsOrder.hasOwnProperty(type))
				return _windowsOrder[type].order;
			else
				return -1;
		}
		
		public function getOrderByRef(window:MDIWindow):int {
			return getOrderByType(WindowLayout.getType(window));
		}
		
	}
}

class SingletonEnforcer{}