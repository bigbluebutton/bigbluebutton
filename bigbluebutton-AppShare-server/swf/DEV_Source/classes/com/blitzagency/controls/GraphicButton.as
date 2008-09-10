import mx.events.EventDispatcher;

class com.blitzagency.controls.GraphicButton extends MovieClip {
// ui elements:
	private var hitAreaMC:MovieClip;
	private var _enabled:Boolean=true;
	
// methods for EventDispatcher:
	public var addEventListener:Function;
	public var removeEventListener:Function;
	private var dispatchEvent:Function;
	
// initialization:
	private function GraphicButton() 
	{
		EventDispatcher.initialize(this);
	}
	
	function onLoad() 
	{
		
		enabled = _enabled;
		if (hitAreaMC) { hitArea = hitAreaMC; }
	}
	
	function onRollOver():Void {
		if (!_enabled) { return; }
		this.gotoAndPlay("over");
		dispatchEvent({type:"over"});
	}
	function onDragOver():Void { onRollOver(); }
	
	function onRollOut():Void {
		if (!_enabled) { return; }
		this.gotoAndPlay("out");
		dispatchEvent({type:"out"});
	}
	function onDragOut():Void { onRollOut(); }
	
	function onPress():Void {
		if (!_enabled) { return; }
		//_global.lastButtonClicked = this
		this.gotoAndStop("down");
		dispatchEvent({type:"down"});
	}
	
	function onRelease():Void {
		if (!_enabled) { return; }
		//_global.lastButtonClicked = this
		onRollOver();
		
		dispatchEvent({type:"click"});
	}
	
	function onReleaseOutside():Void {
		dispatchEvent({type:"click"});
		//dispatchEvent({type:"releaseOutside"});
	}
	
	public function get enabled():Boolean {
		return _enabled;
	}
	
	public function set enabled(p_enabled:Boolean):Void {
		_enabled = Boolean(p_enabled);
		//useHandCursor = p_enabled;
		this.gotoAndStop("up");
		if (!_enabled) { this.gotoAndStop("disabled"); }
	}
}