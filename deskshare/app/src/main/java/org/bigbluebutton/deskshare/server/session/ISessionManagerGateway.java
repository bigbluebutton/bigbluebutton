package org.bigbluebutton.deskshare.server.session;

import java.awt.Point;

import org.bigbluebutton.deskshare.common.Dimension;

/**
 * Interface between Java -> Scala
 * @author Richard Alam
 *
 */
public interface ISessionManagerGateway {
	public void createSession(String room, Dimension screenDim, Dimension blockDim);

	public void removeSession(String room);

	public void updateBlock(String room, int position, byte[] blockData, boolean keyframe);
	
	public void updateMouseLocation(String room, Point loc);
}
