/*
 * Copyright (c) 2007 FlexLib Contributors.  See:
 * http://code.google.com/p/flexlib/wiki/ProjectContributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
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
	
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	public class BBBGroupEffectItem {
		public var window:BBBWindow;
		
		public var moveTo:Point = new Point();
		
		public var widthFrom:Number = 0;
		
		public var widthTo:Number = 0;
		
		public var heightFrom:Number = 0;
		
		public var heightTo:Number = 0;
		
		public function BBBGroupEffectItem(window:BBBWindow):void {
			this.window = window;
		}
		
		public function setWindowSize():void {
			this.window.width = this.widthTo;
			this.window.height = this.heightTo;
		}
		
		public function get isCorrectSize():Boolean {
			return window.height == heightTo && window.width == widthTo;
		}
		
		public function get isCorrectPosition():Boolean {
			return window.x == moveTo.x && window.y == moveTo.y;
		}
		
		public function get isInPlace():Boolean {
			return isCorrectSize && isCorrectPosition;
		}
	}
}
