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
package org.bigbluebutton.modules.whiteboard.views
{
	import flash.display.DisplayObject;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.ui.Keyboard;
	
	import mx.controls.PopUpButton;
	import mx.core.UIComponent;
	import mx.core.UIComponentGlobals;
	import mx.core.mx_internal;
	import mx.effects.Tween;
	import mx.events.InterManagerRequest;
	import mx.managers.ISystemManager;
	import mx.managers.PopUpManager;
	
	use namespace mx_internal;
	
	public class PopUpCombo extends PopUpButton
	{
		public var isOpen:Boolean = false;
		protected var _inTween:Boolean = false;
		protected var _tween:Tween;
		
		private var _specificOpenDirection:String;
		
		public static const OPEN_UP:String = "OPEN_UP";
		public static const OPEN_DOWN:String = "OPEN_DOWN";
		
		public function PopUpCombo()
		{
			super();
		}		
		
		public function get specificOpenDirection():String
		{
			if(!_specificOpenDirection) _specificOpenDirection = PopUpCombo.OPEN_DOWN;
			return _specificOpenDirection;
		}
		
		public function set specificOpenDirection(value:String):void
		{
			_specificOpenDirection = value;
		}
		
		override protected function clickHandler(event:MouseEvent):void
		{
			event.stopImmediatePropagation();
			displayPopUp();
		}
		
		override protected function keyDownHandler(event:KeyboardEvent):void
		{
			super.keyDownHandler(event);
			
			if (event.ctrlKey && event.keyCode == Keyboard.DOWN)
			{
				event.stopImmediatePropagation();
				displayPopUp();
			}
		}
		
		public function displayPopUp():void
		{
			var show:Boolean = !isOpen;
			
			var popUpGap:Number = getStyle("popUpGap");
			var point:Point = new Point(0, unscaledHeight + popUpGap);
			point = localToGlobal(point);
			
			var initY:Number;
			var endY:Number;
			var easingFunction:Function;
			var duration:Number;			
			
			if (popUp.parent == null)
			{
				PopUpManager.addPopUp(popUp, this, false);
				popUp.owner = this;
			}
			else
				PopUpManager.bringToFront(popUp);
			
			if(show)
			{
				
				if(specificOpenDirection == PopUpCombo.OPEN_UP)
				{
					point.y -= (unscaledHeight + popUp.height + 2*popUpGap);
					initY = -popUp.height;					
				}
				else
				{
					initY = popUp.height;
				}
				
				point.x = Math.min( point.x, visibleScreen.right - popUp.getExplicitOrMeasuredWidth());
				point.x = Math.max( point.x, 0);
				point = popUp.parent.globalToLocal(point);
				if (popUp.x != point.x || popUp.y != point.y)
					popUp.move(point.x, point.y);
				
				popUp.scrollRect = new Rectangle(0, initY,
					popUp.width, popUp.height);
				
				if (!popUp.visible)
					popUp.visible = true;
				
				endY = 0;
				isOpen = show;
				duration = getStyle("openDuration");
				easingFunction = getStyle("openEasingFunction") as Function;				
			}
			else
			{
				isOpen = show;
				
				if (popUp.parent == null)
					return;
				
				point = popUp.parent.globalToLocal(point);
				
				endY = (specificOpenDirection == PopUpCombo.OPEN_UP) ? -popUp.height - 2 : popUp.height + 2;
				initY = 0;
				duration = getStyle("closeDuration")
				easingFunction = getStyle("closeEasingFunction") as Function;
			}
			
			_inTween = true;
			UIComponentGlobals.layoutManager.validateNow();
			
			// Block all layout, responses from web service, and other background
			// processing until the tween finishes executing.
			UIComponent.suspendBackgroundProcessing();
			
			_tween = new Tween(this, initY, endY, duration);
			if (easingFunction != null)
				_tween.easingFunction = easingFunction;
		}
		
		protected function get visibleScreen():Rectangle
		{
			var sm:ISystemManager = systemManager.topLevelSystemManager;
			var sbRoot:DisplayObject = sm.getSandboxRoot();
			var _screen:Rectangle;
			if (sm != sbRoot)
			{
				var request:InterManagerRequest = new InterManagerRequest(InterManagerRequest.SYSTEM_MANAGER_REQUEST, 
					false, false,
					"getVisibleApplicationRect"); 
				sbRoot.dispatchEvent(request);
				_screen = Rectangle(request.value);
			}
			else
				_screen = sm.getVisibleApplicationRect();
			
			return _screen;
		}
		
		override mx_internal function onTweenUpdate(value:Number):void
		{
			popUp.scrollRect =
				new Rectangle(0, value, popUp.width, popUp.height);
		}
		
		override mx_internal function onTweenEnd(value:Number):void
		{
			popUp.scrollRect =
				new Rectangle(0, value, popUp.width, popUp.height);
			
			_inTween = false;
			UIComponent.resumeBackgroundProcessing();
			
			if (!isOpen)
			{
				popUp.visible = false;
				popUp.scrollRect = null;
			}
		}
	}
}