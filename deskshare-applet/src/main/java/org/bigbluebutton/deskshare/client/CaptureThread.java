package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;

import javax.imageio.ImageIO;

public class CaptureThread implements Runnable {
	
	private static final int PORT = 1026;
	//private static final String IP = "192.168.0.120";
	
	private Socket socket = null;
	public Capture capture;
	private String roomNumber;
	private String IP;
	private int timeBase;
	
	public CaptureThread(Capture capture, String IP, String room){
		System.out.println("Capture thread constructor.");
		this.capture = capture;
		this.roomNumber = room;
		this.IP = IP;
		this.timeBase = 1000 / capture.getProperFrameRate();
	}
	
	public void run(){
		System.out.println("Capture thread run()");
		DataOutputStream outStream = null;
		try{
			socket = new Socket(IP, PORT);
			PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
			out.println(roomNumber);
			out.println(Integer.toString(capture.getVideoWidth())
					+ "x" + Integer.toString(capture.getVideoHeight())
					+ "x" + Integer.toString(capture.getProperFrameRate()));
			outStream = new DataOutputStream(socket.getOutputStream());
		} catch(Exception e){
			e.printStackTrace(System.out);
			System.exit(0);
		}
		
		while (true){
			BufferedImage image = capture.takeSingleSnapshot();
			
			try{
				ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
				ImageIO.write(image, "jpeg", byteConvert);
				byte[] imageData = byteConvert.toByteArray();
				outStream.writeLong(imageData.length);
				outStream.write(imageData);
				System.out.println("Sent: "+ imageData.length);
				outStream.flush();
			} catch(Exception e){
				e.printStackTrace(System.out);
				System.exit(0);
			}
			
			try{
				System.out.println("Sleeping for " + timeBase);
				Thread.sleep(timeBase);
			} catch (Exception e){
				System.out.println("Exception sleeping.");
				System.exit(0);
			}
		}
	}
	
	public void closeConnection(){
		System.out.println("Closing connection.");
		try{
			socket.close();
		} catch(IOException e){
			e.printStackTrace(System.out);
		}
	}
}
