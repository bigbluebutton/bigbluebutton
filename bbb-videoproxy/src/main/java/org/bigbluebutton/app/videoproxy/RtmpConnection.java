package org.bigbluebutton.app.videoproxy;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

import org.jboss.netty.bootstrap.ClientBootstrap;
import org.jboss.netty.channel.ChannelFactory;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.socket.nio.NioClientSocketChannelFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.flazr.rtmp.client.ClientHandler;
import com.flazr.rtmp.client.ClientOptions;

public abstract class RtmpConnection extends ClientHandler implements ChannelFutureListener {

	private static final Logger log = LoggerFactory.getLogger(RtmpConnection.class);


	
	public RtmpConnection(ClientOptions options) {
		super(options);

	}
	
	private ClientBootstrap bootstrap = null;
	private ChannelFuture future = null;
	private ChannelFactory factory = null;
	
	public boolean connect() {
		if (factory == null)
			factory = new NioClientSocketChannelFactory(Executors.newCachedThreadPool(), Executors.newCachedThreadPool());
        bootstrap = new ClientBootstrap(factory);
        bootstrap.setPipelineFactory(pipelineFactory());
        future = bootstrap.connect(new InetSocketAddress(options.getHost(), options.getPort()));
        future.addListener(this);
        return true;
    }
	
	public void disconnect() {
		if (future != null) {
			if (future.getChannel().isConnected()) {
				log.debug("Channel is connected, disconnecting");
				future.getChannel().close(); //ClosedChannelException
				future.getChannel().getCloseFuture().awaitUninterruptibly();
			}
			future.removeListener(this);
			factory.releaseExternalResources();
			future = null; factory = null; bootstrap = null;
		}
	}
	
	abstract protected ChannelPipelineFactory pipelineFactory();
	
	@Override
	public void operationComplete(ChannelFuture future) throws Exception {
		if (future.isSuccess())
			onConnectedSuccessfully();
		else
			onConnectedUnsuccessfully();
	}	
	
	protected void onConnectedUnsuccessfully() {
	}

	protected void onConnectedSuccessfully() {
	}

	
	@Override
	public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e) {
		String exceptionMessage = e.getCause().getMessage();
		if (exceptionMessage != null && exceptionMessage.contains("ArrayIndexOutOfBoundsException") && exceptionMessage.contains("bad value / byte: 101 (hex: 65)")) {
			log.debug("Ignoring malformed metadata");
			return;
		} else {
			super.exceptionCaught(ctx, e);
	
			//for (OnExceptionListener listener : context.getExceptionListeners())
			//	listener.onException(e.getCause());
		}
	}	
}
