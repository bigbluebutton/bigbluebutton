/**
	Interface used to enforce proper inheritance of the EventBroadcaster through composition.
	
	@class
	@author Danny Patterson
	@version 1.0.0 2005-07-23
	@see com.blitzagency.events.EventBroadcaster
*/

interface com.blitzagency.events.IBroadcastable {
	
	/**
		@see com.blitzagency.events.EventBroadcaster#addEventListener
	*/
	public function addEventListener(eventName:String, listener:Object, methodName:String):Void;
	
	/**
		@see com.blitzagency.events.EventBroadcaster#broadcastEvent
	*/
	public function broadcastEvent(eventName:String, data:Object):Void;
	
	/**
		@see com.blitzagency.events.EventBroadcaster#removeEventListener
	*/
	public function removeEventListener(eventName:String, listener:Object, methodName:String):Void;
}