/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
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
package org.bigbluebutton.conference;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * This class maintains the connections mapping of a user.
 * This tracks the connections for a user to manage auto-reconnects.
 * @author ralam
 *
 */
public class UserConnectionMapper {

	private ConcurrentMap<String, UserConnection> users = new ConcurrentHashMap<String, UserConnection>(8, 0.9f, 1);;

	/**
	 * Adds a connection for a user.
	 * @param userId
	 * @param connId
	 */
	public synchronized void addUserConnection(String userId, String connId) {
		if (users.containsKey(userId)) {
			UserConnection user = users.get(userId);
			user.add(connId);
		} else {
			UserConnection user = new UserConnection();
			user.add(connId);
			users.put(userId, user);
		}
	}

	/**
	 * Removed a connection for a user. Returns true if the user doesn't have any
	 * connection left and thus can be removed.
	 * @param userId
	 * @param connId
	 * @return boolean - no more connections
	 */
	public synchronized boolean userDisconnected(String userId, String connId) {
		if (users.containsKey(userId)) {
			UserConnection user = users.get(userId);
			user.remove(connId);
			if (user.isEmpty()) {
				users.remove(userId);
				return true;
			} 
			return false;
		}
		
		return true;
	}

	private class UserConnection {
		private final Set<String> connections = new HashSet<String>();
		
		public void add(String connId) {
			connections.add(connId);
		}
		
		public void remove(String connId) {
			connections.remove(connId);
		}
		
		public boolean isEmpty() {
			return connections.isEmpty();
		}
	}
}
