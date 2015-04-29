<html>
<head>
	<meta http-equiv="Content-type" content="text/html; charset=utf-8">
	<title>bbb-api-php</title>
	<link type="text/css" rel="stylesheet" href="css/main.css">
</head>

<body id="index" onload="">
<div id="main">
<h1>PHP API Examples for Big Blue Button</h1>
<p>This page includes basic documentation, and links to sample pages that use the Big Blue Button API via a PHP bridge. You can read this page and also inspect the included files to see how it works. Original documentation for the base Big Blue Button API itself can be found at the following URL:</p><p><a href="http://code.google.com/p/bigbluebutton/wiki/API">http://code.google.com/p/bigbluebutton/wiki/API</a></p>

<div id="TOC">
<div id="tocheader">Table of Contents</div>
<ul>
<li><b>Administration Methods</b></li>
	<ul>
	<li><a href="#createameeting">Create a Meeting</a></li>
	<li><a href="#joinameeting">Join a Meeting</a></li>
	<li><a href="#endameeting">End a Meeting</a></li>
	</ul>
<li><b>Monitoring Methods</b></li>
	<ul>
	<li><a href="#ismeetingrunning">Is Meeting Running</a></li>
	<li><a href="#getmeetings">Get Meetings</a></li>
	<li><a href="#getmeetinginfo">Get Meeting Info</a></li>
	</ul>
<li><b>Recording Methods</b></li>
	<ul>
	<li><a href="#getrecordings">Get Recordings</a></li>
	<li><a href="#publishrecordings">Publish Recordings</a></li>
	<li><a href="#deleterecordings">Delete Recordings</a></li>
	</ul>
</ul>
</div>

<h2>Install and Configuration</h2>
<dl>
<dt>Install</dt><dd>Stick the entire <b>/bbb-api-php</b> directory somewhere that you can host php web files. You need to enable the 'allow_url_fopen' to 'On' in your php.ini file so these examples can work. Simply add/replace to your php.ini file: allow_url_fopen = On.</dd>
<dt>Configuration</dt><dd>Define your Big Blue Button server URL and SALT in the configuration file located at <b>/bbb-api-php/includes/config.php</b>.</dd>
<dt>Usage and Customization</dt><dd>After defining your BBB server URL and SALT in the config file, read this page and click on the links to the examples for each method below. You can either modify the included files directly until they do what you need, or you can create your own custom app using the code in these examples to get started.</dd>
<dt>Web Framework Integration</dt><dd>You can integrate this code into a web framework like Zend Framework. Just stick the /includes/bbb-api.php file in Zend's library directory so it is included in your app. You can put then move the BBB server URL and SALT values into your app's config file and call those values from the bbb-api.php file. Last, add logic like you see in the examples below into your controllers and forms.</dd>
</dl>

<h2>Big Blue Button PHP API Usage</h2>

<h3>Administration Methods</h3>
<dl>
	
