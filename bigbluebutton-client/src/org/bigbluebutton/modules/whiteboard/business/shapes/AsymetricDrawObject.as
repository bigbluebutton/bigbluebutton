package org.bigbluebutton.modules.whiteboard.business.shapes
{
    public class AsymetricDrawObject extends DrawObject
    {

        public function AsymetricDrawObject(id:String, type:String, status:String)
        {
            super(id, type, status);
        }

        private function getMinX() : Number
        {
			var minX:Number = -1;
			
			for(var i:int = 0; i < _denormalizedPoints.length - 1; i += 2) {
				if (minX < 0 || (_denormalizedPoints[i] as Number) < minX) {
					minX = _denormalizedPoints[i] as Number;
				}
			}
			
            return minX;
        }

		private function getMaxX():Number {
			var maxX:Number = -1;
			
			for (var i:int = 0; i < _denormalizedPoints.length - 1; i += 2){
				if(maxX < 0 || (_denormalizedPoints[i] as Number) > maxX){
					maxX = _denormalizedPoints[i];
				}
			}
			
			return maxX;
		}
		
		private function getMinY():Number {
			var minY:Number = -1;
			
			for (var i:int = 1; i < _denormalizedPoints.length; i+= 2){
				if(minY < 0 || (_denormalizedPoints[i] as Number) < minY){
					minY = _denormalizedPoints[i];
				}
			}
			
			return minY;
		}

		private function getMaxY():Number {
			var maxY:Number = -1;
			
			for (var i:int = 1; i < _denormalizedPoints.length; i+= 2){
				if(maxY < 0 || (_denormalizedPoints[i] as Number) > maxY){
					maxY = _denormalizedPoints[i];
				}
			}
			
			return maxY;
		}

       

        override public function getX() : Number
        {
            return this.getMinX();
        }

        override public function getY() : Number
        {
            return this.getMinY();
        }

		override public function getWidth():Number{
			var x1:Number = getMinX();
			var x2:Number = getMaxX();
			
			return Math.abs(x1 - x2);
		}

		override public function getHeight():Number{
			var y1:Number = getMinY();
			var y2:Number = getMaxY();
			
			return Math.abs(y1 - y2);
		}

		override public function changeTopLeft(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var bottomRightX:Number = getMaxX();
			var bottomRightY:Number = getMaxY();
			
			if (newX >= bottomRightX || newY >= bottomRightY){
				return;
			}
			
			var ratioX:Number = Math.abs(newX - getMaxX()) / getWidth();
			var ratioY:Number = Math.abs(newY - getMaxY()) / getHeight();
			
			for(var i:int = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] *= ratioX;
				_denormalizedPoints[i + 1] *= ratioY;
			}
			
			var distanceX:Number = bottomRightX - getMaxX();
			var distanceY:Number = bottomRightY - getMaxY();
			
			for(i = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] += distanceX;
				_denormalizedPoints[i + 1] += distanceY;
			}
		}

		override public function changeTopMiddle(newY:Number, parentHeight:Number):void{
			var bottomRightY:Number = getMaxY();
			
			if (newY >= bottomRightY){
				return;
			}
			
			var ratioY:Number = Math.abs(newY - getMaxY()) / getHeight();
			
			for(var i:int = 1; i < _denormalizedPoints.length; i += 2){
				_denormalizedPoints[i] *= ratioY;
			}
			
			var distanceY:Number = bottomRightY - getMaxY();
			
			for(i = 1; i < _denormalizedPoints.length; i += 2){
				_denormalizedPoints[i] += distanceY;
			}
		}

		override public function changeTopRight(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var bottomLeftX:Number = getMinX();
			var bottomLeftY:Number = getMaxY();
			
			if (newX <= bottomLeftX || newY >= bottomLeftY){
				return;
			}
			
			var ratioX:Number = Math.abs(newX - getMinX()) / getWidth();
			var ratioY:Number = Math.abs(newY - getMaxY()) / getHeight();
			
			for(var i:int = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] *= ratioX;
				_denormalizedPoints[i + 1] *= ratioY;
			}
			
			var distanceX:Number = bottomLeftX - getMinX();
			var distanceY:Number = bottomLeftY - getMaxY();
			
			for(i = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] += distanceX;
				_denormalizedPoints[i + 1] += distanceY;
			}
		}

		override public function changeMiddleLeft(newX:Number, parentWidth:Number):void{
			var bottomRightX:Number = getMaxX();
			
			if (newX >= bottomRightX){
				return;
			}
			
			var ratioX:Number = Math.abs(newX - getMaxX()) / getWidth();
			
			for(var i:int = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] *= ratioX;
			}
			
			var distanceX:Number = bottomRightX - getMaxX();
			
			for(i = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] += distanceX;
			}
		}

		override public function changeMiddleRight(newX:Number, parentWidth:Number):void{
			var bottomLeftX:Number = getMinX();
			
			if(newX <= bottomLeftX){
				return;
			}
			
			var ratioX:Number = Math.abs(newX - getMinX()) / getWidth();
			
			for(var i:int = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] *= ratioX;
			}
			
			var distanceX:Number = bottomLeftX - getMinX();
			
			for(i = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] += distanceX;
			}
		}

		override public function changeBottomLeft(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var topRightX:Number = getMaxX();
			var topRightY:Number = getMinY();
			
			if (newX >= topRightX || newY <= topRightY){
				return;
			}
			
			var ratioX:Number = Math.abs(newX - getMaxX()) / getWidth();
			var ratioY:Number = Math.abs(newY - getMinY()) / getHeight();
			
			for(var i:int = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] *= ratioX;
				_denormalizedPoints[i + 1] *= ratioY;
			}
			
			var distanceX:Number = topRightX - getMaxX();
			var distanceY:Number = topRightY - getMinY();
			
			for(i = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] += distanceX;
				_denormalizedPoints[i + 1] += distanceY;
			}
		}

		override public function changeBottomMiddle(newY:Number, parentHeight:Number):void{
			var topRightY:Number = getMinY();
			
			if(newY <= topRightY){
				return;
			}
			
			var ratioY:Number = Math.abs(newY - getMinY()) / getHeight();
			
			for(var i:int = 1; i < _denormalizedPoints.length; i += 2){
				_denormalizedPoints[i] *= ratioY;
			}
			
			var distanceY:Number = topRightY - getMinY();
			
			for(i = 1; i < _denormalizedPoints.length; i += 2){
				_denormalizedPoints[i] += distanceY;
			}
		}

		override public function changeBottomRight(newX:Number, newY:Number, parentWidth:Number, parentHeight:Number):void{
			var topLeftX:Number = getMinX();
			var topLeftY:Number = getMinY();
			
			if(newX <= topLeftX || newY <= topLeftY){
				return;
			}
			
			var ratioX:Number = Math.abs(newX - getMinX()) / getWidth();
			var ratioY:Number = Math.abs(newY - getMinY()) / getHeight();
			
			for(var i:int = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] *= ratioX;
				_denormalizedPoints[i + 1] *= ratioY;
			}
			
			var distanceX:Number = topLeftX - getMinX();
			var distanceY:Number = topLeftY - getMinY();
			
			for(i = 0; i < _denormalizedPoints.length - 1; i += 2){
				_denormalizedPoints[i] += distanceX;
				_denormalizedPoints[i + 1] += distanceY;
			}
		}

    }
}
