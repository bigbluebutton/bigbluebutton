package org.bigbluebutton.conference.service.whiteboard;

public class UIDGenerator {
	private int count = 0;
	public int generateUID() {
		return count++;
	}
}
