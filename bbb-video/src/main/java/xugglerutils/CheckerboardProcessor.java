package xugglerutils;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.util.ArrayList;

import org.bigbluebutton.app.video.VideoAppConstants;

public class CheckerboardProcessor {
	
	private ArrayList<IImageProvider> imageProviders;
	
	private BufferedImage image;
	private Graphics2D graphics;
	
	public CheckerboardProcessor(){
		imageProviders = new ArrayList<IImageProvider>();
		
		this.image = new BufferedImage(VideoAppConstants.JOINED_WIDTH, 
				VideoAppConstants.JOINED_HEIGHT, BufferedImage.TYPE_3BYTE_BGR);
		this.graphics = this.image.createGraphics();
	}
	
	public BufferedImage getImage(){
		return this.image;
	}
	
	public void registerListener(IImageProvider provider){
		this.imageProviders.add(provider);
	}
	
	public void updateImage(){
		for (int i = 0; i<imageProviders.size(); i++){
			appendImage(imageProviders.get(i).getImage(), i);
		}
	}
	
	public void appendImage(BufferedImage image, int position){
		int x = 0;
		int y = 0;
		if (position == 0){
			x=0;
			y=0;
		} else if (position == 1){
			x=VideoAppConstants.TILE_WIDTH;
			y=0;
		} else if (position == 2){
			x=VideoAppConstants.TILE_WIDTH*2;
			y=0;
		} else if (position == 3){
			x=0;
			y=VideoAppConstants.TILE_HEIGHT;
		} else if (position == 4){
			x=VideoAppConstants.TILE_WIDTH;
			y=VideoAppConstants.TILE_HEIGHT;
		} else if (position == 5){
			x=VideoAppConstants.TILE_WIDTH*2;
			y=VideoAppConstants.TILE_HEIGHT;
		} else if (position == 6){
			x=0;
			y=VideoAppConstants.TILE_HEIGHT*2;
		} else if (position == 7){
			x=VideoAppConstants.TILE_WIDTH;
			y=VideoAppConstants.TILE_HEIGHT*2;
		} else if (position == 8){
			y=VideoAppConstants.TILE_HEIGHT*2;
			x=VideoAppConstants.TILE_WIDTH*2;
		}
		graphics.drawImage(image, x, y, null);
	}
}
