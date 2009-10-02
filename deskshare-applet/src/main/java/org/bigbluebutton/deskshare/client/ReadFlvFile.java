package org.bigbluebutton.deskshare.client;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class ReadFlvFile {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		System.out.println("Reading FLV file");
		
		FileInputStream fi = new FileInputStream("D://temp/"+"ScreenVideoStream.flv");
		
		boolean cont = true;
		int read;
		
		String contents = "";
		
//		while (cont) {
		for (int i =0; i < 1000; i++) {
			read = fi.read();
			System.out.println("Read " + read + "(" + Integer.toHexString(read) + ")");
			if (read < 0) { 
				System.out.print("Closing stream");
				cont = false;
			} else {
				contents += " " + read + "(" + Integer.toHexString(read) + ")";
			}
			
		}
		
		System.out.println(contents);
	}

}
