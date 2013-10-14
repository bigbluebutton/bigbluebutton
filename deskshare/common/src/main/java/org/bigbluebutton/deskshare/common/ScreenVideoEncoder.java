/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/
package org.bigbluebutton.deskshare.common;

import java.awt.image.BufferedImage;
import java.awt.image.DataBufferInt;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;

public final class ScreenVideoEncoder {

	private static byte FLV_KEYFRAME = 0x10;
	private static byte FLV_INTERFRAME = 0x20;
	private static byte SCREEN_VIDEO_CODEC_ID = 0x03;
	private static byte SCREEN_VIDEO_CODEC_V2_ID = 0x06;
	
	private static final int PALETTE[] = { 0x00000000, 0x00333333, 0x00666666, 0x00999999, 0x00CCCCCC, 0x00FFFFFF,
			0x00330000, 0x00660000, 0x00990000, 0x00CC0000, 0x00FF0000, 0x00003300, 0x00006600, 0x00009900, 0x0000CC00,
			0x0000FF00, 0x00000033, 0x00000066, 0x00000099, 0x000000CC, 0x000000FF, 0x00333300, 0x00666600, 0x00999900,
			0x00CCCC00, 0x00FFFF00, 0x00003333, 0x00006666, 0x00009999, 0x0000CCCC, 0x0000FFFF, 0x00330033, 0x00660066,
			0x00990099, 0x00CC00CC, 0x00FF00FF, 0x00FFFF33, 0x00FFFF66, 0x00FFFF99, 0x00FFFFCC, 0x00FF33FF, 0x00FF66FF,
			0x00FF99FF, 0x00FFCCFF, 0x0033FFFF, 0x0066FFFF, 0x0099FFFF, 0x00CCFFFF, 0x00CCCC33, 0x00CCCC66, 0x00CCCC99,
			0x00CCCCFF, 0x00CC33CC, 0x00CC66CC, 0x00CC99CC, 0x00CCFFCC, 0x0033CCCC, 0x0066CCCC, 0x0099CCCC, 0x00FFCCCC,
			0x00999933, 0x00999966, 0x009999CC, 0x009999FF, 0x00993399, 0x00996699, 0x0099CC99, 0x0099FF99, 0x00339999,
			0x00669999, 0x00CC9999, 0x00FF9999, 0x00666633, 0x00666699, 0x006666CC, 0x006666FF, 0x00663366, 0x00669966,
			0x0066CC66, 0x0066FF66, 0x00336666, 0x00996666, 0x00CC6666, 0x00FF6666, 0x00333366, 0x00333399, 0x003333CC,
			0x003333FF, 0x00336633, 0x00339933, 0x0033CC33, 0x0033FF33, 0x00663333, 0x00993333, 0x00CC3333, 0x00FF3333,
			0x00003366, 0x00336600, 0x00660033, 0x00006633, 0x00330066, 0x00663300, 0x00336699, 0x00669933, 0x00993366,
			0x00339966, 0x00663399, 0x00996633, 0x006699CC, 0x0099CC66, 0x00CC6699, 0x0066CC99, 0x009966CC, 0x00CC9966,
			0x0099CCFF, 0x00CCFF99, 0x00FF99CC, 0x0099FFCC, 0x00CC99FF, 0x00FFCC99, 0x00111111, 0x00222222, 0x00444444,
			0x00555555, 0x00AAAAAA, 0x00BBBBBB, 0x00DDDDDD, 0x00EEEEEE };
	
	private static final int C7_C15_THRESHOLD = 15;
	
	private static int[] paletteIndex; // maps c15 -> c7 (2^15=32768; palette size: 2^7=128)
	
	public static int[] getPixelsFromImage(BufferedImage image) {
		int[] picpixels = ((DataBufferInt)(image).getRaster().getDataBuffer()).getData();
		
		return picpixels;
	}
	
	public static byte encodeFlvVideoDataHeader(boolean isKeyFrame, boolean useSVC2) {
		return (byte) ((isKeyFrame ? FLV_KEYFRAME : FLV_INTERFRAME) + (useSVC2 ? SCREEN_VIDEO_CODEC_V2_ID : SCREEN_VIDEO_CODEC_ID));
	}
	
	public static byte[] encodeBlockAndScreenDimensions(int blockWidth, int imageWidth, int blockHeight, int imageHeight) {
		byte[] dims = new byte[4];
		
		int bw = (((blockWidth/16) - 1) & 0xf) << 12;
		int iw = (imageWidth & 0xfff);
		int ew = (bw | iw);
		
		int bh = (((blockHeight/16) - 1) & 0xf) << 12;
		int ih = (imageHeight & 0xfff);
		int eh = (bh | ih);
		
		dims[0] = (byte) ((ew & 0xff00) >> 8);
		dims[1] = (byte) (ew & 0xff);
		dims[2] = (byte) ((eh & 0xff00) >> 8);
		dims[3] = (byte) (eh & 0xff);
		
		return dims;
	}
	
