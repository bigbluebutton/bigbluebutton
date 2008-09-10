/*
GDispatcher Beta 1 by Grant Skinner, http://gskinner.com/

No documentation is provided with this beta release. Please see
http://gskinner.com/blog/ for information and documentation.

Please report any bugs, or feature requests to gdispatcher@gskinner.com
You may NOT re-distribute or sell this code in any form.

The GDispatcher class should be completely interchangeable with the
mx.events.EventDispatcher class.
*/

class com.gskinner.events.GDispatcher 
{
	static var $instance:GDispatcher = undefined;
	private var gDispatcher_listeners:Object;
	
	static function initialize(p_obj:Object):Void 
	{
		if ($instance == undefined) { $instance = new GDispatcher; }
		p_obj.dispatchEvent = $instance.dispatchEvent;
		p_obj.eventListenerExists = $instance.eventListenerExists;
		p_obj.addEventListener = $instance.addEventListener;
		p_obj.removeEventListener = $instance.removeEventListener;
		p_obj.removeAllEventListeners = $instance.removeAllEventListeners;
	}
	
	// internal function to locate listeners:
	static function $indexOfListener(p_listeners:Array,p_obj:Object,p_function:String):Number 
	{
		var l:Number = p_listeners.length;
		var i:Number = -1;
		while (++i < l) {
			var obj:Object = p_listeners[i];
			if (obj.o == p_obj && obj.f == p_function) { return i; }
		}
		return -1;
	}
	
	static function $dispatchEvent(p_dispatchObj:Object,p_listeners:Array,p_eventObj:Object) 
	{
		var i:String;
		// trick from MM: fixes problem with users removing items from listeners while it executes.
		for (i in p_listeners) {
			var o:Object = p_listeners[i].o;
			var oType:String = typeof(o);
			var f:String = p_listeners[i].f;
			if (oType == "object" || oType == "movieclip") {
				if (o.handleEvent != undefined && f == undefined) {
					o.handleEvent(p_eventObj);
				} else {
					if (f == undefined) { f = p_eventObj.type; }
					o[f](p_eventObj);
				}
			} else { // function
				o.apply(p_dispatchObj,[p_eventObj]);
			}
		}
	}
	
	// functions used by dispatchers:
	private function dispatchEvent(p_eventObj:Object):Void 
	{
		if (p_eventObj.type == "ALL") { return; } // disallow events of type "ALL"
		if (p_eventObj.target == undefined) { p_eventObj.target = this; }
		this[p_eventObj.type + "Handler"](p_eventObj);
		var listeners:Array = gDispatcher_listeners[p_eventObj.type];
		if (listeners != undefined) { GDispatcher.$dispatchEvent(this,listeners,p_eventObj); }
		listeners = gDispatcher_listeners["ALL"];
		if (listeners != undefined) { GDispatcher.$dispatchEvent(this,listeners,p_eventObj); }
	}
	
	private function eventListenerExists(p_event:String,p_obj:Object,p_function:String):Boolean 
	{
		return (GDispatcher.$indexOfListener(gDispatcher_listeners[p_event],p_obj,p_function) != -1);
	}
	
	private function addEventListener(p_event:String,p_obj:Object,p_function:String):Void 
	{
		if (gDispatcher_listeners == undefined) { gDispatcher_listeners = {}; _global.ASSetPropFlags(this,gDispatcher_listeners,1); }
		var listeners:Array = gDispatcher_listeners[p_event];
		if (listeners == undefined) { gDispatcher_listeners[p_event] = listeners = []; }
		if (GDispatcher.$indexOfListener(listeners,p_obj,p_function) == -1) { listeners.push({o:p_obj,f:p_function}); }
	}
	
	private function removeEventListener(p_event:String,p_obj:Object,p_function:String):Void 
	{
		var listeners = gDispatcher_listeners[p_event];
		if (listeners == undefined) { return; }
		var index:Number = GDispatcher.$indexOfListener(listeners,p_obj,p_function);
		if (index != -1) { listeners.splice(index,1); }
	}
	
	private function removeAllEventListeners(p_event:String):Void 
	{
		if (p_event == undefined) { delete(gDispatcher_listeners); }
		else { delete(gDispatcher_listeners[p_event]); }
	}
}
