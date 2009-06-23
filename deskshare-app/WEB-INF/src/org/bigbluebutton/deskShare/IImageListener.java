package org.bigbluebutton.deskShare;

import java.awt.image.BufferedImage;

/**
 * An Interface for classes which want to receive BufferedImages as they are received by the application
 * @author Snap
 *
 */
public interface IImageListener {
	public void imageReceived(BufferedImage image);
	
	public void streamEnded(String streamName);
}
