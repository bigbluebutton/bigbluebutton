package org.bigbluebutton.web.video.views {
	
	
	import flash.media.Video;
	
	import mx.collections.ArrayCollection;
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.common.views.VideoView;
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	public class VideoWindow extends BBBWindow {
		
		public var videoViews:ArrayCollection = new ArrayCollection();
		
		public var priorityMode:Boolean = false;
		
		private var priorityWeight:Number = 2 / 3; //this value is actually retrived from VideoConfOptions().priorityRatio;
		
		public var priorityItem:UserGraphicHolder = null;
		
		private var _minContentAspectRatio:Number = 4 / 3;
		
		public function VideoWindow() {
			super();
			title = "Webcams";
			width = 300;
			height = 400;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			if (priorityMode) {
				updateDisplayListHelperByPriority(w, h - this.titleBarOverlay.height);
			} else {
				updateDisplayListHelper(w, h - this.titleBarOverlay.height);
			}
		}
		
		private function updateDisplayListHelperByPriority(unscaledWidth:Number, unscaledHeight:Number):void {
			if (videoViews.length < 2) {
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
			var itemX:int, itemY:int, itemWidth:int, itemHeight:int;
			
			var item:UserGraphicHolder = priorityItem as UserGraphicHolder;
			
			// set size and position of the prioritized video
			if (item.aspectRatio > _minContentAspectRatio) {
				itemWidth = pWidth;
				itemHeight = Math.floor(pWidth / item.aspectRatio);
			} else {
				itemHeight = pHeight;
				itemWidth = Math.floor(pHeight * item.aspectRatio);
			}
			
			if (bestConf.isVertSplit) {
				blockX = Math.floor((3 * (unscaledWidth - oWidth * numColumns) + itemWidth) / 4);
				blockY = Math.floor((unscaledHeight - oHeight * numRows) / 2);
				itemX = Math.floor((unscaledWidth - itemWidth - oWidth * numColumns) / 2);
				itemY = Math.floor((unscaledHeight - itemHeight) / 2);
			} else {
				blockX = Math.floor((unscaledWidth - oWidth * numColumns) / 2);
				blockY = Math.floor((3 * (unscaledHeight - oHeight * numRows) + itemHeight) / 4);
				itemX = Math.floor((unscaledWidth - itemWidth) / 2);
				itemY = Math.floor((unscaledHeight - itemHeight - oHeight * numRows) / 2);
			}
			resizeUserGraphicHolder(item, itemWidth, itemHeight, itemX, itemY);
			
			// set size and position of the other videos
			var nonPriorityIndex:int = 0;
			for (var curItemIndex:int = 0; curItemIndex < videoViews.length; ++curItemIndex) {
				var item:UserGraphicHolder = videoViews[curItemIndex] as UserGraphicHolder;
				if (item != priorityItem) {
					if (item.aspectRatio > _minContentAspectRatio) {
						itemWidth = oWidth;
						itemHeight = Math.floor(oWidth / item.aspectRatio);
					} else {
						itemHeight = oHeight;
						itemWidth = Math.floor(oHeight * item.aspectRatio);
					}
					cellOffsetX = (oWidth - itemWidth) / 2;
					cellOffsetY = (oHeight - itemHeight) / 2;
					
					itemX = (nonPriorityIndex % numColumns) * oWidth + blockX + cellOffsetX;
					itemY = Math.floor(nonPriorityIndex / numColumns) * oHeight + blockY + cellOffsetY;
					nonPriorityIndex++;
					
					resizeUserGraphicHolder(item, itemWidth, itemHeight, itemX, itemY);
				}
			}
		}
		
		private function resizeUserGraphicHolder(item:UserGraphicHolder, itemWidth, itemHeight, itemX, itemY) {
			item.move(itemX, itemY);
			item.width = itemWidth;
			item.height = itemHeight;
			item.resize(itemWidth, itemHeight)
		}
		
		private function findPriorityConfiguration(unscaledWidth:Number, unscaledHeight:Number):Object {
			var pBestConf:Object = {numRows: 0, numColumns: 0, width: 0, height: 0};
			var oBestConf:Object = pBestConf;
			var isVertSplit:Boolean = false;
			if (videoViews.length > 1) {
				var pBestConfVer:Object = findBestConfiguration(Math.floor(unscaledWidth * priorityWeight), unscaledHeight, 1);
				var pBestConfHor:Object = findBestConfiguration(unscaledWidth, Math.floor(unscaledHeight * priorityWeight), 1);
				isVertSplit = (pBestConfVer.occupiedArea > pBestConfHor.occupiedArea);
				if (isVertSplit) {
					pBestConf = pBestConfVer;
					oBestConf = findBestConfiguration(unscaledWidth - pBestConf.width, unscaledHeight, videoViews.length - 1);
				} else {
					pBestConf = pBestConfHor;
					oBestConf = findBestConfiguration(unscaledWidth, unscaledHeight - pBestConf.height, videoViews.length - 1);
				}
			} else {
				pBestConf = findBestConfiguration(unscaledWidth, unscaledHeight, 1);
			}
			return {isVertSplit: isVertSplit, priorConf: pBestConf, otherConf: oBestConf};
		}
		
		private function updateDisplayListHelper(unscaledWidth:Number, unscaledHeight:Number):void {
			if (videoViews.length == 0) {
				return;
			}
			
			var bestConfiguration:Object = findBestConfiguration(unscaledWidth, unscaledHeight, videoViews.length);
			var numColumns:int = bestConfiguration.numColumns;
			var numRows:int = bestConfiguration.numRows;
			var cellWidth:int = bestConfiguration.width;
			var cellHeight:int = bestConfiguration.height;
			var cellAspectRatio:Number = bestConfiguration.cellAspectRatio;
			
			var blockX:int = Math.floor((unscaledWidth - cellWidth * numColumns) / 2);
			var blockY:int = Math.floor((unscaledHeight - cellHeight * numRows) / 2);
			var itemX:int, itemY:int, itemWidth:int, itemHeight:int;
			
			for (var i:int = 0; i < videoViews.length; ++i) {
				var item:UserGraphicHolder = videoViews[i] as UserGraphicHolder;
				var cellOffsetX:int = 0;
				var cellOffsetY:int = 0;
				if (item.aspectRatio > cellAspectRatio) {
					itemWidth = cellWidth;
					itemHeight = Math.floor(cellWidth / item.aspectRatio);
					cellOffsetY = (cellHeight - itemHeight) / 2;
				} else {
					itemWidth = Math.floor(cellHeight * item.aspectRatio);
					itemHeight = cellHeight;
					cellOffsetX = (cellWidth - itemWidth) / 2;
				}
				itemX = (i % numColumns) * cellWidth + blockX + cellOffsetX;
				itemY = Math.floor(i / numColumns) * cellHeight + blockY + cellOffsetY;
				
				resizeUserGraphicHolder(item, itemWidth, itemHeight, itemX, itemY);
			}
		}
		
		private function findBestConfiguration(canvasWidth:int, canvasHeight:int, numChildrenInCanvas:int):Object {
			var bestConfiguration:Object = {occupiedArea: 0}
			
			for (var numColumns:int = 1; numColumns <= numChildrenInCanvas; ++numColumns) {
				var numRows:int = Math.ceil(numChildrenInCanvas / numColumns);
				var currentConfiguration:Object = calculateOccupiedArea(canvasWidth, canvasHeight, numColumns, numRows);
				if (currentConfiguration.occupiedArea > bestConfiguration.occupiedArea) {
					bestConfiguration = currentConfiguration;
				}
			}
			return bestConfiguration;
		}
		
		private function calculateOccupiedArea(canvasWidth:int, canvasHeight:int, numColumns:int, numRows:int):Object {
			var obj:Object = calculateCellDimensions(canvasWidth, canvasHeight, numColumns, numRows);
			obj.occupiedArea = obj.width * obj.height * videoViews.length;
			obj.numColumns = numColumns;
			obj.numRows = numRows;
			obj.cellAspectRatio = _minContentAspectRatio;
			return obj;
		}
		
		private function calculateCellDimensions(canvasWidth:int, canvasHeight:int, numColumns:int, numRows:int):Object {
			var obj:Object = {width: Math.floor(canvasWidth / numColumns) - 5, height: Math.floor(canvasHeight / numRows) - 5}
			if (obj.width / obj.height > _minContentAspectRatio) {
				obj.width = Math.floor(obj.height * _minContentAspectRatio);
			} else {
				obj.height = Math.floor(obj.width / _minContentAspectRatio);
			}
			return obj;
		}
	}
}

