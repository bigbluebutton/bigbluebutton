package org.bigbluebutton.modules.videoconf.views
{
    import flash.display.DisplayObject;
    import flash.events.MouseEvent;
    import flash.net.NetConnection;
    import flash.utils.setTimeout;
    
    import mx.containers.Canvas;
    import mx.core.IUIComponent;
    import mx.events.FlexEvent;
    
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.core.Options;
    import org.bigbluebutton.core.UsersUtil;
    import org.bigbluebutton.core.model.LiveMeeting;
    import org.bigbluebutton.core.model.VideoProfile;
    import org.bigbluebutton.core.model.users.User2x;
    import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;


    public class GraphicsWrapper extends Canvas {

		private static const LOGGER:ILogger = getClassLogger(GraphicsWrapper);      

		private var _options:VideoConfOptions;
        private var priorityWeight:Number;
        private var priorityMode:Boolean = false;
        private var priorityItem:DisplayObject = null;
        private var _minContentAspectRatio:Number=4/3;

        public function GraphicsWrapper() {
            percentWidth = percentHeight = 100;
			_options = Options.getOptions(VideoConfOptions) as VideoConfOptions;
			priorityWeight = _options.priorityRatio;
        }

        override public function addChild(child:DisplayObject):DisplayObject {
            throw("You should add the helper functions to add children to this Canvas: addAvatarFor, addVideoFor, addCameraFor");
            return null;
        }

        private function minContentAspectRatio(except:Object = null):Number {
            var result:Number = Number.MAX_VALUE;
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item != except && item.contentAspectRatio < result) {
                    result = item.contentAspectRatio;
                }
            }
            return result;
        }

        private function calculateCellDimensions(canvasWidth:int, canvasHeight:int, numColumns:int, numRows:int, priority:Boolean):Object {
            var obj:Object = {
                width: Math.floor(canvasWidth / numColumns)-5,
                height: Math.floor(canvasHeight / numRows)-5
            }

            var item:UserGraphicHolder = priorityItem as UserGraphicHolder;
            var aspectRatio:Number = (item != null && priority) ? item.contentAspectRatio : _minContentAspectRatio;
            obj.cellAspectRatio = aspectRatio;

            if (obj.width / obj.height > aspectRatio) {
                obj.width = Math.floor(obj.height * aspectRatio);
            } else {
                obj.height = Math.floor(obj.width / aspectRatio);
            }
            return obj;
        }

        private function calculateOccupiedArea(canvasWidth:int, canvasHeight:int, numColumns:int, numRows:int, priority:Boolean):Object {
            var obj:Object = calculateCellDimensions(canvasWidth, canvasHeight, numColumns, numRows, priority);
            obj.occupiedArea = obj.width * obj.height * numChildren;
            obj.numColumns = numColumns;
            obj.numRows = numRows;

            return obj;
        }

        private function findBestConfiguration(canvasWidth:int, canvasHeight:int, numChildrenInCanvas:int, priority:Boolean = false):Object {
            var bestConfiguration:Object = {
                occupiedArea: 0
            }

            for (var numColumns:int = 1; numColumns <= numChildrenInCanvas; ++numColumns) {
                var numRows:int = Math.ceil(numChildrenInCanvas / numColumns);
                var currentConfiguration:Object = calculateOccupiedArea(canvasWidth, canvasHeight, numColumns, numRows, priority);
                if (currentConfiguration.occupiedArea > bestConfiguration.occupiedArea) {
                    bestConfiguration = currentConfiguration;
                }
            }
            return bestConfiguration;
        }

        private function updateDisplayListHelper(unscaledWidth:Number, unscaledHeight:Number):void {
            if (numChildren == 0) {
                return;
            }

            var bestConfiguration:Object = findBestConfiguration(unscaledWidth, unscaledHeight, numChildren);
            var numColumns:int = bestConfiguration.numColumns;
            var numRows:int = bestConfiguration.numRows;
            var cellWidth:int = bestConfiguration.width;
            var cellHeight:int = bestConfiguration.height;
            var cellAspectRatio:Number = bestConfiguration.cellAspectRatio;

            var blockX:int = Math.floor((unscaledWidth - cellWidth * numColumns) / 2);
            var blockY:int = Math.floor((unscaledHeight - cellHeight * numRows) / 2);
            var itemX:int,
                itemY:int,
                itemWidth:int,
                itemHeight:int;

            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                var cellOffsetX:int = 0;
                var cellOffsetY:int = 0;
                if (item.contentAspectRatio > cellAspectRatio) {
                    itemWidth = cellWidth;
                    itemHeight = Math.floor(cellWidth / item.contentAspectRatio);
                    cellOffsetY = (cellHeight - itemHeight) / 2;
                } else {
                    itemWidth = Math.floor(cellHeight * item.contentAspectRatio);
                    itemHeight = cellHeight;
                    cellOffsetX = (cellWidth - itemWidth) / 2;
                }
                itemX = (i % numColumns) * cellWidth + blockX + cellOffsetX;
                itemY = Math.floor(i / numColumns) * cellHeight + blockY + cellOffsetY;

                item.setActualSize(itemWidth, itemHeight);
                item.move(itemX, itemY);
            }
        }    

        private function findPriorityConfiguration(unscaledWidth:Number, unscaledHeight:Number):Object{
            var pBestConf:Object = {
                numRows: 0,
                numColumns: 0,
                width: 0,
                height: 0
            };
            var oBestConf:Object = pBestConf;
            var isVertSplit:Boolean = false;
            if (numChildren > 1){
                var pBestConfVer:Object = findBestConfiguration(Math.floor(unscaledWidth * priorityWeight), unscaledHeight, 1, true);
                var pBestConfHor:Object = findBestConfiguration(unscaledWidth, Math.floor(unscaledHeight * priorityWeight), 1, true);
                isVertSplit = (pBestConfVer.occupiedArea > pBestConfHor.occupiedArea);
                if (isVertSplit) {
                    pBestConf = pBestConfVer;
                    oBestConf = findBestConfiguration(unscaledWidth - pBestConf.width, unscaledHeight, numChildren-1);
                } else {
                    pBestConf = pBestConfHor;
                    oBestConf = findBestConfiguration(unscaledWidth, unscaledHeight - pBestConf.height, numChildren-1);
                }
            } else {
                pBestConf = findBestConfiguration(unscaledWidth,unscaledHeight,1);
            }
            return {isVertSplit: isVertSplit, priorConf: pBestConf, otherConf: oBestConf};
        }

        private function updateDisplayListHelperByPriority(unscaledWidth:Number, unscaledHeight:Number):void {
            if (numChildren < 2) {
                updateDisplayListHelper(unscaledWidth, unscaledHeight);
                return;
            }

            var bestConf:Object = findPriorityConfiguration(unscaledWidth, unscaledHeight);
            var numColumns:int = bestConf.otherConf.numColumns;
            var numRows:int = bestConf.otherConf.numRows;
            var oWidth:int = bestConf.otherConf.width;
            var oHeight:int = bestConf.otherConf.height;
            var pWidth:int = bestConf.priorConf.width;
            var pHeight:int = bestConf.priorConf.height;

            var blockX:int = 0;
            var blockY:int = 0;
            var cellOffsetX:int = 0;
            var cellOffsetY:int = 0;
            var itemX:int,
                itemY:int,
                itemWidth:int,
                itemHeight:int;

            var item:UserGraphicHolder = priorityItem as UserGraphicHolder;

            // set size and position of the prioritized video
            itemWidth = pWidth;
            itemHeight = pHeight;

            if (bestConf.isVertSplit) {
                blockX = Math.floor((3*(unscaledWidth - oWidth*numColumns) + itemWidth)/4);
                blockY = Math.floor((unscaledHeight - oHeight*numRows)/2);
                itemX = Math.floor((unscaledWidth - itemWidth - oWidth*numColumns)/2);
                itemY = Math.floor((unscaledHeight - itemHeight)/2);
            } else {
                blockX = Math.floor((unscaledWidth - oWidth*numColumns)/2);
                blockY = Math.floor((3*(unscaledHeight - oHeight*numRows) + itemHeight)/4);
                itemX = Math.floor((unscaledWidth - itemWidth)/2);
                itemY = Math.floor((unscaledHeight - itemHeight - oHeight*numRows)/2);
            }
            item.setActualSize(itemWidth, itemHeight);
            item.move(itemX, itemY);

            // set size and position of the other videos
            var nonPriorityIndex:int=0;
            for (var curItemIndex:int = 0; curItemIndex < numChildren; ++curItemIndex) {
                item = getChildAt(curItemIndex) as UserGraphicHolder;
                if (item != priorityItem) {

                    if (item.contentAspectRatio > _minContentAspectRatio) {
                        itemWidth = oWidth;
                        itemHeight = Math.floor(oWidth / item.contentAspectRatio);
                    } else {
                        itemHeight = oHeight;
                        itemWidth = Math.floor(oHeight * item.contentAspectRatio);
                    }
                    cellOffsetX = (oWidth - itemWidth)/2;
                    cellOffsetY = (oHeight - itemHeight)/2;

                    itemX = (nonPriorityIndex % numColumns) * oWidth + blockX + cellOffsetX;
                    itemY = Math.floor(nonPriorityIndex / numColumns) * oHeight + blockY + cellOffsetY;
                    nonPriorityIndex++;

                    item.setActualSize(itemWidth, itemHeight);
                    item.move(itemX, itemY);
                }
            }
        }

        override protected function updateDisplayList(w:Number, h:Number):void {
            LOGGER.debug("[GraphicsWrapper::updateDisplayList]");
            super.updateDisplayList(w, h);

            if (priorityMode) {
                updateDisplayListHelperByPriority(w, h);
            } else {
                updateDisplayListHelper(w, h);
            }
        }

        public function addAvatarFor(userId:String):void {
            if (! UsersUtil.hasUser(userId)) return;

            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.userId = userId;
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadAvatar(_options);
                onChildAdd(event);
            });
            graphic.addEventListener(MouseEvent.CLICK, onVBoxClick);
            graphic.addEventListener(FlexEvent.REMOVE, onChildRemove);

            super.addChild(graphic);
        }

        private function addVideoForHelper(userId:String, connection:NetConnection, streamName:String):void {
			LOGGER.debug("[GraphicsWrapper:addVideoForHelper] streamName {0}", [streamName]);
            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.userId = userId;
            graphic.streamName = streamName;
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadVideo(_options, connection, streamName);
                onChildAdd(event);
            });
            graphic.addEventListener(MouseEvent.CLICK, onVBoxClick);
            graphic.addEventListener(FlexEvent.REMOVE, onChildRemove);

            super.addChild(graphic);
        }

        public function addVideoFor(userId:String, connection:NetConnection):void {
            var user:User2x = LiveMeeting.inst().users.getUser(userId);
            if (user == null) return;

            var streamNames:Array = LiveMeeting.inst().webcams.getStreamIdsForUser(userId);

            for each (var streamName:String in streamNames) {
              var viewingStream: Boolean = LiveMeeting.inst().webcams.isViewingStream(user.intId, streamName)
                if (! viewingStream) {
                    // When reconnecting there is discrepancy between the time when the usermodel's viewingStream array
                    // is updated and the time when we check whether the steam needs to be displayed.
                    // To avoid duplication of video views we must check if a view for the stream exists
                    // in addition to the check whether the client is meant to view the stream

                    var streamIsDisplayed:Boolean = false;
                    for (var i:int = 0; i < numChildren; ++i) {
                        var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                        if (userId == item.userId && streamName == item.streamName) {
                            streamIsDisplayed = true;
                        }
                    }
                    if (0 == numChildren || !streamIsDisplayed) {
                        addVideoForHelper(user.intId, connection, streamName);
                    }
                }
            }
        }

        private function addCameraForHelper(userId:String, camIndex:int, videoProfile:VideoProfile):void {
            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.userId = userId;
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadCamera(_options, camIndex, videoProfile);
                onChildAdd(event);
            });
            graphic.addEventListener(MouseEvent.CLICK, onVBoxClick);
            graphic.addEventListener(FlexEvent.REMOVE, onChildRemove);

            super.addChild(graphic);
        }

        public function addStaticComponent(component:IUIComponent):void {
            component.addEventListener(MouseEvent.CLICK, onVBoxClick);
            component.addEventListener(FlexEvent.REMOVE, onChildRemove);

            setTimeout(onChildAdd, 150, null);
            setTimeout(onChildAdd, 4000, null);

            component.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                onChildAdd(event);
            });

            super.addChild(component as DisplayObject);
        }

        private function onChildAdd(event:FlexEvent):void {
            _minContentAspectRatio = minContentAspectRatio();
            invalidateDisplayList();
        }

        private function onChildRemove(event:FlexEvent):void {
            if (priorityMode && event.target == priorityItem) {
                priorityMode = false;
                priorityItem = null;
            }

            _minContentAspectRatio = minContentAspectRatio(event.target);
            invalidateDisplayList();
        }

        protected function onVBoxClick(event:MouseEvent):void {
            var item:UserGraphicHolder = event.currentTarget as UserGraphicHolder;
            // when the user clicks to close the video, the click event is fired but the window
            // is no longer child of this class, so we need to test it first
            if (this.contains(item)) {
                priorityMode = !priorityMode || item != priorityItem;
                if (priorityMode) {
                    priorityItem = item;
                }
                invalidateDisplayList();
            }
        }

        public function addCameraFor(userId:String, camIndex:int, videoProfile:VideoProfile):void {
            if (! UsersUtil.hasUser(userId)) return;

            var alreadyPublishing:Boolean = false;
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.intId == userId && item.visibleComponent is UserVideo && item.video.camIndex == camIndex) {
                    alreadyPublishing = true;
                    break;
                }
            }

            if (!alreadyPublishing) {
                addCameraForHelper(userId, camIndex, videoProfile);
            }
        }

        private function removeChildHelper(child:UserGraphicHolder):void {
            child.shutdown(); 

            if (contains(child)) {
                removeChild(child);
            }
        }

        public function removeAvatarFor(userId:String):void {
			LOGGER.debug("[GraphicsWrapper:removeAvatarFor] userId {0}", [userId]);
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.intId == userId && item.visibleComponent is UserAvatar) {
					LOGGER.debug("[GraphicsWrapper:removeAvatarFor] removing graphic");
                    removeChildHelper(item);
                    // recursive call to remove all avatars for userId
                    removeAvatarFor(userId);
                    break;
                }
            }
        }

        public function removeVideoByCamIndex(userId:String, camIndex:int):String {
			LOGGER.debug("[GraphicsWrapper:removeVideoByCamIndex] userId {0} camIndex {1}", [userId, camIndex]);
            var streamName:String = "";

            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.intId == userId && item.visibleComponent is UserVideo && item.video.camIndex == camIndex) {
                    streamName = item.video.streamName;
                    removeChildHelper(item);
                    break;
                }
            }
            return streamName;
        }

        public function removeVideoByStreamName(userId:String, streamName:String):int {
            var camIndex:int = -1;

            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.userId == userId && item.streamName == streamName) {
                    camIndex = item.video.camIndex;
                    removeChildHelper(item);
                    break;
                }
            }
            return camIndex;
        }

        public function removeGraphicsFor(userId:String):void {
			LOGGER.debug("[GraphicsWrapper:removeGraphicsFor] userId {0}", [userId]);
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.intId == userId) {
					LOGGER.debug("[GraphicsWrapper:removeGraphicsFor] removing graphic");
                    removeChildHelper(item);
                    // recursive call to remove all graphics for userId
                    removeGraphicsFor(userId);
                    break;
                }
            }
        }

        public function hasGraphicsFor(userId:String):Boolean {
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.intId == userId) {
                    return true;
                }
            }
            return false;
        }

        public function shutdown():void {
            while (numChildren > 0) {
                var item:UserGraphicHolder = getChildAt(0) as UserGraphicHolder;
                removeChildHelper(item);
            }
        }
    }
}
