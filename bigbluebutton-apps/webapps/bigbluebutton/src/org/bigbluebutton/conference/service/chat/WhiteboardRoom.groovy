
package org.bigbluebutton.conference.service.whiteboard

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import net.jcip.annotations.ThreadSafeimport java.util.concurrent.ConcurrentHashMapimport java.util.concurrent.CopyOnWriteArrayListimport java.util.Collectionsimport java.util.Iterator
/**
 * Contains information about a WhiteboardRoom. 
 */
@ThreadSafe
public class WhiteboardRoom {
	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardRoom.class, "bigbluebutton" )
	
	private final String name
	private final Map<String, IWhiteboardRoomListener> listeners
	def messages
	
	public WhiteboardRoom(String name) {
		this.name = name
		listeners   = new ConcurrentHashMap<String, IWhiteboardRoomListener>()
	}
	
	public String getName() {
		return name
	}
	
	public void addRoomListener(IWhiteboardRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener")
			listeners.put(listener.getName(), listener)			
		}
	}
	
	public void removeRoomListener(IWhiteboardRoomListener listener) {
		log.debug("removing room listener")
		listeners.remove(listener)		
	}
	
	def getWhiteboardMessages = {
		messages
	}
	
	def sendMessage = {
		if (messages == null) {
			messages = it
		} else {
			messages += it 
		}
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) 
		{
			log.debug("WhiteboardRoom::sendMessage ... calling on listener")
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next()
			log.debug("calling newWhiteboardMessage on listener ${listener.getName()}")
			listener.newWhiteboardMessage(it)
		
			if(messages!=null) log.debug("WhiteboardRoom::sendMessage ... messages=" + messages)
		
		}
	}
		
}
