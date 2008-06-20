import com.blitzagency.data.DecodeHTML;
import org.red5.fitc.presentation.ConfigDelegate;

class com.blitzagency.data.ContentFarm {
// Constants:
	public static var CLASS_REF = com.blitzagency.data.ContentFarm;
// Public Properties:
// Private Properties:
	public static function getContent(p_location:String):String
	{
		//_global.tt("getContent", p_location);
		var content = getRawContent(p_location);
		//_global.tt("content", content);
		content = DecodeHTML.decode(content);
		//_global.tt("content", content);
		return content;
	}
	
	public static function getRawContent(p_location:String):String
	{
		_global.tt("getRawContent", p_location);
		//var content = ConfigDelegate.getContent(p_location);
		return _global.org.red5.fitc.presentation.ConfigDelegate.getContent(p_location);
		//_global.tt("getRawContent", p_location, content, _global.ConfigDelegate.getContent);
		//return content
	}

// Public Methods:
// Semi-Private Methods:
// Private Methods:

}