package org.red5.server.messaging;

// TODO: Auto-generated Javadoc
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

/**
 * Common interface for all messages.
 * <p>Structure of messages is designed according to
 * JMS Message interface. Message is composed of header and body.
 * Header contains commonly used pre-defined headers
 * and extensible headers.</p>
 * 
 * <p>Each message has correlation ID that is never used so far and is subject to be removed in future.</p>
 * 
 * <p>Message has type and number of properties.</p>
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IMessage {
    
    /**
     * Return message id.
     * 
     * @return           Message id
     */
    String getMessageID();

    /**
     * Setter for new message id.
     * 
     * @param id        Message id
     */
	void setMessageID(String id);

    /**
     * Return correlation id.
     * 
     * @return         Correlation id
     */
	String getCorrelationID();

    /**
     * Setter for correlation id.
     * 
     * @param id       Correlation id
     */
	void setCorrelationID(String id);

    /**
     * Return message type.
     * 
     * @return            Message type
     */
	String getMessageType();

    /**
     * Setter for message type.
     * 
     * @param type        Message type
     */
	void setMessageType(String type);

    /**
     * Getter for boolean property.
     * 
     * @param name     Boolean property name
     * 
     * @return         Boolean property
     */
	boolean getBooleanProperty(String name);

    /**
     * Add boolean property to message.
     * 
     * @param name    Boolean property name
     * @param value    Boolean property value
     */
    void setBooleanProperty(String name, boolean value);

    /**
     * Add byte property to message.
     * 
     * @param name     Byte property name
     * 
     * @return         Byte property value
     */
	byte getByteProperty(String name);

    /**
     * Add byte property to message.
     * 
     * @param name     Byte property name
     * @param value    Byte property value
     */
	void setByteProperty(String name, byte value);

    /**
     * Return double property by name.
     * 
     * @param name     Double property name
     * 
     * @return         Double property value
     */
	double getDoubleProperty(String name);

    /**
     * Add double property to message.
     * 
     * @param name     Double property name
     * @param value    Double property value
     */
	void setDoubleProperty(String name, double value);

    /**
     * Return float property by name.
     * 
     * @param name     Float property name
     * 
     * @return         Float property value
     */
	float getFloatProperty(String name);

    /**
     * Add float property to message.
     * 
     * @param name     Float property name
     * @param value    Float property value
     */
	void setFloatProperty(String name, float value);

    /**
     * Return int property by name.
     * 
     * @param name     Int property name
     * 
     * @return         Int property value
     */
	int getIntProperty(String name);

    /**
     * Add int property to message.
     * 
     * @param name     Int property name
     * @param value    Int property value
     */
	void setIntProperty(String name, int value);

    /**
     * Return long property to message.
     * 
     * @param name     Long property name
     * 
     * @return         Long property value
     */
	long getLongProperty(String name);

    /**
     * Add long property to message.
     * 
     * @param name     Long property name
     * @param value    Long property value
     */
	void setLongProperty(String name, long value);

    /**
     * Return short property to message.
     * 
     * @param name     Short property name
     * 
     * @return         Short property value
     */
	short getShortProperty(String name);

    /**
     * Add short property to message.
     * 
     * @param name     Short property name
     * @param value    Short property value
     */
	void setShortProperty(String name, short value);

    /**
     * Return string property to message.
     * 
     * @param name     String property name
     * 
     * @return         String property value
     */
	String getStringProperty(String name);

    /**
     * Add string property to message.
     * 
     * @param name     String property name
     * @param value    String property value
     */
	void setStringProperty(String name, String value);

    /**
     * Return object property to message.
     * 
     * @param name     Object property name
     * 
     * @return         Object property value
     */
	Object getObjectProperty(String name);

    /**
     * Add object property to message.
     * 
     * @param name     Object property name
     * @param value    Object property value
     */
	void setObjectProperty(String name, Object value);
}
