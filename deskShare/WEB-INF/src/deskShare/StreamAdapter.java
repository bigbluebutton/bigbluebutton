package deskShare;

import org.red5.server.net.rtmp.event.IRTMPEvent;

import com.xuggle.red5.io.BroadcastStream;
import com.xuggle.red5.io.IRTMPEventIOHandler;
import com.xuggle.red5.io.Red5HandlerFactory;
import com.xuggle.red5.io.Red5Message;
import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IContainerFormat;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.ISimpleMediaFile;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;

public class StreamAdapter implements Runnable {
	
	private IContainer inContainer = null;
	private IContainer outContainer = null;
	private final BroadcastStream outBStream;
	private final ISimpleMediaFile outInfo;
	private String outputURL;
	
	private final IRTMPEventIOHandler outputHandler;
	private static final Red5HandlerFactory factory = Red5HandlerFactory.getFactory();
	
	private volatile boolean isRunning = false;
	private volatile boolean keepRunning = true;
	
	public StreamAdapter(IContainer aInContainer, BroadcastStream aOutStream, ISimpleMediaFile aOutInfo){
		this.inContainer = aInContainer;
		this.outInfo = aOutInfo;
		this.outBStream = aOutStream;
		
		outputHandler = new IRTMPEventIOHandler(){
			public Red5Message read() throws InterruptedException{
				return null;
			}
			
			public void write(Red5Message message) throws InterruptedException{
				try{
					IRTMPEvent event = message.getData();
					if (event != null){
						outBStream.dispatchEvent(event);
						event.release();
					}
				} finally{
					
				}
			}
		};
	}
	
	public void run(){
		try{
			openContainer();
		} catch(Throwable e){
			e.printStackTrace(System.out);
		} finally{
			//closeContainer();
		}
	}
	
	public void openContainer(){
		try{
			outputURL = Red5HandlerFactory.DEFAULT_PROTOCOL + ":screencast";
			outInfo.setURL(outputURL);
			
			factory.registerStream(outputHandler, outInfo);
			outContainer = IContainer.make();
			IContainerFormat outFormat = IContainerFormat.make();
			outFormat.setOutputFormat("flv", outputURL, null);
			outContainer.open(outputURL, IContainer.Type.WRITE, outFormat);
			
			IStream outStream = outContainer.addNewStream(0);
			IStreamCoder outCoder = outStream.getStreamCoder();
			ICodec.ID outCodecID = outInfo.getVideoCodec();
			ICodec outCodec = ICodec.findEncodingCodec(outCodecID);
			
			outCoder.setCodec(outCodec);
			outCoder.setWidth(outInfo.getVideoWidth());
			outCoder.setHeight(outInfo.getVideoHeight());
		} finally{
			
		}
	}
	
	public void streamPacket(IPacket packet){
		
	}
	
	public boolean isRunning(){
		return this.isRunning;
	}
	
	public void stop(){
		this.keepRunning = false;
	}
	
}
