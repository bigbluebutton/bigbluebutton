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

package org.bigbluebutton.web.common.effects {
	
	import flash.geom.Point;
	import flash.geom.Rectangle;
	
	import mx.effects.Effect;
	import mx.effects.Parallel;
	
	import org.bigbluebutton.web.common.views.BBBManager;
	import org.bigbluebutton.web.common.views.BBBWindow;
	
	import spark.effects.Move;
	import spark.effects.Resize;
	
	/**
	 * Base effects implementation with no animation. Extending this class means the developer
	 * can choose to implement only certain effects, rather than all required by IBBBEffectsDescriptor.
	 */
	public class BBBEffectsDescriptorBase implements IBBBEffectsDescriptorBase {
		
		public var duration:Number = 10;
		
		public function getWindowAddEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowMinimizeEffect(window:BBBWindow, manager:BBBManager, moveTo:Point = null):Effect {
			var parallel:Parallel = new Parallel();
			parallel.duration = this.duration;
			
			var resize:Resize = new Resize(window);
			resize.widthTo = window.minWidth;
			resize.duration = this.duration;
			resize.heightTo = window.minimizeHeight;
			parallel.addChild(resize);
			
			if (moveTo != null) {
				var move:Move = new Move(window);
				move.xTo = moveTo.x;
				move.yTo = moveTo.y;
				move.duration = this.duration;
				parallel.addChild(move);
			}
			
			return parallel;
		}
		
		public function getWindowRestoreEffect(window:BBBWindow, manager:BBBManager, restoreTo:Rectangle):Effect {
			var parallel:Parallel = new Parallel();
			parallel.duration = this.duration;
			
			var resize:Resize = new Resize(window);
			resize.widthTo = restoreTo.width;
			resize.heightTo = restoreTo.height;
			resize.duration = this.duration;
			parallel.addChild(resize);
			
			var move:Move = new Move(window);
			move.xTo = restoreTo.x;
			move.yTo = restoreTo.y;
			move.duration = this.duration;
			parallel.addChild(move);
			
			return parallel;
		}
		
		public function getWindowMaximizeEffect(window:BBBWindow, manager:BBBManager, bottomOffset:Number = 0):Effect {
			var parallel:Parallel = new Parallel();
			parallel.duration = this.duration;
			
			var resize:Resize = new Resize(window);
			resize.widthTo = manager.container.width;
			resize.heightTo = manager.container.height - bottomOffset;
			resize.duration = this.duration;
			parallel.addChild(resize);
			
			var move:Move = new Move(window);
			move.xTo = 0;
			move.yTo = 0;
			move.duration = this.duration;
			parallel.addChild(move);
			
			return parallel;
		}
		
		public function getWindowCloseEffect(window:BBBWindow, manager:BBBManager):Effect {
			// have to return something so that EFFECT_END listener will fire
			var resize:Resize = new Resize(window);
			resize.duration = this.duration;
			resize.widthTo = window.width;
			resize.heightTo = window.height;
			
			return resize;
		}
		
		public function getWindowFocusStartEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowFocusEndEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowDragStartEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowDragEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowDragEndEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowResizeStartEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowResizeEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getWindowResizeEndEffect(window:BBBWindow, manager:BBBManager):Effect {
			return new Effect();
		}
		
		public function getTileEffect(items:Array, manager:BBBManager):Effect
		{
			var parallel:Parallel = new Parallel();
			parallel.duration = this.duration;
			
			for each(var item:BBBGroupEffectItem  in items)
			{
				manager.bringToFront(item.window);
				var move:Move = new Move(item.window);
				move.xTo = item.moveTo.x;
				move.yTo = item.moveTo.y;
				move.duration = this.duration;
				parallel.addChild(move);
				
				item.setWindowSize();
			}
			
			return parallel;
		}
		
		public function reTileMinWindowsEffect(window:BBBWindow, manager:BBBManager, moveTo:Point):Effect
		{
			var move:Move = new Move(window);
			move.duration = this.duration;
			move.xTo = moveTo.x;
			move.yTo = moveTo.y;
			return move
		}
	}
}
