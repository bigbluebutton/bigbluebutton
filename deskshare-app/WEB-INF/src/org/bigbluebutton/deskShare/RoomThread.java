package org.bigbluebutton.deskShare;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.Socket;
import java.util.ArrayList;

import javax.imageio.ImageIO;

/**
 * The RoomThread class is responsible for accepting client traffic relating to a particular room
 * @author Snap
 *
 */
public class RoomThread implements Runnable {
	
	private String roomName;
	private Socket socket;
	private boolean keepCapturing;
	private ArrayList<IImageListener> imageListeners;
	
	private int width, height;
	private int debugIndex = 0;
	
	/**
	 * The default constructor
	 * @param roomNumber - the room number of the room this object is accepting images for
	 */
	public RoomThread(String roomNumber, Socket socket, int width, int height){
		this.roomName = roomNumber;
		this.socket = socket;
		this.keepCapturing = true;
		imageListeners = new ArrayList<IImageListener>();
		this.width = width;
		this.height = height;
	}
	
	/**
	 * The run method of this thread. Should not be called directly
	 */
	public void run(){
		while (keepCapturing){
			acceptImage();
		}
		notifyEndOfStream();
	}
	
	/**
	 * Notify all the listeners
	 */
	private void notifyEndOfStream() {
		for (IImageListener i : imageListeners) i.streamEnded(roomName);
		
	}
	
	/**
	 * Notifies all the listeners that a new image has been received and send the image to them
	 * @param image
	 */
	public void notifyListeners(BufferedImage image){
		for (IImageListener i : imageListeners) i.imageReceived(image);
	}
	
	/**
	 * Registers a listener to listen for received images
	 * @param imageListener
	 */
	public void registerListener(IImageListener imageListener){
		this.imageListeners.add(imageListener);
	}
	
	/**
	 * This method accepts an image from the network over a socket
	 * @param socket
	 */
	public void acceptImage(){
		if (socket.isClosed()){
			keepCapturing = false;
			return;
		}
		
		DataInputStream inStream = null;
		//2^16 is the maximum number of bytes sent over the network in one go. Need several times that
		
		try{
			inStream = new DataInputStream(socket.getInputStream());
			int totalBytes = inStream.readInt();
			System.out.println("Receiving " + totalBytes + " bytes");
			if (totalBytes > 1000000 || totalBytes <= 0) return;
			
			//This is the array to which we will append the partial buffers
			byte[] appendedBuffer = new byte[totalBytes];
			
			inStream.readFully(appendedBuffer);
			
			InputStream imageData = new ByteArrayInputStream(appendedBuffer);
			//re-Create a BufferedImage we received over the network 
			BufferedImage image = ImageIO.read(imageData);

			//Notify all the listening classes that a new image has been received
			if (image == null) return;
			notifyListeners(image);
			//saveImage(image);

		} catch(Exception e){
			e.printStackTrace(System.out);
			keepCapturing = false;
			return;
		}
	}
	
	public String getStreamName(){
		return this.roomName;
	}
	
	public int getScreenWidth(){
		return this.width;
	}
	
	public int getScreenHeight(){
		return this.height;
	}
	
	/**
	 * A debug method for seeing if the images were received correctly
	 * @param image
	 */
	@SuppressWarnings("unused")
	private void saveImage(BufferedImage image){
		debugIndex++;
		try{
			ImageIO.write(image, "jpeg", new File(debugIndex + ".jpeg"));
		} catch(IOException e){
			
		}
	}
}
