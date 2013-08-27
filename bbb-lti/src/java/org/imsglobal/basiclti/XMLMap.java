/**********************************************************************************
 * $URL: https://source.sakaiproject.org/svn/basiclti/trunk/basiclti-util/src/java/org/imsglobal/basiclti/XMLMap.java $
 * $Id: XMLMap.java 109505 2012-06-25 02:38:53Z csev@umich.edu $
 **********************************************************************************
 *
 * Copyright (c) 2009 IMS GLobal Learning Consortium, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License. 
 *
 **********************************************************************************/

package org.imsglobal.basiclti;

/* 
 * This is a little project I call mdom.org which stands for "Map-Dom" or "XML Doms in Maps" 
 * or "XML Documents meet Java Maps" - clearly there is homage to XPath style parsing in the
 * formation of the keys in the Maps - but XPath is not used.
 * 
 * It is my attempt to build a simple, self-contained, static class to make XML parsing 
 * REALLY simple in Java - the idea is to approximate the ease of taking apart and 
 * putting together chunks of XML in languages like Perl, Python, PHP, and Ruby.  
 * While the typed nature of Java makes it so there is a little extra syntax, it has 
 * been reduced to some pretty simple stuff with really forgiving calls.
 * 
 * This has had several names - initially it is called XMLMap - these are pre-release
 * versions ad I leave copies of this around as I move through projects and use 
 * the software.  When I get serious, I will distribute this as org.mdom.MDom and 
 * distribute it as a jar with versions and all that.
 * 
 * It is really easy to take apart XML as long as there are no repeated elements.
 * The function getMap returns a map of keys and values - the keys are the path 
 * starting at the root node of the XML and the value is the element stored inside.
 * You can get attributes as well.  This example:
 * 
 *  <a>
 *	  <b x="X">B</b>
 *	  <c>
 *	    <d>D</d>
 *	  </c>
 *  </a>
 * 
 * Map<String, String> xmlMap = XMLMap.getMap("<a><b x=\"X\">B</b><c><d>D</d></c></a>");
 * 
 * Ends up with the following in the map:
 * 
 *   /a/b!x = X
 *   /a/b = B
 *   /a/c/d = D
 *   
 * You simply use the hash get method to pull out the information.
 * 
 *   System.out.println(xmlMap.get("/a/b"))
 * 
 * Once it is parsed into the Map - everything is quick and simple.
 * 
 * Things are similar in creating XML - You make a TreeMap and put entries in using put()
 * 
 *   Map<String,String> newMap = new TreeMap<String,String>;
 *   newMap.put("/a/b!x","X");
 *   newMap.put("/a/b", "B");
 *   newMap.put("/a/b/c", "C");
 *   String newXml = XMLMap.getXML(simpleMap, true);
 *
 * Another technique is the concept of submaps - you can extract a submap from a Map and then 
 * graft it directly onto some other bit of XML.
 * 
 *  Map<String,String> subMap = XMLMap.selectSubMap(tm, "/a/c");
 *	Map<String,Object> joinedMap = new TreeMap<String,Object>();
 *	System.out.println("subMap="+subMap);
 *	joinedMap.put("/top/id", "1234");
 *	joinedMap.put("/top/fun", subMap); // Graft the map onto this node
 *	String joinedXml = XMLMap.getXML(joinedMap, true);
 *	System.out.println("joinedXML\n"+joinedXml);
 *
 * Produces this XML:
 * 
 *   <top>
 *     <fun>
 *       <d>D</d>
 *     </fun>
 *     <id>1234</id>
 *   </top>
 * 
 * The portion "below" /a/c was extracted and grafted onto the new XML at /top/fun.
 * You can mix strings and Maps in the same map and you can have maps within maps.
 * Once you switch to the Map<String,Object> you can even add an array of strings to an entry.
 * 
 *  Map<String,Object> arrayMap = new TreeMap<String,Object>();
 *	String [] strar = { "first", "second", "third" };
 *  arrayMap.put("/root/stuff", strar);
 *  String arrayXml = XMLMap.getXML(arrayMap, true);
 *  
 *  Produces:
 *  
 *  <root>
 *    <stuff>first</stuff>
 *    <stuff>second</stuff>
 *    <stuff>third</stuff>
 *  </root>
 *
 * The other major concept is how we parse XML and handle multiple items - such as in an RSS feed.
 * When faced with a string of XML where you expect to get sets of items you need to parse the XML
 * and get a "full" map - in this case, when the XMLMap parser sees multiple peer child nodes it
 * returns a List<Map<String,Object>> in the entry. This makes getting lists of Maps realy easy 
 * but can make the basic looking things up in the map a little harder.  There are two approaches to 
 * this - you can either flatten the map or use the getString method to pull out all of the strings.
 * The getString method does not "go into" any lists of maps -  flattening does flatten through 
 * lists of maps, picking the first element of each list.
 * 
 * Here is a way to look up single elements in a Full Map <String,Object>:
 * 
 *   Map<String,Object> rssFullMap = XMLMap.getFullMap(rssText);
 *   System.out.println("Rss Version="+XMLMap.getString(rssFullMap,"/rss!version"));
 *   System.out.println("Chan-title="+XMLMap.getString(rssFullMap,"/rss/channel/title"));
 *
 * Here is how you flatten the Map int a Map<String,String> and use get to lookup
 *     
 *   Map<String,String> rssStringMap = XMLMap.flattenMap(rssFullMap);
 *   System.out.println("Rss Version="+rssStringMap.get("/rss!version"));
 *   System.out.println("Chan-title="+rssStringMap.get("/rss/channel/title"));
 *   
 * Iterating through a Full Map is pretty easy:

 *   for ( Map<String,Object> rssItem : XMLMap.getList(rssFullMap,"/rss/channel/item")) {
 *      System.out.println("=== Item ===");
 *      System.out.println(" Item-title="+XMLMap.getString(rssItem, "/title"));
 *   }
 *   
 * If you have nested sets of elements - you will get back a List<Map<String,Object>> that can 
 * also be iterated.  In this example, we get a list of sites, then each site has a list of tools
 * and each tool has a list of properties.  The getList() method returns empty lists so 
 * that this code works even if the elements are not present or empty - the loops simply 
 * iterate zero times:
 *   
 *   Map<String,Object> theMap = XMLMap.getFullMap(bob);
 *   List<Map<String,Object>> theList = XMLMap.getList(theMap, "/sites/site");
 *   for ( Map<String,Object> siteMap : theList) {
 *     System.out.println("Id="+XMLMap.getString(siteMap,"/id"));
 *     for ( Map<String,Object> toolMap : XMLMap.getList(siteMap,"/tools/tool")) {
 *        System.out.println("ToolId="+XMLMap.getString(toolMap,"/toolid"));
 *        for ( Map<String,Object> property : XMLMap.getList(toolMap, "/properties/property")) {
 *       	System.out.println("key="+XMLMap.getString(property, "/key"));
 *        	System.out.println("val="+XMLMap.getString(property, "/val"));
 *        }
 *      }
 *    }
 * 
 * You can retrieve an element within a site using getString() and then iterate through the 
 * sub-elements using getList().
 * 
 * There is a convenient variation of the getList() method which takes a String which combines 
 * the making of the map and retrieving of the list is you have no other use for the map:
 * 
 *   for ( Map<String,Object> siteMap : XMLMap.getList(bob,"/sites/site")) {
 *     System.out.println("Id="+XMLMap.getString(siteMap,"/id"));
 *     ...
 *    }
 *   
 * This class has static unit tests built in and a static main that can run the sample code and produce
 * output.  This is to insure that the jar file is 100% Self-contained.
 * 
 * TO DO:
 * 
 */

