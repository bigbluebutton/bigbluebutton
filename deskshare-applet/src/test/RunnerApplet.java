package test;
import javax.swing.JApplet;

import screenshot.Capture;
import screenshot.CaptureThread;

public class RunnerApplet extends JApplet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	CaptureThread capThread;
	
	public void init(){
		int screenWidth = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		int screenHeight = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));
		int x = Integer.parseInt(getParameter("X"));
		int y = Integer.parseInt(getParameter("Y"));
		Capture capture = new Capture(x, y, screenWidth, screenHeight);
		String roomNumber = getParameter("ROOM");
		String IP = getParameter("IP");
		capThread = new CaptureThread(capture, IP, roomNumber);
	}
	
	public void stop(){
		
	}
	
	public void start(){
		Thread thread = new Thread(capThread);
		thread.start();
	}
	
	/**
	 * This method is called when the user closes the browser window containing the applet
	 * It is very important that the connection to the server is closed at this point. That way the server knows to
	 * close the stream.
	 */
	public void destroy(){
		capThread.closeConnection();
	}
	
	public void setScreenCoordinates(int x, int y){
		capThread.capture.setX(x);
		capThread.capture.setY(y);
	}
}
