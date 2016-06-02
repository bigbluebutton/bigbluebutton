/*
 * Copyright (c) 2006, 2010, Oracle and/or its affiliates. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * -Redistribution of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *
 * -Redistribution in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 * Neither the name of Oracle nor the names of contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING
 * ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * OR NON-INFRINGEMENT, ARE HEREBY EXCLUDED. SUN MICROSYSTEMS, INC. ("SUN")
 * AND ITS LICENSORS SHALL NOT BE LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING THIS SOFTWARE OR ITS
 * DERIVATIVES. IN NO EVENT WILL SUN OR ITS LICENSORS BE LIABLE FOR ANY LOST
 * REVENUE, PROFIT OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL, CONSEQUENTIAL,
 * INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS OF THE THEORY
 * OF LIABILITY, ARISING OUT OF THE USE OF OR INABILITY TO USE THIS SOFTWARE,
 * EVEN IF SUN HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 *
 * You acknowledge that this software is not designed, licensed or intended
 * for use in the design, construction, operation or maintenance of any
 * nuclear facility.
 */

package jnlp.sample.servlet;

/** Class that contains information about a specific attribute
 */
public class XMLAttribute {
    private String _name;
    private String _value;
    private XMLAttribute _next;

    public XMLAttribute(String name, String value) {
        _name = name;
        _value = value;
        _next = null;
    }

    public XMLAttribute(String name, String value, XMLAttribute next) {
        _name = name;
        _value = value;
        _next = next;
    }

    public String getName()  { return _name; }
    public String getValue() { return _value; }
    public XMLAttribute getNext() { return _next; }
    public void setNext(XMLAttribute next) { _next = next; }

    public boolean equals(Object o) {
        if (o == null || !(o instanceof XMLAttribute)) return false;
        XMLAttribute other = (XMLAttribute)o;
        return
            match(_name, other._name) &&
            match(_value, other._value) &&
            match(_next, other._next);
    }

    private static boolean match(Object o1, Object o2) {
        if (o1 == null) return (o2 == null);
        return o1.equals(o2);
    }

    public String toString() {
        if (_next != null) {
            return _name + "=\"" + _value + "\" " + _next.toString();
        } else {
            return _name + "=\"" + _value + "\"";
        }
    }
}
