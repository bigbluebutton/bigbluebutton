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

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.red5.io.IStreamableFileFactory;
import org.red5.io.IStreamableFileService;
import org.red5.server.api.IBasicScope;
import org.red5.server.api.IScope;
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamFilenameGenerator;
import org.red5.server.api.stream.IStreamFilenameGenerator.GenerationType;
import org.red5.server.messaging.IMessageInput;
import org.red5.server.messaging.IPipe;
import org.red5.server.messaging.InMemoryPullPullPipe;
import org.red5.server.stream.provider.FileProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * {@inheritDoc}.
 */
public class ProviderService implements IProviderService {

	/** Logger. */
	private static final Logger log = LoggerFactory
			.getLogger(ProviderService.class);

	/** {@inheritDoc} */
	public IMessageInput getProviderInput(IScope scope, String name) {
		IMessageInput msgIn = getLiveProviderInput(scope, name, false);
		if (msgIn == null) {
			return getVODProviderInput(scope, name);
		}
		return msgIn;
	}

	/** {@inheritDoc} */
	public IMessageInput getLiveProviderInput(IScope scope, String name,
			boolean needCreate) {
		IBasicScope basicScope;
		basicScope = scope.getBasicScope(IBroadcastScope.TYPE, name);
		if (basicScope == null) {
			if (needCreate) {
				synchronized (scope) {
					// Re-check if another thread already created the scope
					basicScope = scope
							.getBasicScope(IBroadcastScope.TYPE, name);
					if (basicScope == null) {
						basicScope = new BroadcastScope(scope, name);
						scope.addChildScope(basicScope);
					}
				}
			} else {
				return null;
			}
		}
		if (!(basicScope instanceof IBroadcastScope)) {
			return null;
		}
		return (IBroadcastScope) basicScope;
	}

	/** {@inheritDoc} */
	public IMessageInput getVODProviderInput(IScope scope, String name) {
		File file = getVODProviderFile(scope, name);
		if (file == null) {
			return null;
		}
		IPipe pipe = new InMemoryPullPullPipe();
		pipe.subscribe(new FileProvider(scope, file), null);
		return pipe;
	}

	/** {@inheritDoc} */
	public File getVODProviderFile(IScope scope, String name) {
		File file = null;
		try {
			log.info("getVODProviderFile scope path: " + scope.getContextPath()
					+ " name: " + name);
			file = getStreamFile(scope, name);
		} catch (IOException e) {
			log.error("Problem getting file: " + name);
		}
		if (file == null || !file.exists()) {
			return null;
		}
		return file;
	}

	/** {@inheritDoc} */
	public boolean registerBroadcastStream(IScope scope, String name,
			IBroadcastStream bs) {
		boolean status = false;
		synchronized (scope) {
			IBasicScope basicScope = scope.getBasicScope(IBroadcastScope.TYPE,
					name);
			if (basicScope == null) {
				basicScope = new BroadcastScope(scope, name);
				scope.addChildScope(basicScope);
			}
			if (basicScope instanceof IBroadcastScope) {
				((IBroadcastScope) basicScope)
						.subscribe(bs.getProvider(), null);
				status = true;
			}
		}
		return status;
	}

	/** {@inheritDoc} */
	public List<String> getBroadcastStreamNames(IScope scope) {
		// TODO: return result of "getBasicScopeNames" when the api has
		// changed to not return iterators
		List<String> result = new ArrayList<String>();
		Iterator<String> it = scope.getBasicScopeNames(IBroadcastScope.TYPE);
		while (it.hasNext()) {
			result.add(it.next());
		}
		return result;
	}

	/** {@inheritDoc} */
	public boolean unregisterBroadcastStream(IScope scope, String name) {
		boolean status = false;
		synchronized (scope) {
			IBasicScope basicScope = scope.getBasicScope(IBroadcastScope.TYPE,
					name);
			if (basicScope instanceof IBroadcastScope) {
				scope.removeChildScope(basicScope);
				status = true;
			}
		}
		return status;
	}

	/**
	 * Gets the stream file.
	 * 
	 * @param scope the scope
	 * @param name the name
	 * 
	 * @return the stream file
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private File getStreamFile(IScope scope, String name) throws IOException {
		IStreamableFileFactory factory = (IStreamableFileFactory) ScopeUtils
				.getScopeService(scope, IStreamableFileFactory.class);
		if (name.indexOf(':') == -1 && name.indexOf('.') == -1) {
			// Default to .flv files if no prefix and no extension is given.
			name = "flv:" + name;
		}
		log.info("getStreamFile null check - factory: " + factory + " name: "
				+ name);
		for (IStreamableFileService service : factory.getServices()) {
			if (name.startsWith(service.getPrefix() + ':')) {
				name = service.prepareFilename(name);
				break;
			}
		}

		IStreamFilenameGenerator filenameGenerator = (IStreamFilenameGenerator) ScopeUtils
				.getScopeService(scope, IStreamFilenameGenerator.class,
						DefaultStreamFilenameGenerator.class);

		String filename = filenameGenerator.generateFilename(scope, name,
				GenerationType.PLAYBACK);
		File file;
		if (filenameGenerator.resolvesToAbsolutePath()) {
			file = new File(filename);
		} else {
			file = scope.getContext().getResource(filename).getFile();
		}
		return file;

	}

}
