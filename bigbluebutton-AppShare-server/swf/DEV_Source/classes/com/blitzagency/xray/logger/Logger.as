/**
 * @author John Grden
 */
interface com.blitzagency.xray.logger.Logger 
{	
	public function setLevel(p_level:Number):Void;
	public function debug(message:String, dump:Object, package:String):Void;
	public function info(message:String, dump:Object, package:String):Void;
	public function warn(message:String, dump:Object, package:String):Void;
	public function error(message:String, dump:Object, package:String):Void;
	public function fatal(message:String, dump:Object, package:String):Void;
	public function log(message:String, dump:Object, package:String, level:Number):Void;
	
}