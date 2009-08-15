
package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.BufferedImage;
import java.awt.image.ImageObserver;
import java.awt.image.PixelGrabber;
import java.util.zip.Adler32;

final class Tile {    
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
    
    void updateTile(BufferedImage tile)
    {
        long oldsum;
        oldsum = checksum.getValue(); 
        calcChecksum(tile);
        if (oldsum != checksum.getValue()) {
        	this.image = tile;
            version++;
            dirty = true;
        }
        else {
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
    
    BufferedImage getImage() {
    	return image;
    }
    
    int getWidth()
    {
        return dim.getWidth();
    }
    
    int getHeight()
    {
        return dim.getHeight();
    }
    
    int getTilePosition() {
		return position;
	}
    
    int getX() {
		return location.x;
	}

	int getY() {
		return location.y;
	}
	
	Dimension getDimension() {
		return dim;
	}
	
	Point getLocation() {
		return location;
	}
}
