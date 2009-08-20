
package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.BufferedImage;
import java.awt.image.ImageObserver;
import java.awt.image.PixelGrabber;
import java.util.zip.Adler32;

public final class Tile {    
    private final Adler32 checksum;
    private final Dimension dim;
    private final int position;
    private final Point location;
    
	private BufferedImage image = null;
    private long version;
    private boolean dirty;
    
    Tile(Dimension dim, int position, Point location) {
        checksum = new Adler32();
        version = 0;
        dirty = true;
        this.dim = dim;
        this.position = position;
        this.location = location;
    }
    
    void updateTile(BufferedImage capturedSreen)
    {
    	BufferedImage tile = capturedSreen.getSubimage(getX(), getY(), getWidth(), getHeight());
    	
        long oldsum;
        oldsum = checksum.getValue(); 
        calcChecksum(tile);
        if (oldsum != checksum.getValue()) {
        	image = null;
        	this.image = tile;
            version++;
            dirty = true;
        }
        else {
        	tile = null;
            dirty = false;
        }
    }
    
    boolean isSameVersion(long ver)
    {
        if (ver != version) {
            return false;
        }
        else {
            return true;
        }
    }
    
    boolean isDirty()
    {
        return dirty;
    }
    
    void clearDirty()
    {
        dirty = false;
    }
    
    private void calcChecksum(BufferedImage image)
    {
        int w = image.getWidth();
        int h = image.getHeight();
        int pixels[] = new int[w*h];
        PixelGrabber pg = new PixelGrabber(image, 0, 0, w, h, pixels, 0, w);
        checksum.reset();
        
		try {
		    pg.grabPixels(1);
		} catch (InterruptedException e) {
		    System.err.println("interrupted waiting for pixels!");
		    return;
		}
		
		if ((pg.getStatus() & ImageObserver.ABORT) != 0) {
		    System.err.println("image fetch aborted or errored");
		    return;
		}
	    
		for (int j = 0; j < h; j++) {
		    for (int i = 0; i < w; i++) {
	                if ((j*w+i)%13==0)
	                    checksum.update(pixels[j * w + i]);
		    }
		}	        
    }
    
    public BufferedImage getImage() {
    	return image.getSubimage(0, 0, getWidth(), getHeight());
    }
    
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
	
	public void imageSent() {
		image = null;
	}
}
