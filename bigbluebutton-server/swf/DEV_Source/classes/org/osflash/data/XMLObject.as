/**
 * @author John Grden
 * @author Seth Hillinger
 * @author Chris Allen
 * @param Special thanks to Alessandro Crugnola for getting us started!
 * @version 1.1
 */
class org.osflash.data.XMLObject
{
	private static var initialized:Boolean = init();
	private static var lastObjectProcessed:Object;
	private static var strings:Array;
	
	public static function addStrings(p_strings:Array):Void
	{
		// if you have addition specialty strings to add for decoding, add them here
		// it doesn't have to be simple character conversion, it can be full phrase replacement
		// IE: lets' say you have a site for LucasArts, and every where Star Wars is mentioned, it has 
		// to be italized - you can add a string to look for it and replace it with html tags:
		// addStrings(new Array({from:"Star Wars", to:"<i>Star Wars</i>"}))
		
		for(var i:Number=0;i<p_strings.length;i++)
		{
			// in adding the new strings to the FRONT of the array, you can do things like
			// throw your tracking through this first to strip out "/" or "'"
			// if we added these to the END of the array, it would not catch them.
			strings.splice(0, 0, p_strings[i]);
		}
	}

	public static function getlastObjectProcessed():Object
	{
		return lastObjectProcessed
	}
	 
	public static function getXML(p_obj:Object, p_nodeName:String):XML
	{
		return new XML(parseObject(p_obj, p_nodeName));
	}

	public static function getObject( p_xml:XML, p_allArray:Boolean):Object
	{
		lastObjectProcessed = new Object();
		lastObjectProcessed = convertToObject(p_xml, lastObjectProcessed, p_allArray);
		return lastObjectProcessed;
	}
	
	private static function cleanObject(p_obj:Object):Object
	{
		// when XML is converted to an object, it includes a root object, pass back everything without that root
		for(var items:String in p_obj) p_obj = p_obj[items];break;
		return p_obj;
	}
	
	// called when the class first loads.  Sets the strings array for encoding
	private static function init()
	{		
		strings = new Array
		(
			{
				to:"&lt;", from:"<"
			},
			{
				to:"&gt;", from:">"
			},
			{
				to:"&apos;", from:"'"
			},
			{
				to:"&quot;", from:"\""
			},
			{
				to:"&amp;", from:"&"
			}
		)
		return true;
	}
	
	private static function parseObject(p_obj:Object, p_nodeName:String):String
	{
		// if first time this is calld there's no p_nodeName, assume root, since subsequent calls will have this argument included
		if(p_nodeName == undefined) p_nodeName = "root";
		var str = "<" + p_nodeName + ">";
		for(var items:String in p_obj)
		{
			if(typeof(p_obj[items]) == "object") 
			{
				str += parseObject(p_obj[items], items);
			}else
			{
				var nodeValue = p_obj[items]
				if(typeof(nodeValue) != "boolean" && typeof(nodeValue) != "number") nodeValue = encode(p_obj[items]);
				str += "<" + items + ">" + nodeValue + "</" + items + ">";
			}
		}
		str += "</" + p_nodeName + ">";
		return str;
	}
	
	private static function encode(p_str:String):String
	{
		for(var i:Number=0;i<strings.length;i++)
		{
			p_str = p_str.split(strings[i].from).join(strings[i].to);
		}
		if(p_str == undefined) p_str = "";
		return p_str;
	}
	
	private static function convertToObject(p_xml:XMLNode, p_parentObject:Object):Object
	{
		
		if(p_xml.hasChildNodes())
		{
			//check for identical twins (nodes with same name)
			var twins:Array = findTwins(p_xml);
			var arr:Array;
			for(var i:Number=0;i<p_xml.childNodes.length;i++)
			{
				var node:XMLNode = p_xml.childNodes[i];
				var nodeName:String = node.nodeName.split("-").join("_");
			
				// if nodeName is null, don't continue processing this node
				if(nodeName == null) continue;
				
				// setup the data
				var value = node.firstChild.nodeValue;
				// check for type Number
				if (!isNaN(value)) { value = Number(value); }
				// check for Booleans
				if (value == "true" || value == "false") value = value == "true" ? true : false;
				
				//if its a twin, its an array
				var hasTwins:Boolean = false;
				for(var j:Number=0;j<twins.length;j++)
				{
					if(nodeName == twins[j]) 
					{
						hasTwins = true;
						// flag is changed, break loop
						break;
					}
				}
				
				var obj:Object;
				if(hasTwins)
				{
					//create new array
					if(!p_parentObject[nodeName]) arr = p_parentObject[nodeName] = [];

					//push and turn array into object
					obj = arr[arr.length] = {};
					
				//create new object if not array
				}else obj = p_parentObject[nodeName] = {};
							
				//set object to value or attributes
				if(value != undefined)
				{
					//obj = value;
					if(hasTwins) p_parentObject[nodeName][arr.length-1] = value;
					else p_parentObject[nodeName] = value;
				}
				else
				{
					//set attributes			
					if(getAttributesLength(node.attributes) > 0) setAttributes(obj, node.attributes);
				}
				
				//recursion
				if(node.firstChild.hasChildNodes()) convertToObject(node, obj);
			}				
		}
		return p_parentObject;
	}
	
	private static function setAttributes(p_obj:Object, p_attributes:Object):Void
	{
		for(var items:String in p_attributes)
		{
			p_obj[items] = {};
			p_obj[items] = p_attributes[items];
		}
	}
	
	private static function findTwins(p_xml):Array{
		var twins:Array = [];
		for(var h:Number=0;h<p_xml.childNodes.length;h++)
		{
			var node_h:String = p_xml.childNodes[h].nodeName;
			for(var i:Number=h+1;i<p_xml.childNodes.length;i++)
			{
				var node_i:String = p_xml.childNodes[i].nodeName;
				if(node_i == node_h)
				{
					twins.push(node_i);
				}
			}
			
		}
		return twins;
	}
	
	private static function checkSiblingArray(p_node:XMLNode):Boolean
	{
		var checkName:String = "";
		for(var i:Number=0;i<p_node.childNodes.length;i++)
		{
			if(checkName == p_node.childNodes[i].nodeName)
			{
				return true;
				break;
			}
			checkName = p_node.childNodes[i].nodeName;
		}
		return false;
	}
	
	private static function getAttributesLength(p_attributes:Object):Number
	{
		var count:Number = 0
		for(var items:String in p_attributes) count++
		return count;
	}
}