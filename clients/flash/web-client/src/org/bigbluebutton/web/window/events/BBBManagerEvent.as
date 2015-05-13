/*
 * Copyright (c) 2007 FlexLib Contributors.  See:
 * http://code.google.com/p/flexlib/wiki/ProjectContributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package org.bigbluebutton.web.window.events {
	import flash.events.Event;
	
	import mx.effects.Effect;
	
	import org.bigbluebutton.web.window.views.BBBManager;
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	/**
	 * Event type dispatched by BBBManager. Majority of events based on/relayed from managed windows.
	 */
	public class BBBManagerEvent extends Event {
		public static const WINDOW_ADD:String = "windowAdd";
		
		public static const WINDOW_MINIMIZE:String = "windowMinimize";
		
		public static const WINDOW_RESTORE:String = "windowRestore";
		
		public static const WINDOW_MAXIMIZE:String = "windowMaximize";
		
		public static const WINDOW_CLOSE:String = "windowClose";
		
		public static const WINDOW_FOCUS_START:String = "windowFocusStart";
		
		public static const WINDOW_FOCUS_END:String = "windowFocusEnd";
		
		public static const WINDOW_DRAG_START:String = "windowDragStart";
		
		public static const WINDOW_DRAG:String = "windowDrag";
		
		public static const WINDOW_DRAG_END:String = "windowDragEnd";
		
		public static const WINDOW_RESIZE_START:String = "windowResizeStart";
		
		public static const WINDOW_RESIZE:String = "windowResize";
		
		public static const WINDOW_RESIZE_END:String = "windowResizeEnd";
		
		public static const TILE:String = "tile";
		
		public var window:BBBWindow;
		
		public var manager:BBBManager;
		
		public var effect:Effect;
		
		public var effectItems:Array;
		
		public var resizeHandle:String;
		
		public function BBBManagerEvent(type:String, window:BBBWindow, manager:BBBManager, effect:Effect = null, effectItems:Array = null, resizeHandle:String = null, bubbles:Boolean = false) {
			super(type, bubbles, true);
			this.window = window;
			this.manager = manager;
			this.effect = effect;
			this.effectItems = effectItems;
			this.resizeHandle = resizeHandle;
		}
		
		override public function clone():Event {
			return new BBBManagerEvent(type, window, manager, effect, effectItems, resizeHandle, bubbles);
		}
	}
}
