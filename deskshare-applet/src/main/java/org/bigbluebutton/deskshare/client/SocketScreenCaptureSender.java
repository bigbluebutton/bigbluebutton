package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

import javax.imageio.ImageIO;

public class SocketScreenCaptureSender implements IScreenCaptureSender {
	
	private static final int PORT = 9123;
	
	//private static final int PORT = 1026;
	
	private Socket socket = null;
	
	private DataOutputStream outStream = null;
	private PrintWriter out;
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	
	public void connect(String host, String room, int videoWidth, int videoHeight, int frameRate) {
		this.room = room;
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.frameRate = frameRate;
		try{
			socket = new Socket(host, PORT);
			out = new PrintWriter(socket.getOutputStream(), true);
			outStream = new DataOutputStream(socket.getOutputStream());
			sendRoom(room);
			sendScreenCaptureInfo(videoWidth, videoHeight, frameRate);
			
		} catch(UnknownHostException e){
			System.out.println("Unknow host: " + host);
		} catch(IOException e) {
			System.out.println("IOException when trying connecting to " + host);
		}
	}
	
	private void sendRoom(String room) {
		out.println(room);
	}
	
	private void sendScreenCaptureInfo(int videoWidth, int videoHeight, int frameRate) {
			out.println(Integer.toString(videoWidth)
					+ "x" + Integer.toString(videoHeight)
					+ "x" + Integer.toString(frameRate));
	}
	
	public void send(BufferedImage screenCapture) {
		sendRoom(room);
		sendScreenCaptureInfo(videoWidth, videoHeight, frameRate);
		try{
			ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
			ImageIO.write(screenCapture, "jpeg", byteConvert);
			byte[] imageData = byteConvert.toByteArray();
			outStream.writeInt(imageData.length);
			//out.println("xxx");
			outStream.write(imageData);
			//out.println("vvv");
			System.out.println("Sent: "+ imageData.length);
			outStream.flush();
		} catch(IOException e){
			System.out.println("IOException while sending screen capture.");
		}
	}

	public void disconnect(){
		System.out.println("Closing connection.");
		try{
			socket.close();
		} catch(IOException e){
			e.printStackTrace(System.out);
		}
	}
}