import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.TreeMap;
import java.util.Iterator;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.Element;
import org.w3c.dom.Text;
import org.w3c.dom.Attr;
import org.w3c.dom.NodeList;
import org.w3c.dom.NamedNodeMap;

/**
 * a simple utility class for REST style XML
 * kind of lets us act like we are in PHP.
 */
public class XMLMap {

	private static boolean debugFlag = false;
	
	public static Map<String,String> getMap(String str)
	{
		if ( str == null ) return null;
		Document doc = documentFromString(str);
		if ( doc == null ) return null;
		return getMap(doc);
	}

	public static Map<String,String> getMap(Node doc)
	{
		Map<String,Object> tm =  getObjectMap(doc, false);
		if ( tm == null ) return null;
		return flattenMap(tm);
	}
	
	public static Map<String,String> flattenMap(Map<String,Object> theMap)
	{
		if ( theMap == null ) return null;
		// Reduce to the first column of elements for the simple return value
		TreeMap<String,String> retval = new TreeMap<String, String> ();
		Iterator<String> iter = theMap.keySet().iterator();
		while( iter.hasNext() ) {
			String key = iter.next();
			Object value = theMap.get(key);
			// No need to handle String[] - because they will not
			// be stored when doFull == false
			if ( value instanceof String ) {
				String svalue = (String) value;
				// doDebug(d,key+" = " + value);
				if ( value != null ) retval.put(key,svalue);
			}
		}
		return retval;
	}

	public static Map<String,Object> getFullMap(Node doc)
	{
		return getObjectMap(doc, true);
	}

	public static Map<String,Object> getFullMap(String str)
	{
		if ( str == null ) return null;
		Document doc = documentFromString(str);
		if ( doc == null ) return null;
		return getObjectMap(doc, true);
	}

	private static Map<String,Object> getObjectMap(Node doc, boolean doFull)
	{
		if ( doc == null ) return null;
		Map<String,Object> tm = new TreeMap<String,Object>();
		recurse(tm, "", doc, doFull,0);
		return tm;
	}

	// A Utility Method we expose so folks can reuse if they like
	public static Document documentFromString(String input)
	{
		try{
			DocumentBuilder parser = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			Document document = parser.parse(new ByteArrayInputStream(input.getBytes()));
			return document;
		} catch (Exception e) {
			return null;
		}
	}

	private static String addSlash(String path)
	{
		if ( path == null ) return "/";
		if ( path.trim().equals("/") ) return "/";
		return path + "/";
	}
	
