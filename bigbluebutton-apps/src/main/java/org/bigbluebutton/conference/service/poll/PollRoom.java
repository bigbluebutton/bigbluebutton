/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/

package org.bigbluebutton.conference.service.poll;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import net.jcip.annotations.ThreadSafe;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
 /* Contains information about a PollRoom. 
 */
@ThreadSafe
public class PollRoom {
	private static Logger log = Red5LoggerFactory.getLogger( PollRoom.class, "bigbluebutton" );
	
	private final String name;
	private final Map<String, IPollRoomListener> listeners;
	ArrayList<String> messages;
	
	public PollRoom(String name) {
		this.name = name;
		listeners   = new ConcurrentHashMap<String, IPollRoomListener>();
		this.messages = new ArrayList<String>();
	}
	
	public String getName() {
		return name;
	}
	
	public void addRoomListener(IPollRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			listeners.put(listener.getName(), listener);			
		}
	}
	
	public void removeRoomListener(IPollRoomListener listener) {
		listeners.remove(listener);		
	}
	
	@SuppressWarnings("unchecked")
	public void savePoll(Poll poll){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			IPollRoomListener listener = (IPollRoomListener) iter.next();
			listener.savePoll(poll);
		}
	} 
}
