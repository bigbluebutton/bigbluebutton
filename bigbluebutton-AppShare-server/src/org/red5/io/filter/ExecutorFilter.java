/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.red5.io.filter;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.apache.mina.common.IdleStatus;
import org.apache.mina.common.IoFilterAdapter;
import org.apache.mina.common.IoFilterChain;
import org.apache.mina.common.IoSession;
import org.apache.mina.common.ThreadModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * A filter that forward events to {@link Executor}. You can apply various
 * thread model by inserting this filter to the {@link IoFilterChain}. This
 * filter is usually inserted by {@link ThreadModel} automatically, so you don't
 * need to add this filter in most cases.
 * <p>
 * Please note that this filter doesn't manage the life cycle of the underlying
 * {@link Executor}. You have to destroy or stop it by yourself.
 * 
 * <a href="mailto:dev@directory.apache.org">Apache Directory Project</a>
 * 
 * @version $Rev: 350169 $, $Date: 2005-12-01 00:17:41 -0500 (Thu, 01 Dec 2005) $
 */
@SuppressWarnings("unchecked")
public class ExecutorFilter extends IoFilterAdapter {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory
			.getLogger(ExecutorFilter.class);

	/** Executes submitted runnable tasks. */
	private final Executor executor;

	/**
	 * Creates a new instace with the default thread pool implementation (<tt>new ThreadPoolExecutor(16, 16, 60, TimeUnit.SECONDS, new LinkedBlockingQueue() )</tt>).
	 */
	public ExecutorFilter() {
		this(new ThreadPoolExecutor(16, 16, 60, TimeUnit.SECONDS,
				new LinkedBlockingQueue()));
	}

	/**
	 * Creates a new instance with the specified <tt>executor</tt>.
	 * 
	 * @param executor Executor
	 */
	public ExecutorFilter(Executor executor) {
		if (executor == null) {
			throw new NullPointerException("executor");
		}
		logger.debug("Executor set to: " + executor.getClass().getName());
		this.executor = executor;
	}

	/**
	 * Creates new instance with specified core pool size, maximum pool size and
	 * keep alive time.
	 * 
	 * @param corePoolSize Core pool size
	 * @param maximumPoolSize Maximum pool size
	 * @param keepAliveTime Keep alive time (in seconds)
	 */
	public ExecutorFilter(int corePoolSize, int maximumPoolSize,
			long keepAliveTime) {
		this(new ThreadPoolExecutor(corePoolSize, maximumPoolSize,
				keepAliveTime, TimeUnit.SECONDS, new LinkedBlockingQueue()));
	}

	/**
	 * Returns the underlying {@link Executor} instance this filter uses.
	 * 
	 * @return Executor object
	 */
	public Executor getExecutor() {
		return executor;
	}

	/**
	 * Dispatches event to next filter.
	 * 
	 * @param nextFilter Next filter
	 * @param session IoSession object
	 * @param type Event type (opened, closed, read, written, etc)
	 * @param data Data
	 */
	private void fireEvent(NextFilter nextFilter, IoSession session,
			EventType type, Object data) {
		Event event = new Event(type, nextFilter, data);
		SessionBuffer buf = SessionBuffer.getSessionBuffer(session);

		synchronized (buf.eventQueue) {
			buf.eventQueue.add(event);
			if (buf.processingCompleted) {
				buf.processingCompleted = false;
				if (logger.isDebugEnabled()) {
					logger.debug("Launching thread for "
							+ session.getRemoteAddress());
				}

				executor.execute(new ProcessEventsRunnable(buf));
			}
		}
	}

	/**
	 * Holds sessions.
	 */
	private static class SessionBuffer {
		
		/** Key. */
		private static final String KEY = SessionBuffer.class.getName()
				+ ".KEY";

		/**
		 * Creates session buffer from I/O session (connection).
		 * 
		 * @param session Connection between two ends
		 * 
		 * @return Session buffer
		 */
		private static SessionBuffer getSessionBuffer(IoSession session) {
			synchronized (session) {
				SessionBuffer buf = (SessionBuffer) session.getAttribute(KEY);
				if (buf == null) {
					buf = new SessionBuffer(session);
					session.setAttribute(KEY, buf);
				}
				return buf;
			}
		}

		/** MINA session. */
		private final IoSession session;

		/** Event queue. */
		private final List eventQueue = new ArrayList();

		/** Whether there's more events to process. */
		private boolean processingCompleted = true;

		/**
		 * Session buffer.
		 * 
		 * @param session I/O session
		 */
		private SessionBuffer(IoSession session) {
			this.session = session;
		}
	}

	/**
	 * Type of event.
	 */
	protected static class EventType {
		
		/** On connection opened. */
		public static final EventType OPENED = new EventType("OPENED");

		/** On connection closed. */
		public static final EventType CLOSED = new EventType("CLOSED");

		/** On data read. */
		public static final EventType READ = new EventType("READ");

		/** On data written. */
		public static final EventType WRITTEN = new EventType("WRITTEN");

		/** On data recieved. */
		public static final EventType RECEIVED = new EventType("RECEIVED");

		/** On data sent. */
		public static final EventType SENT = new EventType("SENT");

		/** On connection idle. */
		public static final EventType IDLE = new EventType("IDLE");

