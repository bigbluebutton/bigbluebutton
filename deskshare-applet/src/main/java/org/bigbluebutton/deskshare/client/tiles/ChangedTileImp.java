package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.BufferedImage;

public final class ChangedTileImp implements ChangedTile {
    private final Dimension dim;
    private final int position;
    private final Point location;    
    private final BufferedImage image;
    
    public ChangedTileImp(Dimension dim, int position, Point location, BufferedImage image) {
        this.dim = dim;
        this.position = position;
        this.location = location;
        this.image = image;
    }
    
    public BufferedImage getImage() {
    	return image;
    }
    
    public int getWidth() {
    	return dim.getWidth();
    }
    
    public int getHeight() {
    	return dim.getHeight();
    }
    
    public int getPosition() {
    	return position;
    }
    
    public int getX() {
    	return location.x;
    }
    
    public int getY() {
    	return location.y;
    }
}
