package test;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;

import javax.imageio.ImageIO;

import screenshot.Capture;

public class Runner {

	private static final int PORT = 1026;
	private static final String IP = "192.168.0.120";
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println("Starting");
		Capture capture = new Capture();
		
		while (true){
			BufferedImage image = capture.takeSingleSnapshot();
			
			try{
				Socket socket = new Socket(IP, PORT);
				DataOutputStream outStream = new DataOutputStream(socket.getOutputStream());
				ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
				ImageIO.write(image, "jpeg", byteConvert);
				byte[] imageData = byteConvert.toByteArray();
				outStream.write(imageData);
				System.out.println("Sent: "+ imageData.length);
				socket.close();
			} catch(Exception e){
				e.printStackTrace(System.out);
				System.exit(0);
			}
			
			try{
				Thread.sleep(333);
			} catch (Exception e){
				System.exit(0);
			}
		}
	}

}
