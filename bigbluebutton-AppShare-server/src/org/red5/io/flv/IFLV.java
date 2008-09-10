package org.red5.io.flv;

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

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Map;

import org.red5.io.IStreamableFile;
import org.red5.io.ITagReader;
import org.red5.io.ITagWriter;
import org.red5.io.flv.meta.IMetaData;
import org.red5.io.flv.meta.IMetaService;
import org.red5.server.api.cache.ICacheStore;

// TODO: Auto-generated Javadoc
/**
 * Represents FLV file.
 */
public interface IFLV extends IStreamableFile {

	/**
	 * Returns a boolean stating whether the flv has metadata.
	 * 
	 * @return boolean        <code>true</code> if file has injected metadata, <code>false</code> otherwise
	 */
	public boolean hasMetaData();

	/**
	 * Sets the metadata.
	 * 
	 * @param metadata                   Metadata object
	 * 
	 * @throws FileNotFoundException     File not found
	 * @throws IOException               Any other I/O exception
	 */
	public void setMetaData(IMetaData metadata) throws FileNotFoundException,
			IOException;

	/**
	 * Sets the MetaService through Spring.
	 * 
	 * @param service                    Metadata service
	 */
	public void setMetaService(IMetaService service);

	/**
	 * Returns a map of the metadata.
	 * 
	 * @return metadata                  File metadata
	 * 
	 * @throws FileNotFoundException     File not found
	 */
	public IMetaData getMetaData() throws FileNotFoundException;

	/**
	 * Returns a boolean stating whether a flv has keyframedata.
	 * 
	 * @return boolean                   <code>true</code> if file has keyframe metadata, <code>false</code> otherwise
	 */
	public boolean hasKeyFrameData();

	/**
	 * Sets the keyframe data of a flv file.
	 * 
	 * @param keyframedata              Keyframe metadata
	 */
	public void setKeyFrameData(Map keyframedata);

	/**
	 * Gets the keyframe data.
	 * 
	 * @return keyframedata             Keyframe metadata
	 */
	public Map getKeyFrameData();

	/**
	 * Refreshes the headers. Usually used after data is added to the flv file
	 * 
	 * @throws IOException              Any I/O exception
	 */
	public void refreshHeaders() throws IOException;

	/**
	 * Flushes Header.
	 * 
	 * @throws IOException              Any I/O exception
	 */
	public void flushHeaders() throws IOException;

	/**
	 * Returns a Reader closest to the nearest keyframe.
	 * 
	 * @param seekPoint                Point in file we are seeking around
	 * 
	 * @return reader                  Tag reader closest to that point
	 */
	public ITagReader readerFromNearestKeyFrame(int seekPoint);

	/**
	 * Returns a Writer based on the nearest key frame.
	 * 
	 * @param seekPoint                Point in file we are seeking around
	 * 
	 * @return writer                  Tag writer closest to that point
	 */
	public ITagWriter writerFromNearestKeyFrame(int seekPoint);

	/**
	 * Sets the caching implemenation.
	 * 
	 * @param cache the cache
	 */
	public void setCache(ICacheStore cache);
}
