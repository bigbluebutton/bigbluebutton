package screenshot;

import java.awt.AWTException;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

/**
 * The Capture class uses the java Robot class to capture the screen
 * The image captured is scaled down. This is done because of bandwidth issues and because it
 * is unnecessary for the Flex Client to be able to see the full screen, in fact it is undesirable
 * to do so.
 * The image can then be sent for further processing
 * @author Snap
 *
 */
public class Capture implements Runnable {
	public static final int INTERVAL = 1000;
	
	private Robot robot;
	private boolean running;
	private Toolkit toolkit;
	private Rectangle screenBounds;
	private BufferedImage screen;
	private int index;
	
	/**
	 * The default constructor. Performs initialization work
	 */
	public Capture(){
		try{
			robot = new Robot();
		}catch (AWTException e){
			System.out.println(e.getMessage());
		}
		this.running = true;
		this.toolkit = Toolkit.getDefaultToolkit();
		this.screenBounds = new Rectangle(toolkit.getScreenSize());
		this.index = 0;
	}
	
	/**
	 * The run method of this thread. Should not be called directly. Use start() instead.
	 * Starting this thread will cause this object to start capturing the screen
	 */
	public void run(){
		while(running){
			process(robot.createScreenCapture(this.screenBounds));
			try{
				Thread.sleep(INTERVAL);
			} catch (InterruptedException e){
				System.out.println(e.getMessage());
			}
		}
	}
	
	public BufferedImage takeSingleSnapshot(){
		return robot.createScreenCapture(this.screenBounds);
	}
	
	public int getScreenshotWidth(){
		return toolkit.getScreenSize().width;
	}
	
	public int getScreenshotHeight(){
		return toolkit.getScreenSize().height;
	}
	
	/**
	 * Processes a captured image
	 * @param image
	 */
	private void process(BufferedImage image){
		this.index++;
		/*try{
			//Resize the image
			//ImageIO.write(this.resizer.resize(image), "gif", new File("image" + index + ".gif"));
			
			//Save the image
			ImageIO.write(image, "png", new File("image" + index + ".png"));
		} catch(IOException e){
			System.out.println(e.getMessage());
		}*/
		if (this.index >5) this.running = false;
	}
	
	/**
	 * Signals the thread wrapper of this object to stop execution
	 */
	public void stopCapture(){
		this.running = false;
	}
}
