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

package org.bigbluebutton.web.common.events {
	import mx.events.EffectEvent;
	
	/**
	 * Event class dispatched at beginning and end of mdi effects for things like minimize, maximize, etc.
	 */
	public class BBBEffectEvent extends EffectEvent {
		/**
		 * Corresponds to type property of corresponding BBBManagerEvent.
		 */
		public var mdiEventType:String;
		
		/**
		 * List of windows involved in effect.
		 */
		public var windows:Array;
		
		/**
		 * Constructor
		 *
		 * @param type EffectEvent.EFFECT_START or EfectEvent.EFFECT_END
		 * @param mdiEventType Corresponding mdi event type like minimize, maximize, tile, etc. Will be one of BBBManagerEvent's static types.
		 * @param windows List of windows involved in effect. Will be a single element except for cascade and tile.
		 */
		public function BBBEffectEvent(type:String, mdiEventType:String, windows:Array) {
			super(type);
			
			this.mdiEventType = mdiEventType;
			this.windows = windows;
		}
	}
}
