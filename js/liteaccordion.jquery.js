/*************************************************
*
*	project:  	liteAccordion - horizontal accordion plugin for jQuery
*	author:   	Nicola Hibbert
*	url:	  	http://nicolahibbert.com/horizontal-accordion-jquery-plugin
*	demo:	  	http://www.nicolahibbert.com/demo/liteAccordion
*
*	Version:  	0.1.0
*	Copyright: 	(c) 2010-2011 Nicola Hibbert
*
/*************************************************/
;(function($) {
	
	$.fn.liteAccordion = function(options) {
		
		// defaults
		var defaults = {
			containerWidth : 960,
			containerHeight : 320,
			headerWidth : 48,
			
			firstSlide : 1, 
			onActivate : function() {},
			slideSpeed : 800,
			slideCallback : function() {},			
			
			autoPlay : false, 
			cycleSpeed : 6000,

			theme : 'basic', // basic, light*, dark, stitch*
			rounded : false,
			enumerateSlides : false
		},
		
		// merge defaults with options in new settings object				
			settings = $.extend({}, defaults, options),
	
		// define key variables
			$accordion = this,
			$slides = $accordion.find('li'),
			slideLen = $slides.length,
			slideWidth = settings.containerWidth - (slideLen * settings.headerWidth),
			$header = $slides.children('h2'),
			playing,
			
		// core utility and animation methods
			utils = {
				getGroup : function(pos, index) {		
					if (this.offsetLeft === pos.left) {
						return $header.slice(index + 1, slideLen).filter(function() { return this.offsetLeft === $header.index(this) * settings.headerWidth });
					} else if (this.offsetLeft === pos.right) {
						return $header.slice(0, index + 1).filter(function() { return this.offsetLeft === slideWidth + ($header.index(this) * settings.headerWidth) });	
					} 					
				},
				nextSlide : function() {
					var currentSlide = settings.firstSlide;

					// get index of next slide
					return function(num) {
						// pass in (zero based!) index of slide from click event
						if (num && typeof num === 'number') {
							currentSlide = num;
						}	

						// using eq to filter so needs to be zero indexed (i.e. don't add 1)
						return currentSlide++ % slideLen;
					}
				},
				play : function(clicked) {
					var getNext = utils.nextSlide(), // gogo gadget closure!
						start = function() {
							$header.eq(getNext(clicked)).click();
						};
					
					playing = setInterval(start, settings.cycleSpeed);			
				},
				pause : function() {
					clearInterval(playing);
				}
			};		
		
		// set container heights, widths, theme & corner style
		$accordion
			.height(settings.containerHeight)
			.width(settings.containerWidth)
			.addClass(settings.theme)
			.addClass(settings.rounded && 'rounded');
		
		// set tab width, height and selected class
		$header
			.width(settings.containerHeight)
			.height(settings.headerWidth)
			.eq(settings.firstSlide - 1).addClass('selected');
		
		// set initial positions for each slide
		$header.each(function(index) {
			var $this = $(this),
				left = index * settings.headerWidth;
				
			if (index >= settings.firstSlide) {
				left += slideWidth;
			} 
			
			$this
				.css('left', left)
				.next()
					.width(slideWidth)
					.css({ left : left, paddingLeft : settings.headerWidth });
			
			// add number to bottom of tab
			settings.enumerateSlides && $this.append('<b>' + (index + 1) + '</b>');			

		});
				
		// bind event handler for activating slides
		$header.click(function(e) {
			var $this = $(this),
				index = $header.index($this),
				pos = {
					left : index * settings.headerWidth,
					right : index * settings.headerWidth + slideWidth
				}, 
				newPos,
				$group = utils.getGroup.call(this, pos, index); 

			// stop animation on click
			if (playing && e.originalEvent) {
				utils.pause();
			}
			
			// activate onclick callback with slide div as context	
			settings.onActivate.call($slides.eq(index));

			// set animation direction
			if (this.offsetLeft === pos.left) {
				newPos = slideWidth;
			} else if (this.offsetLeft === pos.right) {
				newPos = -slideWidth;
			}

			// check if animation in progress
			if (!$header.is(':animated')) {
				
				// remove, then add selected class
				$header.removeClass('selected').filter($this).addClass('selected');
				
				// get group of tabs & animate
				$group
					.add($group.next())
					.animate({
						left : '+=' + newPos
					}, settings.slideSpeed, function() { return settings.slideCallback.call($slides.eq(index)) });	
				}
		});
								
		// start autoplay, call utils with no args = start from firstSlide
		settings.autoPlay && utils.play();
		
		return $accordion;
		
	};
	
})(jQuery);