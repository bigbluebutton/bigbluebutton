package org.bigbluebutton.deskshare.client.encoder;

import java.awt.image.BufferedImage;
import java.awt.image.DataBufferInt;
import java.awt.image.ImageObserver;
import java.awt.image.PixelGrabber;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;

public final class ScreenVideoEncoder {

	private static byte FLV_KEYFRAME = 0x10;
	private static byte FLV_INTERFRAME = 0x20;
	private static byte SCREEN_VIDEO_CODED_ID = 0x03;
	
	public static int[] getPixelsFromImage(BufferedImage image) {
		int[] picpixels = ((DataBufferInt)(image).getRaster().getDataBuffer()).getData();
		
		return picpixels;
	}
	
	public static byte encodeFlvVideoDataHeader(boolean isKeyFrame) {
		if (isKeyFrame) return (byte) (FLV_KEYFRAME + SCREEN_VIDEO_CODED_ID);
		return (byte) (FLV_INTERFRAME + SCREEN_VIDEO_CODED_ID);		
	}
	
	public static byte[] encodeBlockDimensionsAndGridSize(int blockWidth, int imageWidth, int blockHeight, int imageHeight) {
		byte[] dims = new byte[4];
		
		int bw = (((imageWidth/16) - 1) & 0xf) << 12;
		int iw = (imageWidth & 0xfff);
		int ew = (bw | iw);
		
		int bh = (((imageHeight/16) - 1) & 0xf) << 12;
		int ih = (imageHeight & 0xfff);
		int eh = (bh | ih);
		
		dims[0] = (byte) ((ew & 0xff00) >> 8);
		dims[1] = (byte) (ew & 0xff);
		dims[2] = (byte) ((eh & 0xff00) >> 8);
		dims[3] = (byte) (eh & 0xff);
		
		return dims;
	}
	
	public static int[] getPixels(BufferedImage image, int x, int y, int width, int height) throws PixelExtractException {

		int[] pixels = new int[width * height];
		PixelGrabber pg = new PixelGrabber(image, x, y, width, height, pixels, 0, width);
		try {
		    pg.grabPixels();
		} catch (InterruptedException e) {
		    throw new PixelExtractException("Interrupted waiting for pixels!");
		}
		if ((pg.getStatus() & ImageObserver.ABORT) != 0) {
		    throw new PixelExtractException("Aborted or error while fetching image.");
		}		
		return pixels;	
	}
	
	public static byte[] encodePixels(int pixels[], int width, int height) {
		
		changePixelScanFromBottomLeftToTopRight(pixels, width, height);
		
		byte[] littleEndianPixels = getRGBFromPixelAndConvertToLittleEndian(pixels);
		
		byte[] compressedPixels = compressUsingZlib(littleEndianPixels);  
		
    	byte[] encodedDataLength = ScreenVideoEncoder.encodeCompressedPixelsDataLength(compressedPixels.length);
    	byte[] encodedData = new byte[encodedDataLength.length + compressedPixels.length];
    	
    	System.arraycopy(encodedDataLength, 0, encodedData, 0, encodedDataLength.length);
    	
//    	String encData = "";
 //   	
//    	for (int i=0; i<encodedData.length; i++) {
 //   		encData += "[" + i + "=" + encodedData[i] + "(" + Integer.toHexString((byte)encodedData[i]) + ")]";
 //   	}
    	
    	System.arraycopy(compressedPixels, 0, encodedData, encodedDataLength.length, compressedPixels.length);

//    	System.out.println(encData);
//    	encData = "";
//    	for (int i=0; i<encodedData.length; i++) {
 //   		encData += "[" + i + "=" + encodedData[i] + "(" + Integer.toHexString((byte)encodedData[i]) + ")]";
 //   	}
  //  	System.out.println(encData);
		return encodedData;
	}
	
	private static byte[] encodeCompressedPixelsDataLength(int length) {
		int byte1 =  ((length & 0xFF00) >> 8);
		int byte2 =  (length & 0x0FFF);
//		System.out.println("Block size = " + length + " hex=" + Integer.toHexString(length) + " bytes= " + Integer.toHexString(byte1) + " " + Integer.toHexString(byte2));
		return new byte[] {(byte)byte1 , (byte) (byte2 &0xFFF) };
	}
	
