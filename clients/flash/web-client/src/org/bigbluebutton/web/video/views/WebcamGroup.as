package org.bigbluebutton.web.video.views {
	import spark.components.Group;
	
	public class WebcamGroup extends Group {
		private const VERTICAL_PADDING:uint = 1;
		
		private const HORIZONTAL_PADDING:uint = 1;
		
		private var _minContentAspectRatio:Number = 4 / 3;
		
		private var _numVideos:Number = 0;;
		
		public function WebcamGroup() {
			super();
			
			// Need to explicitly set the min width/height or the sizing will break when a webcam is removed
			minWidth = 50;
			minHeight = 50;
		}
		
		public function addVideo(v:WebcamView):void {
			var count:uint = this.numElements;
			addElement(v);
			if (count < this.numElements) _numVideos++;
			
			validateHeight();
			
			_minContentAspectRatio = minContentAspectRatio();
			invalidateDisplayList();
		}
		
		public function removeVideo(v:WebcamView):void {
			var count:uint = this.numElements;
			removeElement(v);
			if (count > this.numElements) _numVideos--;
			
			validateHeight();
			
			_minContentAspectRatio = minContentAspectRatio();
			invalidateDisplayList();
		}
		
		private function validateHeight():void {
			if (_numVideos > 0) height = 200;
			else height = 0;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			updateDisplayListHelper(w, h);
		}
		
		private function updateDisplayListHelper(unscaledWidth:Number, unscaledHeight:Number):void {
			if (numChildren == 0) {
				return;
			}
			
			var bestConfiguration:Object = findBestConfiguration(unscaledWidth, unscaledHeight, numChildren);
			var numColumns:int = bestConfiguration.numColumns;
			var numRows:int = bestConfiguration.numRows;
			var cellWidth:Number = bestConfiguration.width;
			var cellHeight:Number = bestConfiguration.height;
			var cellAspectRatio:Number = bestConfiguration.cellAspectRatio;
			
			var blockX:int = ((unscaledWidth - cellWidth * numColumns) / 2);
			var blockY:int = ((unscaledHeight - cellHeight * numRows) / 2);
			var itemX:Number, itemY:Number, itemWidth:Number, itemHeight:Number;
			
			for (var i:int = 0; i < numChildren; ++i) {
				var item:WebcamView = getChildAt(i) as WebcamView;
				var cellOffsetX:int = 0;
				var cellOffsetY:int = 0;
				if (item.videoProfile.aspectRatio > cellAspectRatio) {
					itemWidth = cellWidth;
					itemHeight = (cellWidth / item.videoProfile.aspectRatio);
					cellOffsetY = (cellHeight - itemHeight) / 2;
				} else {
					itemWidth = (cellHeight * item.videoProfile.aspectRatio);
					itemHeight = cellHeight;
					cellOffsetX = (cellWidth - itemWidth) / 2;
				}
				itemX = (i % numColumns) * cellWidth + blockX + cellOffsetX;
				itemY = Math.floor(i / numColumns) * cellHeight + blockY + cellOffsetY;
				
				item.setActualSize(itemWidth, itemHeight);
				item.move(itemX, itemY);
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
			obj.occupiedArea = obj.width * obj.height * numChildren;
			obj.numColumns = numColumns;
			obj.numRows = numRows;
			obj.cellAspectRatio = _minContentAspectRatio;
			return obj;
		}
		
		private function calculateCellDimensions(canvasWidth:int, canvasHeight:int, numColumns:int, numRows:int):Object {
			var obj:Object = {width: (canvasWidth / numColumns) - HORIZONTAL_PADDING, height: (canvasHeight / numRows) - VERTICAL_PADDING}
			if (obj.width / obj.height > _minContentAspectRatio) {
				obj.width = (obj.height * _minContentAspectRatio);
			} else {
				obj.height = (obj.width / _minContentAspectRatio);
			}
			return obj;
		}
		
		private function minContentAspectRatio():Number {
			var result:Number = Number.MAX_VALUE;
			for (var i:int = 0; i < numChildren; ++i) {
				var item:WebcamView = getChildAt(i) as WebcamView;
				if (item.videoProfile.aspectRatio < result) {
					result = item.videoProfile.aspectRatio;
				}
			}
			return result;
		}
	}
}