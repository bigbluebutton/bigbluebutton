<%@ page session="false" %>
<html>

<head>
<script type='text/javascript' src='/fileupload/dwr/interface/UploadMonitor.js'></script>
<script type='text/javascript' src='/fileupload/dwr/engine.js'></script>
<script type='text/javascript' src='/fileupload/dwr/util.js'></script>

<script type='text/javascript'>
function progressDone()
{
 
 UploadMonitor.getUpdate("85101");
 dwr.engine.setActiveReverseAjax(true);
}
</script>
</head>

<body>

<p>
<table border="1" cellspacing="0" cellpadding="5">
<form action="fileUpload" method="post" encType="multipart/form-data">
  <tr><td width="10%">Conference Room:</td><td><input type="text" name="room"><br></td></tr>
  <tr><td>Presentation</td><td><input type="file" name="pres"><br></td></tr>
  <tr><td colspan="2"><input type="submit" value="Upload image"></td></tr>
</form>
</table>
</p>

<p><span id="response"></span></p>
<p><input type='button' onclick='progressDone()' value='Test'/></p>


</body>

</html>
