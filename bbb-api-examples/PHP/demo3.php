<?
/*
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

*/

require('bbb_api.inc.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
<title>Create Your Own Meeting</title>

<script type="text/javascript"
	src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<script type="text/javascript" src="heartbeat.js"></script>
</head>
<body>
<br />
<?
$step = 1;
switch ($_REQUEST['action'])
{
	case 'create':
		if (trim($_REQUEST['username']))
		{
			/*
			 * This is the URL for to join the meeting as moderator
			 */
			$meetingID = $_REQUEST['username']."'s meeting";
			$joinURL = getJoinURL($_REQUEST['username'], $meetingID, "<br>Welcome to %%CONFNAME%%.<br>");

			/*
			 * We're going to extract the meetingToken to enable others to join as viewers
			 */
			$p = '|meetingToken=[^&]*|';
			preg_match_all($p, $joinURL, $matches);
			if ($matches[0] && $matches[0][0])
			{
				$meetingToken = $matches[0][0];
				$inviteURL = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'].'?action=invite&meetingID='.urlencode($meetingID).'&'.$meetingToken;
				$step = 2;
			}
			else
			 	echo 'Error: Did not find meeting token.';
		}
		break;
	case 'invite':
		/*
		 * We have an invite to an active meeting. Ask the person for their name so they can join.
		 */
		if (trim($_REQUEST['meetingID']) && trim($_REQUEST['meetingToken']))
		{
			$step = 3;
		}
		break;
	case 'enter':
		/*
		 * The user is now attempting to join the meeting
		 */
		if (trim($_REQUEST['username']) && trim($_REQUEST['meetingToken']) && trim($_REQUEST['meetingID']))
		{
			$joinURL = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'].'?action=join&username='.urlencode($_REQUEST['username']).'&meetingToken='.urlencode($_REQUEST['meetingToken']);

			if (isMeetingRunning($_REQUEST['meetingToken'], $_REQUEST['meetingID']) === true)
			{
			?>
			<script language="javascript" type="text/javascript">
			  window.location.href="<?=$joinURL?>";
			</script>
			<?
			}
			else
			{
				/*
				 * The meeting has not yet started, so check until we get back the status that the meeting is running
				 */
				$step = 4;

				$checkMeetingStatus = "?action=isMeetingRunning&meetingToken=".urlencode($_REQUEST['meetingToken']).'&meetingID='.urlencode($_REQUEST['meetingID']);
			}
		}
		break;
	case 'isMeetingRunning':
		/*
		 * This function proxy the request "isMeetingRunning" through PHP Script to BBB Server so we don't have any AJAX security issue
		 */
		ob_clean();
		$checkMeetingStatus = getURLisMeetingRunning($_REQUEST['meetingToken'], $_REQUEST['meetingID']);
		echo file_get_contents($checkMeetingStatus);
		die;
		break;
	case 'join':
		/*
		 * We have an invite request to join an existing meeting and the meeting is running
		 * We don't need to pass a meeting description as it's already been set by the first time the meeting was created.
		 */
		$joinURL = getJoinURLViewer($_REQUEST['username'], $_REQUEST['meetingToken']);
		if (substr($joinURL, 0, 7) == 'http://')
		{
			?>
	<script language="javascript" type="text/javascript">
	  window.location.href="<?=$joinURL?>";
	</script>
			<?
		}
		else
		{
			?>
	Error: getJoinURLViewer() failed
	<p><?=$joinURL?></p>
			<?
		}
		break;
	default:
		break;
}

switch ($step)
{
	case '1':
		include('demo_header.php');
		?>
		<h2>Demo #3: Create Your Own Meeting</h2>

		<form name="form1" method="get">
			<table width="600" cellspacing="20" cellpadding="20" style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);" border="3">
				<tr>
					<td width="50%">Create your own meeting.</td>
					<td width="50%">
						Step 1. Enter your name: <input type="text"	name="username" /><br />
						<input type="hidden" name="action" value="create"><br />
						<input id="submit-button" type="submit" value="Create meeting" />
					</td>
				</tr>
			</table>
		</form>
		<script>
		//
		// We could have asked the user for both their name and a meeting title, but we'll just use their name to create a title
		// We'll use JQuery to dynamically update the button
		//
		$(document).ready(function(){
			$("input[name='username']").keyup(function() {
				if ($("input[name='username']").val() == "") {
					$("#submit-button").attr('value',"Create meeting" );
				} else {
			   $("#submit-button").attr('value',"Create " +$("input[name='username']").val()+ "'s meeting" );
				}
			});
		});
		</script>
		<?
		break;
	case '2':
		?>
		<hr />
		<h2>Meeting Created</h2>
		<hr />

		<table width="800" cellspacing="20" cellpadding="20" style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);" border="3">
				<tr>
					<td width="50%" align="center"><strong><?=$meetingID?></strong> has been created.</td>
					<td width="50%">
						Step 2. Invite others using the following <a href="<?=$inviteURL?>">link</a> (shown below):
						<textarea cols="62" rows="5" name="myname" style="overflow: hidden"><?=$inviteURL?></textarea>
						Step 3. Click the following link to start your meeting:
						<p align="center"><a href="<?=$joinURL?>">Start Meeting</a></p>
					</td>
				</tr>
		</table>
		<?
		break;
	case '3':
		?>
		<hr />
		<h2>Invite</h2>
		<hr />

		<form name="form3" method="get">
			<table width="600" cellspacing="20" cellpadding="20" style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);"	border="3">
				<tr>
					<td width="50%">You have been invited to join<br /><strong><?=$_REQUEST['meetingID']?></strong>.</td>
					<td width="50%">
						Enter your name: <input type="text" name="username" /><br />
						<input type="hidden" name="meetingID" value="<?=$_REQUEST['meetingID']?>" />
						<input type="hidden" name="meetingToken" value="<?=$_REQUEST['meetingToken']?>" />
						<input type="hidden" name="action" value="enter" />
						<input type="submit" value="Join" />
					</td>
				</tr>
			</table>
		</form>
		<?
		break;
	case '4':
		?>
		<script type="text/javascript">
		$(document).ready(function(){
				$.jheartbeat.set({
				   url: "<?=$checkMeetingStatus?>",
				   delay: 5000
				}, function () {
					mycallback();
				});
				});


		function mycallback() {
			// Not elegant, but works around a bug in IE8
			var isMeetingRunning = ($("#HeartBeatDIV").text().search("true") > 0 );

			if ( isMeetingRunning) {
				window.location = "<?=$joinURL?>";
			}
		}
		</script>

		<hr />
		<h2><strong><?=$_REQUEST['meetingID']?></strong> has not yet started.</h2>
		<hr />


		<table width=600 cellspacing="20" cellpadding="20"
			style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);"
			border=3>
			<tbody>
				<tr>
					<td width="50%">
						<p>Hi <?=$_REQUEST['username']?>,</p>
						<p>Now waiting for the moderator to start <strong><?=$_REQUEST['meetingID']?></strong>.</p>
						<br />
						<p>(Your browser will automatically refresh and join the meeting when it starts.)</p>
					</td>
					<td width="50%" align="center"><img src="polling.gif"></img></td>
				</tr>
			</tbody>
		</table>
		<?
		break;
}

include('demo_footer.php');
?>
</body>
</html>