<a name="createameeting">&nbsp;</a>
<dt>Create a Meeting</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">createMeetingWithXmlResponseArray($creationParams)</span></p></div>
<p>To create a meeting, require the bbb-api.php file, then instatiate the BigBlueButton class in your code.</p>
<div class="code"><pre>
require_once('../includes/bbb-api.php'); //Make this match your actual path the bbb-api.php file.
$bbb = new BigBlueButton();
</pre></div>
<p>Set your meeting values in the creationParams array. (You'll probably grab these from a user-submitted form in real life.) Note that meetingId and meetingName are required. The rest are optional. In the example below, we set attendeePw to be "pw" and moderatorPw to be "mp". This facilititates accessing information about this meeting later by passing matching values. In real code, you'd use PHP to generate random values for those passwords and then store them in your code to access later.</p>
<div class="code"><pre>
$creationParams = array(
	'meetingId' => '1234',			// REQUIRED
	'meetingName' => 'Test Meeting Name',	// REQUIRED
	'attendeePw' => 'ap',		// Match this value in getJoinMeetingURL() to join as attendee.
	'moderatorPw' => 'mp',		// Match this value in getJoinMeetingURL() to join as moderator.
	'welcomeMsg' => '',		// ''= use default. Change to customize.
	'dialNumber' => '',		// The main number to call into. Optional.
	'voiceBridge' => '12345',	// 5 digit PIN to join voice bridge.  Required.
	'webVoice' => '',		// Alphanumeric to join voice. Optional.
	'logoutUrl' => '',		// Default in bigbluebutton.properties. Optional.
	'maxParticipants' => '-1',	// Optional. -1 = unlimitted. Not supported in BBB. [number]
	'record' => 'false',		// New. 'true' will tell BBB to record the meeting.
	'duration' => '0',		// Default = 0 which means no set duration in minutes. [number]
	//'meta_category' => '',	// Use to pass additional info to BBB server. See API docs.
);
</pre></div>
<p>Finally, create the meeting by calling the createMeetingWithXmlResponse method and passing it your desired parameters that you set up in the creationParams array. $result will be an array that contains the XML response from your Big Blue Button server.</p>
<div class="code"><pre>
$result = $bbb->createMeetingWithXmlResponseArray($creationParams);
</pre></div>
<p>That's it. As you can see in the examples, you can add additional code to handle errors and exceptions or do other things as needed. The rest of the methods work basically the same way. You can view the source in the examples or in the bbb-api.php file to see which parameters to pass to the methods.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/createMeeting.php">Create a meeting</a> with a meetingId of '1234' and a meetingName of 'Test Meeting Name' now.</p>
<p><b>Learn more</b>: Read the source code in <b>examples/createMeeting.php</b>.</p>
</div>
</dd>


<a name="joinameeting">&nbsp;</a>
<dt>Join a Meeting</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">getJoinMeetingURL($joinParams)</span></p></div>
<p>Note that this method does not return an XML response from the BBB server. Instead it returns the URL that people can use to join a meeting. You can send this URL to people in an email, or write your code to automatically redirect them there depending on your needs.</p>
<p>Note that when testing, you must create the '1234' meeting using the createMeetingWithXmlResponseArray method above before you can successfully join it.</p>
<div class="example">
<p><b>Try it out</b>:<br /><a href="examples/getJoinMeetingUrlModerator.php">Get the URL</a> to join a meeting with a meetingId of '1234' as a Moderator now.<br />
<a href="examples/getJoinMeetingUrlAttendee.php">Get the URL</a> to join a meeting with a meetingId of '1234' as an Attendee now.</p>
<p><b>Learn more</b>: Read the source code in <b>examples/getJoinMeetingUrlModerator.php</b> and <br /> <b>examples/getJoinMeetingUrlModerator.php</b>.</p>
<p><b>Bonus</b>: <a href="examples/joinIfRunning.php">Join only once running</a> a meeting with a meetingId of '1234' as an Attendee now. This page shows one way to keep the user on a spinner page until the meeting is started by the moderator. You can inspect the code in <b>/bbb-api-php/examples/joinIfRunning.php</b> to learn more about this.</p>
</div>
</dd>


<a name="endameeting">&nbsp;</a>
<dt>End a Meeting</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">endMeetingWithXmlResponseArray($endParams)</span></p></div>
<p>Note that when testing, you must create and start (join as moderator) the '1234' meeting using the methods listed above before you can successfully end it.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/endMeeting.php">End a meeting</a> with a meetingId of '1234' now.</p>
<p><b>Learn more</b>: Read the source code in <b>/bbb-api-php/examples/endMeeting.php</b>.</p>
</div>
</dd>

</dl>


<h3>Monitoring Methods</h3>
<dl>

<a name="ismeetingrunning">&nbsp;</a>	
<dt>Is Meeting Running</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">isMeetingRunningWithXmlResponseArray($meetingId)</span></p></div>
<p>This method will return whether the meeting is currently running or not.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/isMeetingRunning.php">Determine if meeting is running</a> for a meeting with a meetingId of '1234' now.</p>
<p><b>Learn more</b>: Read the source code in <b>examples/isMeetingRunning.php</b>.</p>
</div>
</dd>

<a name="getmeetings">&nbsp;</a>	
<dt>Get Meetings</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">getMeetingsWithXmlResponseArray()</span></p></div>
<p>This method will retrieve a list of current meetings on the BBB server.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/getMeetings.php">Get all meetings</a> now.</p>
<p><b>Learn more</b>: Read the source code in <b>examples/getMeetings.php</b>.</p>
</div>
</dd>

<a name="getmeetinginfo">&nbsp;</a>	
<dt>Get Meeting Info</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">getMeetingInfoWithXmlResponseArray($infoParams)</span></p></div>
<p>This method will return information about a meeting.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/getMeetingInfo.php">Get meeting info</a> for a meeting with a meetingId of '1234' now.</p>
<p><b>Learn more</b>: Read the source code in <b>examples/getMeetingInfo.php</b>.</p>
</div>
</dd>


</dl>

<h3>Recording Methods</h3>
<p><b>Convenience pages for recording</b>: <a href="examples/createRecordedMeeting.php">Create a meeting</a> with 'record' set to 'true' now. This will create a 5 minute long meeting that will be recorded once you <a href="examples/getJoinMeetingUrlModeratorRecord.php">join into it as moderator and let it run</a>. (The meeting will stop after 5 minutes.). The meetingId for this recorded meeting will be <b>'12345'</b>. Once recorded, you can use the methods below to test your results. To get success with publish and delete methods, you'll need to get back a valid recordID using the getRecordingsWithXmlResponseArray() method first, and then add the recordID to the example pages for publishing and deleting recordings.
<dl>

<a name="getrecordings">&nbsp;</a>	
<dt>Get Recordings</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">getRecordingsWithXmlResponseArray($recordingParams)</span></p></div>
<p>This method will return information for specific recordings if you pass it one or more comma separated meetingIds. By default, with no meetingIds, it will list all recordings.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/getRecordings.php">Get all recordings</a> now.</p>
<p><b>Learn more</b>: Read the source code in <b>examples/getRecordings.php</b>.</p>
</div>
</dd>

<a name="publishrecordings">&nbsp;</a>	
<dt>Publish Recordings</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">publishRecordingsWithXmlResponseArray($recordingParams)</span></p></div>
<p>This method publishes/unpublishes recordings.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/publishRecordings.php">Publish recordings</a> now. (Note that you must get a valid recordID from getRecordingsWithXmlResponseArray() and enter it as the <b>$recordingParams['recordId']</b> value in <b>examples/publishRecordings.php</b> in order to get success here. The default recordID that ships in that page won't work on your server.)</p>
<p><b>Learn more</b>: Read the source code in <b>examples/publishRecordings.php</b>.</p>
</div>
</dd>

<a name="deleterecordings">&nbsp;</a>	
<dt>Delete Recordings</dt>
<dd>
<div class="method"><p>METHOD: <span class="methodname">deleteRecordingsWithXmlResponseArray($recordingParams)</span></p></div>
<p>This method deletes recordings.</p>
<div class="example">
<p><b>Try it out</b>: <a href="examples/deleteRecordings.php">Delete recordings</a> now. (Note that you must get a valid recordID from getRecordingsWithXmlResponseArray() and enter it as the <b>$recordingParams['recordId']</b> value in <b>examples/deleteRecordings.php</b> in order to get success here. The default recordID that ships in that page won't work on your server.)</p>
<p><b>Learn more</b>: Read the source code in <b>examples/deleteRecordings.php</b>.</p>
</div>
</dd>


</dl>

<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

</div>
</body>
</html>
