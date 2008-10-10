/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.presentation.model.vo
{
	
	import mx.collections.ICollectionView;
	import mx.collections.ArrayCollection;
	import mx.collections.IViewCursor;
	
	/**
	 * This class represents a SlidesDeck, a collection of Slide object 
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	
	[Bindable]
	public class SlidesDeck
	{	
		public var name : String;
		public var title : String;
		public var slides : ArrayCollection;
		public var selected : int;

		private var slide : Slide;
		
		private var defaultSlide : DefaultSlide = new DefaultSlide();
		
		/**
		 * 
		 * @param presentation
		 * 
		 */		
		public function SlidesDeck(presentation : Object = null)
		{
			slides = new ArrayCollection();
			if (presentation != null)
			{
				fill(presentation);
			}
		}
		
		public function fill(presentation : Object):void
		{
			this.name = presentation.id;
			this.title = presentation.description;
			this.selected = 0;
			
			trace("Presentation: name=[" + name + "] title=[" + title + "]");
			
			if (presentation.slide == null) {
				trace("Presentation: slide = null");
				return;
			}

			if (presentation.slide.length == null) {
 				trace("Presentation: slidesName = [" + presentation.slide.name + "]");
				trace("Presentation: slidesName = [" + presentation.slide.source + "]");				
				
				slide = new Slide(presentation.slide);
				slides.addItem(slide);
			} else {
				trace("Presentation: slides = [" + presentation.slide.length + "]");
			
				for (var i:int=0; i < presentation.slide.length; i++)
				{
					trace("Creating slide[" + i + "]");
			
					slide = new Slide(presentation.slide[i]);
					slides.addItem(slide);
				}				
			}			
		}
		
		public function displayDefaultSlide() : void
		{
			slides.removeAll();
			slides.addItem(defaultSlide);
		}
	}
}