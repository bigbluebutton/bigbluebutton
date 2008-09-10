package org.red5.server.webapp.oflaDemo;

import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IBandwidthConfigure;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IServerStream;
import org.red5.server.api.stream.IStreamCapableConnection;
import org.red5.server.api.stream.support.SimpleConnectionBWConfig;

public class Application extends ApplicationAdapter {
	private IScope appScope;

	private IServerStream serverStream;

	/** {@inheritDoc} */
    @Override
	public boolean appStart(IScope app) {
		appScope = app;
		return true;
	}

	/** {@inheritDoc} */
    @Override
	public boolean appConnect(IConnection conn, Object[] params) {
		// Trigger calling of "onBWDone", required for some FLV players
		measureBandwidth(conn);
		if (conn instanceof IStreamCapableConnection) {
			IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
			SimpleConnectionBWConfig bwConfig = new SimpleConnectionBWConfig();
			bwConfig.getChannelBandwidth()[IBandwidthConfigure.OVERALL_CHANNEL] =
				1024 * 1024;
			bwConfig.getChannelInitialBurst()[IBandwidthConfigure.OVERALL_CHANNEL] =
				128 * 1024;
			streamConn.setBandwidthConfigure(bwConfig);
		}
		
//		if (appScope == conn.getScope()) {
//			serverStream = StreamUtils.createServerStream(appScope, "live0");
//			SimplePlayItem item = new SimplePlayItem();
//			item.setStart(0);
//			item.setLength(10000);
//			item.setName("on2_flash8_w_audio");
//			serverStream.addItem(item);
//			item = new SimplePlayItem();
//			item.setStart(20000);
//			item.setLength(10000);
//			item.setName("on2_flash8_w_audio");
//			serverStream.addItem(item);
//			serverStream.start();
//			try {
//				serverStream.saveAs("aaa", false);
//				serverStream.saveAs("bbb", false);
//			} catch (Exception e) {}
//		}
		 
		return super.appConnect(conn, params);
	}

	/** {@inheritDoc} */
    @Override
	public void appDisconnect(IConnection conn) {
		if (appScope == conn.getScope() && serverStream != null) {
			serverStream.close();
		}
		super.appDisconnect(conn);
	}
}