	public static byte[] encodeBlockUnchanged() {
		return new byte[] { (byte) 0, (byte) 0 };
	}
	
	/**
	 * Screen capture pixels are arranged top-left to bottom-right. ScreenVideo encoding
	 * expects pixels are arranged bottom-left to top-right.
	 * @param pixels - contains pixels of the image
	 * @param width - width of the image
	 * @param height - height of the image
	 */
	private static void changePixelScanFromBottomLeftToTopRight(int[] pixels, int width, int height) {
		int[] swap = new int[pixels.length];
		
		for (int i = 0; i < height; i++) {
			int sourcePos = i * width;
			int destPos = (height - (i+1)) * width;
			System.arraycopy(pixels, sourcePos, swap, destPos, width);
		}
		
		System.arraycopy(swap, 0, pixels, 0, pixels.length);
	}
	
	
	/**
	 * Compress the byte array using Zlib.
	 * @param pixels
	 * @return a byte array of compressed data
	 */
	private static byte[] compressUsingZlib(byte[] pixels) {
	    // Create the compressed stream
//		ByteArrayOutputStream zData = new ByteArrayOutputStream();
//		DeflaterOutputStream deflater = new DeflaterOutputStream(zData, new Deflater());

		 byte[] output = new byte[pixels.length];
		 Deflater compresser = new Deflater();
		 compresser.setInput(pixels);
		 compresser.finish();
		 int compressedDataLength = compresser.deflate(output);

		 byte[] zData = new byte[compressedDataLength] ;
		 System.arraycopy(output, 0, zData, 0, compressedDataLength);
		// set the byte array to the newly compressed data
		return zData;
	}
	
	/**
	 * Extracts the RGB bytes from a pixel represented by a 4-byte integer (ARGB).
	 * Also, rearranges the bytes from big-endian to little-endian.
	 * @param pixels
	 * @return the RGB of the pixels in little-endian
	 */
	private static byte[] getRGBFromPixelAndConvertToLittleEndian(int[] pixels) {	
		
		byte[] rgbPixels = new byte[pixels.length * 3];
		int position = 0;
		
		for (int i = 0; i < pixels.length; i++) {
			byte red = (byte) ((pixels[i] >> 16) & 0xff);
			byte green = (byte) ((pixels[i] >> 8) & 0xff);
			byte blue = (byte) (pixels[i] & 0xff);
			
			// Sequence should be BGR
			rgbPixels[position++] = blue;
			rgbPixels[position++] = green;
			rgbPixels[position++] = red;
			
//			System.out.println("pixel[" + i + "]=" + Integer.toHexString(pixels[i]) + " "
//					+ " bytes = " + Integer.toHexString(red) + " " + Integer.toHexString(green) + " " + Integer.toHexString(blue));
/*			
			rgbPixels[i+2] = (byte) ((pixels[i] & 0xff0000) >> 16);
			rgbPixels[i+1] = (byte) ((pixels[i] & 0x00ff00) >> 8);
			rgbPixels[i+0] = (byte) ((pixels[i] & 0x0000ff));
*/
		}
				
		return rgbPixels;
	}
			
	public static String toStringBits( int value )
	{
	    int displayMask = 1 << 31;
	    StringBuffer buf = new StringBuffer( 35 );
			   
	    for ( int c = 1; c <= 32; c++ ) 
	    {
	        buf.append( ( value & displayMask ) == 0 ? '0' : '1' );
	        value <<= 1;
			       
	        if ( c % 8 == 0 )
		        buf.append( ' ' );
		    }
			   
	    return buf.toString();
	}
		    
	public static String toStringBits( byte value )
	{
	    int displayMask = 1 << 7;
	    StringBuffer buf = new StringBuffer( 8 );
			   
	    for ( int c = 1; c <= 8; c++ ) 
	    {
	        buf.append( ( value & displayMask ) == 0 ? '0' : '1' );
	        value <<= 1;
			       
	        if ( c % 8 == 0 )
		        buf.append( ' ' );
	    }
			   
	    return buf.toString();
	}    
}
