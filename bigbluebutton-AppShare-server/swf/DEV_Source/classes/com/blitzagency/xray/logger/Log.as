import com.blitzagency.xray.logger.XrayLogger;

class com.blitzagency.xray.logger.Log
{
	private var message:String;
	private var dump:Object;
	private var level:Number;
	
	function Log(p_message:String, p_dump:Object, p_level:Number)
	{
		setMessage(p_message);
		setDump(p_dump);
		setLevel(p_level);
	}
	
	public function setMessage(p_message:String):Void
	{
		message = p_message;
	}
	
	public function setDump(p_dump:Object):Void
	{
		dump = p_dump;
	}
	
	public function setLevel(p_level:Number):Void
	{
		level = p_level;
	}
	
	public function getMessage():String
	{
		return message;
	}
	
	public function getDump():Object
	{
		return dump;
	}
	
	public function getLevel():Number
	{
		return level;
	}
}
