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

package org.bigbluebutton.modules.polling.views
{
	
	/**
	 * Enumeration of possible resize handles.
	 */
	public class ResizeHandle {
		public static const LEFT:String = "left";
		
		public static const RIGHT:String = "right";
		
		public static const TOP:String = "top";
		
		public static const BOTTOM:String = "bottom";
		
		public static const TOP_LEFT:String = "topLeft";
		
		public static const TOP_RIGHT:String = "topRight";
		
		public static const BOTTOM_LEFT:String = "bottomLeft";
		
		public static const BOTTOM_RIGHT:String = "bottomRight";
		
		/**
		 * Constructor
		 */
		public function ResizeHandle() {
		}
		
		/**
		 * Checks if the handle is on the top (TOP, TOP_RIGHT, or TOP_LEFT)
		 */
		static public function isTop(handle:String):Boolean {
			return handle == TOP || handle == TOP_RIGHT || handle == TOP_LEFT;
		}
		
		/**
		 * Checks if the handle is on the bottom (BOTTOM, BOTTOM_RIGHT, or BOTTOM_LEFT)
		 */
		static public function isBottom(handle:String):Boolean {
			return handle == BOTTOM || handle == BOTTOM_RIGHT || handle == BOTTOM_LEFT;
		}
		
		/**
		 * Checks if the handle is on the left side (LEFT, TOP_LEFT, or BOTTOM_LEFT)
		 */
		static public function isLeft(handle:String):Boolean {
			return handle == LEFT || handle == TOP_LEFT || handle == BOTTOM_LEFT;
		}
		
		/**
		 * Checks if the handle is on the right side (RIGHT, TOP_RIGHT, or BOTTOM_RIGHT)
		 */
		static public function isRight(handle:String):Boolean {
			return handle == RIGHT || handle == TOP_RIGHT || handle == BOTTOM_RIGHT;
		}
	}
}
