package org.bigbluebutton.modules.videoconf.views
{
    import flash.display.DisplayObject;
    import flash.net.NetConnection;
    import flash.events.MouseEvent;
    import mx.containers.Canvas;
    import mx.core.UIComponent;
    import mx.events.FlexEvent;
    import mx.utils.ObjectUtil;

    import org.bigbluebutton.core.UsersUtil;
    import org.bigbluebutton.core.model.VideoProfile;
    import org.bigbluebutton.main.model.users.BBBUser;
    import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;
    import org.bigbluebutton.modules.videoconf.views.UserGraphicHolder;


    public class GraphicsWrapper extends Canvas {

        private var _options:VideoConfOptions = new VideoConfOptions();
        private var priorityWeight:Number = _options.priorityRatio;
        private var priorityMode:Boolean = false;
        private var priorityItemIndex:int = 0;
        private var cellAspectRatio:Number=4/3;

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

        private function calculateCellDimensions(canvasWidth:int, canvasHeight:int, numColumns:int, numRows:int):Object {
            var obj:Object = {
                width: Math.floor(canvasWidth / numColumns)-1,
                height: Math.floor(canvasHeight / numRows)-1
            }
            if (obj.width / obj.height > cellAspectRatio) {
                obj.width = Math.floor(obj.height * cellAspectRatio);
            } else {
                obj.height = Math.floor(obj.width / cellAspectRatio);
            }
            return obj;
        }

        private function calculateOccupiedArea(canvasWidth:int, canvasHeight:int, numColumns:int, numRows:int):Object {
            var obj:Object = calculateCellDimensions(canvasWidth, canvasHeight, numColumns, numRows);
            obj.occupiedArea = obj.width * obj.height * numChildren;
            obj.numColumns = numColumns;
            obj.numRows = numRows;
            obj.cellAspectRatio = cellAspectRatio;
            return obj;
        }

        private function findBestConfiguration(canvasWidth:int, canvasHeight:int, numChildrenInCanvas:int):Object {

            var bestConfiguration:Object = {
                occupiedArea: 0
            }

            for (var numColumns:int = 1; numColumns <= numChildrenInCanvas; ++numColumns) {
                var numRows:int = Math.ceil(numChildrenInCanvas / numColumns);
                var currentConfiguration:Object = calculateOccupiedArea(canvasWidth, canvasHeight, numColumns, numRows);
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

            var bestConfiguration:Object = findBestConfiguration(width,height,numChildren);
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

        private function findPriorityConfiguration():Object{
            var pBestConf:Object = {
                numRows: 0,
                numColumns: 0,
                width: 0,
                height: 0
            };
            var oBestConf:Object = pBestConf;
            var isVertSplit:Boolean = false;
            if (numChildren > 1){
                var pBestConfVer:Object = findBestConfiguration(Math.floor(width*priorityWeight), height, 1);
                var pBestConfHor:Object = findBestConfiguration(width, Math.floor(height*priorityWeight), 1);
                isVertSplit = (pBestConfVer.occupiedArea > pBestConfHor.occupiedArea);
                pBestConf = isVertSplit ?
                    pBestConfVer :
                    pBestConfHor;
                oBestConf = isVertSplit ?
                    findBestConfiguration(width - pBestConf.width, height,  numChildren-1) : 
                    findBestConfiguration(width, height - pBestConf.height, numChildren-1);
            } else {
                pBestConf = findBestConfiguration(width,height,1);
            }
            return {isVertSplit: isVertSplit, priorConf: pBestConf, otherConf: oBestConf};
        }

        private function updateDisplayListHelperByPriority():void {
            if (numChildren == 0) {
                return;
            }

            var bestConf:Object = findPriorityConfiguration();
            var numColumns:int = bestConf.otherConf.numColumns;
            var numRows:int = bestConf.otherConf.numRows;
            var oWidth:int = bestConf.otherConf.width;
            var oHeight:int = bestConf.otherConf.height;
            var pWidth:int = bestConf.priorConf.width;
            var pHeight:int = bestConf.priorConf.height;  

            var blockX:int=0;
            var blockY:int=0;
            var cellOffsetX:int = 0;
            var cellOffsetY:int = 0;
            var item:UserGraphicHolder = getChildAt(priorityItemIndex) as UserGraphicHolder;        
            if (item.contentAspectRatio > cellAspectRatio) {
                item.width = pWidth;
                item.height = Math.floor(item.width / item.contentAspectRatio);
            } else {
                item.height = pHeight;         
                item.width = Math.floor(item.height * item.contentAspectRatio);
            }
            
            if(bestConf.isVertSplit){
                blockX = Math.floor((3*(width - oWidth*numColumns) + item.width)/4);
                blockY = Math.floor((height-oHeight*numRows)/2);
                item.x = Math.floor((width-item.width-oWidth*numColumns)/2);
                item.y = Math.floor((height-item.height)/2);
            } else {
                blockX = Math.floor((width - oWidth*numColumns)/2);
                blockY = Math.floor((3*(height - oHeight*numRows) + item.height)/4);
                item.x = Math.floor((width-item.width)/2);
                item.y = Math.floor((height-item.height-oHeight*numRows)/2);
            }
           
 
            var nonPriorityIndex:int=0;
            for (var curItemIndex:int = 0; curItemIndex < numChildren; ++curItemIndex) {
                if(curItemIndex != priorityItemIndex){ 
                    item = getChildAt(curItemIndex) as UserGraphicHolder;
                    if (item.contentAspectRatio > cellAspectRatio) {
                        item.width = oWidth;
                        item.height = Math.floor(oWidth / item.contentAspectRatio);
                        cellOffsetY = (oHeight - item.height)/2;
                    } else {
                        item.height = oHeight;         
                        item.width = Math.floor(item.height * item.contentAspectRatio);
                        cellOffsetX = (oWidth - item.width)/2;
                    }
                    item.x = (nonPriorityIndex % numColumns) * oWidth + blockX + cellOffsetX;
                    item.y = Math.floor(nonPriorityIndex / numColumns) * oHeight + blockY + cellOffsetY;
                    nonPriorityIndex++;
                }               
            }
        } 

        override public function validateDisplayList():void {
            super.validateDisplayList();
            if(priorityMode){
                updateDisplayListHelperByPriority();
            } else {
                updateDisplayListHelper();
            }
        }

        public function addAvatarFor(userId:String):void {
            if (! UsersUtil.hasUser(userId)) return;

            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.userId = userId;
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadAvatar(_options);
            });
            super.addChild(graphic);
        }

        private function addVideoForHelper(userId:String, connection:NetConnection, streamName:String):void {
            trace("[GraphicsWrapper:addVideoForHelper] streamName " + streamName);
            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.userId = userId;
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadVideo(_options, connection, streamName);
            });
            graphic.addEventListener(MouseEvent.CLICK, onVBoxClick); 
            super.addChild(graphic); 
            if(graphic.contentAspectRatio < cellAspectRatio)
                cellAspectRatio = graphic.contentAspectRatio;
        }

        private function getUserStreamNames(user:BBBUser):Array {
            if (user.streamName == null || user.streamName == "") {
                return new Array();
            } else {
                return user.streamName.split("|");
            }
        }

        public function addVideoFor(userId:String, connection:NetConnection):void {
            var user:BBBUser = UsersUtil.getUser(userId);
            if (user == null) return;

            var streamNames:Array = getUserStreamNames(user);

            for each (var streamName:String in streamNames) {
                if (user.viewingStream.indexOf(streamName) == -1) {
                    addVideoForHelper(user.userID, connection, streamName);
                }
            }
        }

        private function addCameraForHelper(userId:String, camIndex:int, videoProfile:VideoProfile):void {
            var graphic:UserGraphicHolder = new UserGraphicHolder();
            graphic.userId = userId;
            graphic.addEventListener(FlexEvent.CREATION_COMPLETE, function(event:FlexEvent):void {
                graphic.loadCamera(_options, camIndex, videoProfile);
            });

            graphic.addEventListener(MouseEvent.CLICK, onVBoxClick);
            super.addChild(graphic);
            if(graphic.contentAspectRatio < cellAspectRatio)
                cellAspectRatio = graphic.contentAspectRatio;
        }

        protected function onVBoxClick(event:MouseEvent = null):void {
            var item:UserGraphicHolder = event.currentTarget as UserGraphicHolder;
            var newItemIndex:int = getChildIndex(item);
            priorityMode = !priorityMode || newItemIndex!=priorityItemIndex;
            if(priorityMode){
                priorityItemIndex = newItemIndex;
                updateDisplayListHelperByPriority();
            } else {
                updateDisplayListHelper();
            }        
        }

        public function addCameraFor(userId:String, camIndex:int, videoProfile:VideoProfile):void {
            if (! UsersUtil.hasUser(userId)) return;

            var alreadyPublishing:Boolean = false;
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.userID == userId && item.visibleComponent is UserVideo && item.video.camIndex == camIndex) {
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
                cellAspectRatio = minContentAspectRatio;
            }
        }

        public function removeAvatarFor(userId:String):void {
            trace("[GraphicsWrapper:removeAvatarFor] userId " + userId);
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.userID == userId && item.visibleComponent is UserAvatar) {
                    trace("[GraphicsWrapper:removeAvatarFor] removing graphic");
                    removeChildHelper(item);
                    // recursive call to remove all avatars for userId
                    removeAvatarFor(userId);
                    break;
                }
            }
        }

        public function removeVideoByCamIndex(userId:String, camIndex:int):String {
            trace("[GraphicsWrapper:removeVideoByCamIndex] userId " + userId + " camIndex " + camIndex);
            var streamName:String = "";

            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.userID == userId && item.visibleComponent is UserVideo && item.video.camIndex == camIndex) {
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
                if (item.user && item.user.userID == userId && item.visibleComponent is UserVideo && item.video.streamName == streamName) {
                    camIndex = item.video.camIndex;
                    removeChildHelper(item);
                    break;
                }
            }
            return camIndex;
        }

        public function removeGraphicsFor(userId:String):void {
            trace("[GraphicsWrapper:removeGraphicsFor] userId " + userId);
            for (var i:int = 0; i < numChildren; ++i) {
                var item:UserGraphicHolder = getChildAt(i) as UserGraphicHolder;
                if (item.user && item.user.userID == userId) {
                    trace("[GraphicsWrapper:removeGraphicsFor] removing graphic");
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
                if (item.user && item.user.userID == userId) {
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
