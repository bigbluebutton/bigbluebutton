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
package org.bigbluebutton.conference;

import net.jcip.annotations.ThreadSafe;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.io.Serializable;
import java.lang.Long;
/**
 * Contains information for a Participant. Encapsulates status and the
 * only way to change/add status is through setStatus;
 */
@ThreadSafe
public class Participant implements Serializable {
	private Long userid;
	private String name;
	private String role = "VIEWER";
	private String externUserID;
	
	private final Map status;
	private Map<String, Object> unmodifiableStatus;
	
	public Participant(Long userid, String name, String role, String externUserID, Map<String, Object> status) {
		this.userid = userid;
		this.name = name;
		this.role = role;
		this.externUserID = externUserID;
		this.status = new ConcurrentHashMap<String, Object>(status);
		unmodifiableStatus = Collections.unmodifiableMap(status);
	}
	
	public boolean isModerator() {
		return "MODERATOR".equals(role);
	}
	
	public String getName() {
		return name;
	}
	
	public Long getUserid() {
		return userid;
	}
	
	public String getRole() {
		return role;
	}
	
	public String getExternUserID() {
	   return externUserID;
	}
	
	/**
	 * Returns that status for this participant. However, the status cannot
	 * be modified. To do that, setStatus(...) must be used.
	 */
	public Map getStatus() {
		return unmodifiableStatus;
	}
	
	public void setStatus(String statusName, Object value) {
		// Should we sychronize?
		synchronized (this) {
			status.put(statusName, value);
			/**
			 * Update unmodifiableStatus as it does not get synched with status.
			 * Not sure it it should auto-syc, so just sync it. 
			 * Not sure if this is the right way to do it (ralam 2/26/2009).
			 */
			unmodifiableStatus = Collections.unmodifiableMap(status);
		}
	}
	
	public void removeStatus(String statusName) {
		// Should we sychronize?
		synchronized (this) {
			status.remove(statusName);
			/**
			 * Update unmodifiableStatus as it does not get synched with status.
			 * Not sure it it should auto-syc, so just sync it. 
			 * Not sure if this is the right way to do it (ralam 2/26/2009).
			 */
			unmodifiableStatus = Collections.unmodifiableMap(status);
		}
	}
	
	public Map toMap() {
		Map m = new HashMap();
		m.put("userid", userid);
		m.put("name", name);
		m.put("role", role);
		/**
		 * Create a copy of the status instead of returning the
		 * unmodifiableMap. This way callers can still manipulate it
		 * for their own purpose but our copy still remains unmodified.
		 */
		m.put("status", new HashMap(unmodifiableStatus));
		return m;
	}
}