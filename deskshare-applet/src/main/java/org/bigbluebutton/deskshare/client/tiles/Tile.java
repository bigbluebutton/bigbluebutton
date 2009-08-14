
package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.BufferedImage;
import java.awt.image.ImageObserver;
import java.awt.image.PixelGrabber;
import java.util.zip.Adler32;



public class Tile {    
    private Adler32 checksum;
    private long version;
    private boolean dirty;
    private Dimension dim;
    private int position;
    private Point location;
    private boolean topRowTile = false;
	private boolean lastColumnTile = false;
        
	private BufferedImage image = null;
    
    public Tile(Dimension dim, int position, Point location) {
        checksum = new Adler32();
        version = 0;
        dirty = true;
        this.dim = dim;
        this.position = position;
        this.location = location;
    }
    
    public void updateImage(BufferedImage image)
    {
        long oldsum;
        oldsum = checksum.getValue(); 
        calcChecksum(image);
        if (oldsum != checksum.getValue()) {
        	this.image = image;
            version++;
            dirty = true;
        }
        else {
            dirty = false;
        }
    }
    
    public boolean isSameVersion(long ver)
    {
        if (ver != version) {
            return false;
        }
        else {
            return true;
        }
    }
    
    public boolean isDirty()
    {
        return dirty;
    }
    
    public void clearDirty()
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
    	return image;
    }
    
    public int getWidth()
    {
        return dim.getWidth();
    }
    
    public int getHeight()
    {
        return dim.getHeight();
    }
    
    public int getTilePosition() {
		return position;
	}
    
    public boolean isTopRowTile() {
		return topRowTile;
	}

	public void setTopRowTile(boolean topRowTile) {
		this.topRowTile = topRowTile;
	}

	public boolean isLastColumnTile() {
		return lastColumnTile;
	}

	public void setLastColumnTile(boolean lastColumnTile) {
		this.lastColumnTile = lastColumnTile;
	}

    public int getX() {
		return location.x;
	}

	public int getY() {
		return location.y;
	}
}
