package org.red5.io.mock;

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

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.red5.io.amf3.ByteArray;
import org.red5.io.object.BaseOutput;
import org.red5.io.object.DataTypes;
import org.red5.io.object.RecordSet;
import org.red5.io.object.Serializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

// TODO: Auto-generated Javadoc
/**
 * The Class Output.
 */
public class Output extends BaseOutput implements org.red5.io.object.Output {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(Output.class);

	/** The list. */
	protected List<Object> list;

	/**
	 * Instantiates a new output.
	 * 
	 * @param list the list
	 */
	public Output(List<Object> list) {
		super();
		this.list = list;
	}

	/** {@inheritDoc} */
    public boolean isCustom(Object custom) {
		// No custom types supported
		return false;
	}

    /** {@inheritDoc} */
    public void putString(String string) {
		list.add(string);
	}

	/** {@inheritDoc} */
    public boolean supportsDataType(byte type) {
		// does not yet support references
		return type <= DataTypes.OPT_REFERENCE;
	}

	/** {@inheritDoc} */
	public void writeBoolean(Boolean bol) {
		list.add(Byte.valueOf(DataTypes.CORE_BOOLEAN));
		list.add(bol);
	}

	/** {@inheritDoc} */
    public void writeCustom(Object custom) {
		// Customs not supported by this version
	}

	/** {@inheritDoc} */
    public void writeDate(Date date) {
		list.add(Byte.valueOf(DataTypes.CORE_DATE));
		list.add(date);
	}

	/** {@inheritDoc} */ // DONE
	public void writeNull() {
		list.add(Byte.valueOf(DataTypes.CORE_NULL));
	}

	/** {@inheritDoc} */ // DONE
	public void writeNumber(Number num) {
		list.add(Byte.valueOf(DataTypes.CORE_NUMBER));
		list.add(num);
	}

	/** {@inheritDoc} */
    public void writeReference(Object obj) {
		list.add(Byte.valueOf(DataTypes.OPT_REFERENCE));
		list.add(Short.valueOf(getReferenceId(obj)));
	}

    /** {@inheritDoc} */
	public void writeString(String string) {
		list.add(Byte.valueOf(DataTypes.CORE_STRING));
		list.add(string);
	}

	/** {@inheritDoc} */
    public void writeXML(Document xml) {
		list.add(Byte.valueOf(DataTypes.CORE_XML));
		list.add(xml);
	}

	/** {@inheritDoc} */
	public void writeArray(Collection<?> array, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_ARRAY));
		list.add(array);
	}

	/** {@inheritDoc} */
	public void writeArray(Object[] array, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_ARRAY));
		list.add(array);
	}

	/** {@inheritDoc} */
	public void writeArray(Object array, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_ARRAY));
		list.add(array);
	}

	/** {@inheritDoc} */
	public void writeMap(Map<Object, Object> map, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_MAP));
		list.add(map);
	}

	/** {@inheritDoc} */
	public void writeMap(Collection<?> array, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_MAP));
		list.add(array);
	}

	/** {@inheritDoc} */
	public void writeObject(Object object, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_OBJECT));
		list.add(object);
	}

	/** {@inheritDoc} */
	public void writeObject(Map<Object, Object> map, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_OBJECT));
		list.add(map);
	}

	/** {@inheritDoc} */
	public void writeRecordSet(RecordSet recordset, Serializer serializer) {
		list.add(Byte.valueOf(DataTypes.CORE_OBJECT));
		list.add(recordset);
	}

	/** {@inheritDoc} */
	public void writeByteArray(ByteArray array) {
		list.add(Byte.valueOf(DataTypes.CORE_BYTEARRAY));
		list.add(array);
	}
	
}
