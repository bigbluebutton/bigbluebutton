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
	import flash.geom.Rectangle;
	import flash.utils.getQualifiedClassName;
	
	import flexlib.mdi.containers.MDICanvas;
	import flexlib.mdi.containers.MDIWindow;
	
	import mx.effects.Move;
	import mx.effects.Parallel;
	import mx.effects.Resize;
	import mx.events.EffectEvent;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.modules.layout.managers.OrderManager;

	public class WindowLayout {
		private static const LOGGER:ILogger = getClassLogger(WindowLayout);

		[Bindable] public var name:String;
		[Bindable] public var width:Number;
		[Bindable] public var height:Number;
		[Bindable] public var minWidth:int = -1;
		[Bindable] public var minHeight:int = -1;
		[Bindable] public var x:Number;
		[Bindable] public var y:Number;
		[Bindable] public var minimized:Boolean = false;
		[Bindable] public var maximized:Boolean = false;
		[Bindable] public var hidden:Boolean = false;
		[Bindable] public var order:int = -1;

		static private var EVENT_DURATION:int = 500;

		public function clone():WindowLayout {
			var cloned:WindowLayout = new WindowLayout();
			cloned.name = this.name;
			cloned.width = this.width;
			cloned.height = this.height;
			cloned.minWidth = this.minWidth;
			cloned.minHeight = this.minHeight;
			cloned.x = this.x;
			cloned.y = this.y;
			cloned.minimized = this.minimized;
			cloned.maximized = this.maximized;
			cloned.hidden = this.hidden;
			cloned.order = this.order;
			return cloned;
		}

		public function load(vxml:XML):void {
			if (vxml != null) {
				if (vxml.@name != undefined) {
					name = vxml.@name.toString();
				}
				if (vxml.@width != undefined) {
					width = Number(vxml.@width);
				}
				if (vxml.@height != undefined) {
					height = Number(vxml.@height);
				}
				if (vxml.@x != undefined) {
					x = Number(vxml.@x);
				}
				if (vxml.@y != undefined) {
					y = Number(vxml.@y);
				}
				if (vxml.@minWidth != undefined) {
					minWidth = int(vxml.@minWidth);
				}
				if (vxml.@minimized != undefined) {
					minimized = (vxml.@minimized.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@maximized != undefined) {
					maximized = (vxml.@maximized.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@hidden != undefined) {
					hidden = (vxml.@hidden.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@order != undefined) {
					order = int(vxml.@order);
				}
			}
		}
		
		private static function getWindowDimensionsAndPosition(window:MDIWindow):Rectangle {
			if (window.minimized || window.maximized) {
				return window.savedWindowRect;
			} else {
				return new Rectangle(window.x, window.y, window.width, window.height);
			}
		}

		public static function getLayout(canvas:MDICanvas, window:MDIWindow):WindowLayout {
			var layout:WindowLayout = new WindowLayout();
			var windowRect:Rectangle = getWindowDimensionsAndPosition(window);
			layout.name = getType(window);
			layout.width = windowRect.width / canvas.width;
			layout.height = windowRect.height / canvas.height;
			layout.minWidth = -1;
			layout.x = windowRect.x / canvas.width;
			layout.y = windowRect.y / canvas.height;
			layout.minimized = window.minimized;
			layout.maximized = window.maximized;
			layout.hidden = !window.visible;
			layout.order = OrderManager.getInstance().getOrderByRef(window);
			return layout;
		}
		
		static public function setLayout(canvas:MDICanvas, window:MDIWindow, layout:WindowLayout, onEffectEndCallback:Function):void {
			if (layout == null) {
				onEffectEndCallback();
				return;
			}

			layout.applyToWindow(canvas, window, onEffectEndCallback);
		}
		
		private function applyToWindow(canvas:MDICanvas, window:MDIWindow, onEffectEndCallback:Function):void {
			var newWidth:int = Math.floor(this.width * canvas.width);
			var newHeight:int = Math.floor(this.height * canvas.height);
			var newX:int = Math.floor(this.x * canvas.width);
			var newY:int = Math.floor(this.y * canvas.height);
			var newWindowRect:Rectangle = new Rectangle(newX, newY, newWidth, newHeight);

			window.visible = !this.hidden;

			if (this.minimized) {
				if (!window.minimized) {
					doOnEffectEnd(window, "windowMinimize", function():void {
						window.savedWindowRect = newWindowRect;
						onEffectEndCallback();
					});
					window.minimize();
				} else {
					window.savedWindowRect = newWindowRect;
					onEffectEndCallback();
				}
			} else if (this.maximized) {
				if (!window.maximized) {
					doOnEffectEnd(window, "windowMaximize", function():void {
						window.savedWindowRect = newWindowRect;
						onEffectEndCallback();
					});
					window.maximize();
				} else {
					window.savedWindowRect = newWindowRect;
					onEffectEndCallback();
				}
			} else if (!this.minimized && window.minimized) {
				doOnEffectEnd(window, "windowRestore", function():void {
					window.callLater(function():void {
						applyToWindow(canvas, window, onEffectEndCallback);
					});
				});
				window.unMinimize();
				window.restore();
			} else if (!this.maximized && window.maximized) {
				doOnEffectEnd(window, "windowRestore", function():void {
					window.callLater(function():void {
						applyToWindow(canvas, window, onEffectEndCallback);
					});
				});
				window.maximizeRestore();
				window.restore();
			} else {
				var effect:Parallel = new Parallel();
				effect.duration = EVENT_DURATION;
				effect.target = window;

				if (newX != window.x || newY != window.y) {
					var mover:Move = new Move();
					mover.xTo = newX;
					mover.yTo = newY;
					effect.addChild(mover);
				}

				if (newWidth != window.width || newHeight != window.height) {
					var resizer:Resize = new Resize();
					resizer.widthTo = newWidth;
					resizer.heightTo = newHeight;
					effect.addChild(resizer);
				}

				if (effect.children.length > 0) {
					window.addEventListener(EffectEvent.EFFECT_END, function(e:EffectEvent):void {
						e.currentTarget.removeEventListener(e.type, arguments.callee);
						onEffectEndCallback();
					});
					
					effect.play();
				} else {
					onEffectEndCallback();
				}
			}
		}
		
		private function doOnEffectEnd(window:MDIWindow, eventType:String, onEffectEndCallback:Function):void {
			window.windowManager.addEventListener(EffectEvent.EFFECT_END, function(e:EffectEvent):void {
				try {
					var obj:Object = (e as Object);
					var windows:Array = obj.windows;
					if (obj.mdiEventType == eventType && windows.indexOf(window) != -1) {
						e.currentTarget.removeEventListener(e.type, arguments.callee);
						onEffectEndCallback();
					}
				} catch (e:Error) {
					LOGGER.debug(e.toString());
				}
			});
		}
		
		static public function getType(obj:Object):String {
			if (obj is IBbbModuleWindow) {
				return (obj as IBbbModuleWindow).getName();
			} else {
				var qualifiedClass:String = String(getQualifiedClassName(obj));
				var pattern:RegExp = /(\w+)::(\w+)/g;
				if (qualifiedClass.match(pattern)) {
					return qualifiedClass.split("::")[1];
				} else {
					return String(Object).substr(String(Object).lastIndexOf(".") + 1).match(/[a-zA-Z]+/).join();
				}
			}
		}
		
		public function toAbsoluteXml(canvas:MDICanvas):XML {
			var xml:XML = <window/>;
			xml.@name = name;
			xml.@minimized = minimized;
			xml.@maximized = maximized;
			xml.@hidden = hidden;
			xml.@width = int(width * canvas.width);
			xml.@height = int(height * canvas.height);
			xml.@minWidth = minWidth;
			xml.@x = int(x * canvas.width);
			xml.@y = int(y * canvas.height);
			xml.@order = order;
			return xml;
		}
		
		public function toXml():XML {
			var xml:XML = <window/>;
			xml.@name = name;
			xml.@minimized = minimized;
			xml.@maximized = maximized;
			xml.@hidden = hidden;
			xml.@width = width;
			xml.@height = height;
			xml.@minWidth = minWidth;
			xml.@x = x;
			xml.@y = y;
			xml.@order = order;
			return xml;			
		}  
	}
}
