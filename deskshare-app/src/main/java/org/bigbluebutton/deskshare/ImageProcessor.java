package org.bigbluebutton.deskshare;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

public class ImageProcessor {
	private BufferedImage image;
	private Graphics2D graphics;
	
	public ImageProcessor(BufferedImage image){
		this.image = image;
		this.graphics = this.image.createGraphics();
	}
	
	public void appendTile(BufferedImage tile, int x, int y){
		graphics.drawImage(tile, x, y, null);
	}
	
}
