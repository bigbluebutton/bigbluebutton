package org.red5.demos.fitc;

import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IPendingServiceCallback;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IPlayItem;
import org.red5.server.api.stream.IPlaylistSubscriberStream;
import org.red5.server.api.stream.IStreamAwareScopeHandler;
import org.red5.server.api.stream.ISubscriberStream;

public class Application extends ApplicationAdapter implements
		IPendingServiceCallback, IStreamAwareScopeHandler {

    protected static Logger log = LoggerFactory.getLogger(Application.class);

	/** {@inheritDoc} */
    @Override
	public boolean appStart(IScope scope) {
		// init your handler here
		return true;
	}

	/** {@inheritDoc} */
    @Override
	public boolean appConnect(IConnection conn, Object[] params) {
		IServiceCapableConnection service = (IServiceCapableConnection) conn;
		log.info("Client connected {} conn {}", new Object[]{conn.getClient().getId(), conn});
		log.info("Setting stream id: {}", getClients().size()); // just a unique number
		service
				.invoke("setId", new Object[] { conn.getClient().getId() },
						this);
		return true;
	}

	/** {@inheritDoc} */
    @Override
	public boolean appJoin(IClient client, IScope scope) {
		log.info("Client joined app {}", client.getId());
		// If you need the connecion object you can access it via.
		IConnection conn = Red5.getConnectionLocal();
		return true;
	}

	/** {@inheritDoc} */
    public void streamPublishStart(IBroadcastStream stream) {
		// Notify all the clients that the stream had been started
		if (log.isDebugEnabled()) {
			log.debug("stream broadcast start: {}", stream.getPublishedName());
		}
		IConnection current = Red5.getConnectionLocal();
		Iterator<IConnection> it = scope.getConnections();
		while (it.hasNext()) {
			IConnection conn = it.next();
			if (conn.equals(current)) {
				// Don't notify current client
				continue;
			}

			if (conn instanceof IServiceCapableConnection) {
				((IServiceCapableConnection) conn).invoke("newStream",
						new Object[] { stream.getPublishedName() }, this);
				if (log.isDebugEnabled()) {
					log.debug("sending notification to {}", conn);
				}
			}
		}
	}

	/** {@inheritDoc} */
    public void streamRecordStart(IBroadcastStream stream) {
	}

	/** {@inheritDoc} */
    public void streamBroadcastClose(IBroadcastStream stream) {
	}

	/** {@inheritDoc} */
    public void streamBroadcastStart(IBroadcastStream stream) {
	}

	/** {@inheritDoc} */
    public void streamPlaylistItemPlay(IPlaylistSubscriberStream stream,
			IPlayItem item, boolean isLive) {
	}

	/** {@inheritDoc} */
    public void streamPlaylistItemStop(IPlaylistSubscriberStream stream,
			IPlayItem item) {

	}

	/** {@inheritDoc} */
    public void streamPlaylistVODItemPause(IPlaylistSubscriberStream stream,
			IPlayItem item, int position) {

	}

	/** {@inheritDoc} */
    public void streamPlaylistVODItemResume(IPlaylistSubscriberStream stream,
			IPlayItem item, int position) {

	}

	/** {@inheritDoc} */
    public void streamPlaylistVODItemSeek(IPlaylistSubscriberStream stream,
			IPlayItem item, int position) {

	}

	/** {@inheritDoc} */
    public void streamSubscriberClose(ISubscriberStream stream) {

	}

	/** {@inheritDoc} */
    public void streamSubscriberStart(ISubscriberStream stream) {
	}

	/**
	 * Get streams. called from client
	 * @return iterator of broadcast stream names
	 */
	public List<String> getStreams() {
		IConnection conn = Red5.getConnectionLocal();
		return getBroadcastStreamNames(conn.getScope());
	}

	/**
	 * Handle callback from service call. 
	 */
	public void resultReceived(IPendingServiceCall call) {
		log.info("Received result {} for {}", new Object[]{call.getResult(), call.getServiceMethodName()});
	}

}