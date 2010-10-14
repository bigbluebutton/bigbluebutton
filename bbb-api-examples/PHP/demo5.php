<?php
/*
Copyright 2010 BigBlueButton 

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

Versions:
   1.0  --  Initial version written by DJP
                   (email: djp [a t ]  architectes DOT .org)
   1.1  --  Updated by Omar Shammas
                    (email : omar DOT shammas [a t ] g m ail DOT .com)

*/

require('bbb_api.php');
require('bbb_api_conf.php'); //enter the salt, and url in this file

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
<?php
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


			//Calls endMeeting on the bigbluebutton server
			$response = BigBlueButton::createMeetingArray($_REQUEST['username'], $meetingID, null, "mp", "ap", $salt, $url, "http://bigbluebutton.org");
			
			//Analyzes the bigbluebutton server's response
			if(!$response){//If the server is unreachable
				echo '<div class="updated"><p><strong>Unable to join the meeting. Please check the url of the bigbluebutton server AND check to see if the bigbluebutton server is running.</strong></p></div>';
				//return;
			}
			else if( $response['returncode'] == 'FAILED' ) { //The meeting was not created
				if($response['messageKey'] == 'checksumError'){
					echo '<div class="updated"><p><strong>A checksum error occured. Make sure you entered the correct salt.</strong></p></div>';
					//return;
				}
				else{
					echo '<div class="updated"><p><strong>'.$response['message'].'</strong></p></div>';
					//return;
				}
			}
			else{ //The meeting was created, and the user will now be joined
				$bbb_joinURL = BigBlueButton::joinURL($meetingID, $_REQUEST['username'],"mp", $salt, $url);
			}

			/*
			 * We're going to extract the meetingToken to enable others to join as viewers
			 */
			 

			$inviteURL = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'].'?action=invite&meetingID='.urlencode($meetingID);
			$step = 2;
		}
		break;
	case 'invite':
		/*
		 * We have an invite to an active meeting. Ask the person for their name so they can join.
		 */
		if (trim($_REQUEST['meetingID']))
		{
			$step = 3;
		}
		break;
	case 'enter':
		/*
		 * The user is now attempting to join the meeting
		 */
		if (trim($_REQUEST['username'])&& trim($_REQUEST['meetingID'])){
			$bbb_joinURL = BigBlueButton::joinURL($_REQUEST['meetingID'], $_REQUEST['username'],"ap", $salt, $url);
			//$joinURL = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'].'?action=join&username='.urlencode($_REQUEST['username']).'&meetingToken='.urlencode($_REQUEST['meetingToken']);

			if (BigBlueButton::isMeetingRunning( $_REQUEST['meetingID'], $url, $salt ))
			{
			?>
			<script language="javascript" type="text/javascript">
			  window.location.href="<?php echo $bbb_joinURL;?>";
			</script>
			<?php
			}
			else
			{
				/*
				 * The meeting has not yet started, so check until we get back the status that the meeting is running
				 */
				$step = 4;

				$checkMeetingStatus = BigBlueButton::getMeetingInfoURL( $_REQUEST['meetingID'], 'mp', $url, $salt );
			}
		}
		else if (!$_REQUEST['username']){
			$msg = "You must enter your name.";
			$step = 3;
		}
		break;
	case 'isMeetingRunning':
		/*
		 * This function proxy the request "isMeetingRunning" through PHP Script to BBB Server so we don't have any AJAX security issue
		 */
		ob_clean();
		$checkMeetingStatus = BigBlueButton::isMeetingRunningURL( $_REQUEST['meetingID'], $url, $salt );
		echo file_get_contents($checkMeetingStatus);
		die;
		break;
	case 'join':
		/*
		 * We have an invite request to join an existing meeting and the meeting is running
		 * We don't need to pass a meeting description as it's already been set by the first time the meeting was created.
		 */
		$bbb_joinURL = BigBlueButton::joinURL($_REQUEST['meetingID'], $_REQUEST['username'],"ap", $salt, $url);
			?>
			<script language="javascript" type="text/javascript">window.location.href="<?php echo $bbb_joinURL;?>";</script>
			<?php
		break;
	default:
		break;
}

