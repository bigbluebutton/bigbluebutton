/*
Developer: John Grden
*/
class com.acmewebworks.utils.CoordinateTools
{
	private function CoordinateTools()
	{
		_global.localToLocal = localToLocal;
	}
	
	public static function localToLocal(from:Object, to:Object):Object
	{
		var point:Object = {x: 0, y: 0};
		from.localToGlobal(point);
		to.globalToLocal(point);
		return point;
	} 
	
	public static function getAngle(pointAX:Number, pointAY:Number, pointBX:Number, pointBY:Number):Number
	{
		//return angle
		var nYdiff:Number = (pointAY - pointBY);
		var nXdiff:Number = (pointAX - pointBX);
		var rad:Number = Math.atan2(nYdiff, nXdiff);
	
		var deg:Number = Math.round(rad * 180 / Math.PI);
	
		//this will return a true 360 value
		deg < 0 ? 180 + (180-Math.abs(deg)) : deg;
		return deg;
	}
}