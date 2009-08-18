package org.bigbluebutton.deskshare;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

public class ImageProcessor {
	private BufferedImage image;
	private Graphics2D graphics;
	
	public ImageProcessor(int width, int height){
		this.image = new BufferedImage(width, height, BufferedImage.TYPE_3BYTE_BGR);
		this.graphics = this.image.createGraphics();
	}
	
	public void appendTile(BufferedImage tile, int x, int y){
		graphics.drawImage(tile, x, y, null);
	}
	
	public BufferedImage getImage(){
		return this.image;
	}
}
