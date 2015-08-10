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
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	import flash.utils.getQualifiedClassName;
	
	import mx.effects.Move;
	import mx.effects.Parallel;
	import mx.effects.Resize;
	
	import flexlib.mdi.containers.MDICanvas;
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.modules.layout.managers.OrderManager;

	public class WindowLayout {


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
    [Bindable] public var resizable:Boolean = true;
    [Bindable] public var draggable:Boolean = true;
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
			cloned.resizable = this.resizable;
			cloned.draggable = this.draggable;
			cloned.order = this.order;
			return cloned;
		}

		public function load(vxml:XML):void {
//      trace("Load layout \n" + vxml.toXMLString() + "\n");
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
				// not implemented yet
				//if (vxml.@minHeight != undefined) {
				//	minHeight = int(vxml.@minHeight);
				//}
				if (vxml.@minimized != undefined) {
					minimized = (vxml.@minimized.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@maximized != undefined) {
					maximized = (vxml.@maximized.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@hidden != undefined) {
					hidden = (vxml.@hidden.toString().toUpperCase() == "TRUE") ? true : false;
				}
        if (vxml.@draggable != undefined) {
          draggable = (vxml.@draggable.toString().toUpperCase() == "TRUE") ? true : false;
        }
        if (vxml.@resizable != undefined) {
          resizable = (vxml.@resizable.toString().toUpperCase() == "TRUE") ? true : false;
        }
				if (vxml.@order != undefined) {
					order = int(vxml.@order);
				}
			}
      
//      trace("WindowLayout::load for " + name + " [minimized=" + minimized + ",maximized=" 
//        + maximized + ",hidden=" + hidden + ",drag=" + draggable + ",resize=" + resizable + "]");
		}
		
		static public function getLayout(canvas:MDICanvas, window:MDIWindow):WindowLayout {
			var layout:WindowLayout = new WindowLayout();
			layout.name = getType(window);
			layout.width = window.width / canvas.width;
			layout.height = window.height / canvas.height;
			layout.minWidth = -1;
			//layout.minHeight = -1;
			layout.x = window.x / canvas.width;
			layout.y = window.y / canvas.height;
			layout.minimized = window.minimized;
			layout.maximized = window.maximized;
      layout.resizable = window.resizable;
      layout.draggable = window.draggable;
			layout.hidden = !window.visible;
			layout.order = OrderManager.getInstance().getOrderByRef(window);
      
      //trace("WindowLayout::getLayout for " + layout.name + " [minimized=" + layout.minimized + ",maximized=" + layout.maximized + ",hidden=" + layout.hidden 
      //  + ",drag=" + layout.draggable + ",resize=" + layout.resizable + "]");
      
			return layout;
		}
		
		static public function setLayout(canvas:MDICanvas, window:MDIWindow, layout:WindowLayout):void {
      //if (window == null) trace("WindowLayout::setLayout - window is NULL!!!");
      //if (layout == null) trace("WindowLayout::setLayout - layout is NULL!!!");
      //if (layout.name == null) trace("WindowLayout::setLayout - layout.name is NULL!!!");
      
      //trace("WindowLayout::setLayout for " + getType(window) + ",layout=" + layout.name + "]");
      
			if (layout == null) {
        return;
      }
      
      //trace("WindowLayout::setLayout [minimized=" + layout.minimized + ",maximized=" + layout.maximized + ",hidden=" + layout.hidden 
      //  + ",drag=" + layout.draggable + ",resize=" + layout.resizable + "]");
      
			layout.applyToWindow(canvas, window);
		}
		
		private var _delayedEffects:Array = new Array();
		private function delayEffect(canvas:MDICanvas, window:MDIWindow):void {
			var obj:Object = {canvas:canvas, window:window};
			_delayedEffects.push(obj);
			var timer:Timer = new Timer(150,1);
			timer.addEventListener(TimerEvent.TIMER, onTimerComplete);
			timer.start();
		}
		
		private function onTimerComplete(event:TimerEvent = null):void {
//      trace("::onTimerComplete");
			var obj:Object = _delayedEffects.pop();
			applyToWindow(obj.canvas, obj.window);
		}
		
		private function applyToWindow(canvas:MDICanvas, window:MDIWindow):void {
//      trace("WindowLayout::applyToWindow for " + window.name + " using layout " + this.name + "]");
      
			var effect:Parallel = new Parallel();
			effect.duration = EVENT_DURATION;
			effect.target = window;

      if (window.visible && this.hidden) {
        window.visible = false;
      }
      
      if (!this.hidden) {
        window.visible = true;
      }
      
      // fcecagno 06/06/2013
      // Fixing the issue https://code.google.com/p/bigbluebutton/issues/detail?id=1520
      // Issue introduced in this commit https://github.com/bigbluebutton/bigbluebutton/commit/20487a75cbadac046e27ce5bdc124048b4bed1e0
      // There's an important conceptual problem defining draggable and resizable properties for layouts. The problem
      // is that, when the moderator locks the layout, the viewers shouldn't be able to drag nor resize the windows. But what if
      // the layout definition says that the layout is draggable and/or resizable? Then, the lock button is no guarantee that
      // all users are viewing the same window arrangement. My opinion is that the use case should be very well documented, as
      // well as the expected behavior of these properties. In case we decide to remove completely this implementation, we should
      // cleanup most part of the changes done in the above commit.
      //window.draggable = this.draggable;
      //window.resizable = this.resizable;
      
			if (this.minimized) {
				if (!window.minimized) window.minimize();
			} else if (this.maximized) {
				if (!window.maximized) window.maximize();
			} else if (window.minimized && !this.minimized && !this.hidden) {
				window.unMinimize();
				delayEffect(canvas, window);
				return;
			} else if (window.maximized && !this.maximized && !this.hidden) {
				window.maximizeRestore();
				delayEffect(canvas, window);
				return;
			} else {
				if (!this.hidden) {
					var newWidth:int = int(this.width * canvas.width);
					var newHeight:int = int(this.height * canvas.height);
					var newX:int = int(this.x * canvas.width);
					var newY:int = int(this.y * canvas.height);
					
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
						effect.addChild(resizer)
					}
				}
			}
      
      if (window.visible && this.hidden) {
        window.visible = false;
      }
      
//      trace("WindowLayout::applyToWindow Layout= [minimized=" + this.minimized + ",maximized=" + this.maximized + ",visible=" + !this.hidden 
//        + ",drag=" + this.draggable + ",resize=" + this.resizable + "]");
      
//      trace("WindowLayout::applyToWindow Window = [minimized=" + window.minimized + ",maximized=" + window.maximized + ",visible=" + window.visible 
//        + ",drag=" + window.draggable + ",resize=" + window.resizable + "]");
		
			if (effect.children.length > 0) {
				effect.play();
      }
		}
		
		static public function getType(obj:Object):String {
			var qualifiedClass:String = String(getQualifiedClassName(obj));
			var pattern:RegExp = /(\w+)::(\w+)/g;
			if (qualifiedClass.match(pattern)) {
				return qualifiedClass.split("::")[1];
			} else { 
				return String(Object).substr(String(Object).lastIndexOf(".") + 1).match(/[a-zA-Z]+/).join();
			}
		}
		
		public function toAbsoluteXml(canvas:MDICanvas):XML {
			var xml:XML = <window/>;
			xml.@name = name;
			if (minimized)
				xml.@minimized = true;
			else if (maximized)
				xml.@maximized = true;
			else if (hidden)
				xml.@hidden = true;
			else {
				xml.@width = int(width * canvas.width);
				xml.@height = int(height * canvas.height);
				xml.@minWidth = minWidth;
				//xml.@minHeight = minHeight;
				xml.@x = int(x * canvas.width);
				xml.@y = int(y * canvas.height);

				xml.@draggable = draggable;
				xml.@resizable = resizable;
			}
			xml.@order = order;
			return xml;
		}
		
		public function toXml():XML {
			var xml:XML = <window/>;
			xml.@name = name;
			if (minimized)
				xml.@minimized = true;
			else if (maximized)
				xml.@maximized = true;
			else if (hidden)
				xml.@hidden = true;
			else {
				xml.@width = width;
				xml.@height = height;
				xml.@minWidth = minWidth;
				//xml.@minHeight = minHeight;
				xml.@x = x;
				xml.@y = y;

				xml.@draggable = draggable;
				xml.@resizable = resizable;
			}
			xml.@order = order;
			return xml;			
		}  
	}
}
