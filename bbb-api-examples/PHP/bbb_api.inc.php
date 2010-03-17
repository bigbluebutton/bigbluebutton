<!--

BigBlueButton - http://www.bigbluebutton.org

Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.

BigBlueButton is free software; you can redistribute it and/or modify it under the
terms of the GNU Lesser General Public License as published by the Free Software
Foundation; either version 3 of the License, or (at your option) any later
version.

BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along
with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.

Author: DJP <DJP@architectes.org>

-->
<?
require('bbb_api_conf.inc.php');

/*
 * Create a meeting and return a URL to join it as moderator
 */
function getJoinURL($username, $meetingID, $welcome = '')
{
	$base_url_create = BIGBLUEBUTTONURL."api/create?";
	$base_url_join = BIGBLUEBUTTONURL."api/join?";
	$voiceBridge = 70000 + rand(0, 9999);

	//
	// When creating a meeting, the 'name' parameter is the name of the meeting (not to be confused with
	// the username).  For example, the name could be "Fred's meeting" and the meetingID could be "ID-1234312".
	//
	// While name and meetinID could be different, we'll keep them the same.  Why?  Because calling api/create?
	// with a previously used meetingID will return same meetingToken (regardless if the meeting is running or not).
	//
	// This means the first person to call getJoinURL with meetingID="Demo Meeting" will actually create the
	// meeting.  Subsequent calls will return the same meetingToken and thus subsequent users will join the same
	// meeting.
	//
	// Note: We're hard-coding the password for moderator and attendee (viewer) for purposes of demo.
	//

	$params = 'name='.urlencode($meetingID).'&meetingID='.urlencode($meetingID).'&attendeePW='.ATTENDEEPW.'&moderatorPW='.MODERATORPW.'&voiceBridge='.$voiceBridge;
	if (trim($welcome))
		$params .= '&welcome='.urlencode($welcome);
	$xml = bbb_wrap_simplexml_load_file($base_url_create.$params.'&checksum='.sha1($params.SALT));
	if ($xml && $xml->returncode == 'SUCCESS' && $meetingToken = trim($xml->meetingToken))
	{
		$params = 'meetingToken='.$meetingToken.'&fullName='.urlencode($username).'&password='.MODERATORPW;
		return ($base_url_join.$params.'&checksum='.sha1($params.SALT));
	} else if ($xml)
		return ($xml->messageKey.' : '.$xml->message);
	else
		return ('Unable to fetch URL '.$base_url_create.$params.'&checksum='.sha1($params.SALT));
}

/*
 * getJoinURLViewer() -- Get the URL to join a meeting as viewer
 */
function getJoinURLViewer($username, $meetingToken, $welcome = '')
{
	$base_url_join = BIGBLUEBUTTONURL."api/join?";

	$params = 'meetingToken='.$meetingToken.'&fullName='.urlencode($username).'&password='.ATTENDEEPW;

	return ($base_url_join.$params.'&checksum='.sha1($params.SALT));
}

/*
 * getURLisMeetingRunning() -- return a URL that the client can use to poll for whether the given meeting is running
 * Beware : check that BIGBLUEBUTTONURL is reachable internally from your PHP Web Application Server. (Hosts, firewall...)
 */

function getURLisMeetingRunning($meetingToken, $meetingID)
{
	$base_url = BIGBLUEBUTTONURL."api/isMeetingRunning?";
	$params = 'meetingToken='.$meetingToken.'&meetingID='.urlencode($meetingID);

	return ($base_url.$params.'&checksum='.sha1($params.SALT));
}

/*
 * isMeetingRunning() -- check the BigBlueButton server to see if the meeting is running (i.e. there is someone in the meeting)
 */
function isMeetingRunning($meetingToken, $meetingID)
{
	$xml = bbb_wrap_simplexml_load_file(getURLisMeetingRunning($meetingToken, $meetingID));
	if ($xml && $xml->returncode == 'SUCCESS')
		return (($xml->running == 'TRUE')?true:false);
	else
		return (false);
}
?>