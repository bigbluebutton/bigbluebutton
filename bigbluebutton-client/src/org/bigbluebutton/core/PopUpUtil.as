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
    import flash.utils.Dictionary;
    import flash.utils.getQualifiedClassName;

    import mx.core.FlexGlobals;
    import mx.core.IChildList;
    import mx.core.IFlexDisplayObject;
    import mx.core.IUIComponent;
    import mx.managers.PopUpManager;
    import mx.managers.SystemManager;

    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;

    public final class PopUpUtil {

        private static const LOGGER:ILogger = getClassLogger(PopUpUtil);

        private static var popUpDict:Dictionary = new Dictionary(true);

        public static function createNonModelPopUp(parent:DisplayObject, className:Class, center:Boolean = true):IFlexDisplayObject {
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
                PopUpManager.centerPopUp(popUp)
            }
            popUpDict[getQualifiedClassName(className)] = popUp;

            LOGGER.debug("Created PopUp with type [{0}]", [className]);

            return popUp;
        }
    }
}