switch ($step)
{
	case '1':
		include('demo_header.php');
		?>
		<h2>Demo #5: Create Your Own Meeting</h2>
		
		<form name="form1" method="get">
			<table cellspacing="7" cellpadding="7">
				<tr>
					<td><strong>Step 1</strong></td>
				</tr>
				<tr>
					<td>
						Enter your name: 
					</td>
					<td>
						<input type="text"	name="username" />
						<input type="hidden" name="action" value="create"/>
					</td>
				</tr>
				<tr>
					<td></td>
					<td>
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
		<?php
		break;
	case '2':
		include('demo_header.php');
		?>
		<h2><strong><?php echo $meetingID; ?></strong> has been created.</h2>
		
		<p>
			<strong>Step 2. </strong> Invite others using the following link: <a href="<?php echo $inviteURL;?>"><?php echo $inviteURL;?></a>
		</p>
		<p><strong>Step 3. </strong> Click the following link to start your meeting:
			<a href="<?php echo $bbb_joinURL; ?>">Start Meeting</a>
		</p>
		<?php
		break;
		
	case '3':
		?>
		<hr />
		<h2>Invite</h2>
		<?php
			if($msg) echo '<p style="color:red;"><strong>'.$msg.'</strong></p>';
		?>
		
		<form name="form3" method="get">
			<table cellspacing="7" cellpadding="7">
				<tr>
					<td colspan=2>You have been invited to join <strong><?php echo $_REQUEST['meetingID'];?></strong>.</td>
				</tr>
				<tr>
					<td width="50%">
						Enter your name: 
					</td>
					<td>
						<input type="text" name="username" /><br />
						<input type="hidden" name="meetingID" value="<?php echo $_REQUEST['meetingID'];?>" />
						<input type="hidden" name="action" value="enter" />
					</td>
				</tr>
				<tr>
					<td></td>
					<td>
						<input type="submit" value="Join" />
					</td>
				<tr>
			</table>
		</form>
		<?php
		break;
	case '4':		
		//$checkMeetingStatus = BigBlueButton::getUrlOfRunningMeeting($_REQUEST['meetingID'], $url, $salt );
		?>		
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
		<script type="text/javascript" src="<?php echo 'heartbeat.js'; ?>"></script>
		<script type="text/javascript" src="<?php echo 'md5.js'; ?>"></script>
		<script type="text/javascript" src="<?php echo 'jquery.xml2json.js'; ?>"></script>
		<script type="text/javascript">
			$(document).ready(function(){
				$.jheartbeat.set({
					url: 'check.php?meetingID=<?php echo urlencode(trim($_REQUEST['meetingID'])); ?>'
					delay: 5000
				}, function () {
				mycallback();
				});
			});


			function mycallback() {
				// Not elegant, but works around a bug in IE8
				var isMeetingRunning = ($("#HeartBeatDIV").text().search("true") > 0 );

				if (isMeetingRunning) {
					window.location = "<?php echo $bbb_joinURL; ?>";
				}
			}
		</script>
		<hr />
		<h2><strong><?php echo $_REQUEST['meetingID'];?></strong> has not yet started.</h2>
		<table>
			<tbody>
				<tr>
					<td>
						<p>Hi <?php echo $_REQUEST['username'];?>,</p>
						<p>Now waiting for the moderator to start the meeting.</p>
						<br />
						<img align="center" src="<?php echo 'polling.gif'; ?>" />
						<br />
						<p>(Your browser will automatically refresh and join the meeting when it starts.)</p>
					</td>
				</tr>
			</tbody>
		</table>
		
		
		
		<?php
		break;
}

include('demo_footer.php');
?>
</body>
</html>