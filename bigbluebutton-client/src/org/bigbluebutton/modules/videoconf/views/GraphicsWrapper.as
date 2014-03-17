package org.bigbluebutton.modules.videoconf.views
{
    import flash.display.DisplayObject;
    import flash.utils.*;
    import mx.containers.Canvas;
    import mx.core.UIComponent;

    import org.bigbluebutton.main.model.users.BBBUser;
    import org.bigbluebutton.modules.videoconf.views.UserGraphicHolder;

    public class GraphicsWrapper extends Canvas {

        public function GraphicsWrapper() {

        }

        override public function addChild(child:DisplayObject):DisplayObject {
            if (getQualifiedClassName(child) != "org.bigbluebutton.modules.videoconf.views::UserGraphicHolder") {
                throw("Adding to GraphicsWrapper an invalid UIComponent: " + getQualifiedClassName(child));
            }
            return super.addChild(child);
        }

        private function get minContentAspectRatio():Number {
            var result:Number = Number.MAX_VALUE;
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.contentAspectRatio < result) {
                    result = item.contentAspectRatio;
                }
            }
            return result;
        }

        private function calculateCellDimensions(numColumns:int, numRows:int, cellAspectRatio:Number):Object {
            var obj:Object = {
                width: Math.floor(width / numColumns),
                height: Math.floor(height / numRows)
            }
            if (obj.width / obj.height > cellAspectRatio) {
                obj.width = Math.floor(obj.height * cellAspectRatio);
            } else {
                obj.height = Math.floor(obj.width / cellAspectRatio);
            }
            return obj;
        }

        private function calculateOccupiedArea(numColumns:int, numRows:int, cellAspectRatio:Number):Object {
            var obj:Object = calculateCellDimensions(numColumns, numRows, cellAspectRatio);
            obj.occupiedArea = obj.width * obj.height * numChildren;
            obj.numColumns = numColumns;
            obj.numRows = numRows;
            obj.cellAspectRatio = cellAspectRatio;
            return obj;
        }

        private function findBestConfiguration():Object {
            var cellAspectRatio:Number = minContentAspectRatio;

            var bestConfiguration:Object = {
                occupiedArea: 0
            }

            for (var numColumns:int = 1; numColumns <= numChildren; ++numColumns) {
                var numRows:int = Math.ceil(numChildren / numColumns);

                var currentConfiguration:Object = calculateOccupiedArea(numColumns, numRows, cellAspectRatio);
                if (currentConfiguration.occupiedArea > bestConfiguration.occupiedArea) {
                    bestConfiguration = currentConfiguration;
                }
            }
            return bestConfiguration;
        }

        private function updateDisplayListHelper():void {
            if (numChildren == 0) {
                return;
            }

            var bestConfiguration:Object = findBestConfiguration();
            var numColumns:int = bestConfiguration.numColumns;
            var numRows:int = bestConfiguration.numRows;
            var cellWidth:int = bestConfiguration.width;
            var cellHeight:int = bestConfiguration.height;
            var cellAspectRatio:Number = bestConfiguration.cellAspectRatio;

            var blockX:int = Math.floor((width - cellWidth * numColumns) / 2);
            var blockY:int = Math.floor((height - cellHeight * numRows) / 2);

            for (var i:int = 0; i < numChildren; ++i) {
                var item:DisplayObject = getChildAt(i);
                item.width = cellWidth;
                item.height = cellHeight;
                item.x = (i % numColumns) * cellWidth + blockX;
                item.y = Math.floor(i / numColumns) * cellHeight + blockY;
            }
        }

        override public function validateDisplayList():void {
            super.validateDisplayList();

            updateDisplayListHelper();
        }
/*
        override protected function measure():void {
            super.measure();

            updateDisplayListHelper();
        }
*/
/*
        override public function validateSize(recursive:Boolean = false):void {
            super.validateSize(recursive);

            updateDisplayListHelper();
        }
*/
/*
        override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);

            updateDisplayListHelper();
        }
*/
        public function removeGraphicsFor(userId:String):void {
            trace("[GraphicsWrapper:removeGraphicsFor] userId " + userId);
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user.userID == userId) {
                    trace("[GraphicsWrapper:removeGraphicsFor] removing graphic");
                    item.shutdown();
                    removeChild(item);
                    // recursive call to remove all graphics for userId
                    removeGraphicsFor(userId);
                    break;
                }
            }
        }

        public function shutdown():void {
            while (numChildren > 0) {
                var item:UserGraphicHolder = getChildAt(0) as UserGraphicHolder;
                item.shutdown();
                removeChild(item);
            }
        }
    }
}