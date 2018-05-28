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
	import mx.effects.Fade;
	import mx.effects.Move;
	import mx.effects.Parallel;
	import mx.effects.easing.Bounce;

	import org.bigbluebutton.common.toaster.message.ToastMessageBase;

	public class ToasterEffectDescriptorBase implements IToasterEffectDescriptor {
		private var _moveDuration:int = 750;

		private var _fadeDuration:int = 750;

		public function getAddedEffect(toastMessage:ToastMessageBase):Effect {
			var fadeIn:Fade = new Fade(toastMessage);
			fadeIn.alphaFrom = 0;
			fadeIn.alphaTo = 1;
			fadeIn.duration = _fadeDuration;
			return fadeIn;
		}

		public function getMoveToStackTopEffect(toastMessage:ToastMessageBase, moveFrom:Point, moveTo:Point):Effect {
			var move:Move = new Move(toastMessage);
			move.xFrom = moveFrom.x;
			move.yFrom = moveFrom.y;
			move.xTo = moveTo.x;
			move.yTo = moveTo.y;
			move.duration = _moveDuration;
			move.easingFunction = Bounce.easeOut;
			return move;
		}

		public function getMoveToStackBottomEffect(toastMessage:ToastMessageBase, moveTo:Point):Effect {
			var move:Move = new Move(toastMessage);
			move.yTo = moveTo.y < 0 ? 0 : moveTo.y;
			move.duration = _moveDuration;
			return move;
		}

		public function getRemovedEffect(toastMessage:ToastMessageBase, moveTo:Point):Effect {

			var parallel:Parallel = new Parallel(toastMessage);
			var move:Move = new Move(toastMessage);
			move.xTo = moveTo.x;
			move.yTo = moveTo.y;
			move.duration = _moveDuration;
			parallel.addChild(move);
			var fadeOut:Fade = new Fade();
			fadeOut.alphaFrom = 1;
			fadeOut.alphaTo = 0;
			fadeOut.duration = _fadeDuration;
			parallel.addChild(fadeOut);

			parallel.end();
			return parallel;
		}

	}
}
