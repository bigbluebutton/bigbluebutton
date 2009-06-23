package test;

import java.awt.image.BufferedImage;
import java.io.File;

import javax.imageio.ImageIO;

import screenshot.Capture;

public class Runner {
	
	private static int index = 0;
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println("Starting");
		Capture capture = new Capture(0, 0, 800, 600);
		
		while (index < 20){
			BufferedImage image = capture.takeSingleSnapshot();
			
			try{
				//ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
				ImageIO.write(image, "jpeg", new File(Integer.toString(index) + ".jpeg"));
				index++;
				//byte[] imageData = byteConvert.toByteArray();
				System.out.println(index);
			} catch(Exception e){
				e.printStackTrace(System.out);
				System.exit(0);
			}
			
			try{
				Thread.sleep(200);
			} catch (Exception e){
				System.exit(0);
			}
		}
	}
}
