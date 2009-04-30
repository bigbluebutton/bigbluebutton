package converter;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

import util.Properties;

public class Resizer {
	public Resizer(){
		
	}
	
	public BufferedImage resize(BufferedImage image){
		Image img = image.getScaledInstance(Properties.WIDTH, Properties.HEIGHT, Image.SCALE_DEFAULT);
		
		BufferedImage buffImg = 
			new BufferedImage(Properties.WIDTH, Properties.HEIGHT, Properties.DEFAULT_IMAGE_TYPE);
		Graphics2D graphics = buffImg.createGraphics();
		graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, 
		RenderingHints.VALUE_TEXT_ANTIALIAS_DEFAULT);
		
		graphics.drawImage(image, 0, 0, Properties.WIDTH, Properties.HEIGHT, null);
		return buffImg;
	}
}
