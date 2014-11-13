package org.bigbluebutton.clientcheck.model
{
	import mx.collections.ArrayCollection;

	import spark.collections.Sort;
	import spark.collections.SortField;

	public class DataProvider implements IDataProvider
	{
		private var _dataProvider:ArrayCollection = new ArrayCollection;

		public function addData(obj:Object):void
		{
			_dataProvider.addItem(obj);
		}

		public function getData():ArrayCollection
		{
			return _dataProvider;
		}

		private function sortData():void
		{
			var itemSortField:SortField = new SortField();
			var statusSortField:SortField = new SortField();
			itemSortField.name = "Item";
			statusSortField.name = "Status";
			var dataSort:Sort = new Sort();
			dataSort.fields = [statusSortField, itemSortField];
			_dataProvider.sort = dataSort;
			_dataProvider.refresh();
		}

		public function updateData(obj:Object):void
		{
			var i:int = 0;

			while (i < _dataProvider.length && _dataProvider.getItemAt(i).Item != obj.Item) i++;

			if (_dataProvider.getItemAt(i).Item == obj.Item)
			{
				_dataProvider.removeItemAt(i);
				_dataProvider.addItemAt(obj, i);
			}
			else trace("Something is missing at MainViewMediator's initDataProvider");

			sortData();
		}

		public function getAllDataAsString():String {
			var data:String="";

			for (var i:int=0; i < _dataProvider.length; i++)
			{
				data += _dataProvider.getItemAt(i).Item + "  :  " + _dataProvider.getItemAt(i).Result + "  :  " + _dataProvider.getItemAt(i).Status + "\n";
			}

			return data;
		}
	}
}
