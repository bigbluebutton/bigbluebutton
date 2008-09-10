package org.red5.io.flv.impl;

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

import org.red5.io.BaseStreamableFileService;
import org.red5.io.IStreamableFile;
import org.red5.io.flv.IFLVService;
import org.red5.io.object.Deserializer;
import org.red5.io.object.Serializer;

// TODO: Auto-generated Javadoc
/**
 * A FLVServiceImpl sets up the service and hands out FLV objects to
 * its callers.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Dominick Accattato (daccattato@gmail.com)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 * @author Paul Gregoire, (mondain@gmail.com)
 */
public class FLVService extends BaseStreamableFileService implements
		IFLVService {

    /** Serializer. */
    private Serializer serializer;

    /** Deserializer. */
    private Deserializer deserializer;

    /** Generate FLV metadata?. */
    private boolean generateMetadata;

	/** {@inheritDoc} */
    @Override
	public String getPrefix() {
		return "flv";
	}

	/** {@inheritDoc} */
    @Override
	public String getExtension() {
		return ".flv";
	}

	/** 
     * {@inheritDoc}
	 */
	public void setSerializer(Serializer serializer) {
		this.serializer = serializer;

	}

	/** {@inheritDoc}
	 */
	public void setDeserializer(Deserializer deserializer) {
		this.deserializer = deserializer;

	}

	/** {@inheritDoc}
	 */
	@Override
	public IStreamableFile getStreamableFile(File file) throws IOException {
		return new FLV(file, generateMetadata);
	}

	/**
	 * Generate metadata or not.
	 * 
	 * @param generate  <code>true</code> if there's need to generate metadata, <code>false</code> otherwise
	 */
    public void setGenerateMetadata(boolean generate) {
		generateMetadata = generate;
	}

	/**
	 * Getter for serializer.
	 * 
	 * @return  Serializer
	 */
    public Serializer getSerializer() {
		return serializer;
	}

	/**
	 * Getter for deserializer.
	 * 
	 * @return  Deserializer
	 */
    public Deserializer getDeserializer() {
		return deserializer;
	}
}
