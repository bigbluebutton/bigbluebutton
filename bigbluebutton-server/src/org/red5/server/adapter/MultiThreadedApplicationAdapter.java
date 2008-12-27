package org.red5.server.adapter;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import static org.red5.server.api.ScopeUtils.getScopeService;
import static org.red5.server.api.ScopeUtils.isApp;
import static org.red5.server.api.ScopeUtils.isRoom;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.red5.io.IStreamableFile;
import org.red5.io.IStreamableFileFactory;
import org.red5.io.IStreamableFileService;
import org.red5.io.ITagReader;
import org.red5.io.StreamableFileFactory;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.scheduling.IScheduledJob;
import org.red5.server.api.scheduling.ISchedulingService;
import org.red5.server.api.service.ServiceUtils;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.so.ISharedObjectSecurity;
import org.red5.server.api.so.ISharedObjectSecurityService;
import org.red5.server.api.so.ISharedObjectService;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IBroadcastStreamService;
import org.red5.server.api.stream.IClientBroadcastStream;
import org.red5.server.api.stream.IOnDemandStream;
import org.red5.server.api.stream.IOnDemandStreamService;
import org.red5.server.api.stream.IPlayItem;
import org.red5.server.api.stream.IPlaylistSubscriberStream;
import org.red5.server.api.stream.IStreamAwareScopeHandler;
import org.red5.server.api.stream.IStreamPlaybackSecurity;
import org.red5.server.api.stream.IStreamPublishSecurity;
import org.red5.server.api.stream.IStreamSecurityService;
import org.red5.server.api.stream.IStreamService;
import org.red5.server.api.stream.ISubscriberStream;
import org.red5.server.api.stream.ISubscriberStreamService;
import org.red5.server.exception.ClientRejectedException;
import org.red5.server.scheduling.QuartzSchedulingService;
import org.red5.server.so.SharedObjectService;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.red5.server.stream.ProviderService;
import org.red5.server.stream.StreamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * ApplicationAdapter class serves as a base class for your Red5 applications.
 * It provides methods to work with SharedObjects and streams, as well as
 * connections and scheduling services.
 * 
 * ApplicationAdapter is an application level IScope. To handle streaming
 * processes in your application you should implement
 * {@link IStreamAwareScopeHandler} interface and implement handling methods.
 * 
 * Application adapter provides you with useful event handlers that can be used to intercept streams,
 * authorize users, etc. Also, all methods added in subclasses can be called from client side with NetConnection.call
 * method. Unlike to Flash Media server which requires you to keep methods on Client object at server side, Red5
 * offers much more convenient way to add methods for remote invocation to your applications.
 * 
 * <p><strong>EXAMPLE:</strong></p>
 * <p>
 * <code>
 * public List<String> getLiveStreams() {<br />
 * // Implementation goes here, say, use Red5 object to obtain scope and all it's streams<br />
 * }<br />
 * </code>
 * 
 * <p>This method added to ApplicationAdapter sublass can be called from client side with the following code:</p>
 * 
 * <code>
 * var nc:NetConnection = new NetConnection();<br />
 * nc.connect(...);<br />
 * nc.call("getLiveStreams", resultHandlerObj);<br />
 * </code>
 * 
 * 
 * 
 * <p>If you want to build a server-side framework this is a place to start and wrap it around ApplicationAdapter subclass.</p>
 * </p>
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 * @author Michael Klishin
 */