	private static void recurse(Map<String, Object> tm, String path, Node parentNode, boolean doFull, int d) 
	{
		doDebug(d,"> recurse path="+path+" parentNode="+ nodeToString(parentNode));
		d++;

		NodeList nl = parentNode.getChildNodes();
		NamedNodeMap nm = parentNode.getAttributes();

		// Count the TextNodes
		int nodeCount = 0;
		String value = null;
		
		// Insert the text node if we find one
		if ( nl != null ) for (int i = 0; i< nl.getLength(); i++ ) {
			Node node = nl.item(i);
			if (node.getNodeType() == node.TEXT_NODE) {
				value = node.getNodeValue();
				if ( value == null ) break;
				if ( value.trim().length() < 1 ) break;
				// doDebug(d,"Adding path="+path+" value="+node.getNodeValue());
				tm.put(path,node.getNodeValue());
				break;  // Only the first one
			}
		}
		
		// Now loop through and add the attribute values 
		if ( nm != null ) for (int i = 0; i< nm.getLength(); i++ ) {
			Node node = nm.item(i);
			if (node.getNodeType() == node.ATTRIBUTE_NODE) {
				String name = node.getNodeName();
				value = node.getNodeValue();
				// doDebug(d,"ATTR "+path+"("+name+") = "+node.getNodeValue());
				if ( name == null || name.trim().length() < 1 || 
						value == null || value.trim().length() < 1 ) continue;  

				String newPath = path+"!"+name;
				tm.put(newPath,value);
			}
		}
		
		// If we are not doing the full DOM - we only traverse the first child
		// with the same name - so we use a set to record which nodes 
		// we have gone down.
		if ( ! doFull ) {
			// Now descend the tree to the next level deeper !!
			Set <String> done = new HashSet<String>();
			if ( nl != null ) for (int i = 0; i< nl.getLength(); i++ ) {
				Node node = nl.item(i);
				if (node.getNodeType() == node.ELEMENT_NODE && ( ! done.contains(node.getNodeName())) ) {
					doDebug(d,"Going down the rabbit hole path="+path+" node="+node.getNodeName());
					recurse(tm, addSlash(path)+node.getNodeName(),node,doFull,d);
					doDebug(d,"Back from the rabbit hole path="+path+" node="+node.getNodeName());
					done.add(node.getNodeName());	
				}
			}
			d--;
			doDebug(d,"< recurse path="+path+" parentNode="+ nodeToString(parentNode));
			return;
		}

		// If we are going to do the full expansion - we need to know when 
		// There are more than one child with the same name.  If there are more
		// One child, we make list of Maps.

		Map<String,Integer> childMap = new TreeMap<String,Integer>();
		if ( nl != null ) for (int i = 0; i< nl.getLength(); i++ ) {
			Node node = nl.item(i);
			if (node.getNodeType() == node.ELEMENT_NODE ) {
				Integer count = childMap.get(node.getNodeName());
				if ( count == null ) count = new Integer(0);
				count = count + 1;
				// Insert or Replace
				childMap.put(node.getNodeName(), count);
			}
		}
		
		if ( childMap.size() < 1 ) return;
		
		// Now go through the children nodes and make a List of Maps
		Iterator<String> iter = childMap.keySet().iterator();
		Map<String,List<Map<String,Object>>> nodeMap = new TreeMap<String,List<Map<String,Object>>>();
		while ( iter.hasNext() ) {
			String nextChild = iter.next();
			if ( nextChild == null ) continue;
			Integer count = childMap.get(nextChild);
			if ( count == null ) continue;
			if ( count < 2 ) continue;
			doDebug(d,"Making a List for "+nextChild);
			List<Map<String,Object>> newList = new ArrayList<Map<String,Object>>();
			nodeMap.put(nextChild,newList);
		}
		
		// Now descend the tree to the next level deeper !!
		if ( nl != null ) for (int i = 0; i< nl.getLength(); i++ ) {
			Node node = nl.item(i);
			if (node.getNodeType() == node.ELEMENT_NODE ) {
				String childName = node.getNodeName();
				if ( childName == null ) continue;
				List<Map<String,Object>> mapList = nodeMap.get(childName);
				if ( mapList == null ) {
					doDebug(d,"Going down the single rabbit hole path="+path+" node="+node.getNodeName());
					recurse(tm, addSlash(path)+node.getNodeName(),node,doFull,d);
					doDebug(d,"Back from the single rabbit hole path="+path+" node="+node.getNodeName());
				} else {
					doDebug(d,"Going down the multi rabbit hole path="+path+" node="+node.getNodeName());
					Map<String,Object> newMap = new TreeMap<String,Object>();
					recurse(newMap,"/",node,doFull,d);
					doDebug(d,"Back from the multi rabbit hole path="+path+" node="+node.getNodeName()+" map="+newMap);
					if ( newMap.size() > 0 ) mapList.add(newMap);
				}
			}
		}
		
		// Now append the multi-node maps to our current map
		Iterator<String> iter2 = nodeMap.keySet().iterator();
		while ( iter2.hasNext() ) {
			String nextChild = iter2.next();
			if ( nextChild == null ) continue;
			List<Map<String,Object>> newList = nodeMap.get(nextChild);
			if ( newList == null ) continue;
			if ( newList.size() < 1 ) continue;
			doDebug(d,"Adding sub-map name="+nextChild+" list="+newList);
			tm.put(path+"/"+nextChild, newList);
		}
		d--;
        doDebug(d,"< recurse path="+path+" parentNode="+ nodeToString(parentNode));
	}

	public static String getXML(Map tm)
	{
		Document document = getXMLDom(tm);
		if ( document == null ) return null;
		return documentToString(document, false);
	}

	public static String getXMLFragment(Map tm, boolean pretty)
	{
		String retval = getXML(tm, pretty);
		if ( retval.startsWith("<?xml") ) {
			int pos = retval.indexOf("<",1);
			if ( pos > 0 ) retval = retval.substring(pos);
		}
		return retval;
	}

	public static String getXML(Map tm, boolean pretty)
	{
		Document document = getXMLDom(tm);
		if ( document == null ) return null;
		String retval = documentToString(document, pretty);
		// Since the built in transform seems unable to indent
		// We patch it ourselves to keep from being ugly
		if ( pretty ) {
			retval = prettyPostProcess(retval);
		}
		return retval;
	}
	
	// This process a pretty print from an input string - 
	// It does it the hard way - using the methods in this class.
	// It may not be the ideal way to pretty print a XML String
	// but it is our way and we want to be D.R.Y. here...  
	// As such you may see some error messages from 
	// the XMLMap class in the pretty printing.
	public static String prettyPrint(String input)
	{
		Map<String, Object> theMap = XMLMap.getFullMap(input);
        return XMLMap.getXML(theMap, true);
	}

	private static String prettyPostProcess(String inString)
	{
		StringBuffer sb = new StringBuffer();
		int depth = 0;
		boolean newLine = false;
		for (int i=0; i<inString.length(); i++ ) 
		{
			char ch = inString.charAt(i);
			char nc = ' ';
			if ( (i+1) < inString.length() ) nc = inString.charAt(i+1);
			if ( ch == '\n' ) 
			{ 
				sb.append('\n');
				newLine = true;
				continue;
			}
			// Eat Leading whitespace
			if ( newLine && ( ch == ' ' || ch == '\t' ) ) continue; 

			// Decrement depth if the first non-space is an end-tag
			if ( ch == '<' && nc == '/' ) depth--;
			if ( newLine ) 
			{
				for (int j=0; j<depth && j < 15; j++) sb.append("  ");
				newLine = false;
			}

			// Update depth if necessary
			if ( ch == '<' && ! ( nc == '/' || nc == '?' )) depth++;

			sb.append(ch);
		}
		return sb.toString();
	}

	public static Document getXMLDom(Map tm)
	{
		if ( tm == null ) return null;
		Document document = null;

		try{
			DocumentBuilder parser = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			document = parser.newDocument();
		} catch (Exception e) {
			return null;
		}

		iterateMap(document, document.getDocumentElement(), tm, 0);
		return document;
	}

