/**
	Interface used to enforce proper inheritance of the EventBroadcaster through composition.
	
	@class
	@author Danny Patterson
	@version 1.0.0 2005-07-23
	@see com.blitzagency.events.EventBroadcaster
*/

interface com.blitzagency.events.IStaticBroadcastable {
	/**
		@see com.blitzagency.events.EventBroadcaster#addEventListener
	*/
	public function addSingletonEventListener(eventName:String, listener:Object, methodName:String):Void;
	
	/**
		@see com.blitzagency.events.EventBroadcaster#broadcastEvent
	*/
	public function broadcastSingletonEvent(eventName:String, data:Object):Void;
	
	/**
	 * This is for use with to broadcast a Singleton instance of a utility class
	 */
	public function removeSingletonEventListener(eventName:String, listener:Object, methodName:String):Void;
}