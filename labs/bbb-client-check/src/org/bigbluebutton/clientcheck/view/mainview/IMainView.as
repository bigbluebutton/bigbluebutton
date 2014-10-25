package org.bigbluebutton.clientcheck.view.mainview
{
	import spark.components.Button;
	import spark.components.DataGrid;
	import spark.components.BorderContainer;

	public interface IMainView
	{
		function get dataGrid():DataGrid;
		function get view():BorderContainer;
	}
}
