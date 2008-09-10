package org.red5.io.object;

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
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.BeanMap;
import org.red5.io.amf3.ByteArray;
import org.red5.io.amf3.IExternalizable;
import org.red5.io.utils.ObjectMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

// TODO: Auto-generated Javadoc
/**
 * The Serializer class writes data output and handles the data according to the
 * core data types.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class Serializer {

    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(Serializer.class);

	/**
	 * Serializes output to a core data type object.
	 * 
	 * @param out          Output writer
	 * @param any          Object to serialize
	 */
	public void serialize(Output out, Object any) {
		if (log.isDebugEnabled()) {
			log.debug("serialize");
		}
		if (any instanceof IExternalizable) {
			// Make sure all IExternalizable objects are serialized as objects
			out.writeObject(any, this);
			return;
		} else if (any instanceof ByteArray) {
			// Write ByteArray objects directly
			out.writeByteArray((ByteArray) any);
			return;
		}
		
		if (writeBasic(out, any)) {
			if (log.isDebugEnabled()) {
				log.debug("write basic");
			}
			return;
		}

		if (!writeComplex(out, any)) {
			if (log.isDebugEnabled()) {
				log.debug("Unable to serialize: " + any);
			}
		}
	}

	/**
	 * Writes a primitive out as an object.
	 * 
	 * @param out              Output writer
	 * @param basic            Primitive
	 * 
	 * @return boolean         true if object was successfully serialized, false otherwise
	 */
	protected boolean writeBasic(Output out, Object basic) {
		if (basic == null) {
			out.writeNull();
		} else if (basic instanceof Boolean) {
			out.writeBoolean((Boolean) basic);
		} else if (basic instanceof Number) {
			out.writeNumber((Number) basic);
		} else if (basic instanceof String) {
			out.writeString((String) basic);
		} else if (basic instanceof Date) {
			out.writeDate((Date) basic);
		} else {
			return false;
		}
		return true;
	}

	/**
	 * Writes a complex type object out.
	 * 
	 * @param out        Output writer
	 * @param complex    Complex datatype object
	 * 
	 * @return boolean   true if object was successfully serialized, false otherwise
	 */
	public boolean writeComplex(Output out, Object complex) {
		if (log.isDebugEnabled()) {
			log.debug("writeComplex");
		}
		if (writeListType(out, complex)) {
			return true;
		} else if (writeArrayType(out, complex)) {
			return true;
		} else if (writeXMLType(out, complex)) {
			return true;
		} else if (writeCustomType(out, complex)) {
			return true;
		} else if (writeObjectType(out, complex)) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Writes Lists out as a data type.
	 * 
	 * @param out             Output write
	 * @param listType        List type
	 * 
	 * @return boolean        true if object was successfully serialized, false otherwise
	 */
	protected boolean writeListType(Output out, Object listType) {
		if (log.isDebugEnabled()) {
			log.debug("writeListType");
		}
		if (listType instanceof List) {
			writeList(out, (List<?>) listType);
		} else {
			return false;
		}
		return true;
	}

	/**
	 * Writes a List out as an Object.
	 * 
	 * @param out             Output writer
	 * @param list            List to write as Object
	 */
	protected void writeList(Output out, List<?> list) {
		// if its a small list, write it as an array
		if (list.size() < 100) {
			out.writeArray(list, this);
			return;
		}
		// else we should check for lots of null values,
		// if there are over 80% then its probably best to do it as a map
		int size = list.size();
		int nullCount = 0;
		for (int i = 0; i < size; i++) {
			if (list.get(i) == null) {
				nullCount++;
			}
		}
		if (nullCount > (size * 0.8)) {
			out.writeMap(list, this);
		} else {
			out.writeArray(list, this);
		}
	}

	/**
	 * Writes array (or collection) out as output Arrays, Collections, etc.
	 * 
	 * @param out               Output object
	 * @param arrType           Array or collection type
	 * 
	 * @return <code>true</code> if the object has been written, otherwise
	 * <code>false</code>
	 */
	@SuppressWarnings("all")
	protected boolean writeArrayType(Output out, Object arrType) {
		if (log.isDebugEnabled()) {
			log.debug("writeArrayType");
		}
		if (arrType instanceof Collection) {
			out.writeArray((Collection<Object>) arrType, this);
		} else if (arrType instanceof Iterator) {
			writeIterator(out, (Iterator<Object>) arrType);
		} else if (arrType.getClass().isArray()
				&& arrType.getClass().getComponentType().isPrimitive()) {
			out.writeArray(arrType, this);
		} else if (arrType instanceof Object[]) {
			out.writeArray((Object[]) arrType, this);
		} else {
			return false;
		}
		return true;
	}

	/**
	 * Writes an iterator out to the output.
	 * 
	 * @param out          Output writer
	 * @param it           Iterator to write
	 */
	protected void writeIterator(Output out, Iterator<Object> it) {
		if (log.isDebugEnabled()) {
			log.debug("writeIterator");
		}
        // Create LinkedList of collection we iterate thru and write it out later
        LinkedList<Object> list = new LinkedList<Object>();
		while (it.hasNext()) {
			list.addLast(it.next());
		}
        // Write out collection
		out.writeArray(list, this);
	}

	/**
	 * Writes an xml type out to the output.
	 * 
	 * @param out          Output writer
	 * @param xml          XML
	 * 
	 * @return boolean     <code>true</code> if object was successfully written, <code>false</code> otherwise
	 */
	protected boolean writeXMLType(Output out, Object xml) {
		if (log.isDebugEnabled()) {
			log.debug("writeXMLType");
		}
        // If it's a Document write it as Document
        if (xml instanceof Document) {
            writeDocument(out, (Document) xml);
		} else {
			return false;
		}
		return true;
	}

	/**
	 * Writes a document to the output.
	 * 
	 * @param out           Output writer
	 * @param doc           Document to write
	 */
	protected void writeDocument(Output out, Document doc) {
        out.writeXML(doc);
	}

	/**
	 * Write typed object to the output.
	 * 
	 * @param out           Output writer
	 * @param obj           Object type to write
	 * 
	 * @return <code>true</code> if the object has been written, otherwise
	 * <code>false</code>
	 */
	@SuppressWarnings("all")
	protected boolean writeObjectType(Output out, Object obj) {
		if (obj instanceof ObjectMap || obj instanceof BeanMap) {
			out.writeObject((Map) obj, this);
		} else if (obj instanceof Map) {
			out.writeMap((Map) obj, this);
		} else if (obj instanceof RecordSet) {
			out.writeRecordSet((RecordSet) obj, this);
		} else {
			out.writeObject(obj, this);
		}
		return true;
	}

	// Extension points
	/**
	 * Pre processes an object
	 * TODO // must be implemented.
	 * 
	 * @param any           Object to preprocess
	 * 
	 * @return              Prerocessed object
	 */
	public Object preProcessExtension(Object any) {
		// Does nothing right now but will later
		return any;
	}

	/**
	 * Writes a custom data to the output.
	 * 
	 * @param out       Output writer
	 * @param obj       Custom data
	 * 
	 * @return <code>true</code> if the object has been written, otherwise
	 * <code>false</code>
	 */
	protected boolean writeCustomType(Output out, Object obj) {
		if (out.isCustom(obj)) {
            // Write custom data
            out.writeCustom(obj);
			return true;
		} else {
			return false;
		}
	}

}
