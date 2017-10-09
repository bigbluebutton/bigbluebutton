/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.main.views {
	import mx.collections.ArrayCollection;
	import mx.collections.ListCollectionView;
	import mx.controls.DataGrid;

	public class BBBDataGrid extends DataGrid {
		// This function needs to be overridden to avoid finding any
		// first comumn value that starts the typed letter.
		// It will make hotkeys work correctly gtriki (12 feb, 2017)
		override protected function findKey(eventCode:int):Boolean {
			if (eventCode >= 33 && eventCode <= 126) {
				return false;
			} else {
				return super.findKey(eventCode);
			}
		}

		public function refresh():void {
			// Store currently selected item and vertical scroll position
			var storeItemForUpdate:Object = this.selectedItem;;
			var vScroll:int = this.verticalScrollPosition;

			if (this.dataProvider && this.dataProvider is ListCollectionView) {
				(this.dataProvider as ArrayCollection).refresh();
			}

			// Restore currently selected item and vertical scroll position
			this.verticalScrollPosition = vScroll;
			this.selectedItem = storeItemForUpdate;
		}
	}
}
