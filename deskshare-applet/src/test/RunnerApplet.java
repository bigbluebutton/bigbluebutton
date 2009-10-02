package test;
import javax.swing.JApplet;

import screenshot.Capture;
import screenshot.CaptureThread;

public class RunnerApplet extends JApplet {

	private static final long serialVersionUID = 1L;
	CaptureThread capThread;
	
	private int screenWidth = 800;
	private int screenHeight = 600;
	private int x = 0;
	private int y = 0;
	private String roomNumber = "test-room";
	private String IP = "192.168.0.136";
	
	public void init(){
		screenWidth = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		screenHeight = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));
		x = Integer.parseInt(getParameter("X"));
		y = Integer.parseInt(getParameter("Y"));
		roomNumber = getParameter("ROOM");
		IP = getParameter("IP");
	}
	
	public void stop(){
		
	}
	
	public void start(){
		System.out.println("RunnerApplet start()");
		Capture capture = new Capture(x, y, screenWidth, screenHeight);
		capThread = new CaptureThread(capture, IP, roomNumber);
		
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
	
	static public void main (String argv[]) {
	    final JApplet applet = new RunnerApplet();

	    applet.start();
	}

}
