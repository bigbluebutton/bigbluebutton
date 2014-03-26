package org.bigbluebutton.modules.videoconf.views
{
    import flash.display.DisplayObject;
    import flash.net.NetConnection;
    import mx.containers.Canvas;
    import mx.core.UIComponent;
    import mx.events.FlexEvent;

    import org.bigbluebutton.core.UsersUtil;
    import org.bigbluebutton.core.model.VideoProfile;
    import org.bigbluebutton.main.model.users.BBBUser;
    import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;
    import org.bigbluebutton.modules.videoconf.views.UserGraphicHolder;

    public class GraphicsWrapper extends Canvas {

        private var _options:VideoConfOptions = new VideoConfOptions();

        public function GraphicsWrapper() {
            percentWidth = percentHeight = 100;
        }

        override public function addChild(child:DisplayObject):DisplayObject {
            throw("You should add the helper functions to add children to this Canvas: addAvatarFor, addVideoFor, addCameraFor");
            return null;
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
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                var cellOffsetX:int = 0;
                var cellOffsetY:int = 0;
                if (item.contentAspectRatio > cellAspectRatio) {
                    item.width = cellWidth;
                    item.height = Math.floor(cellWidth / item.contentAspectRatio);
                    cellOffsetY = (cellHeight - item.height) / 2;
                } else {
                    item.width = Math.floor(cellHeight * item.contentAspectRatio);
                    item.height = cellHeight;
                    cellOffsetX = (cellWidth - item.width) / 2;
                }
                item.x = (i % numColumns) * cellWidth + blockX + cellOffsetX;
                item.y = Math.floor(i / numColumns) * cellHeight + blockY + cellOffsetY;
            }
        }

        override public function validateDisplayList():void {
            super.validateDisplayList();

            updateDisplayListHelper();
        }

        public function addAvatarFor(userId:String):void {
            if (! UsersUtil.hasUser(userId)) return;

            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadAvatar(UsersUtil.getUser(userId), _options);
            });
            super.addChild(graphic);
        }

        public function addVideoFor(userId:String, connection:NetConnection, streamName:String):void {
            if (! UsersUtil.hasUser(userId)) return;

            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadVideo(UsersUtil.getUser(userId), _options, connection, streamName);
            });
            super.addChild(graphic);
        }

        public function addCameraFor(userId:String, camIndex:int, videoProfile:VideoProfile):void {
            if (! UsersUtil.hasUser(userId)) return;

            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadCamera(UsersUtil.getUser(userId), _options, camIndex, videoProfile);
            });
            super.addChild(graphic);
        }

        public function removeGraphicsFor(userId:String):void {
            trace("[GraphicsWrapper:removeGraphicsFor] userId " + userId);
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.userID == userId) {
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