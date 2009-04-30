package frontend;

import javax.swing.JApplet;

import screenshot.Capture;

/**
 * The frontend of the DeskShareClient application, this applet is embedded in the browser
 * @author Snap
 *
 */
public class DeskShareApplet extends JApplet {
	
	private Capture capture;
	private Thread captureThread;
	/**
	 * Initialise the applet when it is loaded
	 */
	public void init(){
		Capture capture = new Capture();
		captureThread = new Thread(capture);
		
	}
	
	/**
	 * Start the applet execution
	 * In our case, starts capturing the screen
	 */
	public void start(){
		captureThread.start();
	}
	
	/**
	 * The stop method is called when the user leaves the webpage in which the applet is embedded
	 * The stop method, in this case, does nothing, because we want our applet to keep capturing
	 * the screen even (especially) if the user is viewing another window, application, etc...
	 */
	public void stop(){
		
	}
	
	/**
	 * Method called when user closes webpage. Perform cleanup
	 */
	public void destroy(){
		try{
			captureThread.join();
		} catch (InterruptedException e){
			System.out.println(e.getMessage());
		}
	}
	
}
