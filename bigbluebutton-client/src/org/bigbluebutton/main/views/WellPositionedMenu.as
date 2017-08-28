package org.bigbluebutton.main.views
{
    import flash.display.DisplayObject;
    import flash.display.DisplayObjectContainer;
    import flash.geom.Point;

    import mx.controls.Menu;
    import mx.events.ResizeEvent;

    public class WellPositionedMenu {
        private static function posOutOfStage(menu:Menu, pos:Point):Boolean {
            return pos.x < 0
            || pos.y < 0
            || pos.y + menu.height > menu.stage.stageHeight
            || pos.x + menu.width > menu.stage.stageWidth;
        }

        private static function onFirstResize(object:DisplayObject):Function {
            return function(e:ResizeEvent):void {
                var menu:Menu = e.currentTarget as Menu;

                var possiblePos:Array = [
                    object.localToGlobal(new Point(0, object.height + 1)), // bottom-right
                    object.localToGlobal(new Point(object.width + 1, 0)), // right
                    object.localToGlobal(new Point(object.width - menu.width, object.height + 1)), // bottom-left
                    object.localToGlobal(new Point(0, -(menu.height + 1))), // top-right
                    object.localToGlobal(new Point(object.width - menu.width, -(menu.height + 1))) // top-left
                ]

                var pos:Point = possiblePos[0];
                for (var i:int = 0; i < possiblePos.length; ++i) {
                    if (! posOutOfStage(menu, possiblePos[i])) {
                        pos = possiblePos[i];
                        break;
                    }
                }
                menu.move(pos.x, pos.y);
            };
        }

        public static function createMenu(parent:DisplayObjectContainer, mdp:Object, displayNextTo:DisplayObject, showRoot:Boolean = true):Menu {
            var menu:Menu = Menu.createMenu(parent, mdp, showRoot);
            menu.addEventListener(ResizeEvent.RESIZE, onFirstResize(displayNextTo));
            return menu;
        }
    }
}
