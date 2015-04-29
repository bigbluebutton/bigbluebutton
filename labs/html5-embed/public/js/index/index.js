/**
 * Validates form and input for data
 * @param  {[type]} form   [description]
 * @param  {[type]} input1 [description]
 * @param  {[type]} input2 [description]
 * @return {[type]}        [description]
 */
function validateForm(form, input1, input2) {
	var x = document.forms[form][input].value;
	var y = document.forms[form][input2].value;
	if (x == null || x == "") {
		alert("Please enter a username");
		return false;
	}
	if (y == null || y == "") {
		alert("Please enter a meeting ID");
		return false;
	}
}