		/** On exception. */
		public static final EventType EXCEPTION = new EventType("EXCEPTION");

		/** Type value. */
		private final String value;

		/**
		 * Creates event type.
		 * 
		 * @param value Type
		 */
		private EventType(String value) {
			this.value = value;
		}

		/** {@inheritDoc} */
		@Override
		public String toString() {
			return value;
		}
	}

	/**
	 * Connection event.
	 */
	protected static class Event {
		
		/** Event type. */
		private final EventType type;

		/** Next filter object. */
		private final NextFilter nextFilter;

		/** Event data. */
		private final Object data;

		/**
		 * Creates new event object of specified type.
		 * 
		 * @param type Event type
		 * @param nextFilter Filter to run next
		 * @param data Event data
		 */
		Event(EventType type, NextFilter nextFilter, Object data) {
			this.type = type;
			this.nextFilter = nextFilter;
			this.data = data;
		}

		/**
		 * Getter for event data.
		 * 
		 * @return Event data
		 */
		public Object getData() {
			return data;
		}

		/**
		 * Getter for next filter in queue.
		 * 
		 * @return Next filter
		 */
		public NextFilter getNextFilter() {
			return nextFilter;
		}

		/**
		 * Getter for type.
		 * 
		 * @return Type of event
		 */
		public EventType getType() {
			return type;
		}
	}

	/** {@inheritDoc} */
	@Override
	public void sessionCreated(NextFilter nextFilter, IoSession session) {
		nextFilter.sessionCreated(session);
	}

	/** {@inheritDoc} */
	@Override
	public void sessionOpened(NextFilter nextFilter, IoSession session) {
		fireEvent(nextFilter, session, EventType.OPENED, null);
	}

	/** {@inheritDoc} */
	@Override
	public void sessionClosed(NextFilter nextFilter, IoSession session) {
		fireEvent(nextFilter, session, EventType.CLOSED, null);
	}

	/** {@inheritDoc} */
	@Override
	public void sessionIdle(NextFilter nextFilter, IoSession session,
			IdleStatus status) {
		fireEvent(nextFilter, session, EventType.IDLE, status);
	}

	/** {@inheritDoc} */
	@Override
	public void exceptionCaught(NextFilter nextFilter, IoSession session,
			Throwable cause) {
		fireEvent(nextFilter, session, EventType.EXCEPTION, cause);
	}

	/** {@inheritDoc} */
	@Override
	public void messageReceived(NextFilter nextFilter, IoSession session,
			Object message) {
		// ByteBufferUtil.acquireIfPossible(message);
		fireEvent(nextFilter, session, EventType.RECEIVED, message);
	}

	/** {@inheritDoc} */
	@Override
	public void messageSent(NextFilter nextFilter, IoSession session,
			Object message) {
		// ByteBufferUtil.acquireIfPossible(message);
		fireEvent(nextFilter, session, EventType.SENT, message);
	}

	/**
	 * Handles event.
	 * 
	 * @param nextFilter Next filter in queue
	 * @param session IoSession object (connection between two ends)
	 * @param type Event type
	 * @param data Event data
	 */
	protected void processEvent(NextFilter nextFilter, IoSession session,
			EventType type, Object data) {
		if (type == EventType.RECEIVED) {
			nextFilter.messageReceived(session, data);
			// ByteBufferUtil.releaseIfPossible(data);
		} else if (type == EventType.SENT) {
			nextFilter.messageSent(session, data);
			// ByteBufferUtil.releaseIfPossible(data);
		} else if (type == EventType.EXCEPTION) {
			nextFilter.exceptionCaught(session, (Throwable) data);
		} else if (type == EventType.IDLE) {
			nextFilter.sessionIdle(session, (IdleStatus) data);
		} else if (type == EventType.OPENED) {
			nextFilter.sessionOpened(session);
		} else if (type == EventType.CLOSED) {
			nextFilter.sessionClosed(session);
		}
	}

	/** {@inheritDoc} */
	@Override
	public void filterWrite(NextFilter nextFilter, IoSession session,
			WriteRequest writeRequest) {
		nextFilter.filterWrite(session, writeRequest);
	}

	/** {@inheritDoc} */
	@Override
	public void filterClose(NextFilter nextFilter, IoSession session)
			throws Exception {
		nextFilter.filterClose(session);
	}

	/**
	 * Runnable implementation that processes events and is runned by Executor.
	 */
	private class ProcessEventsRunnable implements Runnable {
		
		/** Session buffer. */
		private final SessionBuffer buffer;

		/**
		 * Creates Runnable task with given session buffer.
		 * 
		 * @param buffer Session buffer to use
		 */
		ProcessEventsRunnable(SessionBuffer buffer) {
			this.buffer = buffer;
		}

		/** {@inheritDoc} */
		public void run() {
			while (true) {
				Event event;

				synchronized (buffer.eventQueue) {
					if (buffer.eventQueue.isEmpty()) {
						buffer.processingCompleted = true;
						break;
					}

					event = (Event) buffer.eventQueue.remove(0);
				}

				processEvent(event.getNextFilter(), buffer.session, event
						.getType(), event.getData());
			}

			if (logger.isDebugEnabled()) {
				logger.debug("Exiting since queue is empty for "
						+ buffer.session.getRemoteAddress());
			}
		}
	}
}
