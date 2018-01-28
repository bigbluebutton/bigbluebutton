/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core {
	import flash.display.DisplayObject;
	import flash.events.KeyboardEvent;
	import flash.geom.Point;
	import flash.ui.Keyboard;
	import flash.utils.Dictionary;
	import flash.utils.getQualifiedClassName;

	import mx.containers.Panel;
	import mx.controls.Alert;
	import mx.core.Application;
	import mx.core.FlexGlobals;
	import mx.core.IChildList;
	import mx.core.IFlexDisplayObject;
	import mx.core.IUIComponent;
	import mx.events.FlexEvent;
	import mx.events.ResizeEvent;
	import mx.managers.ISystemManager;
	import mx.managers.PopUpManager;
	import mx.managers.SystemManager;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.IKeyboardClose;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public final class PopUpUtil {

		private static const LOGGER:ILogger = getClassLogger(PopUpUtil);

		private static var popUpDict:Dictionary = new Dictionary(true);

		private static var lockedPositions:Dictionary = new Dictionary(true);

		public static function initAlert():void {
			Alert.buttonHeight = 30;
			Alert.buttonWidth = 100;
			Alert.cancelLabel = ResourceUtil.getInstance().getString('bbb.alert.cancel');
			Alert.noLabel = ResourceUtil.getInstance().getString('bbb.alert.no');
			Alert.okLabel = ResourceUtil.getInstance().getString('bbb.alert.ok');
			Alert.yesLabel = ResourceUtil.getInstance().getString('bbb.alert.yes');
			Application(FlexGlobals.topLevelApplication).addEventListener(ResizeEvent.RESIZE, globalResizeListener);
		}

		public static function createNonModalPopUp(parent:DisplayObject, className:Class, center:Boolean = true):IFlexDisplayObject {
			if (!checkPopUpExists(className)) {
				return addPopUpToStage(parent, className, false, center);
			}
			return null;
		}

		public static function createModalPopUp(parent:DisplayObject, className:Class, center:Boolean = true):IFlexDisplayObject {
			if (!checkPopUpExists(className)) {
				return addPopUpToStage(parent, className, true, center);
			}
			return null;
		}

		public static function removePopUp(classOrInstance:*):void {
			var fqcn:String = getQualifiedClassName(classOrInstance);
			if (popUpDict[fqcn] != undefined) {
				PopUpManager.removePopUp(popUpDict[fqcn])
				delete popUpDict[fqcn];
				LOGGER.debug("Removed PopUp with type [{0}]", [fqcn]);
			}
		}

		private static function checkPopUpExists(className:Class):Boolean {
			LOGGER.debug("Checking if [{0}] exists as a PopUp", [className]);
			var systemManager:SystemManager = FlexGlobals.topLevelApplication.systemManager;

			var childList:IChildList = systemManager.rawChildren;
			for (var i:int = childList.numChildren - 1; i >= 0; i--) {
				var childObject:IUIComponent = childList.getChildAt(i) as IUIComponent;
				// PopUp already exists
				if (childObject is className && childObject.isPopUp) {
					LOGGER.debug("PopUp with type [{0}] found", [className]);
					return true;
				}
			}
			LOGGER.debug("No PopUp with type [{0}] not found", [className]);
			return false;
		}

		private static function addPopUpToStage(parent:DisplayObject, className:Class, modal:Boolean = false, center:Boolean = true):IFlexDisplayObject {
			var popUp:IFlexDisplayObject = PopUpManager.createPopUp(parent, className, modal);
			if (center) {
				PopUpManager.centerPopUp(popUp);
			}
			popUpDict[getQualifiedClassName(className)] = popUp;

			if (popUp is IKeyboardClose) {
				popUp.addEventListener(KeyboardEvent.KEY_DOWN, escapeKeyDownHandler);
			}

			LOGGER.debug("Created PopUp with type [{0}]", [className]);

			return popUp;
		}

		private static function escapeKeyDownHandler(event:KeyboardEvent):void {
			if (event.charCode == Keyboard.ESCAPE) {
				event.currentTarget.removeEventListener(KeyboardEvent.KEY_DOWN, escapeKeyDownHandler);
				removePopUp(event.currentTarget);
			}
		}

		private static function globalResizeListener(event:ResizeEvent):void {
			var systemManager:ISystemManager = Application(FlexGlobals.topLevelApplication).systemManager;
			for (var i:int = systemManager.numChildren - 1; i > 0; i -= 1) {
				if (systemManager.getChildAt(i) is Panel && !hasPositionLocked(systemManager.getChildAt(i))) {
					PopUpManager.centerPopUp(systemManager.getChildAt(i) as IFlexDisplayObject);
				}
			}
		}

		public static function lockPosition(popUp:*, positionFunction:Function = null):void {
			var resizeHandler:Function = function():void {
				if (positionFunction != null) {
					var newPosition:Point = positionFunction.apply();
					popUp.move(newPosition.x, newPosition.y);
				}
			};
			popUp.addEventListener(FlexEvent.CREATION_COMPLETE, resizeHandler);
			Application(FlexGlobals.topLevelApplication).addEventListener(ResizeEvent.RESIZE, resizeHandler);
			lockedPositions[getQualifiedClassName(popUp)] = resizeHandler;
		}

		public static function unlockPosition(popUp:*):void {
			var fqcn:String = getQualifiedClassName(popUp);
			if (lockedPositions[fqcn] != undefined) {
				popUp.removeEventListener(FlexEvent.CREATION_COMPLETE, lockedPositions[fqcn]);
				Application(FlexGlobals.topLevelApplication).removeEventListener(ResizeEvent.RESIZE, lockedPositions[fqcn]);
				delete lockedPositions[fqcn];
			}
		}

		public static function hasPositionLocked(popUp:*):Boolean {
			return lockedPositions[getQualifiedClassName(popUp)] != undefined;
		}
	}
}
