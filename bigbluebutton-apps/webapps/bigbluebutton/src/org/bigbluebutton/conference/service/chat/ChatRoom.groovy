
package org.bigbluebutton.conference.service.chat

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import net.jcip.annotations.ThreadSafeimport java.util.concurrent.ConcurrentHashMapimport java.util.concurrent.CopyOnWriteArrayListimport java.util.Collectionsimport java.util.Iterator
/**
 * Contains information about a ChatRoom. 
 */
@ThreadSafe
public class ChatRoom {
	private static Logger log = Red5LoggerFactory.getLogger( ChatRoom.class, "bigbluebutton" )
	
	private final String name
	private final Map<String, IChatRoomListener> listeners
	def messages
	
	public ChatRoom(String name) {
		this.name = name
		listeners   = new ConcurrentHashMap<String, IChatRoomListener>()
	}
	
	public String getName() {
		return name
	}
	
	public void addRoomListener(IChatRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener")
			listeners.put(listener.getName(), listener)			
		}
	}
	
	public void removeRoomListener(IChatRoomListener listener) {
		log.debug("removing room listener")
		listeners.remove(listener)		
	}
	
	def getChatMessages = {
		messages
	}
	
	def sendMessage = {
		if (messages == null) {
			messages = it
		} else {
			messages += it 
		}
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IChatRoomListener listener = (IChatRoomListener) iter.next()
			log.debug("calling newChatMessage on listener ${listener.getName()}")
			listener.newChatMessage(it)
		}
	}
		
}
