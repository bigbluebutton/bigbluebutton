// ** AUTO-UI IMPORT STATEMENTS **
import org.red5.utils.Delegate;
import com.gskinner.events.GDispatcher;
import mx.containers.Window;
// ** END AUTO-UI IMPORT STATEMENTS **

class com.blitzagency.util.SimpleDialog extends MovieClip {
// Constants:
	public static var CLASS_REF = com.blitzagency.util.SimpleDialog;
	public static var LINKAGE_ID:String = "com.blitzagency.util.SimpleDialog";
// Public Properties:
	public var addEventListener:Function;
	public var removeEventListener:Function;
	public var __title:String;
// Private Properties:
	private var dispatchEvent:Function;
// UI Elements:

// ** AUTO-UI ELEMENTS **
	private var bg:MovieClip;
	private var msg:MovieClip;
	private var __message:String;
	private var ok:MovieClip;
	private var hiddenBG:Button;
	private var window:Window;
// ** END AUTO-UI ELEMENTS **

	public function get message():String
	{
		return __message;
	}
	
	public function set message(newValue):Void
	{
		__message = newValue;
		msg.text = newValue;
	}
	
	public function get title():String
	{
		return __title;
	}
	
	public function set title(newValue):Void
	{
		__title = newValue;
		window.title = newValue;
	}

// Initialization:
	private function SimpleDialog() {GDispatcher.initialize(this)}
	private function onLoad():Void { configUI(); }

// Public Methods:	
	public function show(p_message:String):Void
	{
		message = p_message;
		_visible = true;
	}
	
	public function hide():Void
	{
		_visible = false;
	}
	
	public function initButtons(p_obj:Object):Void
	{
		ok.label.text = p_obj.ok;
	}

// Semi-Private Methods:
// Private Methods:
	private function configUI():Void 
	{
		_visible = false;
		initOk();
	}
	
	private function initOk():Void
	{
		ok.onRelease = Delegate.create(this, doConfirm);
	}
	
	private function doConfirm():Void
	{
		hide();
		dispatchEvent({type:"onConfirm", msg:message})
	}
}