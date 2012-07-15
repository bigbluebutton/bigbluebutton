package org.bigbluebutton.conference.service.whiteboard;

public class UIDGenerator {
	private int count = 0;
	
	/* 
	 * synchronized for safe access by multiple threads. should not degrade performance much because
	 * this method is called only when new 'objects' on the whiteboard are created/published and not
	 * while they are being updated and transmitted to other clients
	 */
	public synchronized int generateUID() {
		return count++;
	}
}
