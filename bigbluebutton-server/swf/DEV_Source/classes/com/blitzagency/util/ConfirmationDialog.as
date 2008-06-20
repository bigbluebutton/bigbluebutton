// ** AUTO-UI IMPORT STATEMENTS **
import com.blitzagency.util.SimpleDialog;
import mx.containers.Window;
// ** END AUTO-UI IMPORT STATEMENTS **
import mx.events.EventDispatcher;
import mx.utils.Delegate;

class com.blitzagency.util.ConfirmationDialog extends SimpleDialog {
// Constants:
	public static var CLASS_REF = com.blitzagency.util.ConfirmationDialog;
	public static var LINKAGE_ID:String = "com.blitzagency.util.ConfirmationDialog";
// Public Properties:
	public var addEventListener:Function;
	public var removeEventListener:Function;
	public var temp:Object; // used for temporarily storing information during a confirmation, since we're not modal
// Private Properties:
	private var dispatchEvent:Function;
// UI Elements:

// ** AUTO-UI ELEMENTS **
	private var bg:MovieClip;
	private var cancel:MovieClip;
	private var hiddenBG:Button;
	private var message:TextField;
	private var ok:MovieClip;
	private var window:Window;
// ** END AUTO-UI ELEMENTS **

// Initialization:
	private function ConfirmationDialog() {EventDispatcher.initialize(this)}
	private function onLoad():Void 
	{ 
		configUI(); 
		initCancel(); 
	}

// Public Methods:
// Semi-Private Methods:
// Private Methods;	
	private function initCancel():Void
	{
		cancel.onRelease = Delegate.create(this, doCancel);
	}
	
	private function doCancel():Void
	{
		hide();
		dispatchEvent({type:"onCancel"}) 	
	}
}