/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.common.toaster.effects {
	import flash.geom.Point;

	import mx.effects.Effect;

	import org.bigbluebutton.common.toaster.message.ToastMessageBase;

	public interface IToasterEffectDescriptor {
		function getAddedEffect(toastMessage:ToastMessageBase):Effect;
		function getMoveToStackTopEffect(toastMessage:ToastMessageBase, moveFrom:Point, moveTo:Point):Effect;
		function getMoveToStackBottomEffect(toastMessage:ToastMessageBase, moveTo:Point):Effect;
		function getRemovedEffect(toastMessage:ToastMessageBase, moveTo:Point):Effect;
	}
}
