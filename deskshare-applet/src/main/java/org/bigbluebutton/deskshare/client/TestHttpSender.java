package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

import javax.imageio.ImageIO;

import com.sun.org.apache.xerces.internal.util.HTTPInputSource;

public class TestHttpSender implements IScreenCaptureSender {
	private String host = "localhost";
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	private String servletName = "deskshare/sample/showslides";
	private URL url;
	private String videoInfo;
	
	@Override
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
	}

	@Override
	public void disconnect() {
		// TODO Auto-generated method stub

	}

	@Override
	public void send(BufferedImage screenCapture) {
		String data;
		try {

	    URL url = new URL("http://192.168.0.136/deskshare/sample/showslides");
	    URLConnection conn = url.openConnection();
	    ClientHttpRequest chr = new ClientHttpRequest(conn);
	    chr.setParameter("room", room);
	    chr.setParameter("videoInfo", videoInfo);
	    ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
			ImageIO.write(screenCapture, "jpeg", byteConvert);
			byte[] imageData = byteConvert.toByteArray();
			ByteArrayInputStream cap = new ByteArrayInputStream(imageData);
			
		chr.setParameter("upload", "screen", cap);
		chr.post();
		
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
