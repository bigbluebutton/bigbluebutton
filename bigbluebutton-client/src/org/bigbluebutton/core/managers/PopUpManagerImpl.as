/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core.managers {
	import flash.display.DisplayObject;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	import mx.core.FlexVersion;
	import mx.core.IFlexDisplayObject;
	import mx.core.IInvalidating;
	import mx.core.UIComponent;
	import mx.core.mx_internal;
	import mx.events.Request;
	import mx.managers.IPopUpManager;
	import mx.managers.ISystemManager;
	import mx.managers.PopUpData;
	import mx.managers.PopUpManagerImpl;

	use namespace mx_internal;

	public class PopUpManagerImpl extends mx.managers.PopUpManagerImpl {

		/**
		 *  @private
		 */
		private static var instance:IPopUpManager;

		/**
		 *  @private
		 */
		public static function getInstance():IPopUpManager {
			if (!instance)
				instance = new org.bigbluebutton.core.managers.PopUpManagerImpl();

			return instance;
		}

		/**
		 *  Centers a popup window over whatever window was used in the call
		 *  to the <code>createPopUp()</code> or <code>addPopUp()</code> method.
		 *
		 *  <p>Note that the position of the popup window may not
		 *  change immediately after this call since Flex may wait to measure and layout the
		 *  popup window before centering it.</p>
		 *
		 *  @param The IFlexDisplayObject representing the popup.
		 *
		 *  @langversion 3.0
		 *  @playerversion Flash 9
		 *  @playerversion AIR 1.1
		 *  @productversion Flex 3
		 */
		override public function centerPopUp(popUp:IFlexDisplayObject):void {
			if (popUp is IInvalidating)
				IInvalidating(popUp).validateNow();

			const o:PopUpData = findPopupInfoByOwner(popUp);

			// If we don't find the pop owner or if the owner's parent is not specified or is not on the
			// stage, then center based on the popUp's current parent.
			var popUpParent:DisplayObject = (o && o.parent && o.parent.stage) ? o.parent : popUp.parent;
			if (popUpParent) {
				//FLEX-28967 : https://issues.apache.org/jira/browse/FLEX-28967. Fix by miroslav.havrlent
				var systemManager:ISystemManager;
				if (o != null) {
					systemManager = o.systemManager;
				} else if (popUpParent.hasOwnProperty("systemManager")) {
					systemManager = popUpParent["systemManager"];
				} else if (popUpParent is ISystemManager) {
					systemManager = popUpParent as ISystemManager;
				}

				if (!systemManager)
					return; // or throw exception maybe ?

				var x:Number;
				var y:Number;
				var appWidth:Number;
				var appHeight:Number;
				var parentWidth:Number;
				var parentHeight:Number;
				var rect:Rectangle;
				var clippingOffset:Point = new Point();
				var pt:Point;
				var isTopLevelRoot:Boolean;
				var sbRoot:DisplayObject = systemManager.getSandboxRoot();

				var request:Request;
				if (hasEventListener("isTopLevelRoot")) {
					request = new Request("isTopLevelRoot", false, true);
				}
				if (request && !dispatchEvent(request))
					isTopLevelRoot = Boolean(request.value);
				else
					isTopLevelRoot = systemManager.isTopLevelRoot();

				if (isTopLevelRoot && (FlexVersion.compatibilityVersion < FlexVersion.VERSION_4_6)) {
					// The sandbox root is the top level root.
					// The application width is just the screen width.
					var screen:Rectangle = systemManager.screen;
					appWidth = screen.width;
					appHeight = screen.height;
				} else {
					rect = systemManager.getVisibleApplicationRect();
					rect.topLeft = DisplayObject(systemManager).globalToLocal(rect.topLeft);
					rect.bottomRight = DisplayObject(systemManager).globalToLocal(rect.bottomRight);

					// Offset the top, left of the window to bring it into view.        
					clippingOffset = rect.topLeft.clone();
					appWidth = rect.width;
					appHeight = rect.height;
				}

				// If parent is a UIComponent, check for clipping between
				// the object and its SystemManager
				if (popUpParent is UIComponent) {
					rect = UIComponent(popUpParent).getVisibleRect();
					if (UIComponent(popUpParent).systemManager != sbRoot)
						rect = UIComponent(popUpParent).systemManager.getVisibleApplicationRect(rect);
					var offset:Point = popUpParent.globalToLocal(rect.topLeft);
					clippingOffset.x += offset.x;
					clippingOffset.y += offset.y;
					parentWidth = rect.width;
					parentHeight = rect.height;
				} else {
					parentWidth = popUpParent.width;
					parentHeight = popUpParent.height;
				}

				// The appWidth may smaller than parentWidth if the application is
				// clipped by the parent application.
				x = Math.max(0, (Math.min(appWidth, parentWidth) - popUp.width) / 2);
				y = Math.max(0, (Math.min(appHeight, parentHeight) - popUp.height) / 2);

				// If the layout has been mirrored, then 0,0 is the uppper
				// right corner; compensate here.
				// Code removed below, centring a popup does not need RTL layou check

				pt = new Point(clippingOffset.x, clippingOffset.y);
				pt = popUpParent.localToGlobal(pt);
				pt = popUp.parent.globalToLocal(pt);
				popUp.move(Math.round(x) + pt.x, Math.round(y) + pt.y);
			}
		}

		/**
		 *  @private
		 *  Returns the index position of the PopUpData in the popupInfo array (or -1)
		 *  for a given popupInfo.owner
		 */
		private function findPopupInfoIndexByOwner(owner:Object):int {
			const n:int = popupInfo.length;
			for (var i:int = 0; i < n; i++) {
				var o:PopUpData = popupInfo[i];
				if (o.owner == owner)
					return i;
			}
			return -1;
		}

		/**
		 *  @private
		 *  Returns the PopUpData (or null) for a given popupInfo.owner
		 */
		private function findPopupInfoByOwner(owner:Object):PopUpData {
			var index:int = findPopupInfoIndexByOwner(owner);
			return index > -1 ? popupInfo[index] : null;
		}

	}
}
