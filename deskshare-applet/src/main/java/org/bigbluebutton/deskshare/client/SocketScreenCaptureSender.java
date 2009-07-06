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
	
	private static final int PORT = 1026;
	
	private Socket socket = null;
	
	private DataOutputStream outStream = null;
	private PrintWriter out;
	
	public void connect(String host, String room, int videoWidth, int videoHeight, int frameRate) {
		try{
			socket = new Socket(host, PORT);
			out = new PrintWriter(socket.getOutputStream(), true);
			sendRoom(room);
			sendScreenCaptureInfo(videoWidth, videoHeight, frameRate);
			outStream = new DataOutputStream(socket.getOutputStream());
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
		try{
			ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
			ImageIO.write(screenCapture, "jpeg", byteConvert);
			byte[] imageData = byteConvert.toByteArray();
			outStream.writeLong(imageData.length);
			outStream.write(imageData);
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
