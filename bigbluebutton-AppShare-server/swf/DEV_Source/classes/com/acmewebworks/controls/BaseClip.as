import mx.events.EventDispatcher;

class com.acmewebworks.controls.BaseClip extends MovieClip
{
// Constants:
	public static var CLASS_REF = com.acmewebworks.controls.BaseClip;
// Public Properties:
	public var addEventListener:Function;
	public var removeEventListener:Function;
// Private Properties:
	private var dispatchEvent:Function;

// Initialization:
	public function BaseClip() 
	{
		EventDispatcher.initialize(this);
	}

// Public Methods:
	public function scale(p_scale:Number):Void
	{
		_xscale = p_scale;
		_yscale = p_scale;
	}
	
	public function size(p_size:Number):Void
	{
		_x = p_size;
		_y = p_size;
	}
// Semi-Private Methods:
// Private Methods:

}