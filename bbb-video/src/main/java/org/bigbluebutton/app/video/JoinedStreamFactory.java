package org.bigbluebutton.app.video;

import org.red5.server.api.IScope;

import xugglerutils.JoinedStream;

public class JoinedStreamFactory {
	
	public JoinedStream createStream(String room, IScope scope){
		return new JoinedStream(scope, room, VideoAppConstants.JOINED_WIDTH, 
				VideoAppConstants.JOINED_HEIGHT, VideoAppConstants.JOINED_FRAME_RATE);
	}
}
