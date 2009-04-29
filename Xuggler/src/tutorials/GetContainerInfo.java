package tutorials;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;


public class GetContainerInfo {
	
	public static void main(String[] args){
		if (args.length != 1)
			throw new IllegalArgumentException("no file");
		
		IContainer container = IContainer.make();
		
		if (container.open(args[0], IContainer.Type.READ, null) < 0)
			throw new IllegalArgumentException("could not read");
		
		int numStreams = container.getNumStreams();
		System.out.println(numStreams);
		
		for (int i=0; i<numStreams; i++){
			IStream stream = container.getStream(i);
			IStreamCoder coder = stream.getStreamCoder();
			
			System.out.println("stream " + i + " is type " + coder.getCodecType());
		}
	}
}