	/*  Remember that the map is a linear list of entries
    /a/b B1
    /a/c Map
         /x X1
         /y Y1
         /y!r R1
    /a/c!q Q1
    /a/d D1

    <a>
      <b>B1</b>
      <c q="Q1">
         <x>X1</x>
         <y r="R1">Y1</y>
      </c>
      <d>D1</d>
    </a>
	 */
	private static void iterateMap(Document document, Node parentNode, Map tm, int d)
	{
		doDebug(d,"> IterateMap parentNode= "+ nodeToString(parentNode));
		d++;
		Iterator iter = tm.keySet().iterator();
		while( iter.hasNext() ) {
			String key = (String) iter.next();
			if ( key == null ) continue;
			if ( ! key.startsWith("/") ) continue;  // Skip
			Object obj = tm.get(key);
			if ( obj == null ) {
				continue;
			} if ( obj instanceof String ) {
				storeInDom(document, parentNode, key, (String) obj, 0, d);
			} else if ( obj instanceof String [] ) {
				String [] strArray = (String []) obj;
				doDebug(d,"Looping through an array of length "+strArray.length);
				for(int i=0; i < strArray.length; i++ ) {
					storeInDom(document, parentNode, key, strArray[i], i, d);
				} 
			} else if ( obj instanceof Map ) {
				Map subMap = (Map) obj;
				Node startNode = getNodeAtPath(document, parentNode, key, 0, d);
				doDebug(d,"descending into Map path="+key+" startNode="+ nodeToString(startNode));
				iterateMap(document, startNode, subMap, d);
				doDebug(d,"back from descent Map path="+key+" startNode="+ nodeToString(startNode));
			} else if ( obj instanceof List ) {
				List lst = (List) obj;
				doDebug(d,"Have a list that is this long "+lst.size());
				Iterator listIter = lst.iterator();
				int newPos = 0;
				while ( listIter.hasNext() ) {
					Object listObj = listIter.next();
					doDebug(d,"Processing List element@"+newPos+" "+listObj.getClass().getName());
					if ( listObj instanceof String ) {
						storeInDom(document, parentNode, key, (String) obj, newPos, d);
						newPos++;
					} if ( listObj instanceof Map ) {
						Map subMap = (Map) listObj;
						doDebug(d,"Retrieving key from  List-Map path="+key+"@"+newPos);
						Node startNode = getNodeAtPath(document, parentNode, key, newPos, d);
						doDebug(d,"descending into List-Map path="+key+"@"+newPos+" startNode="+ nodeToString(startNode));
						iterateMap(document, startNode, subMap, d);
						doDebug(d,"back from descent List-Map path="+key+"@"+newPos+" startNode="+ nodeToString(startNode));
						newPos++;
					} else {
						System.out.println("XMLMap Encountered an object of type "+obj.getClass().getName()+" in a List which should contain only Map objects");
					}
				}
 			} else {
				doDebug(d,"Found a "+obj.getClass().getName()+" do not know how to iterate.");
			}
		}
		d--;
		doDebug(d,"< IterateMap parentNode = "+ nodeToString(parentNode));
	}

	private static void storeInDom(Document document, Node parentNode, String key, String value, int nodePos, int d)
	{
		doDebug(d,"> storeInDom"+key+"@"+ nodePos + " = " + value + " parent="+ nodeToString(parentNode));
		d++;
		if ( document == null || key == null || value == null ) return;
		if ( parentNode == null ) parentNode = document;
		doDebug(d,"parentNode I="+ nodeToString(parentNode));

		String [] newPath = key.split("/");
		doDebug(d,"newPath = "+outStringArray(newPath));
		String nodeAttr = null;
		for ( int i=1; i< newPath.length; i++ )
		{
			String nodeName = newPath[i];
			if ( i == newPath.length-1 ) {
				// doDebug(d,"Splitting !="+nodeName);
				// check to see if we have a nodename=attributename
				String [] nodeSplit = nodeName.split("!");
				if ( nodeSplit.length > 1 ) {
					nodeName = nodeSplit[0];
					nodeAttr = nodeSplit[1];
					// doDebug(d,"new nodeName="+nodeName+" nodeAttr="+nodeAttr);
				}
				parentNode = getOrAddChildNode(document, parentNode, nodeName, nodePos, d);
			} else {
				parentNode = getOrAddChildNode(document, parentNode, nodeName, 0, d);
			}
		}
		// doDebug(d,"parentNode after="+ nodeToString(parentNode));

		if ( nodeAttr != null )
		{
			if ( value!= null && parentNode instanceof Element ) 
			{
				Element element = (Element) parentNode;
				// doDebug(d,"Adding an attribute "+nodeAttr);
				element.setAttribute(nodeAttr,value);
			}
		}
		else if ( value != null ) 
		{
			Text newNode = document.createTextNode(value);
			parentNode.appendChild(newNode);
		}
		d--;
		// doDebug(d,"xml="+documentToString(document,false));
		// doDebug(d,"< storeInDom"+key+" = " + value);
	}

	// Note - sadly this does not "return" the attr name - hence we need 
	// to replicate this code in storeInDom :(
	private static Node getNodeAtPath(Document document, Node parentNode, String path, int nodePos, int d)
	{
		if ( parentNode == null ) parentNode = document;
		doDebug(d,"> getNodeAtPath path@" + nodePos + "="+path+" parentNode="+ nodeToString(parentNode));
		d++;

		String [] newPath = path.split("/");
		// doDebug(d,"newPath = "+outStringArray(newPath));
		for ( int i=1; i< newPath.length; i++ )
		{
			String nodeName = newPath[i];
			if ( i == newPath.length-1 ) {
				// doDebug(d,"Splitting !="+nodeName);
				// check to see if we have a nodename=attributename
				String [] nodeSplit = nodeName.split("!");
				if ( nodeSplit.length > 1 ) {
					nodeName = nodeSplit[0];
					// doDebug(d,"new nodeName="+nodeName);
				}
				parentNode = getOrAddChildNode(document, parentNode, nodeName, nodePos, d);
			} else {
				parentNode = getOrAddChildNode(document, parentNode, nodeName, 0, d);
			}	
		}
		d--;
		doDebug(d,"< getNodeAtPath returning="+ nodeToString(parentNode));
		return parentNode;
	}

