package org.bigbluebutton.deskshare.client.tiles;

import java.awt.image.BufferedImage;

public interface ChangedTile {

    public BufferedImage getImage();
    
    public int getWidth();
    
    public int getHeight();
    
    public int getPosition();
    
    public int getX();
    
    public int getY();
}
