
package org.bigbluebutton.conference

import org.red5.server.api.so.ISharedObject
public class RoomListener implements IRoomListener{

	private ISharedObject so;

	public RoomListener(ISharedObject so) {
		this.so = so 
	}
	
	def getName() {
		return 'TEMPNAME'
	}
	
	public void participantStatusChange(Long userid, String status, Object value){
		so.sendMessage("participantStatusChange", [userid, status, value])
	}
	
	public void participantJoined(Participant p) {
		List args = new ArrayList()
		args.add(p.toMap())
		so.sendMessage("participantJoined", args)
	}
	
	public void participantLeft(Long userid) {		
		List args = new ArrayList()
		args.add(userid)
		so.sendMessage("participantLeft", args)
	}
}
