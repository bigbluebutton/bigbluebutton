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
		
		[Bindable] public var name:String;
		// default is a reserved word in actionscript
		[Bindable] public var default_:Boolean = false;
		[Bindable] private var windows:Dictionary = new Dictionary();
		static private var _ignoredWindows:Array = new Array("PublishWindow", 
				"VideoWindow", "DesktopPublishWindow"); 
		
		public function load(vxml:XML):void {
			if (vxml != null) {
				if (vxml.@name != undefined) {
					name = vxml.@name.toString();
				}
				if (vxml.@default != undefined) {
					default_ = (vxml.@default.toString().toUpperCase() == "TRUE") ? true : false;
				}
				for each (var n:XML in vxml.window) {
					var window:WindowLayout = new WindowLayout();
					window.load(n);
					windows[window.name] = window;
				}
			}			
		}
		
		public function windowLayout(name:String):WindowLayout {
			return windows[name];
		}
		
		public function toXml():String {
			var r:String = "<layout name=\"" + name + 
					(default_? " default=\"true\"": "") + 
					" \">";
			for each (var value:WindowLayout in windows) {
				r += "\n\t" + value.toXml();
			}
			r += "\n</layout>";
			return r;
		}
		
		public function applyToCanvas(canvas:MDICanvas):void {
			if (canvas == null)
				return;
				
			for each (var window:MDIWindow in canvas.windowManager.windowList) {
				applyToWindow(canvas, window);
			}
		}
		
		public function applyToWindow(canvas:MDICanvas, window:MDIWindow):void {
			var type:String = WindowLayout.getType(window);
			WindowLayout.setLayout(canvas, window, windows[type]);
		}
		
		static public function getLayout(canvas:MDICanvas, name:String):LayoutDefinition {
			var layoutDefinition:LayoutDefinition = new LayoutDefinition();
			layoutDefinition.name = name;
			for each (var window:MDIWindow in canvas.windowManager.windowList) {
				var layout:WindowLayout = WindowLayout.getLayout(canvas, window);
				// for now we will just ignore the video windows
				if (layout.name in _ignoredWindows)
					continue;
				layoutDefinition.windows[layout.name] = layout;
			}
			return layoutDefinition;
		}
	}
}
