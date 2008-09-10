package org.red5.server.stream;

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

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Stack;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.red5.server.api.IBWControllable;
import org.red5.server.api.IBandwidthConfigure;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * A simple implementation of bandwidth controller. The initial burst,
 * if not specified by user, is half of the property "defaultCapacity".
 * <p>
 * Following is the reference information for the future optimization
 * on threading:
 * The threads that may access this object concurrently are:
 * * Thread A that makes token request.
 * * Thread B that makes token request.
 * * Thread C that distributes tokens and call the callbacks. (Timer)
 * * Thread D that updates the bw config of a controllable.
 * * Thread E that resets a bucket.
 * * Thread F that unregisters a controllable.
 * 
 * The implementation now synchronizes on each context to make sure only
 * one thread is accessing the context object at a time.
 * 
 * @author Steven Gong (steven.gong@gmail.com)
 * @version $Id$
 */
public class SimpleBWControlService extends TimerTask
implements IBWControlService {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(SimpleBWControlService.class);
	
	/** The context map. */
	protected Map<IBWControllable, BWContext> contextMap =
		new ConcurrentHashMap<IBWControllable, BWContext>();
	
	/** The token distributor. */
	protected Timer tokenDistributor;
	
	/** The interval. */
	protected long interval;
	
	/** The default capacity. */
	protected long defaultCapacity;
	
	/**
	 * Inits the.
	 */
	public void init() {
		tokenDistributor = new Timer("Token Distributor", true);
		tokenDistributor.scheduleAtFixedRate(this, 0, interval);
	}

	/**
	 * Shutdown.
	 */
	public void shutdown() {
		tokenDistributor.cancel();
	}
	
	/* (non-Javadoc)
	 * @see java.util.TimerTask#run()
	 */
	public void run() {
		if (contextMap.isEmpty()) {
			// Early bail out, nothing to do.
			return;
		}
		
		Collection<BWContext> contexts = contextMap.values();
		for (BWContext context : contexts) {
			synchronized (context) {
				if (context.bwConfig != null) {
					long t = System.currentTimeMillis();
					long delta = t - context.lastSchedule;
					context.lastSchedule = t;
					if (context.bwConfig[3] >= 0) {
						if (defaultCapacity >= context.tokenRc[3]) {
							context.tokenRc[3] += (double) (context.bwConfig[3]) * delta / 8000;
						}
					} else {
						for (int i = 0; i < 3; i++) {
							if (context.bwConfig[i] >= 0 && defaultCapacity >= context.tokenRc[i]) {
								context.tokenRc[i] += (double) (context.bwConfig[i]) * delta / 8000;
							}
						}
					}
				}
			}
		}
		for (BWContext context : contexts) {
			synchronized (context) {
				// notify all blocked requests
				context.notifyAll();
				// notify all callbacks
				invokeCallback(context);
			}
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#getAudioBucket(org.red5.server.stream.IBWControlContext)
	 */
	public ITokenBucket getAudioBucket(IBWControlContext context) {
		if (!(context instanceof BWContext)) return null;
		BWContext c = (BWContext) context;
		return c.buckets[0];
	}

	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#getVideoBucket(org.red5.server.stream.IBWControlContext)
	 */
	public ITokenBucket getVideoBucket(IBWControlContext context) {
		if (!(context instanceof BWContext)) return null;
		BWContext c = (BWContext) context;
		return c.buckets[1];
	}
	
	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#getDataBucket(org.red5.server.stream.IBWControlContext)
	 */
	public ITokenBucket getDataBucket(IBWControlContext context) {
		if (!(context instanceof BWContext)) return null;
		BWContext c = (BWContext) context;
		return c.buckets[2];
	}

	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#registerBWControllable(org.red5.server.api.IBWControllable)
	 */
	public IBWControlContext registerBWControllable(IBWControllable bc) {
		BWContext context = new BWContext(bc);
		long[] channelInitialBurst = null;
		if (bc.getBandwidthConfigure() != null) {
			context.bwConfig = new long[4];
			for (int i = 0; i < 4; i++) {
				context.bwConfig[i] = bc.getBandwidthConfigure().getChannelBandwidth()[i];
			}
			channelInitialBurst = bc.getBandwidthConfigure().getChannelInitialBurst();
		}
		context.buckets[0] = new Bucket(bc, 0);
		context.buckets[1] = new Bucket(bc, 1);
		context.buckets[2] = new Bucket(bc, 2);
		context.tokenRc = new double[4];
		if (context.bwConfig != null) {
			// set the initial value to token resources as "defaultCapacity/2"
			for (int i = 0; i < 4; i++) {
				if (channelInitialBurst[i] >= 0) {
					context.tokenRc[i] = channelInitialBurst[i];
				} else {
					context.tokenRc[i] = defaultCapacity / 2;
				}
			}
			context.lastSchedule = System.currentTimeMillis();
		} else {
			context.lastSchedule = -1;
		}
		contextMap.put(bc, context);
		return context;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#resetBuckets(org.red5.server.stream.IBWControlContext)
	 */
	public void resetBuckets(IBWControlContext context) {
		if (!(context instanceof BWContext)) return;
		BWContext c = (BWContext) context;
		for (int i = 0; i < 3; i++) {
			c.buckets[i].reset();
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#unregisterBWControllable(org.red5.server.stream.IBWControlContext)
	 */
	public void unregisterBWControllable(IBWControlContext context) {
		resetBuckets(context);
		contextMap.remove(context.getBWControllable());
	}
	
	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#lookupContext(org.red5.server.api.IBWControllable)
	 */
	public IBWControlContext lookupContext(IBWControllable bc) {
		return contextMap.get(bc);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.stream.IBWControlService#updateBWConfigure(org.red5.server.stream.IBWControlContext)
	 */
	public void updateBWConfigure(IBWControlContext context) {
		if (!(context instanceof BWContext)) return;
		BWContext c = (BWContext) context;
		IBWControllable bc = c.getBWControllable();
		synchronized (c) {
			if (bc.getBandwidthConfigure() == null) {
				c.bwConfig = null;
				c.lastSchedule = -1;
			} else {
				long[] oldConfig = c.bwConfig;
				c.bwConfig = new long[4];
				for (int i = 0; i < 4; i++) {
					c.bwConfig[i] = bc.getBandwidthConfigure().getChannelBandwidth()[i];
				}
				if (oldConfig == null) {
					// initialize the last schedule timestamp if necessary
					c.lastSchedule = System.currentTimeMillis();
					long[] channelInitialBurst = bc.getBandwidthConfigure().getChannelInitialBurst();
					// set the initial value to token resources as "defaultCapacity/2"
					for (int i = 0; i < 4; i++) {
						if (channelInitialBurst[i] >= 0) {
							c.tokenRc[i] = channelInitialBurst[i];
						} else {
							c.tokenRc[i] = defaultCapacity / 2;
						}
					}
				} else {
					// we have scheduled before, so migration of token is needed
					if (c.bwConfig[IBandwidthConfigure.OVERALL_CHANNEL] >=0 &&
							oldConfig[IBandwidthConfigure.OVERALL_CHANNEL] < 0) {
						c.tokenRc[IBandwidthConfigure.OVERALL_CHANNEL] +=
							c.tokenRc[IBandwidthConfigure.AUDIO_CHANNEL] +
							c.tokenRc[IBandwidthConfigure.VIDEO_CHANNEL] +
							c.tokenRc[IBandwidthConfigure.DATA_CHANNEL];
						for (int i = 0; i < 3; i++) {
							c.tokenRc[i] = 0;
						}
					} else if (c.bwConfig[IBandwidthConfigure.OVERALL_CHANNEL] < 0 &&
							oldConfig[IBandwidthConfigure.OVERALL_CHANNEL] >= 0) {
						for (int i = 0; i < 3; i++) {
							if (c.bwConfig[i] >= 0) {
								c.tokenRc[i] += c.tokenRc[IBandwidthConfigure.OVERALL_CHANNEL];
								break;
							}
						}
						c.tokenRc[IBandwidthConfigure.OVERALL_CHANNEL] = 0;
					}
				}
			}
		}
	}
	
	/**
	 * Sets the interval.
	 * 
	 * @param interval the new interval
	 */
	public void setInterval(long interval) {
		this.interval = interval;
	}
	
	/**
	 * Sets the default capacity.
	 * 
	 * @param capacity the new default capacity
	 */
	public void setDefaultCapacity(long capacity) {
		this.defaultCapacity = capacity;
	}
	
	/**
	 * Process request.
	 * 
	 * @param request the request
	 * 
	 * @return true, if successful
	 */
	protected boolean processRequest(TokenRequest request) {
		IBWControllable bc = request.initialBC;
		while (bc != null) {
			BWContext context = contextMap.get(bc);
			if (context == null) {
				rollbackRequest(request);
				return false;
			}
			synchronized (context) {
				if (context.bwConfig != null) {
					boolean result;
					if (request.type == TokenRequestType.BLOCKING) {
						result = processBlockingRequest(request, context);
					} else if (request.type == TokenRequestType.NONBLOCKING) {
						result = processNonblockingRequest(request, context);
					} else {
						result = processBestEffortRequest(request, context);
					}
					if (!result) {
						// for non-blocking mode, the callback is
						// recorded and will be rolled back when being reset,
						// so we don't need to do rollback here.
						if (request.type != TokenRequestType.NONBLOCKING) {
							rollbackRequest(request);
						}
						return false;
					}
				}
				TokenRequestContext requestContext = new TokenRequestContext();
				requestContext.acquiredToken = request.requestToken;
				requestContext.bc = bc;
				request.acquiredStack.push(requestContext);
			}
			bc = bc.getParentBWControllable();
		}
		// for best effort request, we need to rollback over-charged tokens
		if (request.type == TokenRequestType.BEST_EFFORT) {
			rollbackRequest(request);
		}
		return true;
	}
	
	/**
	 * Process blocking request.
	 * 
	 * @param request the request
	 * @param context the context
	 * 
	 * @return true, if successful
	 */
	private boolean processBlockingRequest(TokenRequest request, BWContext context) {
		context.timeToWait = request.timeout;
		do {
			if (context.bwConfig[3] >= 0) {
				if (context.tokenRc[3] >= request.requestToken) {
					context.tokenRc[3] -= request.requestToken;
					request.timeout = context.timeToWait;
					return true;
				}
			} else {
				if (context.tokenRc[request.channel] < 0) return true;
				if (context.tokenRc[request.channel] >= request.requestToken) {
					context.tokenRc[request.channel] -= request.requestToken;
					request.timeout = context.timeToWait;
					return true;
				}
			}
			long beforeWait = System.currentTimeMillis();
			try {
				context.wait(context.timeToWait);
			} catch (InterruptedException e) {
			}
			context.timeToWait -= System.currentTimeMillis() - beforeWait;
		} while (context.timeToWait > 0);
		return false;
	}
	
	/**
	 * Process nonblocking request.
	 * 
	 * @param request the request
	 * @param context the context
	 * 
	 * @return true, if successful
	 */
	private boolean processNonblockingRequest(TokenRequest request, BWContext context) {
		if (context.bwConfig[3] >= 0) {
			if (context.tokenRc[3] >= request.requestToken) {
				context.tokenRc[3] -= request.requestToken;
				return true;
			}
		} else {
			if (context.tokenRc[request.channel] < 0) return true;
			if (context.tokenRc[request.channel] >= request.requestToken) {
				context.tokenRc[request.channel] -= request.requestToken;
				return true;
			}
		}
		context.pendingRequestArray[request.channel].add(request);
		return false;
	}
	
	/**
	 * Process best effort request.
	 * 
	 * @param request the request
	 * @param context the context
	 * 
	 * @return true, if successful
	 */
	private boolean processBestEffortRequest(TokenRequest request, BWContext context) {
		if (context.bwConfig[3] >= 0) {
			if (context.tokenRc[3] >= request.requestToken) {
				context.tokenRc[3] -= request.requestToken;
			} else {
				request.requestToken = context.tokenRc[3];
				context.tokenRc[3] = 0;
			}
		} else {
			if (context.tokenRc[request.channel] < 0) return true;
			if (context.tokenRc[request.channel] >= request.requestToken) {
				context.tokenRc[request.channel] -= request.requestToken;
			} else {
				request.requestToken = context.tokenRc[request.channel];
				context.tokenRc[request.channel] = 0;
			}
		}
		if (request.requestToken == 0) return false;
		else return true;
	}
	
	/**
	 * Invoke callback.
	 * 
	 * @param context the context
	 */
	protected void invokeCallback(BWContext context) {
		// loop through all channels in a context
		for (int i = 0; i < 3; i++) {
			List<TokenRequest> pendingList = context.pendingRequestArray[i];
			if (!pendingList.isEmpty()) {
				// loop through all pending requests in a channel
				for (TokenRequest request : pendingList) {
					IBWControllable bc = context.getBWControllable();
					while (bc != null) {
						BWContext c = contextMap.get(bc);
						if (c == null) {
							// context has been unregistered, we should ignore
							// this callback
							break;
						}
						synchronized (c) {
							if (c.bwConfig != null && !processNonblockingRequest(request, c)) {
								break;
							}
						}
						TokenRequestContext requestContext = new TokenRequestContext();
						requestContext.acquiredToken = request.requestToken;
						requestContext.bc = bc;
						request.acquiredStack.push(requestContext);
						bc = bc.getParentBWControllable();
					}
					if (bc == null) {
						// successfully got the required tokens
						try {
							request.callback.available(context.buckets[request.channel], (long) request.requestToken);
						} catch (Throwable t) {
							log.error("Error calling request's callback", t);
						}
					}
				}
				pendingList.clear();
			}
		}
	}
	
	/**
	 * Give back the acquired tokens due to failing to accomplish the requested
	 * operation or over-charged tokens in the case of best-effort request.
	 * 
	 * @param request the request
	 */
	protected void rollbackRequest(TokenRequest request) {
		while (!request.acquiredStack.isEmpty()) {
			TokenRequestContext requestContext = request.acquiredStack.pop();
			BWContext context = contextMap.get(requestContext.bc);
			if (context != null) {
				synchronized (context) {
					if (context.bwConfig != null) {
						if (context.bwConfig[3] >= 0) {
							if (request.type == TokenRequestType.BEST_EFFORT) {
								context.tokenRc[3] += requestContext.acquiredToken - request.requestToken;
							} else {
								context.tokenRc[3] += requestContext.acquiredToken;
							}
						} else {
							if (context.bwConfig[request.channel] >= 0) {
								if (request.type == TokenRequestType.BEST_EFFORT) {
									context.tokenRc[request.channel] += requestContext.acquiredToken - request.requestToken;
								} else {
									context.tokenRc[request.channel] += requestContext.acquiredToken;
								}
							}
						}
					}
				}
			}
		}
	}
	
	/**
	 * The Class Bucket.
	 */
	private class Bucket implements ITokenBucket {
		
		/** The bc. */
		private IBWControllable bc;
		
		/** The channel. */
		private int channel;
		
		/**
		 * Instantiates a new bucket.
		 * 
		 * @param bc the bc
		 * @param channel the channel
		 */
		public Bucket(IBWControllable bc, int channel) {
			this.bc = bc;
			this.channel = channel;
		}

		/* (non-Javadoc)
		 * @see org.red5.server.stream.ITokenBucket#acquireToken(long, long)
		 */
		public boolean acquireToken(long tokenCount, long wait) {
			if (wait < 0) return false;
			TokenRequest request = new TokenRequest();
			request.type = TokenRequestType.BLOCKING;
			request.timeout = wait;
			request.channel = channel;
			request.initialBC = bc;
			request.requestToken = tokenCount;
			return processRequest(request);
		}

		/* (non-Javadoc)
		 * @see org.red5.server.stream.ITokenBucket#acquireTokenBestEffort(long)
		 */
		public long acquireTokenBestEffort(long upperLimitCount) {
			TokenRequest request = new TokenRequest();
			request.type = TokenRequestType.BEST_EFFORT;
			request.channel = channel;
			request.initialBC = bc;
			request.requestToken = upperLimitCount;
			if (processRequest(request)) {
				return (long) request.requestToken;
			} else {
				return 0;
			}
		}

		/* (non-Javadoc)
		 * @see org.red5.server.stream.ITokenBucket#acquireTokenNonblocking(long, org.red5.server.stream.ITokenBucket.ITokenBucketCallback)
		 */
		public boolean acquireTokenNonblocking(long tokenCount, ITokenBucketCallback callback) {
			TokenRequest request = new TokenRequest();
			request.type = TokenRequestType.NONBLOCKING;
			request.callback = callback;
			request.channel = channel;
			request.initialBC = bc;
			request.requestToken = tokenCount;
			return processRequest(request);
		}

		/* (non-Javadoc)
		 * @see org.red5.server.stream.ITokenBucket#getCapacity()
		 */
		public long getCapacity() {
			return defaultCapacity;
		}

		/* (non-Javadoc)
		 * @see org.red5.server.stream.ITokenBucket#getSpeed()
		 */
		public double getSpeed() {
			BWContext context = contextMap.get(bc);
			if (context.bwConfig[3] >= 0) {
				return context.bwConfig[3] * 1000 / 8;
			} else {
				if (context.bwConfig[channel] >= 0) {
					return context.bwConfig[channel] * 1000 / 8;
				} else {
					return -1;
				}
			}
		}

		/* (non-Javadoc)
		 * @see org.red5.server.stream.ITokenBucket#reset()
		 */
		public void reset() {
			// TODO wake up all blocked threads
			IBWControllable bc = this.bc;
			while (bc != null) {
				BWContext context = contextMap.get(bc);
				if (context == null) {
					break;
				}
				synchronized (context) {
					List<TokenRequest> pendingList = context.pendingRequestArray[channel];
					TokenRequest toRemove = null;
					for (TokenRequest request : pendingList) {
						if (request.initialBC == this.bc) {
							rollbackRequest(request);
							toRemove = request;
							break;
						}
					}
					if (toRemove != null) {
						pendingList.remove(toRemove);
						try {
							toRemove.callback.reset(this, (long) toRemove.requestToken);
						} catch (Throwable t) {
							log.error("Error reset request's callback", t);
						}
						break;
					}
				}
				bc = bc.getParentBWControllable();
			}
		}
		
	}
	
	/**
	 * The Class TokenRequest.
	 */
	protected class TokenRequest {
		
		/** The type. */
		TokenRequestType type;
		
		/** The callback. */
		ITokenBucket.ITokenBucketCallback callback;
		
		/** The timeout. */
		long timeout;
		
		/** The channel. */
		int channel;
		
		/** The initial bc. */
		IBWControllable initialBC;
		
		/** The request token. */
		double requestToken;
		
		/** The acquired stack. */
		Stack<TokenRequestContext> acquiredStack = new Stack<TokenRequestContext>();
	}
	
	/**
	 * The Class TokenRequestContext.
	 */
	protected class TokenRequestContext {
		
		/** The bc. */
		IBWControllable bc;
		
		/** The acquired token. */
		double acquiredToken;
	}
	
	/**
	 * The Enum TokenRequestType.
	 */
	protected enum TokenRequestType {
		
		/** The BLOCKING. */
		BLOCKING,
		
		/** The NONBLOCKING. */
		NONBLOCKING,
		
		/** The BES t_ effort. */
		BEST_EFFORT
	}
	
	/**
	 * The Class BWContext.
	 */
	protected class BWContext implements IBWControlContext {
		
		/** The bw config. */
		long[] bwConfig;
		
		/** The token rc. */
		double[] tokenRc = new double[4];
		
		/** The buckets. */
		ITokenBucket[] buckets = new ITokenBucket[3];
		
		/** The pending request array. */
		List<TokenRequest>[] pendingRequestArray = null;
		
		/** The last schedule. */
		long lastSchedule;
		
		/** The time to wait. */
		long timeToWait;
		
		/** The controllable. */
		private IBWControllable controllable;
		
		/**
		 * Instantiates a new bW context.
		 * 
		 * @param controllable the controllable
		 */
		public BWContext(IBWControllable controllable) {
			this.controllable = controllable;
			Arrays.fill(tokenRc, 0);
			pendingRequestArray = new List[] {new CopyOnWriteArrayList<TokenRequest>(),
					new CopyOnWriteArrayList<TokenRequest>(),
					new CopyOnWriteArrayList<TokenRequest>()};
		}
		
		/* (non-Javadoc)
		 * @see org.red5.server.stream.IBWControlContext#getBWControllable()
		 */
		public IBWControllable getBWControllable() {
			return controllable;
		}
	}
}