	public static int[] getPixels(BufferedImage image, int x, int y, int width, int height, boolean useSVC2) throws PixelExtractException {
		long start = System.currentTimeMillis();
					
		/* Use this!!! Fast!!! (ralam Oct. 14, 2009) */
		int[] pixels = image.getRGB(x, y, width, height, null, 0, width);
		
		/* DO NOT user this. Slow. 10 times slower than the other one. */
/*		
		PixelGrabber pg = new PixelGrabber(image, x, y, width, height, pixels, 0, width);
		try {
		    pg.grabPixels();
		} catch (InterruptedException e) {
		    throw new PixelExtractException("Interrupted waiting for pixels!");
		}
		if ((pg.getStatus() & ImageObserver.ABORT) != 0) {
		    throw new PixelExtractException("Aborted or error while fetching image.");
		}
*/
		long end = System.currentTimeMillis();
//		System.out.println("Grabbing pixels[" + pixels.length + "] took " + (end-start) + " ms.");
		return pixels;	
	}
	
	public static byte[] encodePixels(int pixels[], int width, int height, boolean grayscale) {
		
		changePixelScanFromBottomLeftToTopRight(pixels, width, height);
		
		byte[] bgrPixels = convertFromRGBtoBGR(pixels, grayscale);
		
		byte[] compressedPixels = compressUsingZlib(bgrPixels);  
		
    	byte[] encodedDataLength = ScreenVideoEncoder.encodeCompressedPixelsDataLength(compressedPixels.length);
    	byte[] encodedData = new byte[encodedDataLength.length + compressedPixels.length];
    	
    	System.arraycopy(encodedDataLength, 0, encodedData, 0, encodedDataLength.length);
    	
    	System.arraycopy(compressedPixels, 0, encodedData, encodedDataLength.length, compressedPixels.length);

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
		
		long start = System.currentTimeMillis();
		for (int i = 0; i < height; i++) {
			int sourcePos = i * width;
			int destPos = (height - (i+1)) * width;
			System.arraycopy(pixels, sourcePos, swap, destPos, width);
		}
		
		System.arraycopy(swap, 0, pixels, 0, pixels.length);
		long end = System.currentTimeMillis();
//		System.out.println("Scanning pixels[" + pixels.length + "] took " + (end-start) + " ms.");
	}
	
	
	/**
	 * Compress the byte array using Zlib.
	 * @param pixels
	 * @return a byte array of compressed data
	 */
	private static byte[] compressUsingZlib(byte[] pixels) {
		long start = System.currentTimeMillis();
	    // Create the compressed stream
		 byte[] output = new byte[pixels.length];
		 Deflater compresser = new Deflater(Deflater.BEST_COMPRESSION);
		 compresser.setInput(pixels);
		 compresser.finish();
		 int compressedDataLength = compresser.deflate(output);

		 byte[] zData = new byte[compressedDataLength] ;
		 System.arraycopy(output, 0, zData, 0, compressedDataLength);

		long end = System.currentTimeMillis();
//		System.out.println("Compressing pixels[" + pixels.length + "] took " + (end-start) + " ms.");

		// set the byte array to the newly compressed data
		return zData;
	}
	
	/**
	 * Extracts the RGB bytes from a pixel represented by a 4-byte integer (ARGB).
	 * @param pixels
	 * @return pixels in BGR order
	 */
	private static byte[] convertFromRGBtoBGR(int[] pixels, boolean grayscale) {	
//		long start = System.currentTimeMillis();
		byte[] rgbPixels = new byte[pixels.length * 3];
		int position = 0;
		
		for (int i = 0; i < pixels.length; i++) {
			byte red = (byte) ((pixels[i] >> 16) & 0xff);
			byte green = (byte) ((pixels[i] >> 8) & 0xff);
			byte blue = (byte) (pixels[i] & 0xff);
/*
			if (grayscale) {
				byte brightness = convertToGrayScale(red, green, blue);
				
				// Sequence should be BGR
				rgbPixels[position++] = brightness;
				rgbPixels[position++] = brightness;
				rgbPixels[position++] = brightness;	
			} else {
				// Sequence should be BGR
				rgbPixels[position++] = blue;
				rgbPixels[position++] = green;
				rgbPixels[position++] = red;				
			}	
*/				
			// Sequence should be BGR
			rgbPixels[position++] = blue;
			rgbPixels[position++] = green;
			rgbPixels[position++] = red;
		}
		
		long end = System.currentTimeMillis();
//		System.out.println("Extracting pixels[" + pixels.length + "] took " + (end-start) + " ms.");				
		return rgbPixels;
	}
			
	private static byte convertToGrayScale(int r, int g, int b) {
		return (byte)(0.212671 * r + 0.715160 * g + 0.072169 * b);
	}
	