	private static Node getOrAddChildNode(Document doc, Node parentNode, String nodeName,int whichNode, int d)
	{
		doDebug(d,"> getOrAddChildNode name="+nodeName+"@"+whichNode+" parentNode="+ nodeToString(parentNode));
		d++;
		if ( nodeName == null || parentNode == null) return null;

		// Check to see if we are somewhere in an index
		int begpos = nodeName.indexOf('[');
		int endpos = nodeName.indexOf(']');
		// doDebug(d,"Looking for bracket ipos="+begpos+" endpos="+endpos);
		if ( begpos > 0 && endpos > begpos && endpos < nodeName.length() ) {
			String indStr = nodeName.substring(begpos+1,endpos);
			doDebug(d,"Index String = "+ indStr);
			nodeName = nodeName.substring(0,begpos);
			doDebug(d,"New Nodename="+nodeName);
			Integer iVal = new Integer(indStr); 
			doDebug(d,"Integer = "+iVal);
			whichNode = iVal;
		}
		
		NodeList nl = parentNode.getChildNodes();
		int foundNodes = -1;
		if ( nl != null ) for (int i = 0; i< nl.getLength(); i++ ) {
			Node node = nl.item(i);
			// doDebug(d,"length= " +nl.getLength()+ " i="+i+" NT="+node.getNodeType());
			// doDebug(d,"searching nn="+nodeName+" nc="+node.getNodeName());
			if (node.getNodeType() == node.ELEMENT_NODE) {
				if ( nodeName.equals(node.getNodeName()) ) {
					foundNodes++;
					d--;
					doDebug(d,"< getOrAddChildNode found name="+ nodeToString(node));
					doDebug(d,"foundNodes = "+foundNodes+" looking for node="+whichNode);
					if ( foundNodes >= whichNode ) return node;
				}
			}
		}

		Element newNode = null;
		while ( foundNodes < whichNode ) {
			foundNodes++;
			doDebug(d,"Adding node at position " + foundNodes + " moving toward " + whichNode);
			if ( nodeName == null ) continue;
			newNode = doc.createElement(nodeName);
			doDebug(d,"Adding "+nodeName+" at "+ nodeToString(parentNode)+" in "+doc);
			parentNode.appendChild(newNode);
			doDebug(d,"xml="+documentToString(doc,false));
			doDebug(d,"getOrAddChildNode added newnode="+ nodeToString(newNode));
		}
		d--;
		doDebug(d,"< getOrAddChildNode added newnode="+ nodeToString(newNode));
		return newNode;
	}

