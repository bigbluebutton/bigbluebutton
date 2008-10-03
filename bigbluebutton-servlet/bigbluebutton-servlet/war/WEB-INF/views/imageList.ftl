<!-- imageList.ftl -->

<html>
<body>

<#list images as image>
<table border="1" cellspacing="0" cellpadding="5">
  <tr><td width="10%">Name</td><td>${image.name}&nbsp;</td></tr>
	<tr><td colspan="2"><img src="imageContent?name=${image.name}" height="100"></td></tr>
	<tr><td>Description (${image.descriptionLength})</td><td>${image.shortDescription}&nbsp;</td></tr>
</table>
<p>
</#list>

<p>
<table border="1" cellspacing="0" cellpadding="5">
<form action="imageUpload" method="post" encType="multipart/form-data">
  <tr><td width="10%">Name</td><td><input type="text" name="name"><br></td></tr>
  <tr><td>Content</td><td><input type="file" name="image"><br></td></tr>
  <tr><td>Description</td><td><textarea name="description" cols="80" rows="5"></textarea></td></tr>
  <tr><td colspan="2"><input type="submit" value="Upload image"></td></tr>
</form>
</table>

<p><a href="clearDatabase">Clear database</a>

</body>
</html>
