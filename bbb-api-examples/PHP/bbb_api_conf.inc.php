<?
// This is the security salt that must match the value set in the BigBlueButton server
define('SALT', '639259d4-9dd8-4b25-bf01-95f9567eaf4b');

// This is the URL for the BigBlueButton server
define('BIGBLUEBUTTONURL', 'http://192.168.7.131/bigbluebutton/');

/*
 * Note: We're hard-coding the password for moderator and attendee (viewer) for purposes of demo.
 */
define('ATTENDEEPW', 'ap');
define('MODERATORPW', 'mp');

/*
 * Is libcurl available ?
 */
if(function_exists(curl_init))
{
	function bbb_wrap_simplexml_load_file($url)
	{
		$ch = curl_init() or die ( curl_error() );
		curl_setopt( $ch, CURLOPT_URL, $url );
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
		$data = curl_exec( $ch );
		curl_close( $ch );
		return (new SimpleXMLElement($data));
	}
}
else
{
	/*
	 * REQUIREMENT - PHP.INI
	 * allow_url_fopen = On
	 */
	 function bbb_wrap_simplexml_load_file($url)
	 {
	 	return (simplexml_load_file($url));
	 }
}
?>