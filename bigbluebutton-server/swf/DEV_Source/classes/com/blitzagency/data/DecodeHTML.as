class com.blitzagency.data.DecodeHTML 
{
// Constants:
	public static var CLASS_REF = com.blitzagency.data.DecodeHTML;
// Public Properties:
// Private Properties:
	private static var strings:Array;
	private static var configured:Boolean = config();

// Initialization:
	public function DecodeHTML() {}
	
	private static function config():Boolean
	{
		_global.HTMLDecode = DecodeHTML;
		
		strings = new Array
		(
			{
				from:"&lt;", to:"<"
			},
			{
				from:"&gt;", to:">"
			},
			{
				from:"&apos;", to:"'"
			},
			{
				from:"&quot;", to:"\""
			},
			{
				from:"&amp;", to:"&"
			},
			{
				from:"<a href", to:"<link><a href"
			},
			{
				from:"</a>", to:"</a></link>"
			}
		)
		return true;
	}

// Public Methods:
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
			//strings.push(p_strings[i]);
		}
	}
	
	public static function decode(str:String)
	{
		for(var i:Number=0;i<strings.length;i++)
		{
			str = str.split(strings[i].from).join(strings[i].to);
		}
		
		return str;
	}
// Semi-Private Methods:
// Private Methods:

}