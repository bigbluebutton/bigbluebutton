/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 * 
 * Author: Felipe Cecagno <felipe@mconf.org>
 */
package org.bigbluebutton.modules.layout.model {

	public class LayoutDefinition {

		import flash.utils.Dictionary;
		import flexlib.mdi.containers.MDICanvas;
		import flexlib.mdi.containers.MDIWindow;
		
		import org.bigbluebutton.common.LogUtil;
		import org.bigbluebutton.modules.layout.managers.OrderManager;
		
		[Bindable] public var name:String;
		// default is a reserved word in actionscript
		[Bindable] public var defaultLayout:Boolean = false;
		[Bindable] private var _windows:Dictionary = new Dictionary();
		static private var _ignoredWindows:Array = new Array("PublishWindow", 
				"VideoWindow", "DesktopPublishWindow", "DesktopViewWindow",
				"LogWindow");
		
		public function load(vxml:XML):void {
			if (vxml != null) {
				if (vxml.@name != undefined) {
					name = vxml.@name.toString();
				}
				if (vxml.@default != undefined) {
					defaultLayout = (vxml.@default.toString().toUpperCase() == "TRUE") ? true : false;
				}
				for each (var n:XML in vxml.window) {
					var window:WindowLayout = new WindowLayout();
					window.load(n);
					_windows[window.name] = window;
				}
			}			
		}
		
		public function windowLayout(name:String):WindowLayout {
			return _windows[name];
		}
		
		public function toXml():XML {
			var xml:XML = <layout/>;
			xml.@name = name;
			if (defaultLayout)
				xml.@default = true;
			for each (var value:WindowLayout in _windows) {
				xml.appendChild(value.toXml());
			}
			return xml;
		}
		
		private function adjustWindowsOrder(canvas:MDICanvas):void {
			var orderList:Array = new Array();
			var type:String;
			var order:int;
			for each (var window:MDIWindow in canvas.windowManager.windowList) {
				type = WindowLayout.getType(window);
				
				if (ignoreWindowByType(type) || !_windows.hasOwnProperty(type))
					continue;
				
				order = _windows[type].order;

				// order == -1 means that there's no order defined for this window
				if (order != -1)
					orderList[order] = { window:window, order:order, type:type };
			}
			
			// only bring the focused window to front
			for each (var obj:Object in orderList) {
				if (obj != null) {
					obj.window.windowManager.bringToFront(obj.window);
					break;
				}
			}
		}
		
		public function applyToCanvas(canvas:MDICanvas):void {
			if (canvas == null)
				return;		

//			adjustWindowsOrder(canvas);

			for each (var window:MDIWindow in canvas.windowManager.windowList) {
				applyToWindow(canvas, window);
			}
		}
		
		public function applyToWindow(canvas:MDICanvas, window:MDIWindow, type:String=null):void {
			if (type == null)
				type = WindowLayout.getType(window);

			if (!ignoreWindowByType(type))
				WindowLayout.setLayout(canvas, window, _windows[type]);
		}
		
		static private function ignoreWindowByType(type:String):Boolean {
			return (_ignoredWindows.indexOf(type) != -1);
		}
		
		static public function ignoreWindow(window:MDIWindow):Boolean {
			var type:String = WindowLayout.getType(window);
			return ignoreWindowByType(type);
		}
		
		static public function getLayout(canvas:MDICanvas, name:String):LayoutDefinition {
			var layoutDefinition:LayoutDefinition = new LayoutDefinition();
			layoutDefinition.name = name;
			for each (var window:MDIWindow in canvas.windowManager.windowList) {
				var layout:WindowLayout = WindowLayout.getLayout(canvas, window);
				if (!ignoreWindowByType(layout.name))
					layoutDefinition._windows[layout.name] = layout;
			}
			return layoutDefinition;
		}
	}
}
