package tests;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class EncoderRunner {
	
	public static final int PORT = 1026;
	
	private ServerSocket serverSocket = null;
	private Socket socket = null;
	
	private boolean running = true;
	
	private BuffImageEncodeV2 imageEncoder = null;
	
	public EncoderRunner(){
		try{
			serverSocket = new ServerSocket(PORT);
			imageEncoder = new BuffImageEncodeV2();
		}catch(IOException e){
			e.printStackTrace(System.out);
		}
	}
	
	public static void main(String[] args){
		EncoderRunner runner = new EncoderRunner();
		int count = 0;
		while(count < 100){
			try{
				runner.socket = runner.serverSocket.accept();
				runner.imageEncoder.acceptImage(runner.socket);
				count++;
			} catch(Exception e){
				e.printStackTrace(System.out);
			}
		}
		runner.imageEncoder.closeStreams();
	}
}
