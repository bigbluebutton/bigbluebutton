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
package org.bigbluebutton.deskshare.client;

import java.awt.AWTException;
import java.awt.Graphics2D;
import java.awt.GraphicsConfiguration;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.Image;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.Robot;
import java.awt.Transparency;
import java.awt.image.BufferedImage;

/**
 * The Capture class uses the java Robot class to capture the screen.
 * @author Snap
 *
 */
public class ScreenCapture {	
	private Robot robot;
	private Rectangle screenBounds;	
	private int scaleWidth, scaleHeight, x,y, captureWidth, captureHeight;
	private boolean quality;
	private GraphicsConfiguration graphicsConfig;

	public ScreenCapture(int x, int y, int captureWidth, int captureHeight, int scaleWidth, int scaleHeight, boolean quality) {
		this.captureWidth = captureWidth;
		this.captureHeight = captureHeight;
		
		try{
			robot = new Robot();
		}catch (AWTException e){
			System.out.println(e.getMessage());
		}

		this.screenBounds = new Rectangle(x, y, this.captureWidth, this.captureHeight);
		this.scaleWidth = scaleWidth;
		this.scaleHeight = scaleHeight;
		this.quality = quality;
		GraphicsEnvironment je = GraphicsEnvironment.getLocalGraphicsEnvironment();
	    GraphicsDevice js = je.getDefaultScreenDevice();

	    graphicsConfig = js.getDefaultConfiguration();
	}
		
	public BufferedImage takeSingleSnapshot() {
		BufferedImage capturedImage = robot.createScreenCapture(this.screenBounds);

//		System.out.println("ScreenCapture snap: [cw=" + captureWidth + ",ch=" + captureHeight + "] at [x=" + x + ",y=" + y +"]"
//				+ "[sw==" + scaleWidth + ",sh=" + scaleHeight + "]");
		
		if (needToScaleImage()) {
			return useQuality(capturedImage);
		} else {
			return capturedImage;
		}
	}
	
	public void setX(int x) {
		this.x = x;
		updateBounds();
	}
	
	public void setY(int y) {
		this.y = y;
		updateBounds();
	}
	
	public void setWidth(int width) {
		this.captureWidth = width;
		updateBounds();
	}
	
	public void setHeight(int height) {
		this.captureHeight = height;
		updateBounds();
	}
	
	public void updateBounds() {
		this.screenBounds = new Rectangle(x, y, captureWidth, captureHeight);
	}
	
	private boolean needToScaleImage() {
		return (captureWidth != scaleWidth && captureHeight != scaleHeight);
	}

	private BufferedImage useQuality(BufferedImage image) {	    
	    BufferedImage resultImage = graphicsConfig.createCompatibleImage(scaleWidth, scaleHeight, Transparency.BITMASK);
	    resultImage.setAccelerationPriority(1);
	    
		Graphics2D g2 = resultImage.createGraphics();
					
		Image scaledImage = image.getScaledInstance(scaleWidth, scaleHeight, Image.SCALE_AREA_AVERAGING);
		g2.drawImage(scaledImage, 0, 0, scaleWidth, scaleHeight, null);				


		g2.dispose();
		return resultImage;
	}
	
		 
	/**
	 * See http://today.java.net/pub/a/today/2007/04/03/perils-of-image-getscaledinstance.html
	 * 
     * Convenience method that returns a scaled instance of the
     * provided {@code BufferedImage}.
     *
     * @param img the original image to be scaled
     * @param targetWidth the desired width of the scaled instance,
     *    in pixels
     * @param targetHeight the desired height of the scaled instance,
     *    in pixels
     * @param hint one of the rendering hints that corresponds to
     *    {@code RenderingHints.KEY_INTERPOLATION} (e.g.
     *    {@code RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR},
     *    {@code RenderingHints.VALUE_INTERPOLATION_BILINEAR},
     *    {@code RenderingHints.VALUE_INTERPOLATION_BICUBIC})
     * @param higherQuality if true, this method will use a multi-step
     *    scaling technique that provides higher quality than the usual
     *    one-step technique (only useful in downscaling cases, where
     *    {@code targetWidth} or {@code targetHeight} is
     *    smaller than the original dimensions, and generally only when
     *    the {@code BILINEAR} hint is specified)
     * @return a scaled version of the original {@code BufferedImage}
     */
    public BufferedImage getScaledInstance(BufferedImage img, int targetWidth, int targetHeight, Object hint, boolean higherQuality) {
        int type = (img.getTransparency() == Transparency.OPAQUE) ? BufferedImage.TYPE_INT_RGB : BufferedImage.TYPE_INT_ARGB;
        BufferedImage ret = (BufferedImage)img;
        int w, h;
        if (higherQuality) {
            // Use multi-step technique: start with original size, then
            // scale down in multiple passes with drawImage()
            // until the target size is reached
            w = img.getWidth();
            h = img.getHeight();
        } else {
            // Use one-step technique: scale directly from original
            // size to target size with a single drawImage() call
            w = targetWidth;
            h = targetHeight;
        }
        
        do {
            if (higherQuality && w > targetWidth) {
                w /= 2;
                if (w < targetWidth) {
                    w = targetWidth;
                }
            }

            if (higherQuality && h > targetHeight) {
                h /= 2;
                if (h < targetHeight) {
                    h = targetHeight;
                }
            }

            BufferedImage tmp = new BufferedImage(w, h, type);
            Graphics2D g2 = tmp.createGraphics();
            g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, hint);
            g2.drawImage(ret, 0, 0, w, h, null);
            g2.dispose();

            ret = tmp;
        } while (w != targetWidth || h != targetHeight);

        return ret;
    }
	
}