	public static String outStringArray(String [] arr)
	{
		if ( arr == null ) return null;
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < arr.length; i++ ) {
			if ( i > 0 ) sb.append(" ");
			sb.append("["+i+"]=");
			sb.append(arr[i]);
		}
		return sb.toString();
	}

	public static String nodeToString(Node node)
	{
		if ( node == null ) return null;
		String retval = node.getNodeName();
		while ( (node = node.getParentNode()) != null ) {
			retval = node.getNodeName() + "/" + retval;
		}
		return "/" + retval;
	}

	// Optionally setup indenting to "pretty print"
	// Note - this is not very pretty at least in my testing - but it is better
	// than all string together
	public static String documentToString(Document document, boolean pretty)
	{
		return nodeToString(document, pretty);
	}

	// Optionally setup indenting to "pretty print"
	// Note - this is not very pretty at least in my testing - but it is better
	// than all string together
	public static String nodeToString(Node node, boolean pretty)
	{
		try {
			javax.xml.transform.Transformer tf =
				javax.xml.transform.TransformerFactory.newInstance().newTransformer();
			if ( pretty ) {
				tf.setOutputProperty(OutputKeys.INDENT, "yes");
				tf.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
			}
			ByteArrayOutputStream baStream = new ByteArrayOutputStream();
			tf.transform (new javax.xml.transform.dom.DOMSource (node),
					new javax.xml.transform.stream.StreamResult (baStream));
			return baStream.toString();
		} catch (Exception e)  {
			return null;
		}
	}

	// Someone better at Generics can yell at me as to how this should have been 
	// done to use the same code for either objects or strings.  Sorry.
	public static Map<String, String> selectSubMap(Map<String, String> sm, String selection)
	{
		if ( sm == null ) return null;
		selection = selection.trim();
		if ( badSelection(selection) ) return null;
		Map<String, String> retval = new TreeMap<String, String>();
		selectSubMap(sm, retval, null, null, selection);
		return retval;
	}

	public static Map<String, Object> selectFullSubMap(Map<String, Object> om, String selection)
	{
		if ( om == null ) return null;
		selection = selection.trim();
		if ( badSelection(selection) ) return null;
		Map<String, Object> retval = new TreeMap<String, Object>();
		selectSubMap(null, null, om, retval, selection);
		return retval;
	}

	private static boolean badSelection(String selection)
	{
		if ( selection == null ) return true;
		if ( selection.equals("/") ) return true;
		if ( selection.length() < 2 ) return true;
		if ( ! selection.startsWith("/") ) return true;
		return false;
	}

	private static void selectSubMap(Map<String, String> sm, Map<String, String> sret,
			Map<String, Object> om,  Map<String, Object> oret, String selection)
	{
		Iterator<String> iter = null;
		if ( sm != null ) {
			iter = sm.keySet().iterator();
		} else {
			iter = om.keySet().iterator();
		}

		while( iter.hasNext() ) {
			String key = iter.next();
			boolean match = false;
			String newKey = null;
			if ( key.equals(selection) ) {
				match = true;
				newKey = "/";
			} else if ( selection.endsWith("/") && key.startsWith(selection)) {
				match = true;
				newKey = key.substring(selection.length()-1);
			} else if ( key.startsWith(selection+"/") ) {
				match = true;
				newKey = key.substring(selection.length());
			} else if ( key.startsWith(selection+"!") ) {
				match = true;
				newKey = "/" + key.substring(selection.length());
			}
			if ( ! match ) continue;	
			// doDebug(d,"newKey = "+newKey);
			if ( sm != null ) {
				String value = sm.get(key);
				if ( value == null ) continue;
				sret.put(newKey,value);
				// doDebug(d,newKey+" = " + value);
			} else { 
				Object value = om.get(key);
				if ( value == null ) continue;
				oret.put(newKey,value);
				// doDebug(d,newKey+" = " + value);
			}
		}
	}

	/*
	 * Remove a submap.  Depending if the string ends ina slash - there are
	 * two behaviors.
	 * /x/y/   All of the children are removed but the node is left intact
	 * /x/y    All of the children are removed and the node itself and
	 *           any attributes are removed as well (typical case)
	 */
	public static void removeSubMap(Map tm, String selection)
	{
		if ( tm == null ) return;
		selection = selection.trim();
		if ( badSelection(selection) ) return;

		// If the selection does not end with /, generate the 
		// Attribute and children selections
		selection = selection.trim();
		String childSel = selection;
		String attrSel = selection;
		if ( ! selection.endsWith("/") ) {
			childSel = selection + "/";
			attrSel = selection + "!";
		}

		// Track what we will delete until loop is done
		Set<String> delSet = new HashSet<String>();

		Iterator iter = tm.keySet().iterator();
		while( iter.hasNext() ) {
			Object key = iter.next();
			if ( ! (key instanceof String) ) continue;
			String strKey = (String) key;
			if ( strKey.equals(selection) || strKey.startsWith(childSel) || strKey.startsWith(attrSel)) {
				delSet.add(strKey);
				// System.out.println("Deleting key="+key);
			}
		}

		// Actually remove...
		Iterator<String> setIter = delSet.iterator();
		while( setIter.hasNext() ) {
			String key = setIter.next();
			tm.remove(key);
		}
	}

	private static void doDebug(int d, String str) {
		if ( ! debugFlag ) return;
 		for(int i=0; i<d;i++) System.out.print(" ");
		System.out.println(str);
	}
	
	//  Assume the Object is a String - get it or return null if it is anything but a String
	public static String getString(Map<String,Object> theMap, String key)
	{
		if ( theMap == null ) return null;
		Object obj = theMap.get(key);
		if ( obj == null ) return null;
		if ( obj instanceof String ) return (String) obj;
		return null;
	}
	
	/* This goes to a set of nodes that are intended to be multiple nodes and returns a list whether there 
	 * are one or many nodes.
	 *
	 * <abc>
	 *   <p1s>
	 *     <p1><key>p1key</key><val>p1val</val></p1>
	 *   </p1s>
	 *   <p2s>
	 *     <p2><key>p2akey</key><val>p2aval</val></p2>
	 *     <p2><key>p2bkey</key><val>p2bval</val></p2>
	 *   </p2s>
	 * </abc>
	 * 
	 *  List<Map<String,Object>> p1s = XMLMap.getList(mnop,"/abc/p1s/p1");
	 *  List<Map<String,Object>> p2s = XMLMap.getList(mnop,"/abc/p2s/p2");
	 *  
	 *  Always return a list even if it is just an empty list so this code works:
	 *  
     *          for ( Map<String,Object> siteMap : XMLMap.getList(mnop,"/sites/site")) {
     *          	System.out.println("Site="+siteMap);
     *          }
     */
	public static List<Map<String,Object>> getList(Map<String,Object> theMap,String key)
	{
		ArrayList<Map<String, Object>> al = new ArrayList<Map<String, Object>>();
		if ( theMap == null || key == null ) return al;
		
		// If this is a nice little list of maps - we are golden - send the list back
		Object obj = theMap.get(key);
		if ( obj instanceof List ) return (List<Map<String,Object>>) obj;
		
		// We may have a single String value - we may have a single terminal value
		// perhaps with some attributes
		// <toolInstance>
		//   <tool-settings>
		//      <setting key="frameheight">1300</setting>
		//   </tool-settings>
		// </toolInstance>

		// See if there is one sub map there...
		Map<String, Object> oneMap = selectFullSubMap(theMap, key);
		// System.out.println("One submap = "+oneMap);
		if ( oneMap == null ) return al;
		
		// If the map is not empty - return am empty list 
		// rather than a one element list with an empty map
		if ( oneMap.isEmpty() ) return al;
		
		// Make a list of one submap...
		al.add(oneMap);
		return al;
	}
	
    // Note that getList with the first parameter to getList is a String, it does a 
	// getMap and then a getList   with that Map - this allows the following 
	// rather dense code:
	
	//  for ( Map<String,Object> siteMap : XMLMap.getList(xmlString,"/sites/site")) {
    
	// The long form of this looks as follows:
	
    //   Map<String,Object> theMap = XMLMap.getFullMap(xmlString);
    //   List<Map<String,Object>> theList = XMLMap.getList(theMap, "/sites/site");
    //   for ( Map<String,Object> siteMap : theList) {
    
    // The short form should only be used if this is the only time you will parse
	// to get a FullMap - otherwise - get the FullMap once and pull out the different bits
	// from the map without reparsing the xmlString.

	public static List<Map<String,Object>> getList(String xmlInput,String key)
	{
        Map<String,Object> tmpMap  = XMLMap.getFullMap(xmlInput);
        return XMLMap.getList(tmpMap,key);
	}
	
	/* 
	 * Unit Tests - Keep these public in case folks want to call them when they are
	 * only in possession of a jar file - makes the jar file a bearer instrument at
	 * the cost of some extra space.
	 */
	
	public static boolean unitTest(String xmlString, boolean doDebug)
	{

		if ( xmlString == null ) return false;
		debugFlag = doDebug;
		
		// If Debug is turned on - let the chips fly, exceptions and
		// All...
		if ( doDebug ) {
			debugFlag = true;
			String pretty1 = XMLMap.prettyPrint(xmlString);
			String pretty2 = XMLMap.prettyPrint(pretty1);
			if ( pretty1.equals(pretty2) ) return true;
			System.out.println("XMLMap - unit test failed");
			return false;
		}
		
		// For Debug off - we first try it silently and in a try/catch block
		debugFlag = false;
		try {
			String pretty1 = XMLMap.prettyPrint(xmlString);
			String pretty2 = XMLMap.prettyPrint(pretty1);
			if ( pretty1.equals(pretty2) ) return true;
		}
		catch (Throwable t) {
			// We will re-do below so folks see the trace back - 
			// in the context of debug
		}

		// If we failed - re-do it with verbose mode on
		System.out.println("XMLMap - unit test failed");
		System.out.println(xmlString);
		debugFlag = true;
		String pretty1 = XMLMap.prettyPrint(xmlString);
		System.out.println("Pretty Print Version pass 1\n"+pretty1);
		String pretty2 = XMLMap.prettyPrint(pretty1);
		System.out.println("Pretty Print Version pass 2\n"+pretty2);
		debugFlag = false;  // Always reset class-wide variable
		return false;
	}

	// Some Unit Test and sample Strings
	private static final String simpleText = "<a><b x=\"X\">B</b><c><d>D</d></c></a>";
	private static final String sitesText = "<sites> <site> <id>sue</id> </site> <site> <id>fred</id> <title>Title</title> <tools> <tool> <toolid>sakai.web.content</toolid> <properties> <property> <key>p1key</key> <val>p1val</val> </property> <property> <key>p2key</key> <val>p2val</val> </property> </properties> </tool> <tool> <toolid>sakai-wiki</toolid> <properties> <property> <key>wikikey</key> </property> </properties> </tool> <tool> <toolid>sakai-blog</toolid> </tool> </tools> </site> </sites>";
	private static final String rssText = "<rss version=\"2.0\"><channel><title>Dr-Chuck's Media</title><description>Television Shows and other media</description><link>http://www.dr-chuck.com/media.php</link><item><title>Track Days with John Merlin Williams</title><description>This film is about racing street Motorcyles.</description><link>http://www.dr-chuck.com</link></item><item><title>Motocross Racing</title><description>Dr. Chuck comes in second to last and is covered with mud.</description><link>http://www.dr-chuck.com/</link></item></channel></rss>";
    
	public static boolean allUnitTests() {
		if ( !unitTest(simpleText, false) ) return false;
		if ( !unitTest(sitesText, false) ) return false;
		if ( !unitTest(rssText, false) ) return false;
		return true;
	}
	
	public static void main(String[] args) {
		System.out.println("Running XMLMap (www.mdom.org) unit tests..");
		if ( !allUnitTests() ) return;
		System.out.println("Unit tests passed...");
		runSamples();
	}
	
	public static void runSamples() {
		System.out.println("Running XMLMap (www.mdom.org) Samples...");
		debugFlag = false;

		// Test the parsing of a Basic string Map
		Map<String, String> tm = XMLMap.getMap(simpleText);
		// System.out.println("tm="+tm);
		
		// Test the production of a basic map
		Map<String,String> simpleMap = new TreeMap<String,String>();
		simpleMap.put("/a/b!x", "X");
		simpleMap.put("/a/b", "B");
		simpleMap.put("/a/c/d", "D");
		System.out.println("simpleMap\n"+simpleMap);
		String simpleXml = XMLMap.getXML(simpleMap, true);
		System.out.println("simpleXml\n"+simpleXml);
		unitTest(simpleXml,false);
				
		// Do a select of a subMap
		Map<String,String> subMap = XMLMap.selectSubMap(tm, "/a/c");
		Map<String,Object> joinedMap = new TreeMap<String,Object>();
		System.out.println("subMap="+subMap);
		joinedMap.put("/top/id", "1234");
		joinedMap.put("/top/fun", subMap); // Graft the map onto this node
		System.out.println("joinedMap\n"+joinedMap);
		String joinedXml = XMLMap.getXML(joinedMap, true);
		System.out.println("joinedXML\n"+joinedXml);
		unitTest(joinedXml,false);
		
		// Do an Array
		Map<String,Object> arrayMap = new TreeMap<String,Object>();
		String [] arrayStr = { "first", "second", "third" };
        arrayMap.put("/root/stuff", arrayStr);
		System.out.println("arrayMap\n"+arrayMap);
		String arrayXml = XMLMap.getXML(arrayMap, true);
		System.out.println("arrayXml\n"+arrayXml);
		unitTest(arrayXml,false);

		// Make a Map that is a combination of Maps, String, and Arrays
        Map<String,Object> newMap = new TreeMap<String,Object>();

        newMap.put("/Root/milton","Root-milton");
        newMap.put("/Root/joe","Root-joe");
        
        Map<String,String> m2 = new TreeMap<String,String>();
        m2.put("/fred/a","fred-a");
        m2.put("/fred/b","fred-b");
        newMap.put("/Root/freds", m2);
        
        // Add a list of maps
        // <Root>
        //   <maps>
        //     <map>
        //       <key>key-0</key>
        //       <val>val-0</val>
        //     </map>
        //     <map>
        //       <key>key-1</key>
        //       <val>val-1</val>
        //     </map>
        //   </maps>
        // </Root>
        
        List<Map<String,String>> lm = new ArrayList<Map<String,String>>();
        Map<String,String> m3 = null;
        m3 = new TreeMap<String,String>();
        m3.put("/key","key-0");
        m3.put("/val","val-0");
        lm.add(m3);
        
        m3 = new TreeMap<String,String>();
        m3.put("/key","key-1");
        m3.put("/val","val-1");
        lm.add(m3);
        
        newMap.put("/Root/maps/map", lm);
        
        // Add an array of Strings
        // <Root>
        //   <array>first</array>
        //   <array>second</array>
        //   <array>third</array>
        // </Root>
        
        String [] strar = { "first", "second", "third" };
        newMap.put("/Root/array", strar);
        
        // Add a list of Maps - this is a bit of a weird application - mostly as a 
        // completeness test to insure lists of maps and arrays are equivalent.  Also
        // since the getFullMap returns maps, not Arrays of strings, this is necessary
        // to insure symmetry - i.e. we can take a map structure we produce and 
        // regenerate the XML.  Most users will not use this form in construction.
        //
        // <Root>
        //     <item>item-1</item>
        //     <item>item-2</item>
        // </Root>
        
        List<Map<String,String>> l1 = new ArrayList<Map<String,String>>();
        Map<String,String> m4 = new TreeMap<String,String>();
        m4.put("/", "item-1");
        l1.add(m4);
        Map<String,String> m5 = new TreeMap<String,String>();
        m5.put("/", "item-2");
        l1.add(m5);
        newMap.put("/Root/item", l1);
 
        // Put in using the XMLMap bracket Syntax - not a particularly good
        // Way to represent multiple items - it is just here for completeness.
        newMap.put("/Root/anns/ann[0]","Root-ann[0]");
        newMap.put("/Root/anns/ann[1]","Root-ann[1]");
        newMap.put("/Root/bobs/bob[0]/key","Root-bobs-bob[0]-key");
        newMap.put("/Root/bobs/bob[0]/val","Root-bobs-bob[0]-val");
        newMap.put("/Root/bobs/bob[1]/key","Root-bobs-bob[1]-key");
        newMap.put("/Root/bobs/bob[1]/val","Root-bobs-bob[1]-val");
   
        // This is not allowed because maps cannot have duplicates 
 /*       
        Map<String,String> m6 = new TreeMap<String,String>();
        m5.put("/two", "two-1");
        m5.put("/two", "two-2");
        newMap.put("/Root", m6);
  */      
        
        // Take the Map - turn it into XML and then parse the returned
        // XML into a second map - take the second map and produce more XML
        // If all goes well, the two generated blobs of XML should be the
        // same.  If anything goes wrong - we re-do it with lots of debug
        String complexXml = null;
        boolean success = false;
    	debugFlag = false;
        try {
            complexXml = XMLMap.getXML(newMap, true);
            success = true;
        } catch(Exception e) {
        	success = false;
        }
        
        // If we fail - do it again with deep levels of verbosity
        if ( success ) {
        	unitTest(complexXml,false);
        } else {
        	debugFlag = true;
        	System.out.println("\n MISMATCH AND/OR SOME ERROR HAS OCCURED - REDO in VERBODE MODE");
            System.out.println("Starting out newMap="+newMap); 
            complexXml = XMLMap.getXML(newMap, true);
        	unitTest(complexXml,false);
        	debugFlag = false;
        }
    	
        // A different example - iterating through nested sets - demonstrating the short form
        // of getSites() with the first parameter a string -the commented code below is the long form.
        
        // Map<String,Object> theMap = XMLMap.getFullMap(sitesText);
        // List<Map<String,Object>> theList = XMLMap.getList(theMap, "/sites/site");
        // for ( Map<String,Object> siteMap : theList) {
        
        // The short form using convenience method if you don't need the map for anything else
        System.out.println("\nParsing Sites Structure");
        for ( Map<String,Object> siteMap : XMLMap.getList(sitesText,"/sites/site")) {
        	System.out.println("Site="+siteMap);
        	System.out.println("Id="+XMLMap.getString(siteMap,"/id"));
            for ( Map<String,Object> toolMap : XMLMap.getList(siteMap,"/tools/tool")) {
        		System.out.println("Tool="+toolMap);
        		System.out.println("ToolId="+XMLMap.getString(toolMap,"/toolid"));
                for ( Map<String,Object> property : XMLMap.getList(toolMap, "/properties/property")) {
        			System.out.println("key="+XMLMap.getString(property, "/key"));
        			System.out.println("val="+XMLMap.getString(property, "/val"));
        		}
        	}
	    }
        
        // Lets parse some RSS as a final kind of easy but quite practical test
        debugFlag = false;
        System.out.println("\nParsing RSS Feed");
        // System.out.println(XMLMap.prettyPrint(rssText));
        Map<String,Object> rssFullMap = XMLMap.getFullMap(rssText);
        System.out.println("RSS Full Map\n"+rssFullMap);
        System.out.println("Rss Version="+XMLMap.getString(rssFullMap,"/rss!version"));
        System.out.println("Chan-desc="+XMLMap.getString(rssFullMap,"/rss/channel/description"));
        System.out.println("Chan-title="+XMLMap.getString(rssFullMap,"/rss/channel/title"));
        
        Map<String,String> rssStringMap = XMLMap.flattenMap(rssFullMap);
        System.out.println("RSS Flat String Only Map\n"+rssStringMap);
        System.out.println("Rss Version="+rssStringMap.get("/rss!version"));
        System.out.println("Chan-desc="+rssStringMap.get("/rss/channel/description"));
        System.out.println("Chan-title="+rssStringMap.get("/rss/channel/title"));

        for ( Map<String,Object> rssItem : XMLMap.getList(rssFullMap,"/rss/channel/item")) {
        	System.out.println("=== Item ===");
        	System.out.println(" Item-title="+XMLMap.getString(rssItem, "/title"));
        	System.out.println(" Item-description="+XMLMap.getString(rssItem, "/description"));
        	System.out.println(" Item-link="+XMLMap.getString(rssItem, "/link"));
        }	
	}
}

