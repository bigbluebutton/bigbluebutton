package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

import javax.imageio.ImageIO;

public class HttpScreenCaptureSender implements IScreenCaptureSender {

	private String host = "localhost";
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	private String servletName = "deskshare";
	private URL url;
	private String videoInfo;
	
	private MultiPartFormOutputStream mpfOutStream;
	private URLConnection conn;
	
	public void send(BufferedImage screenCapture) {
		ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
		try {
			ImageIO.write(screenCapture, "jpeg", byteConvert);
			byte[] imageData = byteConvert.toByteArray();
			mpfOutStream.writeField("room", room);
			mpfOutStream.writeField("video", videoInfo);
			mpfOutStream.writeFile("screen", "image/jpeg", "screen.jpg", imageData);
		} catch (IOException e) {
			System.out.println("IOException while converting screen capture.");
		}		
	}

	public void connect(String host, String room, int videoWidth,
			int videoHeight, int frameRate) {
		this.host = host;
		this.room = room;
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.frameRate = frameRate;
		
		videoInfo = Integer.toString(videoWidth)
				+ "x" + Integer.toString(videoHeight)
				+ "x" + Integer.toString(frameRate);
		
		String urlString = "";
		try {
			urlString = "http://" + host + "/" + servletName;
			url = new URL(urlString);
			conn = MultiPartFormOutputStream.createConnection(url);
			conn.setRequestProperty("Connection", "Keep-Alive");
			
			mpfOutStream = new MultiPartFormOutputStream(conn.getOutputStream(), MultiPartFormOutputStream.createBoundary());
			
		} catch (MalformedURLException e) {
			System.out.println("MalformedURLException for " + urlString);
		} catch (IOException e) {
			System.out.println("IOException while creating URL connection.");
		}
	}

	public void disconnect() {
		try {
			mpfOutStream.close();
		} catch (IOException e) {
			System.out.println("IOException while closing output stream");
		}
	}

}
