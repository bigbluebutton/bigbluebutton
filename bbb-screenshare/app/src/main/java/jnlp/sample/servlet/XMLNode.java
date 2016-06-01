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

import java.io.PrintWriter;
import java.io.StringWriter;

/** Class that contains information about an XML Node
 */
public class XMLNode {
    private boolean _isElement;     // Element/PCTEXT
    private String _name;
    private XMLAttribute _attr;
    private XMLNode _parent;  // Parent Node
    private XMLNode _nested;  // Nested XML tags
    private XMLNode _next;    // Following XML tag on the same level

    /** Creates a PCTEXT node */
    public XMLNode(String name) {
        this(name, null, null, null);
        _isElement = false;
    }

    /** Creates a ELEMENT node */
    public XMLNode(String name, XMLAttribute attr) {
        this(name, attr, null, null);
    }

    /** Creates a ELEMENT node */
    public XMLNode(String name, XMLAttribute attr, XMLNode nested, XMLNode next) {
        _isElement = true;
        _name = name;
        _attr = attr;
        _nested = nested;
        _next = next;
        _parent = null;
    }

    public String getName()  { return _name; }
    public XMLAttribute getAttributes() { return _attr; }
    public XMLNode getNested() { return _nested; }
    public XMLNode getNext() { return _next; }
    public boolean isElement() { return _isElement; }

    public void setParent(XMLNode parent) { _parent = parent; }
    public XMLNode getParent() { return _parent; }

    public void setNext(XMLNode next)     { _next = next; }
    public void setNested(XMLNode nested) { _nested = nested; }

    public boolean equals(Object o) {
        if (o == null || !(o instanceof XMLNode)) return false;
        XMLNode other = (XMLNode)o;
        boolean result =
            match(_name, other._name) &&
            match(_attr, other._attr) &&
            match(_nested, other._nested) &&
            match(_next, other._next);
        return result;
    }

    public String getAttribute(String name) {
        XMLAttribute cur = _attr;
        while(cur != null) {
            if (name.equals(cur.getName())) return cur.getValue();
            cur = cur.getNext();
        }
        return "";
    }

    private static boolean match(Object o1, Object o2) {
        if (o1 == null) return (o2 == null);
        return o1.equals(o2);
    }

    public void printToStream(PrintWriter out) {
        printToStream(out, 0);
    }

    public void printToStream(PrintWriter out, int n) {
        if (!isElement()) {
            out.print(_name);
        } else {
            if (_nested == null) {
                String attrString = (_attr == null) ? "" : (" " + _attr.toString());
                lineln(out, n, "<" + _name + attrString + "/>");
            } else {
                String attrString = (_attr == null) ? "" : (" " + _attr.toString());
                lineln(out, n, "<" + _name + attrString + ">");
                _nested.printToStream(out, n + 1);
                if (_nested.isElement()) {
                    lineln(out, n, "</" + _name + ">");
                } else {
                    out.print("</" + _name + ">");
                }
            }
        }
        if (_next != null) {
            _next.printToStream(out, n);
        }
    }

    private static void lineln(PrintWriter out, int indent, String s) {
        out.println("");
        for(int i = 0; i < indent; i++) {
            out.print("  ");
        }
        out.print(s);
    }

    public String toString() {
        StringWriter sw = new StringWriter(1000);
        PrintWriter pw = new PrintWriter(sw);
        printToStream(pw);
        pw.close();
        return sw.toString();
    }
}