	public static String toStringBits(int value) {
	    int displayMask = 1 << 31;
	    StringBuffer buf = new StringBuffer(35);
			   
	    for ( int c = 1; c <= 32; c++ ) 
	    {
	        buf.append( ( value & displayMask ) == 0 ? '0' : '1' );
	        value <<= 1;
			       
	        if ( c % 8 == 0 )
		        buf.append( ' ' );
		    }
			   
	    return buf.toString();
	}
		    
	public static String toStringBits(byte value) {
	    int displayMask = 1 << 7;
	    StringBuffer buf = new StringBuffer(8);
			   
	    for ( int c = 1; c <= 8; c++ ) 
	    {
	        buf.append((value & displayMask) == 0 ? '0' : '1');
	        value <<= 1;
			       
	        if ( c % 8 == 0 )
		        buf.append( ' ' );
	    }
			   
	    return buf.toString();
	}    
	
	public static byte[] encodePixelsSVC2(int pixels[], int width, int height) {
		changePixelScanFromBottomLeftToTopRight(pixels, width, height);
		
		// write the block as IMAGEBLOCKV2
		
		if (paletteIndex == null)
			createPaletteIndex();
		
		try {
			ByteArrayOutputStream baos1 = new ByteArrayOutputStream(); // TODO calibrate initial size

			for (int i=0; i<pixels.length; i++) {
				writeAs15_7(pixels[i], baos1);
			}
			
			// baos2 contains everything from IMAGEBLOCKV2 except the DataSize field
			ByteArrayOutputStream baos2 = new ByteArrayOutputStream(); // TODO calibrate initial size
			
			// IMAGEFORMAT:
			// ColorDepth: UB[2] 10 (15/7 hybrid color image); HasDiffBlocks: UB[1] 0; Zlib prime stuff (2 bits) not used (0)
			baos2.write(16);
			
			// No ImageBlockHeader (IMAGEDIFFPOSITION, IMAGEPRIMEPOSITION)
			
			Deflater deflater = new Deflater(Deflater.BEST_COMPRESSION);
			DeflaterOutputStream deflateroutputstream = new DeflaterOutputStream(baos2, deflater);
			deflateroutputstream.write(baos1.toByteArray());
			deflateroutputstream.finish();
			byte dataBuffer[] = baos2.toByteArray();
			
			// DataSize field
			int dataSize = dataBuffer.length;
			ByteArrayOutputStream baos = new ByteArrayOutputStream(); // TODO calibrate initial size
			writeShort(((OutputStream) (baos)), dataSize);
			// Data
			baos.write(dataBuffer, 0, dataSize);
			return baos.toByteArray();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	private static void writeShort(OutputStream outputstream, int l) throws IOException {
		outputstream.write(l >> 8 & 0xff);
		outputstream.write(l & 0xff);
	}
	
	private static int chromaDifference(int c1, int c2) {
		int t1 = (c1 & 0x000000ff) + ((c1 & 0x0000ff00) >> 8) + ((c1 & 0x00ff0000) >> 16);
		int t2 = (c2 & 0x000000ff) + ((c2 & 0x0000ff00) >> 8) + ((c2 & 0x00ff0000) >> 16);
		return Math.abs(t1 - t2) + Math.abs((c1 & 0x000000ff) - (c2 & 0x000000ff))
				+ Math.abs(((c1 & 0x0000ff00) >> 8) - ((c2 & 0x0000ff00) >> 8))
				+ Math.abs(((c1 & 0x00ff0000) >> 16) - ((c2 & 0x00ff0000) >> 16));
	}

	private static int computePaletteIndexForColor(int rgb) {
		int min = 0x7fffffff;
		int minc = -1;
		for (int i = 0; i < 128; i++) {
			int diff = chromaDifference(PALETTE[i], rgb);
			if (diff < min) {
				min = diff;
				minc = i;
			}
		}
		return minc;
	}

	private static int createPaletteIndex() {
		paletteIndex = new int[32768];
		for (int r = 4; r < 256; r += 8) {
			for (int g = 4; g < 256; g += 8) {
				for (int b = 4; b < 256; b += 8) {
					int rgb = b | (g << 8) | (r << 16);
					int c15 = (b >> 3) | ((g & 0xf8) << 2) | ((r & 0xf8) << 7);
					int index = computePaletteIndexForColor(rgb);
					paletteIndex[c15] = index;
				}
			}
		}
		return 0;
	}
	
	private static void writeAs15_7(int rgb, ByteArrayOutputStream stream) throws IOException {
		// convert from 24 bit RGB to 15 bit RGB
		int c15 = ((rgb & 0xf80000) >> 9 | (rgb & 0xf800) >> 6 | (rgb & 0xf8) >> 3) & 0x7fff;
		int d15 = chromaDifference(rgb, rgb & 0x00f8f8f8);
		int c7 = paletteIndex[c15];
		int d7 = chromaDifference(rgb, PALETTE[c7]);
		if (d7 - d15 <= C7_C15_THRESHOLD) {
			// write c7, c15 isn't much better
			stream.write(c7);
		} else {
			writeShort(stream, 0x8000 | c15); // high bit set as marker for c15
		}
	}
}
