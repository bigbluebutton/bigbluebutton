/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 *
 * $Id: $x
 */
package org.bigbluebutton.deskshare.server.session;

import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.bigbluebutton.deskshare.common.Dimension;

public class SessionManager {

	private final ConcurrentHashMap<String, Session> sessions;
	private final Map<String, Session> unmodifiableMap;
	
	private FrameStreamer frameStreamer;
	private ExecutorService exec = Executors.newSingleThreadExecutor();
	private volatile boolean keepAliveAudit = false;
	private Runnable keepAliveAuditThread;
	private final static int AUDIT_INTERVAL = 60000;
	
	public SessionManager() {
		sessions = new ConcurrentHashMap<String, Session>();
		unmodifiableMap = Collections.unmodifiableMap(sessions);
		
		keepAliveAudit = true;
		
		keepAliveAuditThread = new Runnable() {
			public void run() {
				while (keepAliveAudit) {
					Session session;
					String room;
					
					for (Iterator<String> iter = unmodifiableMap.keySet().iterator(); iter.hasNext(); ) {
						room = (String) iter.next();
						session = unmodifiableMap.get(room);
						System.out.println("Checking if we should terminate " + room);
						if (! session.keepAlive()) {
							removeSession(room);
						}
					}
					try {
						Thread.sleep(AUDIT_INTERVAL);
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		};
		exec.execute(keepAliveAuditThread);	
		
	}
	
	public synchronized void createSession(String room, Dimension screen, Dimension block) {
		if (! sessions.containsKey(room)) {
			System.out.println("Created session " + room);
			frameStreamer.createNewStream(room, screen.getWidth(), screen.getHeight());
			Session session = new Session(room, screen, block, frameStreamer);
			if (sessions.putIfAbsent(room, session) == null) {
				// Successfully inserted session. I.e. no previous session.
				session.initialize();
			}
		} else {
			System.out.println("Session already exist for " + room);
		}
	}

	public synchronized void removeSession(String room) {
		System.out.println("Removing session " + room);
		sessions.remove(room);
		frameStreamer.endStream(room);
	}
	
	public void updateBlock(String room, int position, byte[] blockData, boolean keyframe) {
		Session session = sessions.get(room);
		if (session != null)
			session.updateBlock(position, blockData, keyframe);
	}
		
	public void setFrameStreamer(FrameStreamer streamer) {
		System.out.println("Setting FrameStreamer");
		frameStreamer = streamer;
		frameStreamer.start();
	}
}
