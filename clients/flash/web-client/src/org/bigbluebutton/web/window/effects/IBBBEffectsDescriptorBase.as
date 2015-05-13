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

package org.bigbluebutton.web.window.effects {
	import flash.geom.Point;
	import flash.geom.Rectangle;
	
	import mx.effects.Effect;
	
	import org.bigbluebutton.web.window.views.BBBManager;
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	/**
	 * Interface expected by BBBManager. All effects classes must implement this interface.
	 */
	public interface IBBBEffectsDescriptorBase {
		// window effects
		
		function getWindowAddEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowMinimizeEffect(window:BBBWindow, manager:BBBManager, moveTo:Point = null):Effect;
		
		function getWindowRestoreEffect(window:BBBWindow, manager:BBBManager, restoreTo:Rectangle):Effect;
		
		function getWindowMaximizeEffect(window:BBBWindow, manager:BBBManager, bottomOffset:Number = 0):Effect;
		
		function getWindowCloseEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowFocusStartEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowFocusEndEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowDragStartEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowDragEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowDragEndEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowResizeStartEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowResizeEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		function getWindowResizeEndEffect(window:BBBWindow, manager:BBBManager):Effect;
		
		// group effects
		
		function getTileEffect(items:Array, manager:BBBManager):Effect;
		
		function reTileMinWindowsEffect(window:BBBWindow, manager:BBBManager, moveTo:Point):Effect;
	}
}