public class MultiThreadedApplicationAdapter extends StatefulScopeWrappingAdapter implements
		ISharedObjectService, IBroadcastStreamService, IOnDemandStreamService,
		ISubscriberStreamService, ISchedulingService, IStreamSecurityService,
		ISharedObjectSecurityService, IStreamAwareScopeHandler,
		ApplicationMBean {

	/** Logger object. */
	protected static Logger log = LoggerFactory.getLogger(MultiThreadedApplicationAdapter.class);

	/** List of application listeners. */
	private Set<IApplication> listeners = new HashSet<IApplication>();

    /** Scheduling service. Uses Quartz. Adds and removes scheduled jobs. */
    protected ISchedulingService schedulingService;

    /** Client time to live is max allowed ping return time, in seconds. */
    private int clientTTL = 2;

    /** Ghost connections (disconnected users listed as connected) cleanup period in seconds. */
    private int ghostConnsCleanupPeriod = 5;

    /** Ghost connections cleanup job name. Needed to cancel this job. */
    private String ghostCleanupJobName;

    /** List of handlers that protect stream publishing. */
    private Set<IStreamPublishSecurity> publishSecurity = new HashSet<IStreamPublishSecurity>();

    /** List of handlers that protect stream playback. */
    private Set<IStreamPlaybackSecurity> playbackSecurity = new HashSet<IStreamPlaybackSecurity>();

    /** List of handlers that protect shared objects. */
    private Set<ISharedObjectSecurity> sharedObjectSecurity = new HashSet<ISharedObjectSecurity>();

    /**
     * Register listener that will get notified about application events. Please
     * note that return values (e.g. from {@link IApplication#appStart(IScope)})
     * will be ignored for listeners.
     * 
     * @param listener object to register
     */
	public void addListener(IApplication listener) {
		listeners.add(listener);
	}

	/**
	 * Unregister handler that will not get notified about application events
	 * any longer.
	 * 
	 * @param listener object to unregister
	 */
	public void removeListener(IApplication listener) {
		listeners.remove(listener);
	}

	/**
	 * Return handlers that get notified about application events.
	 * 
	 * @return list of handlers
	 */
	public Set<IApplication> getListeners() {
		return Collections.unmodifiableSet(listeners);
	}

	/** {@inheritDoc} */
	public void registerStreamPublishSecurity(IStreamPublishSecurity handler) {
		publishSecurity.add(handler);
	}

	/** {@inheritDoc} */
	public void unregisterStreamPublishSecurity(IStreamPublishSecurity handler) {
		publishSecurity.remove(handler);
	}
	
	/** {@inheritDoc} */
	public Set<IStreamPublishSecurity> getStreamPublishSecurity() {
		return publishSecurity;
	}

	/** {@inheritDoc} */
	public void registerStreamPlaybackSecurity(IStreamPlaybackSecurity handler) {
		playbackSecurity.add(handler);
	}
	
	/** {@inheritDoc} */
	public void unregisterStreamPlaybackSecurity(IStreamPlaybackSecurity handler) {
		playbackSecurity.remove(handler);
	}
	
	/** {@inheritDoc} */
	public Set<IStreamPlaybackSecurity> getStreamPlaybackSecurity() {
		return playbackSecurity;
	}
	
	/** {@inheritDoc} */
	public void registerSharedObjectSecurity(ISharedObjectSecurity handler) {
		sharedObjectSecurity.add(handler);
	}
	
	/** {@inheritDoc} */
	public void unregisterSharedObjectSecurity(ISharedObjectSecurity handler) {
		sharedObjectSecurity.remove(handler);
	}
	
	/** {@inheritDoc} */
	public Set<ISharedObjectSecurity> getSharedObjectSecurity() {
		return sharedObjectSecurity;
	}
	
	/**
	 * Reject the currently connecting client without a special error message.
	 * This method throws {@link ClientRejectedException} exception.
	 * 
	 * @return never returns
	 * 
	 * @throws org.red5.server.exception.ClientRejectedException Thrown when client connection must be rejected by application logic
	 * @throws ClientRejectedException the client rejected exception
	 */
	protected boolean rejectClient() throws ClientRejectedException {
		throw new ClientRejectedException();
	}

	/**
	 * Reject the currently connecting client with an error message.
	 * 
	 * The passed object will be available as "application" property of the
	 * information object that is returned to the caller.
	 * 
	 * @param reason Additional error message to return to client-side Flex/Flash application
	 * 
	 * @return never returns
	 * 
	 * @throws org.red5.server.exception.ClientRejectedException Thrown when client connection must be rejected by application logic
	 * @throws ClientRejectedException the client rejected exception
	 */
	protected boolean rejectClient(Object reason) throws ClientRejectedException{
		throw new ClientRejectedException(reason);
	}

	/**
	 * Returns connection result for given scope and parameters. Whether the
	 * scope is room or app level scope, this method distinguishes it and acts
	 * accordingly. You override
	 * {@link ApplicationAdapter#appConnect(IConnection, Object[])} or
	 * {@link ApplicationAdapter#roomConnect(IConnection, Object[])} in your
	 * application to make it act the way you want.
	 * 
	 * @param conn Connection object
	 * @param scope Scope
	 * @param params List of params passed to connection handler
	 * 
	 * @return <code>true</code> if connect is successful, <code>false</code>
	 * otherwise
	 */
	@Override
	public boolean connect(IConnection conn, IScope scope, Object[] params) {
		if (!super.connect(conn, scope, params)) {
			return false;
		}
		boolean success = false;
		if (isApp(scope)) {
			success = appConnect(conn, params);
		} else if (isRoom(scope)) {
			success = roomConnect(conn, params);
		}
		return success;
	}

	/**
	 * Starts scope. Scope can be both application or room level.
	 * 
	 * @param scope Scope object
	 * 
	 * @return <code>true</code> if scope can be started, <code>false</code>
	 * otherwise. See {@link AbstractScopeAdapter#start(IScope)} for
	 * details.
	 */
	@Override
	public boolean start(IScope scope) {
		if (!super.start(scope)) {
			return false;
		}
		if (isApp(scope)) {
			return appStart(scope);
		} else {
			return isRoom(scope) && roomStart(scope);
        }
    }

	/**
	 * Returns disconnection result for given scope and parameters. Whether the
	 * scope is room or app level scope, this method distinguishes it and acts
	 * accordingly.
	 * 
	 * @param conn Connection object
	 * @param scope Scope
	 */
	@Override
	public void disconnect(IConnection conn, IScope scope) {
		if (log.isDebugEnabled()) {
			log.debug("disconnect: {} << {}", conn, scope);
		}
		if (isApp(scope)) {
			appDisconnect(conn);
		} else if (isRoom(scope)) {
			roomDisconnect(conn);
		}
		super.disconnect(conn, scope);
	}

	/**
	 * Stops scope handling (that is, stops application if given scope is app
	 * level scope and stops room handling if given scope has lower scope
	 * level). This method calls {@link ApplicationAdapter#appStop(IScope)} or
	 * {@link ApplicationAdapter#roomStop(IScope)} handlers respectively.
	 * 
	 * @param scope Scope to stop
	 */
	@Override
	public void stop(IScope scope) {
		if (isApp(scope)) {
			appStop(scope);
		} else if (isRoom(scope)) {
			roomStop(scope);
		}
		super.stop(scope);
	}

	/**
	 * Adds client to scope. Scope can be both application or room. Can be
	 * applied to both application scope and scopes of lower level. This method
	 * calls {@link ApplicationAdapter#appJoin(IClient, IScope)} or
	 * {@link ApplicationAdapter#roomJoin(IClient, IScope)} handlers
	 * respectively.
	 * 
	 * @param client Client object
	 * @param scope Scope object
	 * 
	 * @return true, if join
	 */
	@Override
	public boolean join(IClient client, IScope scope) {
		if (!super.join(client, scope)) {
			return false;
		}
		if (isApp(scope)) {
			return appJoin(client, scope);
		} else {
			return isRoom(scope) && roomJoin(client, scope);
        }
    }

	/**
	 * Disconnects client from scope. Can be applied to both application scope
	 * and scopes of lower level. This method calls
	 * {@link ApplicationAdapter#appLeave(IClient, IScope)} or
	 * {@link ApplicationAdapter#roomLeave(IClient, IScope)} handlers
	 * respectively.
	 * 
	 * @param client Client object
	 * @param scope Scope object
	 */
	@Override
	public void leave(IClient client, IScope scope) {
		if (log.isDebugEnabled()) {
			log.debug("leave: {} << {}", client, scope);
		}
		if (isApp(scope)) {
			appLeave(client, scope);
		} else if (isRoom(scope)) {
			roomLeave(client, scope);
		}
		super.leave(client, scope);
	}

	/**
	 * Called once on scope (that is, application or application room) start.
	 * You override {@link ApplicationAdapter#appStart(IScope)} or
	 * {@link ApplicationAdapter#roomStart(IScope)}} in your application to
	 * make it act the way you want.
	 * 
	 * @param app Application scope object
	 * 
	 * @return <code>true</code> if scope can be started, <code>false</code>
	 * otherwise
	 */
	public boolean appStart(IScope app) {
		if (log.isDebugEnabled()) {
			log.debug("appStart: {}", app);
		}
		for (IApplication listener : listeners) {
			listener.appStart(app);
		}
		return true;
	}

	/**
	 * Handler method. Called when application is stopped.
	 * 
	 * @param app Scope object
	 */
	public void appStop(IScope app) {
		if (log.isDebugEnabled()) {
			log.debug("appStop: {}", app);
		}
		for (IApplication listener : listeners) {
			listener.appStop(app);
		}
	}

	/**
	 * Handler method. Called when room scope is started.
	 * 
	 * @param room Room scope
	 * 
	 * @return 	Boolean value
	 */
	public boolean roomStart(IScope room) {
		if (log.isDebugEnabled()) {
			log.debug("roomStart: {}", room);
		}
		// TODO : Get to know what does roomStart return mean
		for (IApplication listener : listeners) {
			listener.roomStart(room);
		}
		return true;
	}

	/**
	 * Handler method. Called when room scope is stopped.
	 * 
	 * @param room Room scope.
	 */
	public void roomStop(IScope room) {
		if (log.isDebugEnabled()) {
			log.debug("roomStop: {}", room);
		}
		for (IApplication listener : listeners) {
			listener.roomStop(room);
		}
	}

	/**
	 * Handler method. Called every time new client connects (that is, new
	 * IConnection object is created after call from a SWF movie) to the
	 * application.
	 * 
	 * You override this method to pass additional data from client to server
	 * application using <code>NetConnection.connect</code> method.
	 * 
	 * <p><strong>EXAMPLE:</strong><br />
	 * In this simple example we pass user's skin of choice identifier from
	 * client to th server.</p>
	 * 
	 * <p><strong>Client-side:</strong><br />
	 * <code>NetConnection.connect("rtmp://localhost/killerred5app", "silver");</code></p>
	 * 
	 * <p><strong>Server-side:</strong><br />
	 * <code>if (params.length > 0) System.out.println("Theme selected: " + params[0]);</code></p>
	 * 
	 * @param conn Connection object
	 * @param params List of parameters after connection URL passed to
	 * <code>NetConnection.connect</code> method.
	 * 
	 * @return 		Boolean value
	 */
	public boolean appConnect(IConnection conn, Object[] params) {
		if (log.isDebugEnabled()) {
			log.debug("appConnect: {}", conn);
		}
		for (IApplication listener : listeners) {
			listener.appConnect(conn, params);
		}
		return true;
	}

	/**
	 * Handler method. Called every time new client connects (that is, new
	 * IConnection object is created after call from a SWF movie) to the
	 * application.
	 * 
	 * You override this method to pass additional data from client to server
	 * application using <code>NetConnection.connect</code> method.
	 * 
	 * See {@link ApplicationAdapter#appConnect(IConnection, Object[])} for code
	 * example.
	 * 
	 * @param conn Connection object
	 * @param params List of params passed to room scope
	 * 
	 * @return 		Boolean value
	 */
	public boolean roomConnect(IConnection conn, Object[] params) {
		if (log.isDebugEnabled()) {
			log.debug("roomConnect: {}", conn);
		}
		for (IApplication listener : listeners) {
			listener.roomConnect(conn, params);
		}
		return true;
	}

	/**
	 * Handler method. Called every time client disconnects from the
	 * application.
	 * 
	 * @param conn Disconnected connection object
	 */
	public void appDisconnect(IConnection conn) {
		if (log.isDebugEnabled()) {
			log.debug("appDisconnect: {}", conn);
		}
		for (IApplication listener : listeners) {
			listener.appDisconnect(conn);
		}
	}

	/**
	 * Handler method. Called every time client disconnects from the room.
	 * 
	 * @param conn Disconnected connection object
	 */
	public void roomDisconnect(IConnection conn) {
		if (log.isDebugEnabled()) {
			log.debug("roomDisconnect: {}", conn);
		}
		for (IApplication listener : listeners) {
			listener.roomDisconnect(conn);
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.adapter.ApplicationMBean#appJoin(org.red5.server.api.IClient, org.red5.server.api.IScope)
	 */
	public boolean appJoin(IClient client, IScope app) {
		if (log.isDebugEnabled()) {
			log.debug("appJoin: {} >> {}", client, app);
		}
		for (IApplication listener : listeners) {
			listener.appJoin(client, app);
		}
		return true;
	}

	/**
	 * Handler method. Called every time client leaves application scope.
	 * 
	 * @param client Client object that left
	 * @param app Application scope
	 */
	public void appLeave(IClient client, IScope app) {
		if (log.isDebugEnabled()) {
			log.debug("appLeave: {} << {}", client, app);
		}
		for (IApplication listener : listeners) {
			listener.appLeave(client, app);
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.adapter.ApplicationMBean#roomJoin(org.red5.server.api.IClient, org.red5.server.api.IScope)
	 */
	public boolean roomJoin(IClient client, IScope room) {
		if (log.isDebugEnabled()) {
			log.debug("roomJoin: {} >> {}", client, room);
		}
		for (IApplication listener : listeners) {
			listener.roomJoin(client, room);
		}
		return true;
	}

	/**
	 * Handler method. Called every time client leaves room scope.
	 * 
	 * @param client    Disconnected client object
	 * @param room      Room scope
	 */
	public void roomLeave(IClient client, IScope room) {
		if (log.isDebugEnabled()) {
			log.debug("roomLeave: {} << {}", client, room);
		}
		for (IApplication listener : listeners) {
			listener.roomLeave(client, room);
		}
	}

	/**
	 * Try to measure bandwidth of current connection.
	 * 
	 * This is required for some FLV player to work because they require the
	 * "onBWDone" method to be called on the connection.
	 */
	public void measureBandwidth() {
		measureBandwidth(Red5.getConnectionLocal());
	}

	/**
	 * Try to measure bandwidth of given connection.
	 * 
	 * This is required for some FLV player to work because they require the
	 * "onBWDone" method to be called on the connection.
	 * 
	 * @param conn the connection to measure the bandwidth for
	 */
	public void measureBandwidth(IConnection conn) {
		// dummy for now, this makes flv player work
		// they dont wait for connected status they wait for onBWDone
		ServiceUtils.invokeOnConnection(conn, "onBWDone", new Object[] {});
		/*
		 * ServiceUtils.invokeOnConnection(conn, "onBWCheck", new Object[] {},
		 * new IPendingServiceCallback() { public void
		 * resultReceived(IPendingServiceCall call) { log.debug("onBWCheck 1
		 * result: " + call.getResult()); } }); int[] filler = new int[1024];
		 * ServiceUtils.invokeOnConnection(conn, "onBWCheck", new Object[] {
		 * filler }, new IPendingServiceCallback() { public void
		 * resultReceived(IPendingServiceCall call) { log.debug("onBWCheck 2
		 * result: " + call.getResult()); ServiceUtils.invokeOnConnection(conn,
		 * "onBWDone", new Object[] { new Integer(1000), new Integer(300), new
		 * Integer(6000), new Integer(300) }, new IPendingServiceCallback() {
		 * public void resultReceived(IPendingServiceCall call) {
		 * log.debug("onBWDone result: " + call.getResult()); } }); } });
		 */
	}

	/* Wrapper around ISharedObjectService */

	/**
	 * Creates a new shared object for given scope. Server-side shared objects
	 * (also known as Remote SO) are special kind of objects those variable are
	 * synchronized between clients. To get an instance of RSO at client-side,
	 * use <code>SharedObject.getRemote()</code>.
	 * 
	 * SharedObjects can be persistent and transient. Persistent RSO are
	 * statuful, i.e. store their data between sessions. If you need to store
	 * some data on server while clients go back and forth use persistent SO
	 * (just use <code>true</code> ), otherwise perfer usage of transient for
	 * extra performance.
	 * 
	 * @param scope Scope that shared object belongs to
	 * @param name Name of SharedObject
	 * @param persistent Whether SharedObject instance should be persistent or not
	 * 
	 * @return 				<code>true</code> if SO was created, <code>false</code> otherwise
	 */
	public boolean createSharedObject(IScope scope, String name,
			boolean persistent) {
		ISharedObjectService service = (ISharedObjectService) getScopeService(
				scope, ISharedObjectService.class, SharedObjectService.class,
				false);
		return service.createSharedObject(scope, name, persistent);
    }

    /**
     * Returns shared object from given scope by name.
     * 
     * @param scope Scope that shared object belongs to
     * @param name Name of SharedObject
     * 
     * @return 				Shared object instance with name given
     */
	public ISharedObject getSharedObject(IScope scope, String name) {
		ISharedObjectService service = (ISharedObjectService) getScopeService(
				scope, ISharedObjectService.class, SharedObjectService.class,
				false);
		return service.getSharedObject(scope, name);
	}

	/**
	 * Returns shared object from given scope by name.
	 * 
	 * @param scope Scope that shared object belongs to
	 * @param name Name of SharedObject
	 * @param persistent Whether SharedObject instance should be persistent or not
	 * 
	 * @return 				Shared object instance with name given
	 */
	public ISharedObject getSharedObject(IScope scope, String name,
			boolean persistent) {
		ISharedObjectService service = (ISharedObjectService) getScopeService(
				scope, ISharedObjectService.class, SharedObjectService.class,
				false);
		return service.getSharedObject(scope, name, persistent);
	}

	/**
	 * Returns available SharedObject names as List.
	 * 
	 * @param scope Scope that SO belong to
	 * 
	 * @return the shared object names
	 */
	public Set<String> getSharedObjectNames(IScope scope) {
		ISharedObjectService service = (ISharedObjectService) getScopeService(
				scope, ISharedObjectService.class, SharedObjectService.class,
				false);
		return service.getSharedObjectNames(scope);
	}

	/**
	 * Checks whether there's a SO with given scope and name.
	 * 
	 * @param scope Scope that SO belong to
	 * @param name Name of SharedObject
	 * 
	 * @return true, if checks for shared object
	 */
	public boolean hasSharedObject(IScope scope, String name) {
		ISharedObjectService service = (ISharedObjectService) getScopeService(
				scope, ISharedObjectService.class, SharedObjectService.class,
				false);
		return service.hasSharedObject(scope, name);
	}

	/* Wrapper around the stream interfaces */

	/** {@inheritDoc} */
    public boolean hasBroadcastStream(IScope scope, String name) {
		IProviderService service = (IProviderService) getScopeService(scope,
				IProviderService.class, ProviderService.class);
		return (service.getLiveProviderInput(scope, name, false) != null);
	}

	/** {@inheritDoc} */
    public IBroadcastStream getBroadcastStream(IScope scope, String name) {
		IStreamService service = (IStreamService) getScopeService(scope,
				IStreamService.class, StreamService.class);
		if (!(service instanceof StreamService))
			return null;
		
		IBroadcastScope bs = ((StreamService) service).getBroadcastScope(scope,
				name);
		return (IClientBroadcastStream) bs
				.getAttribute(IBroadcastScope.STREAM_ATTRIBUTE);
	}

	/**
	 * Returns list of stream names broadcasted in <pre>scope</pre>. Broadcast stream name is somewhat different
	 * from server stream name. Server stream name is just an ID assigned by Red5 to every created stream. Broadcast stream name
	 * is the name that is being used to subscribe to the stream at client side, that is, in <code>NetStream.play</code> call.
	 * 
	 * @param scope Scope to retrieve broadcasted stream names
	 * 
	 * @return List of broadcasted stream names.
	 */
	public List<String> getBroadcastStreamNames(IScope scope) {
		IProviderService service = (IProviderService) getScopeService(scope,
				IProviderService.class, ProviderService.class);
		return service.getBroadcastStreamNames(scope);
	}

	/**
	 * Check whether scope has VOD stream with given name or not.
	 * 
	 * @param scope Scope
	 * @param name VOD stream name
	 * 
	 * @return <code>true</code> if scope has VOD stream with given name,
	 * <code>false</code> otherwise.
	 */
	public boolean hasOnDemandStream(IScope scope, String name) {
		IProviderService service = (IProviderService) getScopeService(scope,
				IProviderService.class, ProviderService.class);
		return (service.getVODProviderInput(scope, name) != null);
	}

	/**
	 * Returns VOD stream with given name from specified scope.
	 * 
	 * @param scope Scope object
	 * @param name VOD stream name
	 * 
	 * @return IOnDemandStream object that represents stream that can be played
	 * on demand, seekable and so forth. See {@link IOnDemandStream} for
	 * details.
	 */
	public IOnDemandStream getOnDemandStream(IScope scope, String name) {
		log.warn("This won't work until the refactoring of the streaming code is complete.");
		IOnDemandStreamService service = (IOnDemandStreamService) getScopeService(
				scope, IOnDemandStreamService.class, StreamService.class, false);
		return service.getOnDemandStream(scope, name);
	}

	/**
	 * Returns subscriber stream with given name from specified scope.
	 * Subscriber stream is a stream that clients can subscribe to.
	 * 
	 * @param scope Scope
	 * @param name Stream name
	 * 
	 * @return ISubscriberStream object
	 */
	public ISubscriberStream getSubscriberStream(IScope scope, String name) {
		log.warn("This won't work until the refactoring of the streaming code is complete.");
		ISubscriberStreamService service = (ISubscriberStreamService) getScopeService(
				scope, ISubscriberStreamService.class, StreamService.class,
				false);
		return service.getSubscriberStream(scope, name);
	}

	/**
	 * Wrapper around ISchedulingService, adds a scheduled job to be run
	 * periodically. We store this service in the scope as it can be shared
	 * across all rooms of the applications.
	 * 
	 * @param interval Time inverval to run the scheduled job
	 * @param job Scheduled job object
	 * 
	 * @return Name of the scheduled job
	 */
	public String addScheduledJob(int interval, IScheduledJob job) {
		ISchedulingService service = (ISchedulingService) getScopeService(
				scope, ISchedulingService.class, QuartzSchedulingService.class,
				false);
		return service.addScheduledJob(interval, job);
	}

	/**
	 * Adds a scheduled job that's gonna be executed once. Please note that the
	 * jobs are not saved if Red5 is restarted in the meantime.
	 * 
	 * @param timeDelta Time offset in milliseconds from the current date when given
	 * job should be run
	 * @param job Scheduled job object
	 * 
	 * @return Name of the scheduled job
	 */
	public String addScheduledOnceJob(long timeDelta, IScheduledJob job) {
		ISchedulingService service = (ISchedulingService) getScopeService(
				scope, ISchedulingService.class, QuartzSchedulingService.class,
				false);
		return service.addScheduledOnceJob(timeDelta, job);
	}

	/**
	 * Adds a scheduled job that's gonna be executed once on given date. Please
	 * note that the jobs are not saved if Red5 is restarted in the meantime.
	 * 
	 * @param date When to run scheduled job
	 * @param job Scheduled job object
	 * 
	 * @return Name of the scheduled job
	 */
	public String addScheduledOnceJob(Date date, IScheduledJob job) {
		ISchedulingService service = (ISchedulingService) getScopeService(
				scope, ISchedulingService.class, QuartzSchedulingService.class,
				false);
		return service.addScheduledOnceJob(date, job);
	}

	/**
	 * Adds a scheduled job which starts after the specified
	 * delay period and fires periodically.
	 * 
	 * @param interval time in milliseconds between two notifications of the job
	 * @param job the job to trigger periodically
	 * @param delay time in milliseconds to pass before first execution.
	 * 
	 * @return the string
	 * 
	 * the name of the scheduled job
	 */
	public String addScheduledJobAfterDelay(int interval, IScheduledJob job, int delay) {
		ISchedulingService service = (ISchedulingService) getScopeService(
				scope, ISchedulingService.class, QuartzSchedulingService.class,
				false);
		return service.addScheduledJobAfterDelay(interval, job, delay);
	}

	/**
	 * Removes scheduled job from scheduling service list.
	 * 
	 * @param name Scheduled job name
	 */
	public void removeScheduledJob(String name) {
		ISchedulingService service = (ISchedulingService) getScopeService(
				scope, ISchedulingService.class, QuartzSchedulingService.class,
				false);
		service.removeScheduledJob(name);
	}

	/**
	 * Retuns list of scheduled job names.
	 * 
	 * @return List of scheduled job names as list of Strings.
	 */
	public List<String> getScheduledJobNames() {
		ISchedulingService service = (ISchedulingService) getScopeService(
				scope, ISchedulingService.class, QuartzSchedulingService.class,
				false);
		return service.getScheduledJobNames();
	}

	// NOTE: Method added to get flv player to work.
	/**
	 * Returns stream length. This is a hook so do not count on this method
	 * 'cause situation may one day.
	 * 
	 * @param name Stream name
	 * 
	 * @return Stream length in seconds (?)
	 */
	public double getStreamLength(String name) {
		IProviderService provider = (IProviderService) getScopeService(scope,
				IProviderService.class, ProviderService.class);
		File file = provider.getVODProviderFile(scope, name);
		if (file == null) {
			return 0;
		}

		double duration = 0;

		IStreamableFileFactory factory = (IStreamableFileFactory) ScopeUtils
				.getScopeService(scope, IStreamableFileFactory.class,
						StreamableFileFactory.class);
		IStreamableFileService service = factory.getService(file);
		if (service == null) {
			log.error("No service found for {}", file.getAbsolutePath());
			return 0;
		}
		try {
			IStreamableFile streamFile = service.getStreamableFile(file);
			ITagReader reader = streamFile.getReader();
			duration = (double) reader.getDuration() / 1000;
			reader.close();
		} catch (IOException e) {
			log.error("error read stream file {}. {}", file.getAbsolutePath(), e);
		}

		return duration;
	}

	/** {@inheritDoc} */
    public boolean clearSharedObjects(IScope scope, String name) {
		ISharedObjectService service = (ISharedObjectService) getScopeService(
				scope, ISharedObjectService.class, SharedObjectService.class,
				false);

        return service.clearSharedObjects(scope, name);
    }

    /**
     * Client time to live is max allowed connection ping return time in seconds.
     * 
     * @return              TTL value used in seconds
     */
    public long getClientTTL() {
        return clientTTL;
    }

    /**
     * Client time to live is max allowed connection ping return time in seconds.
     * 
     * @param clientTTL     New TTL value in seconds
     */
    public void setClientTTL(int clientTTL) {
        this.clientTTL = clientTTL;
    }

    /**
     * Return period of ghost connections cleanup task call.
     * 
     * @return              Ghost connections cleanup period
     */
    public int getGhostConnsCleanupPeriod() {
        return ghostConnsCleanupPeriod;
    }

    /**
     * Set new ghost connections cleanup period.
     * 
     * @param ghostConnsCleanupPeriod      New ghost connections cleanup period
     */
    public void setGhostConnsCleanupPeriod(int ghostConnsCleanupPeriod) {
        this.ghostConnsCleanupPeriod = ghostConnsCleanupPeriod;
    }

    /**
     * Schedules new ghost connections cleanup using current cleanup period.
     */
    public void scheduleGhostConnectionsCleanup() {
    	log.info("Scheduling ghost connections cleanup.");
        IScheduledJob job = new IScheduledJob(){
            public void execute(ISchedulingService service) throws CloneNotSupportedException {
                killGhostConnections();
            }
        };

        // Cancel previous if was scheduled
        cancelGhostConnectionsCleanup();

        // Store name so we can cancel it later
        ghostCleanupJobName = schedulingService.addScheduledJob( ghostConnsCleanupPeriod * 1000, job );
    }

    /**
     * Cancel ghost connections cleanup period.
     */
    public void cancelGhostConnectionsCleanup() {
        if( ghostCleanupJobName != null ){
            schedulingService.removeScheduledJob( ghostCleanupJobName );
        }
    }

    /**
     * Cleans up ghost connections.
     */
    protected void killGhostConnections() {
        Iterator<IConnection> iter = getConnectionsIter();
        while (iter.hasNext()) {
            IConnection conn = iter.next();

            // Ping client
            conn.ping();

            // Time to live exceeded, disconnect
            if( conn.getLastPingTime() > clientTTL * 1000 ){
            	log.warn("Killing ghost connection {}", conn);
                disconnect( conn, scope );    
            }
        }
    }
    
    /**
     * Notification method that is sent by FME just before publishing starts.
     * 
     * @param streamName Name of stream that is about to be published.
     */
    public void FCPublish(String streamName) {
    	// Override if necessary.
    }
    
    /**
     * Notification method that is sent by FME when publishing of a stream ends.
     */
    public void FCUnpublish() {
    	// Override if necessary.
    }

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamBroadcastClose(org.red5.server.api.stream.IBroadcastStream)
	 */
	public void streamBroadcastClose(IBroadcastStream stream) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamBroadcastStart(org.red5.server.api.stream.IBroadcastStream)
	 */
	public void streamBroadcastStart(IBroadcastStream stream) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamPlaylistItemPlay(org.red5.server.api.stream.IPlaylistSubscriberStream, org.red5.server.api.stream.IPlayItem, boolean)
	 */
	public void streamPlaylistItemPlay(IPlaylistSubscriberStream stream, IPlayItem item, boolean isLive) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamPlaylistItemStop(org.red5.server.api.stream.IPlaylistSubscriberStream, org.red5.server.api.stream.IPlayItem)
	 */
	public void streamPlaylistItemStop(IPlaylistSubscriberStream stream, IPlayItem item) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamPlaylistVODItemPause(org.red5.server.api.stream.IPlaylistSubscriberStream, org.red5.server.api.stream.IPlayItem, int)
	 */
	public void streamPlaylistVODItemPause(IPlaylistSubscriberStream stream, IPlayItem item, int position) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamPlaylistVODItemResume(org.red5.server.api.stream.IPlaylistSubscriberStream, org.red5.server.api.stream.IPlayItem, int)
	 */
	public void streamPlaylistVODItemResume(IPlaylistSubscriberStream stream, IPlayItem item, int position) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamPlaylistVODItemSeek(org.red5.server.api.stream.IPlaylistSubscriberStream, org.red5.server.api.stream.IPlayItem, int)
	 */
	public void streamPlaylistVODItemSeek(IPlaylistSubscriberStream stream, IPlayItem item, int position) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamPublishStart(org.red5.server.api.stream.IBroadcastStream)
	 */
	public void streamPublishStart(IBroadcastStream stream) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamRecordStart(org.red5.server.api.stream.IBroadcastStream)
	 */
	public void streamRecordStart(IBroadcastStream stream) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamSubscriberClose(org.red5.server.api.stream.ISubscriberStream)
	 */
	public void streamSubscriberClose(ISubscriberStream stream) {
    	// Override if necessary.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.stream.IStreamAwareScopeHandler#streamSubscriberStart(org.red5.server.api.stream.ISubscriberStream)
	 */
	public void streamSubscriberStart(ISubscriberStream stream) {
    	// Override if necessary.
	}
    
}
