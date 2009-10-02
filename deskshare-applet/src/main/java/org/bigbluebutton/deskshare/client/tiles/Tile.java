
package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.BufferedImage;
import java.awt.image.ImageObserver;
import java.awt.image.PixelGrabber;
import java.io.File;
import java.io.IOException;
import java.util.zip.Adler32;
import java.util.zip.Checksum;

import javax.imageio.ImageIO;

import org.bigbluebutton.deskshare.client.encoder.PixelExtractException;
import org.bigbluebutton.deskshare.client.encoder.ScreenVideoEncoder;

public final class Tile {    
    private final Adler32 checksum;
    private final Dimension dim;
    private final int position;
    private final Point location;
    
    Tile(Dimension dim, int position, Point location) {
        checksum = new Adler32();
        this.dim = dim;
        this.position = position;
        this.location = location;
    }
    
    byte[] updateTile(BufferedImage capturedScreen, boolean isKeyFrame)
    {
    	byte[] encodedData;
/* 
    	BufferedImage screen = capturedScreen.getSubimage(getX(), getY(), getWidth(), getHeight());
    	
		try {
		ImageIO.write(screen, "jpg", new File("D://temp/part" + position + ".jpg"));
	} catch (IOException e1) {
		// TODO Auto-generated catch block
		e1.printStackTrace();
	}
*/    	
    	try {
			int pixels[] = ScreenVideoEncoder.getPixels(capturedScreen, getX(), getY(), getWidth(), getHeight());
			
/*			
			String pixs = "";
			for (int i = 0; i < pixels.length; i++) {
				pixs += Integer.toHexString(pixels[i]) + " ";
			}
			
			System.out.println(pixs);
*/			
	        long oldsum;
	        oldsum = checksum.getValue(); 
	        calcChecksum(pixels);
	        
	        System.out.println("Checksum = " + checksum.getValue() + " " + oldsum + " keyframe " + isKeyFrame);
	        
	        if ((oldsum == checksum.getValue()) && !isKeyFrame) {
	        	System.out.println("Encoding unchanged block");
	        	encodedData = ScreenVideoEncoder.encodeBlockUnchanged();        	
	        }
	        else {
	        	encodedData = ScreenVideoEncoder.encodePixels(pixels, getWidth(), getHeight());		        	
	        }    	
    	} catch (PixelExtractException e) {
    		System.out.println(e.toString());
    		encodedData = ScreenVideoEncoder.encodeBlockUnchanged();
		}
        
//    	System.out.println("Encoded data size = " + encodedData.length);
    	return encodedData;

    }
    
    private void calcChecksum(int pixels[])
    {
    	checksum.reset();
//        Checksum checksumEngine = new Adler32();
//        checksumEngine.update(pixels, 0, pixels.length);
 //       long checksum = checksumEngine.getValue();
        
        for (int i = 0; i < pixels.length; i++)
	        checksum.update(pixels[i]);   
    }
    
//    public BufferedImage getImage() {
//    	return image.getSubimage(0, 0, getWidth(), getHeight());
//    }
    
    public int getWidth()
    {
        return new Integer(dim.getWidth()).intValue();
    }
    
    public int getHeight()
    {
        return new Integer(dim.getHeight()).intValue();
    }
    
    public int getTilePosition() {
		return new Integer(position).intValue();
	}
    
    public int getX() {
		return new Integer(location.x).intValue();
	}

    public int getY() {
		return new Integer(location.y).intValue();
	}
	
	Dimension getDimension() {
		return new Dimension(dim.getWidth(), dim.getHeight());
	}
	
	Point getLocation() {
		return new Point(location.x, location.y);
	}
	
//	public void imageSent() {
//		image = null;
//	}
}
