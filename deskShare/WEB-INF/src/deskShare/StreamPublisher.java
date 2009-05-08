package deskShare;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.stream.BroadcastScope;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;

import com.xuggle.red5.io.BroadcastStream;

public class StreamPublisher {
	
	final private Logger log = Red5LoggerFactory.getLogger(this.getClass());
	
	public StreamPublisher(){
		
	}
	
	synchronized public void startPublishing(IScope aScope){
		log.debug("started publishing stream in " + aScope.getName());
		
		String outStreamName = "outStream";
		BroadcastStream outStream = new BroadcastStream(outStreamName);
		outStream.setPublishedName(outStreamName);
		outStream.setScope(aScope);
		
		IContext context = aScope.getContext();
		
		IProviderService providerService = (IProviderService) context.getBean(IProviderService.BEAN_NAME);
		if (providerService.registerBroadcastStream(aScope, outStreamName, outStream)){
			IBroadcastScope bScope = (BroadcastScope) providerService.getLiveProviderInput(aScope, outStreamName, true);
			
			bScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, outStream);
		} else{
			log.error("could not register broadcast stream");
			throw new RuntimeException("could not register broadcast stream");
		}
		//start broadcasting the stream
		outStream.start();
	}
	
	synchronized public void stopPublishing(){
		
	}
}