/* Sample output from test run with lines wrapped a bit:

Running XMLMap (www.mdom.org) unit tests..
Unit tests passed...
Running XMLMap (www.mdom.org) Samples...
tm={/a/b=B, /a/b!x=X, /a/c/d=D}
simpleMap
{/a/b=B, /a/b!x=X, /a/c/d=D}
simpleXml
<?xml version="1.0" encoding="UTF-8"?>
<a>
  <b x="X">B</b>
  <c>
    <d>D</d>
  </c>
</a>

subMap={/d=D}
joinedMap
{/top/fun={/d=D}, /top/id=1234}
joinedXML
<?xml version="1.0" encoding="UTF-8"?>
<top>
  <fun>
    <d>D</d>
  </fun>
  <id>1234</id>
</top>

arrayMap
{/root/stuff=[Ljava.lang.String;@6f50a8}
arrayXml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <stuff>first</stuff>
  <stuff>second</stuff>
  <stuff>third</stuff>
</root>


Parsing Sites Structure
Site={/id=sue}
Id=sue
Site={/id=fred, /title=Title, /tools/tool=[{/properties/property=[{/key=p1key, /val=p1val}, 
   {/key=p2key, /val=p2val}], /toolid=sakai.web.content}, {/properties/property/key=wikikey, 
   /toolid=sakai-wiki}, {/toolid=sakai-blog}]}

Id=fred
Tool={/properties/property=[{/key=p1key, /val=p1val}, {/key=p2key, /val=p2val}], /toolid=sakai.web.content}
ToolId=sakai.web.content
key=p1key
val=p1val
key=p2key
val=p2val
Tool={/properties/property/key=wikikey, /toolid=sakai-wiki}
ToolId=sakai-wiki
key=wikikey
val=null
Tool={/toolid=sakai-blog}
ToolId=sakai-blog

Parsing RSS Feed
RSS Full Map
{/rss!version=2.0, /rss/channel/description=Television Shows and other media, 
  /rss/channel/item=[{/description=This film is about racing street Motorcyles., 
  /link=http://www.dr-chuck.com, /title=Track Days with John Merlin Williams}, 
  {/description=Dr. Chuck comes in second to last and is covered with mud., 
  /link=http://www.dr-chuck.com/, /title=Motocross Racing}], 
  /rss/channel/link=http://www.dr-chuck.com/media.php, /rss/channel/title=Dr-Chuck's Media}
   
Rss Version=2.0
Chan-desc=Television Shows and other media
Chan-title=Dr-Chuck's Media
RSS Flat String Only Map
{/rss!version=2.0, /rss/channel/description=Television Shows and other media, 
  /rss/channel/link=http://www.dr-chuck.com/media.php, /rss/channel/title=Dr-Chuck's Media}

Rss Version=2.0
Chan-desc=Television Shows and other media
Chan-title=Dr-Chuck's Media
=== Item ===
 Item-title=Track Days with John Merlin Williams
 Item-description=This film is about racing street Motorcyles.
 Item-link=http://www.dr-chuck.com
=== Item ===
 Item-title=Motocross Racing
 Item-description=Dr. Chuck comes in second to last and is covered with mud.
 Item-link=http://www.dr-chuck.com/

 */

