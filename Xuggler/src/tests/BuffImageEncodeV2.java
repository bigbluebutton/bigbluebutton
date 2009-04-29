package tests;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;

import javax.imageio.ImageIO;

import util.Capture;

import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.IPixelFormat;
import com.xuggle.xuggler.IRational;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.video.ConverterFactory;
import com.xuggle.xuggler.video.IConverter;

public class BuffImageEncodeV2{

	private IContainer outContainer = null;
	private IStream outStream = null;
	private IStreamCoder outStreamCoder = null;
	private static String outputFileName = "imageEncode.flv";

	private long timeStamp = 0;
	private int frameNumber = 0;

	private static final String IP = "192.168.0.120";
	private static final int PORT = 1026;

	/*public static void main(String[] args){
		BuffImageEncodeV2 imageEncoder = new BuffImageEncodeV2();
		try{
			imageEncoder.socket = imageEncoder.serverSocket.accept();
			//Thread thread = new Thread(imageEncoder);
			//thread.run();
		} catch(Exception e){
			System.out.println(e.getMessage());
		}
	}*/

	public BuffImageEncodeV2(){
		setupStreams();
	}

	public void setupStreams(){

		outContainer = IContainer.make();

		int retval = outContainer.open(outputFileName, IContainer.Type.WRITE, null);
		if (retval <0)
			throw new RuntimeException("could not open output file");

		int numStreams = 1;

		outStream = outContainer.addNewStream(0);
		outStreamCoder = outStream.getStreamCoder();

		//Try H264
		//ICodec codec = ICodec.findEncodingCodec(ICodec.ID.CODEC_ID_H264);
		
		//Try Sorenson Spark - Does not work with any screen resolution
		//ICodec codec = ICodec.findEncodingCodec(ICodec.ID.CODEC_ID_H263P);
		
		//Try VP6
		//ICodec codec = ICodec.findEncodingCodec(ICodec.ID.CODEC_ID_VP6);
		
		//Guess the codec - seems to have best results for now
		ICodec codec = ICodec.guessEncodingCodec(null, null, outputFileName, null, ICodec.Type.CODEC_TYPE_VIDEO);
		if (codec == null)
			throw new RuntimeException("could not guess codec");
		
		System.out.println("Codec: " + codec.getID());
		
		outStreamCoder.setNumPicturesInGroupOfPictures(30);
		outStreamCoder.setCodec(codec);
		
		//This is the optimal bitrate I have found using trial and error
		outStreamCoder.setBitRate(25000);
		outStreamCoder.setBitRateTolerance(9000);

		int width = 1680;//capture.getScreenshotWidth();
		int height = 1050;//capture.getScreenshotHeight();

		outStreamCoder.setPixelType(IPixelFormat.Type.YUV420P);
		outStreamCoder.setHeight(height);
		outStreamCoder.setWidth(width);
		outStreamCoder.setFlag(IStreamCoder.Flags.FLAG_QSCALE, true);
		outStreamCoder.setGlobalQuality(0);
		//Set number of pictures between keyframes

		IRational frameRate = IRational.make(3,1);
		outStreamCoder.setFrameRate(frameRate);
		outStreamCoder.setTimeBase(IRational.make(frameRate.getDenominator(), frameRate.getNumerator()));
		frameRate = null;

		retval = outStreamCoder.open();
		if (retval <0)
			throw new RuntimeException("could not open input decoder");
		retval = outContainer.writeHeader();
		if (retval <0)
			throw new RuntimeException("could not write file header");
	}

	public void runEncoder(BufferedImage image){
		long offset = 0;
		IPacket packet = IPacket.make();

		IConverter converter = null;
		//BufferedImage image = capture.takeSingleSnapshot();
		try{
			converter = ConverterFactory.createConverter(image, IPixelFormat.Type.YUV420P);
		} catch(UnsupportedOperationException e){
			System.out.println("could not create converter");
		}
		IVideoPicture outFrame = converter.toPicture(image, timeStamp);
		timeStamp += 333000;
		frameNumber ++;
		//if (frameNumber % 5 == 0) outFrame.setKeyFrame(false);
		//else outFrame.setKeyFrame(true);

		//while(offset < outFrame.getSize()){
		//	
		//}

		outFrame.setQuality(0);
		int retval = outStreamCoder.encodeVideo(packet, outFrame, 0);
		if (retval < 0)
			throw new RuntimeException("could not encode video");
		if (packet.isComplete()){
			retval = outContainer.writePacket(packet);
			if (retval < 0)
				throw new RuntimeException("could not save packet to container");
		}
	}

	public void acceptImage(Socket socket){
		DataInputStream inStream = null;
		//2^16 is the maximum number of bytes sent over the network in one go. Need several times that
		byte[][] buffer = new byte[10][65536];
		//This is the array to which we will append the partial buffers
		byte[] appendedBuffer = new byte[10 * 65536];
		try{
			inStream = new DataInputStream(socket.getInputStream());
			int bytesRead = 0, index = 0, totalRead = 0;
			while(!socket.isClosed() && (bytesRead != -1)){
				//Read bytes sent from the socket
				bytesRead = inStream.read(buffer[index]);
				index++;
				totalRead += bytesRead;
				System.out.println("Read bytes: " + bytesRead);
			}

			//Append the partial arrays to the big one
			for (index = 0; index<4; index++){
				for (int i = 0; i<buffer[index].length; i++){
					appendedBuffer[index*65536 + i] = buffer[index][i];
				}
			}

			System.out.println("Read bytes in total: " + totalRead);
			//Create a convinience InputStream from the big buffer we now have
			InputStream imageData = new ByteArrayInputStream(appendedBuffer);
			//re-Create a BufferedImage we received over the network 
			BufferedImage image = ImageIO.read(imageData);

			//For testing, save the image to see if it was transfered correctly
			//ImageIO.write(image,"jpeg", new File("output.jpg"));

			//Run the encoder to encode the image to flash video
			runEncoder(image);

		} catch(Exception e){
			e.printStackTrace(System.out);
		}
	}

	public void closeStreams(){
		int retval = outContainer.writeTrailer();
	    if (retval < 0)
	      throw new RuntimeException("Could not write trailer to output file");
	}
}
