package org.bigbluebutton.clientcheck.model
{
	import mx.collections.ArrayCollection;

	public interface IDataProvider
	{
		function addData(obj:Object):void;
		function getData():ArrayCollection;
		function updateData(obj:Object):void;
		function getAllDataAsString():String;
	}
}
