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
package org.bigbluebutton.modules.layout.model {
	import flash.utils.Dictionary;
	
	import flexlib.mdi.containers.MDICanvas;
	import flexlib.mdi.containers.MDIWindow;
	import org.bigbluebutton.core.UsersUtil;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.core.managers.UserManager;

	public class LayoutDefinition {
		
		private static const LOGGER:ILogger = getClassLogger(LayoutDefinition);
    
		[Bindable] public var name:String;
		// default is a reserved word in actionscript
		[Bindable] public var defaultLayout:Boolean = false;
    
   		public var currentLayout:Boolean = false;
    
		private var _layoutsPerRole:Dictionary = new Dictionary();
		
		static private var _ignoredWindows:Array = new Array("AvatarWindow", "PublishWindow", 
				"VideoWindow", "ScreensharePublishWindow", "ScreenshareViewWindow",
				"LogWindow");
		static private var _roles:Array = new Array(Role.VIEWER, Role.MODERATOR, Role.PRESENTER);
				
		private function loadLayout(vxml:XML):void {
			if (vxml.@name != undefined) {
				name = vxml.@name.toString();
			}
			if (vxml.@default != undefined) {
				defaultLayout = (vxml.@default.toString().toUpperCase() == "TRUE") ? true : false;
			}
			var role:String = Role.VIEWER;
			if (vxml.@role != undefined && _roles.indexOf(vxml.@role.toString().toUpperCase()) != -1) {
				role = vxml.@role.toString().toUpperCase();
			}
			if (!_layoutsPerRole.hasOwnProperty(role))
				_layoutsPerRole[role] = new Dictionary();
			for each (var n:XML in vxml.window) {
				var window:WindowLayout = new WindowLayout();
				window.load(n);
				_layoutsPerRole[role][window.name] = window;
			}
		}
		
		public function load(vxml:XML):void {
			if (vxml == null)
				return;
			
			if (vxml.name().localName == "layout")
				loadLayout(vxml);
			else if (vxml.name().localName == "layout-block") {
				for each (var tmp:XML in vxml.layout)
					loadLayout(tmp);
			}
		}

		private function get myLayout():Dictionary {
			var hasViewerLayout:Boolean = _layoutsPerRole.hasOwnProperty(Role.VIEWER);
			var hasModeratorLayout:Boolean = _layoutsPerRole.hasOwnProperty(Role.MODERATOR);
			var hasPresenterLayout:Boolean = _layoutsPerRole.hasOwnProperty(Role.PRESENTER);
			
			if (UserManager.getInstance().getConference().amIPresenter && hasPresenterLayout) {
				return _layoutsPerRole[Role.PRESENTER];
			} else if (UserManager.getInstance().getConference().amIModerator() && hasModeratorLayout) {
				return _layoutsPerRole[Role.MODERATOR];
			} else if (hasViewerLayout)   {
				return _layoutsPerRole[Role.VIEWER];
			} else if (hasModeratorLayout) {
				return _layoutsPerRole[Role.MODERATOR];
			} else if (hasPresenterLayout) {
				return _layoutsPerRole[Role.PRESENTER];
			} else {
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["layout"];
                logData.message = "There's no layout that fits the participants profile."; 
                LOGGER.error(JSON.stringify(logData));

				return null;
			}
		}
		
		public function windowLayout(name:String):WindowLayout {
			return myLayout[name];
		}
		
		private function windowsToXml(windows:Dictionary):XML {
			var xml:XML = <layout/>;
			xml.@name = name;
			if (defaultLayout)
				xml.@default = true;
			for each (var value:WindowLayout in windows) {
				xml.appendChild(value.toXml());
			}
			return xml;
		}
		
		public function toXml():XML {
			var xml:XML = <layout-block/>;
			var tmp:XML;
			for each (var value:String in _roles) {
				if (_layoutsPerRole.hasOwnProperty(value)) {
					tmp = windowsToXml(_layoutsPerRole[value]);
					if (value != Role.VIEWER)
						tmp.@role = value;
					xml.appendChild(tmp);
				}
			}
			return xml;
		}
		
		public function applyToCanvas(canvas:MDICanvas):void {
			if (canvas == null)
				return;
			
			var windows:Array = canvas.windowManager.windowList;
			// LogUtil.traceObject(myLayout);
			var transformedLayout:Dictionary = generateWindowsTransformations(myLayout, windows, canvas.width, canvas.height);
			
			var type:String;
			for each (var window:MDIWindow in windows) {
				type = WindowLayout.getType(window);
				//trace(LOG + "Determine if we need to apply layout [" + name + "] for window [" + type + "]");
				if (!ignoreWindowByType(type)) {
					//trace(LOG + "Applying layout [" + name + "] to window [" + type + "]");
					WindowLayout.setLayout(canvas, window, transformedLayout[type]);
				} else {
					//trace(LOG + "Ignoring layout [" + name + "] to window [" + type + "]");
				}
			}
		}
		
		// http://stackoverflow.com/questions/12162607/how-to-clone-a-dictionary-and-its-content
		private function cloneLayoutDictionary(original:Dictionary):Dictionary {
		    var cloned:Dictionary = new Dictionary();
		    for(var key:Object in original) {
				cloned[key] = original[key].clone();
		    }
		    return cloned;
		}
		
		private function generateWindowsTransformations(layout:Dictionary, windows:Array, screen_w:int, screen_h:int):Dictionary {
			var type:String;
			var i:int;
			var items:Array = new Array();
			var item:Object;
			var copiedLayout:Dictionary = cloneLayoutDictionary(layout);

			for each (var window:MDIWindow in windows) {
				type = WindowLayout.getType(window);
				if (ignoreWindowByType(type) || !copiedLayout.hasOwnProperty(type))
					continue;
				
				items.push({
					type: type,
					x0: copiedLayout[type].x,
					y0: copiedLayout[type].y,
					w0: copiedLayout[type].width,
					h0: copiedLayout[type].height,
					fixed_w: copiedLayout[type].minWidth != -1 && copiedLayout[type].minWidth / screen_w > copiedLayout[type].width,
					fixed_h: copiedLayout[type].minHeight != -1 && copiedLayout[type].minHeight / screen_h > copiedLayout[type].height,
					min_w: copiedLayout[type].minWidth != -1? copiedLayout[type].minWidth / screen_w: copiedLayout[type].width,
					min_h: copiedLayout[type].minHeight != -1? copiedLayout[type].minHeight / screen_h: copiedLayout[type].height,
					fixed_on_left0: 0.0,
					not_fixed_on_left0: 0.0
				});
			}

			items.sortOn("x0", Array.NUMERIC);

			/**
			 *	First we are interested in discovering which windows have a fixed 
			 *	width. We understand as fixed width the window that will be restricted 
			 *	in width by the minWidth parameter. The next procedure will discover 
			 *	how many pixels are fixed or non-fixed at the left of each window. 
			 *	This is an important information because it will say how the windows 
			 *	will be positioned after the transformation.
			 */
			var pivot0:Number = 0.0;
			var pivot1:Number = 0.0;
			var fixed_w0:Number = 0.0;
			var fixed_w1:Number = 0.0;
			for (i = 0; i < items.length; ++i) {
				item = items[i];
				
				item.fixed_on_left0 = fixed_w0 - (pivot0 > item.x0? pivot0 - item.x0: 0);
				item.not_fixed_on_left0 = item.x0 - item.fixed_on_left0;
				item.fixed_on_left1 = fixed_w1 - (pivot0 > item.x0? pivot1 - item.x0: 0);

				if (item.fixed_w) {
					item.w1 = item.min_w;

					if (pivot0 <= item.x0) {
						fixed_w0 += item.w0;
					} else if (pivot0 < item.x0 + item.w0) {
						fixed_w0 += item.x0 + item.w0 - pivot0;
					}
					pivot0 = Math.max(pivot0, item.x0 + item.w0);

					if (pivot1 <= item.x0) {
						fixed_w1 += item.w1;
					} else if (pivot1 < item.x0 + item.w1) {
						fixed_w1 += item.x0 + item.w1 - pivot1;
					}
					pivot1 = Math.max(pivot1, item.x0 + item.w1);
				} else {
					pivot0 = Math.max(pivot0, item.x0);
					pivot1 = Math.max(pivot1, item.x0);
				}
			}

			var not_fixed_w0:Number = 1 - fixed_w0;
			var not_fixed_w1:Number = 1 - fixed_w1;
			var not_fixed_multiplier:Number = (fixed_w1 - fixed_w0) / not_fixed_w0;

			/**
			 *	The same procedure is executed (using a pivot) to discover how 
			 *	many pixels aren't fixed at the left of each window AFTER the transformation, 
			 *	and then generate the transformation at the windows in position and width.
			 */
			pivot0 
				= pivot1 
				= fixed_w0 
				= fixed_w1 
				= not_fixed_w0 
				= not_fixed_w1 
				= 0.0;
			for (i = 0; i < items.length; ++i) {
				item = items[i];

				item.not_fixed_on_left1 = item.not_fixed_on_left0 - item.not_fixed_on_left0 * not_fixed_multiplier;

				item.w1 = item.fixed_w? item.min_w: item.w0 - item.w0 * not_fixed_multiplier;
				item.x1 = item.x0 + (item.fixed_on_left1 - item.fixed_on_left0) + (item.not_fixed_on_left1 - item.not_fixed_on_left0);

				if (item.fixed_w) {
					item.w1 = item.min_w;

					if (pivot0 <= item.x0) {
						fixed_w0 += item.w0;
					} else if (pivot0 < item.x0 + item.w0) {
						fixed_w0 += item.x0 + item.w0 - pivot0;
					}
					pivot0 = Math.max(pivot0, item.x0 + item.w0);

					if (pivot1 <= item.x0) {
						fixed_w1 += item.w1;
					} else if (pivot1 < item.x0 + item.w1) {
						fixed_w1 += item.x0 + item.w1 - pivot1;
					}
					pivot1 = Math.max(pivot1, item.x0 + item.w1);
				} else {
					pivot0 = Math.max(pivot0, item.x0);
					pivot1 = Math.max(pivot1, item.x0);
				}
				
				copiedLayout[item.type].x = item.x1;
				copiedLayout[item.type].y = item.y0;
				copiedLayout[item.type].width = item.w1;
				copiedLayout[item.type].height = item.h0;
			}
			
			return copiedLayout;
		}
		
		private function apply(canvas:MDICanvas, window:MDIWindow, type:String=null):void {
			if (type == null) {
				type = WindowLayout.getType(window);
			}

			if (!ignoreWindowByType(type)) {
				WindowLayout.setLayout(canvas, window, myLayout[type]);
			}
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
			layoutDefinition._layoutsPerRole[Role.VIEWER] = new Dictionary();
			for each (var window:MDIWindow in canvas.windowManager.windowList) {
				var layout:WindowLayout = WindowLayout.getLayout(canvas, window);
				if (!ignoreWindowByType(layout.name))
					layoutDefinition._layoutsPerRole[Role.VIEWER][layout.name] = layout;
			}
			return layoutDefinition;
		}
	}
}
