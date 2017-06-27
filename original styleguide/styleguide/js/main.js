webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {global.$ = global.jQuery = __webpack_require__(2);

	// require('placeholders-2/lib/main');

	var Header = __webpack_require__(3);
	var header = new Header($('.main-header').first());

	var Lightbox = __webpack_require__(5);
	var lightbox = new Lightbox();

	var Accordion = __webpack_require__(7);
	var accordion = new Accordion();


	if($('.styleguide').length > 0){
	  $('.sg-element-wrap').each(function(){
	    var code = $(this).find('.l-grid').html();
	    $(this).data('sg-code', code);
	  });

	  var Styleguide = __webpack_require__(9);
	  var styleguide = new Styleguide();
	}

	if($('.intro-animation').length > 0){
	  var IntroAnimation = __webpack_require__(12);
	  var introAnimation = new IntroAnimation($('.intro-animation').first());
	}else{
	  $('.header-lion').show();
	  $('.l-site-width').css('visibility', 'visible');
	  $('.main-header').css('visibility', 'visible');
	  $('.mobilenav-header').css('top', 0);
	}

	var resizeEvent = document.createEvent('Event');
	resizeEvent.initEvent('windowresize', true, true);
	var timeOut = null;
	window.onresize = function() {
	  if (timeOut != null) clearTimeout(timeOut);
	  timeOut = setTimeout(function() {
	    document.dispatchEvent(resizeEvent);
	  }, 50);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mediaQuery = __webpack_require__(4);
	var $ = __webpack_require__(2);

	var Header = function($element) {
	  this.$el = $element;
	  this.init();
	};

	Header.prototype = {
	  mobileNavVisible: false,

	  init: function() {
	    var self = this;
	    self.alignContent();

	    $(document).on('click', '.js-navMainLink', function(e) {

	      if ($(this).parent().find('ul').length > 0) {
	        e.preventDefault();

	        var $ul = $(this).parent().find('ul').first();
	        if ($(this).hasClass('is-active')) {
	          self.hideSubNav($ul);
	        } else {
	          $(this).parent().parent().find('.nav-main-link').removeClass('is-active');
	          self.showSubNav($ul);
	        }
	      }
	    }).on('click', '.js-toggleMobileNav', function(e) {

	      self.toggleMobileNav();
	    }).on('click', '.js-search-show', function(e) {

	      self.showSearch();
	    }).on('click', '.js-search-close', function(e) {

	      self.hideSearch();
	    });

	    window.addEventListener('windowresize', function (e) {
	      self.alignContent();
	    }, false);

	  },
	  showSubNav: function($ul) {

	    $ul.parent().find('.nav-main-link').first().addClass('is-active');
	    if ($ul.hasClass('sec')) {
	      $('.nav-main-list.sec').removeClass('is-visible');
	      $('.nav-main-list.third').removeClass('is-visible');
	    } else if ($ul.hasClass('third')) {
	      $('.nav-main-list.third').removeClass('is-visible');
	    }
	    var h = $ul.parent().parent().height();
	    if (mediaQuery.is('mobile')) {
	      h += 30;
	    }
	    $ul.css('top', h + 'px');
	    $ul.addClass('is-visible');

	    this.alignContent();

	  },
	  hideSubNav: function($ul) {

	    $ul.parent().find('.nav-main-link').removeClass('is-active');
	    $ul.removeClass('is-visible');
	    $ul.find('.nav-main-list.is-visible').removeClass('is-visible');

	    this.alignContent();

	  },
	  alignContent: function() {
	    if (!mediaQuery.is('mobile')) {
	      var h = -15;
	      this.$el.find('.nav-main-list.is-visible').each(function(e, v) {
	        h += $(v).height();
	      });
	      h += $('.nav-wrap').height();
	      $('.content-wrap').css('margin-top', h);
	    }else{
	      $('.content-wrap').css('margin-top', '65px');
	    }

	    $('.nav-main-list.is-visible').each(function(e, v) {
	      var h = $(v).parent().parent().height();
	      if (mediaQuery.is('mobile')) {
	        h += 15;
	      }
	      $(v).css('top', h + 'px');
	    });

	  },
	  toggleMobileNav: function() {

	    // $('.content-wrap').toggleClass('mobile-hidden-translate');
	    if(!this.mobileNavVisible) {
	      $('.nav-wrap').removeClass('mobile-hidden-translate');
	      $('.mobilenav-btn').addClass('is-active');
	      this.mobileNavVisible = true;

	      $('body').append('<div class="js-toggleMobileNav mobilenav-toggleplane"></div>');
	    }else{
	      $('.nav-wrap').addClass('mobile-hidden-translate');
	      $('.mobilenav-btn').removeClass('is-active');
	      this.mobileNavVisible = false;

	      $('.mobilenav-toggleplane').remove();
	    }

	  },
	  showSearch: function() {
	    $('.search-wrap').fadeIn(400);
	    $('.search-content').hide(0).delay(400).fadeIn(600, function() {
	      $('.search-input').val('').focus();
	    });
	    // $('.nav-wrap h1').animate({'margin-left':'40px'}, 500);
	    // $('.nav-main-list.prem').delay(80).animate({'margin-left':'40px'}, 500);
	  },
	  hideSearch: function() {
	    $('.search-content').fadeOut(400);
	    $('.search-wrap').delay(400).fadeOut(600);
	    // $('.nav-main-list.prem').delay(80).animate({'margin-left':'0'}, 500);
	    // $('.nav-wrap h1').animate({'margin-left':'0'}, 500);
	  }
	};

	module.exports = Header;


/***/ },
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mediaQuery = __webpack_require__(4);
	var $ = __webpack_require__(2);
	var swipebox = __webpack_require__(6);

	var Lightbox = function($element) {
	  this.init();
	};

	Lightbox.prototype = {
	  init: function() {
	    $( '.js-lightbox' ).swipebox({
	      hideBarsDelay: 0,
	      hideBarsOnMobile: false,
	      afterOpen: function() {
	        $('#swipebox-close').addClass('icon-close2 icon-large').html('<span class="icon-label">Schliessen</span>');
	        $('#swipebox-prev').addClass('icon-left icon-large').html('<span class="icon-label">Zurück</span>');
	        $('#swipebox-next').addClass('icon-right icon-large').html('<span class="icon-label">Vorwärts</span>');
	        $('#swipebox-next, #swipebox-prev').css('background-image', '');
	      }
	    });
	  }
	};

	module.exports = Lightbox;


/***/ },
/* 6 */
/***/ function(module, exports) {

	/*! Swipebox v1.2.9 | Constantin Saguin csag.co | MIT License | github.com/brutaldesign/swipebox */

	;( function ( window, document, $, undefined ) {

	  $.swipebox = function( elem, options ) {

	    // Default options
	    var ui,
	      defaults = {
	        useCSS : true,
	        useSVG : true,
	        initialIndexOnArray : 0,
	        closeBySwipe: true,
	        hideBarsOnMobile : true,
	        hideBarsDelay : 3000,
	        videoMaxWidth : 1140,
	        vimeoColor : 'CCCCCC',
	        beforeOpen: null,
	        afterOpen: null,
	        afterClose: null,
	                loopAtEnd: false
	      },

	      plugin = this,
	      elements = [], // slides array [ { href:'...', title:'...' }, ...],
	      $elem,
	      selector = elem.selector,
	      $selector = $( selector ),
	      isMobile = navigator.userAgent.match( /(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i ),
	      isTouch = isMobile !== null || document.createTouch !== undefined || ( 'ontouchstart' in window ) || ( 'onmsgesturechange' in window ) || navigator.msMaxTouchPoints,
	      supportSVG = !! document.createElementNS && !! document.createElementNS( 'http://www.w3.org/2000/svg', 'svg').createSVGRect,
	      winWidth = window.innerWidth ? window.innerWidth : $( window ).width(),
	      winHeight = window.innerHeight ? window.innerHeight : $( window ).height(),
	      /* jshint multistr: true */
	      html = '<div id="swipebox-overlay">\
	          <div id="swipebox-slider"></div>\
	          <div id="swipebox-caption"></div>\
	          <div id="swipebox-action">\
	            <a id="swipebox-close"></a>\
	            <a id="swipebox-prev"></a>\
	            <a id="swipebox-next"></a>\
	          </div>\
	      </div>';

	    plugin.settings = {};

	        $.swipebox.close = function (){
	            ui.closeSlide();
	        };

	        $.swipebox.extend = function (){
	            return ui;
	        }

	    plugin.init = function() {

	      plugin.settings = $.extend( {}, defaults, options );

	      if ( $.isArray( elem ) ) {

	        elements = elem;
	        ui.target = $( window );
	        ui.init( plugin.settings.initialIndexOnArray );

	      } else {

	        $( document ).on( 'click', selector, function( event ) {

	          // console.log( isTouch );

	          if ( event.target.parentNode.className === 'slide current' ) {

	            return false;

	          }

	          if ( ! $.isArray( elem ) ) {
	            ui.destroy();
	            $elem = $( selector );
	            ui.actions();
	          }

	          elements = [];
	          var index , relType, relVal;

	          // Allow for HTML5 compliant attribute before legacy use of rel
	          if ( ! relVal ) {
	            relType = 'data-rel';
	            relVal  = $( this ).attr( relType );
	          }

	          if ( ! relVal ) {
	            relType = 'rel';
	            relVal = $( this ).attr( relType );
	          }

	          if ( relVal && relVal !== '' && relVal !== 'nofollow' ) {
	            $elem = $selector.filter( '[' + relType + '="' + relVal + '"]' );
	          } else {
	            $elem = $( selector );
	          }

	          $elem.each( function() {

	            var title = null,
	              href = null;

	            if ( $( this ).attr( 'title' ) ) {
	              title = $( this ).attr( 'title' );
	            }


	            if ( $( this ).attr( 'href' ) ) {
	              href = $( this ).attr( 'href' );
	            }

	            elements.push( {
	              href: href,
	              title: title
	            } );
	          } );

	          index = $elem.index( $( this ) );
	          event.preventDefault();
	          event.stopPropagation();
	          ui.target = $( event.target );
	          ui.init( index );
	        } );
	      }
	    };

	    ui = {

	      /**
	       * Initiate Swipebox
	       */
	      init : function( index ) {
	        if ( plugin.settings.beforeOpen ) {
	          plugin.settings.beforeOpen();
	        }
	        this.target.trigger( 'swipebox-start' );
	        $.swipebox.isOpen = true;
	        this.build();
	        this.openSlide( index );
	        this.openMedia( index );
	        this.preloadMedia( index+1 );
	        this.preloadMedia( index-1 );
	        if ( plugin.settings.afterOpen ) {
	          plugin.settings.afterOpen();
	        }
	      },

	      /**
	       * Built HTML containers and fire main functions
	       */
	      build : function () {
	        var $this = this, bg;

	        $( 'body' ).append( html );

	        if ( $this.doCssTrans() ) {
	          $( '#swipebox-slider' ).css( {
	            '-webkit-transition' : 'left 0.4s ease',
	            '-moz-transition' : 'left 0.4s ease',
	            '-o-transition' : 'left 0.4s ease',
	            '-khtml-transition' : 'left 0.4s ease',
	            'transition' : 'left 0.4s ease'
	          } );
	          $( '#swipebox-overlay' ).css( {
	            '-webkit-transition' : 'opacity 1s ease',
	            '-moz-transition' : 'opacity 1s ease',
	            '-o-transition' : 'opacity 1s ease',
	            '-khtml-transition' : 'opacity 1s ease',
	            'transition' : 'opacity 1s ease'
	          } );
	          $( '#swipebox-action, #swipebox-caption' ).css( {
	            '-webkit-transition' : '0.5s',
	            '-moz-transition' : '0.5s',
	            '-o-transition' : '0.5s',
	            '-khtml-transition' : '0.5s',
	            'transition' : '0.5s'
	          } );
	        }

	        if ( supportSVG && plugin.settings.useSVG === true ) {
	          bg = $( '#swipebox-action #swipebox-prev' ).css( 'background-image' );
	          bg = bg.replace( 'png', 'svg' );
	          $( '#swipebox-action #swipebox-prev,#swipebox-action #swipebox-next' ).css( {
	            'background-image' : bg
	          } );
	        }

	        if ( isMobile && plugin.settings.hideBarsOnMobile === true ) {
	          $( '#swipebox-action, #swipebox-caption' ).hide();
	        }

	        $.each( elements,  function() {
	          $( '#swipebox-slider' ).append( '<div class="slide"></div>' );
	        } );

	        $this.setDim();
	        $this.actions();

	        if ( isTouch ) {
	          $this.gesture();
	        }

	        // Devices can have both touch and keyboard input so always allow key events
	        $this.keyboard();

	        $this.animBars();
	        $this.resize();

	      },

	      /**
	       * Set dimensions depending on windows width and height
	       */
	      setDim : function () {

	        var width, height, sliderCss = {};

	        // Reset dimensions on mobile orientation change
	        if ( 'onorientationchange' in window ) {

	          window.addEventListener( 'orientationchange', function() {
	            if ( window.orientation === 0 ) {
	              width = winWidth;
	              height = winHeight;
	            } else if ( window.orientation === 90 || window.orientation === -90 ) {
	              width = winHeight;
	              height = winWidth;
	            }
	          }, false );


	        } else {

	          width = window.innerWidth ? window.innerWidth : $( window ).width();
	          height = window.innerHeight ? window.innerHeight : $( window ).height();
	        }

	        sliderCss = {
	          width : width,
	          height : height
	        };

	        $( '#swipebox-overlay' ).css( sliderCss );

	      },

	      /**
	       * Reset dimensions on window resize envent
	       */
	      resize : function () {
	        var $this = this;

	        $( window ).resize( function() {
	          $this.setDim();
	        } ).resize();
	      },

	      /**
	       * Check if device supports CSS transitions
	       */
	      supportTransition : function () {

	        var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split( ' ' ),
	          i;

	        for ( i = 0; i < prefixes.length; i++ ) {
	          if ( document.createElement( 'div' ).style[ prefixes[i] ] !== undefined ) {
	            return prefixes[i];
	          }
	        }
	        return false;
	      },

	      /**
	       * Check if CSS transitions are allowed (options + devicesupport)
	       */
	      doCssTrans : function () {
	        if ( plugin.settings.useCSS && this.supportTransition() ) {
	          return true;
	        }
	      },

	      /**
	       * Touch navigation
	       */
	      gesture : function () {

	        var $this = this,
	          distance = null,
	          vDistance = null,
	          vSwipe = false,
	          swipMinDistance = 10,
	          vSwipMinDistance = 50,
	          startCoords = {},
	          endCoords = {},

	          bars = $( '#swipebox-caption, #swipebox-action' ),
	          slider = $( '#swipebox-slider' );

	        bars.addClass( 'visible-bars' );
	        $this.setTimeout();

	        $( 'body' ).bind( 'touchstart', function( event ) {

	          $( this ).addClass( 'touching' );

	          endCoords = event.originalEvent.targetTouches[0];
	          startCoords.pageX = event.originalEvent.targetTouches[0].pageX;
	          startCoords.pageY = event.originalEvent.targetTouches[0].pageY;

	          $( '.touching' ).bind( 'touchmove',function( event ) {
	            event.preventDefault();
	            event.stopPropagation();
	            endCoords = event.originalEvent.targetTouches[0];

	            if ( plugin.settings.closeBySwipe ) {
	              vDistance = endCoords.pageY - startCoords.pageY;
	              if ( Math.abs( vDistance ) >= vSwipMinDistance || vSwipe ) {
	                var opacity = 0.75 - Math.abs(vDistance) / slider.height();

	                slider.css( { 'top': vDistance + 'px' } );
	                slider.css( { 'opacity': opacity } );

	                vSwipe = true;
	              }
	            }

	          } );

	          return false;

	        } ).bind( 'touchend',function( event ) {
	          event.preventDefault();
	          event.stopPropagation();

	          if ( plugin.settings.closeBySwipe ) {
	            if ( slider.css( 'opacity' ) <= 0.5) {
	              var vOffset = vDistance > 0 ? slider.height() : - slider.height();
	              slider.animate( { top: vOffset + 'px', 'opacity': 0 },
	                300,
	                function () {
	                  $this.closeSlide();
	                } );
	            } else {
	              slider.animate( { top: 0, 'opacity': 1 }, 300 );
	            }

	            if ( vSwipe ) {
	              vSwipe = false;
	              return;
	            }
	          }

	          distance = endCoords.pageX - startCoords.pageX;

	          if ( distance >= swipMinDistance ) {

	            // swipeLeft
	            $this.getPrev();

	          } else if ( distance <= - swipMinDistance ) {

	            // swipeRight
	            $this.getNext();

	          } else {
	            // tap
	            if ( ! bars.hasClass( 'visible-bars' ) ) {
	              $this.showBars();
	              $this.setTimeout();
	            } else {
	              $this.clearTimeout();
	              $this.hideBars();
	            }
	          }

	          $( '.touching' ).off( 'touchmove' ).removeClass( 'touching' );

	        } );

	      },

	      /**
	       * Set timer to hide the action bars
	       */
	      setTimeout: function () {
	        if ( plugin.settings.hideBarsDelay > 0 ) {
	          var $this = this;
	          $this.clearTimeout();
	          $this.timeout = window.setTimeout( function() {
	              $this.hideBars();
	            },

	            plugin.settings.hideBarsDelay
	          );
	        }
	      },

	      /**
	       * Clear timer
	       */
	      clearTimeout: function () {
	        window.clearTimeout( this.timeout );
	        this.timeout = null;
	      },

	      /**
	       * Show navigation and title bars
	       */
	      showBars : function () {
	        var bars = $( '#swipebox-caption, #swipebox-action' );
	        if ( this.doCssTrans() ) {
	          bars.addClass( 'visible-bars' );
	        } else {
	          $( '#swipebox-caption' ).animate( { top : 0 }, 500 );
	          $( '#swipebox-action' ).animate( { bottom : 0 }, 500 );
	          setTimeout( function() {
	            bars.addClass( 'visible-bars' );
	          }, 1000 );
	        }
	      },

	      /**
	       * Hide navigation and title bars
	       */
	      hideBars : function () {
	        var bars = $( '#swipebox-caption, #swipebox-action' );
	        if ( this.doCssTrans() ) {
	          bars.removeClass( 'visible-bars' );
	        } else {
	          $( '#swipebox-caption' ).animate( { top : '-50px' }, 500 );
	          $( '#swipebox-action' ).animate( { bottom : '-50px' }, 500 );
	          setTimeout( function() {
	            bars.removeClass( 'visible-bars' );
	          }, 1000 );
	        }
	      },

	      /**
	       * Animate navigation and top bars
	       */
	      animBars : function () {
	        var $this = this,
	          bars = $( '#swipebox-caption, #swipebox-action' );

	        bars.addClass( 'visible-bars' );
	        $this.setTimeout();

	        $( '#swipebox-slider' ).click( function() {
	          if ( ! bars.hasClass( 'visible-bars' ) ) {
	            $this.showBars();
	            $this.setTimeout();
	          }
	        } );

	        $( '#swipebox-action' ).hover( function() {
	          $this.showBars();
	          bars.addClass( 'visible-bars' );
	          $this.clearTimeout();

	          }, function() {
	                        if (plugin.settings.hideBarsDelay > 0){
	            bars.removeClass( 'visible-bars' );
	            $this.setTimeout();
	                        }

	          } );

	      },

	      /**
	       * Keyboard navigation
	       */
	      keyboard : function () {
	        var $this = this;
	        $( window ).bind( 'keyup', function( event ) {
	          event.preventDefault();
	          event.stopPropagation();

	          if ( event.keyCode === 37 ) {

	            $this.getPrev();

	          } else if ( event.keyCode === 39 ) {

	            $this.getNext();

	          } else if ( event.keyCode === 27 ) {

	            $this.closeSlide();

	          }
	        } );
	      },

	      /**
	       * Navigation events : go to next slide, go to prevous slide and close
	       */
	      actions : function () {
	        var $this = this,
	          action = 'touchend click'; // Just detect for both event types to allow for multi-input

	        if ( elements.length < 2 ) {

	          $( '#swipebox-prev, #swipebox-next' ).hide();

	        } else {
	          $( '#swipebox-prev' ).bind( action, function( event ) {
	            event.preventDefault();
	            event.stopPropagation();
	            $this.getPrev();
	            $this.setTimeout();
	          } );

	          $( '#swipebox-next' ).bind( action, function( event ) {
	            event.preventDefault();
	            event.stopPropagation();
	            $this.getNext();
	            $this.setTimeout();
	          } );
	        }

	        $( '#swipebox-close' ).bind( action, function() {
	          $this.closeSlide();
	        } );
	      },

	      /**
	       * Set current slide
	       */
	      setSlide : function ( index, isFirst ) {
	        isFirst = isFirst || false;

	        var slider = $( '#swipebox-slider' );

	        if ( this.doCssTrans() ) {
	          slider.css( { left : ( -index*100 )+'%' } );
	        } else {
	          slider.animate( { left : ( -index*100 )+'%' } );
	        }

	        $( '#swipebox-slider .slide' ).removeClass( 'current' );
	        $( '#swipebox-slider .slide' ).eq( index ).addClass( 'current' );
	        this.setTitle( index );

	        if ( isFirst ) {
	          slider.fadeIn();
	        }

	        $( '#swipebox-prev, #swipebox-next' ).removeClass( 'disabled' );

	        if ( index === 0 ) {
	          $( '#swipebox-prev' ).addClass( 'disabled' );
	        } else if ( index === elements.length - 1 && plugin.settings.loopAtEnd != true) {
	          $( '#swipebox-next' ).addClass( 'disabled' );
	        }
	      },

	      /**
	       * Open slide
	       */
	      openSlide : function ( index ) {
	        $( 'html' ).addClass( 'swipebox-html' );
	        if ( isTouch ) {
	          $( 'html' ).addClass( 'swipebox-touch' );
	        }
	        $( window ).trigger( 'resize' ); // fix scroll bar visibility on desktop
	        this.setSlide( index, true );
	      },

	      /**
	       * Set a time out if the media is a video
	       */
	      preloadMedia : function ( index ) {
	        var $this = this,
	          src = null;

	        if ( elements[index] !== undefined ) {
	          src = elements[index].href;
	        }

	        if ( ! $this.isVideo( src ) ) {
	          setTimeout( function() {
	            $this.openMedia( index );
	          }, 1000);
	        } else {
	          $this.openMedia( index );
	        }
	      },

	      /**
	       * Open
	       */
	      openMedia : function ( index ) {
	        var $this = this,
	          src = null;

	        if ( elements[index] !== undefined ) {
	          src = elements[index].href;
	        }

	        if (index < 0 || index >= elements.length) {
	          return false;
	        }

	        if ( ! $this.isVideo( src ) ) {
	          $this.loadMedia( src, function() {
	            $( '#swipebox-slider .slide' ).eq( index ).html( this );
	          } );
	        } else {
	          $( '#swipebox-slider .slide' ).eq( index ).html( $this.getVideo( src ) );
	        }

	      },

	      /**
	       * Set link title attribute as caption
	       */
	      setTitle : function ( index ) {
	        var title = null;

	        $( '#swipebox-caption' ).empty();

	        if ( elements[index] !== undefined ) {
	          title = elements[index].title;
	        }

	        if ( title ) {
	          $( '#swipebox-caption' ).append( title );
	        }
	      },

	      /**
	       * Check if the URL is a video
	       */
	      isVideo : function ( src ) {

	        if ( src ) {
	          if ( src.match( /youtube\.com\/watch\?v=([a-zA-Z0-9\-_]+)/) || src.match( /vimeo\.com\/([0-9]*)/ ) || src.match( /youtu\.be\/([a-zA-Z0-9\-_]+)/ ) ) {
	            return true;
	          }

	                    if (src.toLowerCase().indexOf( "swipeboxvideo=1" ) >= 0){

	                        return true;
	                    }
	        }

	      },

	      /**
	       * Get video iframe code from URL
	       */
	      getVideo : function( url ) {
	        var iframe = '',
	          youtubeUrl = url.match( /watch\?v=([a-zA-Z0-9\-_]+)/ ),
	          youtubeShortUrl = url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/),
	          vimeoUrl = url.match( /vimeo\.com\/([0-9]*)/ );
	        if ( youtubeUrl || youtubeShortUrl) {
	          if ( youtubeShortUrl ) {
	            youtubeUrl = youtubeShortUrl;
	          }
	          iframe = '<iframe width="560" height="315" src="//www.youtube.com/embed/' + youtubeUrl[1] + '" frameborder="0" allowfullscreen></iframe>';

	        } else if ( vimeoUrl ) {

	          iframe = '<iframe width="560" height="315"  src="//player.vimeo.com/video/' + vimeoUrl[1] + '?byline=0&amp;portrait=0&amp;color='+plugin.settings.vimeoColor+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';

	        }

	                if (youtubeShortUrl || youtubeShortUrl || vimeoUrl){

	                } else {
	                    iframe = '<iframe width="560" height="315" src="' + url + '" frameborder="0" allowfullscreen></iframe>';
	                }

	        return '<div class="swipebox-video-container" style="max-width:' + plugin.settings.videomaxWidth + 'px"><div class="swipebox-video">'+iframe+'</div></div>';
	      },

	      /**
	       * Load image
	       */
	      loadMedia : function ( src, callback ) {
	        if ( ! this.isVideo( src ) ) {
	          var img = $( '<img>' ).on( 'load', function() {
	            callback.call( img );
	          } );

	          img.attr( 'src', src );
	        }
	      },

	      /**
	       * Get next slide
	       */
	      getNext : function () {
	        var $this = this,
	          index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
	        if ( index+1 < elements.length ) {
	                    var src = $( '#swipebox-slider .slide' ).eq(index).contents().find("iframe").attr("src");
	                    $( '#swipebox-slider .slide' ).eq(index).contents().find("iframe").attr("src",src);
	          index++;
	          $this.setSlide( index );
	          $this.preloadMedia( index+1 );
	        } else {

	                    if (plugin.settings.loopAtEnd === true){
	                      var src = $( '#swipebox-slider .slide' ).eq(index).contents().find("iframe").attr("src");
	                      $( '#swipebox-slider .slide' ).eq(index).contents().find("iframe").attr("src",src);
	                      index = 0;
	                      $this.preloadMedia( index );
	                      $this.setSlide( index );
	                      $this.preloadMedia( index + 1 );
	                    } else {
	             $( '#swipebox-slider' ).addClass( 'rightSpring' );
	             setTimeout( function() {
	              $( '#swipebox-slider' ).removeClass( 'rightSpring' );
	             }, 500 );
	                    }
	        }
	      },

	      /**
	       * Get previous slide
	       */
	      getPrev : function () {
	        var index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
	        if ( index > 0 ) {
	                    var src = $( '#swipebox-slider .slide' ).eq(index).contents().find("iframe").attr("src");
	                    $( '#swipebox-slider .slide' ).eq(index).contents().find("iframe").attr("src",src);
	          index--;
	          this.setSlide( index );
	          this.preloadMedia( index-1 );
	        } else {
	             $( '#swipebox-slider' ).addClass( 'leftSpring' );
	                setTimeout( function() {
	              $( '#swipebox-slider' ).removeClass( 'leftSpring' );
	             }, 500 );
	                    }
	      },

	      /**
	       * Close
	       */
	      closeSlide : function () {
	        $( 'html' ).removeClass( 'swipebox-html' );
	        $( 'html' ).removeClass( 'swipebox-touch' );
	        $( window ).trigger( 'resize' );
	        this.destroy();
	      },

	      /**
	       * Destroy the whole thing
	       */
	      destroy : function () {
	        $( window ).unbind( 'keyup' );
	        $( 'body' ).unbind( 'touchstart' );
	        $( 'body' ).unbind( 'touchmove' );
	        $( 'body' ).unbind( 'touchend' );
	        $( '#swipebox-slider' ).unbind();
	        $( '#swipebox-overlay' ).remove();

	        if ( ! $.isArray( elem ) ) {
	          elem.removeData( '_swipebox' );
	        }

	        if ( this.target ) {
	          this.target.trigger( 'swipebox-destroy' );
	        }

	        $.swipebox.isOpen = false;

	        if ( plugin.settings.afterClose ){
	          plugin.settings.afterClose();
	        }
	      }
	    };

	    plugin.init();

	  };

	  $.fn.swipebox = function( options ) {

	    if ( ! $.data( this, '_swipebox' ) ) {
	      var swipebox = new $.swipebox( this, options );
	      this.data( '_swipebox', swipebox );
	    }
	    return this.data( '_swipebox' );

	  };

	}( window, document, jQuery ) );


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mediaQuery = __webpack_require__(4);
	var $ = __webpack_require__(2);
	var jqueryeasing = __webpack_require__(8);

	var Accordion = function($element) {
	  var self = this;
	  this.init();
	};

	Accordion.prototype = {
	  init: function() {
	    var self = this;
	    $(document).on('click', '.accordion-item-head', function(e) {
	      e.preventDefault();

	      if(!$(this).parent().hasClass('is-visible')){
	        self.showItem($(this).parent());
	      }else{
	        self.hideItem($(this).parent());
	      }
	    });

	    $('.accordion-item.is-visible').each(function(){
	      self.showItem($(this));
	    });

	    window.addEventListener('windowresize', function (e) {
	      self.handleResize();
	    }, false);

	    $(' .accordion img').each(function() {
	      $(this).on('load', function() {
	        window.setTimeout(self.handleResize, 400);
	      });
	    });
	  },
	  showItem: function($el) {
	    $el.removeClass('is-visible');
	    $('.accordion-item').stop().animate({height:'30px'}, 400, 'easeOutQuint', function() {
	      $(this).removeClass('is-visible');
	    });

	    var curHeight = $el.height();
	    $el.css('height', 'auto');
	    var autoHeight = $el.height();
	    $el.addClass('is-visible');
	    // $el.find('.accordion-item-content').css('position', 'absolute');
	    $el.stop().height(curHeight).animate({height: autoHeight}, 400, 'easeOutQuint');
	  },
	  hideItem: function($el) {
	    $el.stop().animate({height:'30px'}, 400, 'easeOutQuint', function() {
	      $(this).removeClass('is-visible');
	    });
	  },
	  handleResize: function() {
	    $('.accordion-item.is-visible').each(function() {
	      var $this = $(this);
	      $this.removeClass('is-visible');
	      $this.css('height', 'auto');
	      var autoHeight = $this.height();
	      $this.addClass('is-visible').css('height', autoHeight+'px');
	    });
	  }
	};

	module.exports = Accordion;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * jQuery Easing v1.4.1 - http://gsgd.co.uk/sandbox/jquery/easing/
	 * Open source under the BSD License.
	 * Copyright © 2008 George McGinley Smith
	 * All rights reserved.
	 * https://raw.github.com/gdsmith/jquery-easing/master/LICENSE
	*/

	(function (factory) {
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($) {
				return factory($);
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (typeof module === "object" && typeof module.exports === "object") {
			exports = factory(require('jquery'));
		} else {
			factory(jQuery);
		}
	})(function($){

	// Preserve the original jQuery "swing" easing as "jswing"
	$.easing.jswing = $.easing.swing;

	var pow = Math.pow,
		sqrt = Math.sqrt,
		sin = Math.sin,
		cos = Math.cos,
		PI = Math.PI,
		c1 = 1.70158,
		c2 = c1 * 1.525,
		c3 = c1 + 1,
		c4 = ( 2 * PI ) / 3,
		c5 = ( 2 * PI ) / 4.5;

	// x is the fraction of animation progress, in the range 0..1
	function bounceOut(x) {
		var n1 = 7.5625,
			d1 = 2.75;
		if ( x < 1/d1 ) {
			return n1*x*x;
		} else if ( x < 2/d1 ) {
			return n1*(x-=(1.5/d1))*x + 0.75;
		} else if ( x < 2.5/d1 ) {
			return n1*(x-=(2.25/d1))*x + 0.9375;
		} else {
			return n1*(x-=(2.625/d1))*x + 0.984375;
		}
	}

	$.extend( $.easing,
	{
		def: 'easeOutQuad',
		swing: function (x) {
			return $.easing[$.easing.def](x);
		},
		easeInQuad: function (x) {
			return x * x;
		},
		easeOutQuad: function (x) {
			return 1 - ( 1 - x ) * ( 1 - x );
		},
		easeInOutQuad: function (x) {
			return x < 0.5 ?
				2 * x * x :
				1 - pow( -2 * x + 2, 2 ) / 2;
		},
		easeInCubic: function (x) {
			return x * x * x;
		},
		easeOutCubic: function (x) {
			return 1 - pow( 1 - x, 3 );
		},
		easeInOutCubic: function (x) {
			return x < 0.5 ?
				4 * x * x * x :
				1 - pow( -2 * x + 2, 3 ) / 2;
		},
		easeInQuart: function (x) {
			return x * x * x * x;
		},
		easeOutQuart: function (x) {
			return 1 - pow( 1 - x, 4 );
		},
		easeInOutQuart: function (x) {
			return x < 0.5 ?
				8 * x * x * x * x :
				1 - pow( -2 * x + 2, 4 ) / 2;
		},
		easeInQuint: function (x) {
			return x * x * x * x * x;
		},
		easeOutQuint: function (x) {
			return 1 - pow( 1 - x, 5 );
		},
		easeInOutQuint: function (x) {
			return x < 0.5 ?
				16 * x * x * x * x * x :
				1 - pow( -2 * x + 2, 5 ) / 2;
		},
		easeInSine: function (x) {
			return 1 - cos( x * PI/2 );
		},
		easeOutSine: function (x) {
			return sin( x * PI/2 );
		},
		easeInOutSine: function (x) {
			return -( cos( PI * x ) - 1 ) / 2;
		},
		easeInExpo: function (x) {
			return x === 0 ? 0 : pow( 2, 10 * x - 10 );
		},
		easeOutExpo: function (x) {
			return x === 1 ? 1 : 1 - pow( 2, -10 * x );
		},
		easeInOutExpo: function (x) {
			return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
				pow( 2, 20 * x - 10 ) / 2 :
				( 2 - pow( 2, -20 * x + 10 ) ) / 2;
		},
		easeInCirc: function (x) {
			return 1 - sqrt( 1 - pow( x, 2 ) );
		},
		easeOutCirc: function (x) {
			return sqrt( 1 - pow( x - 1, 2 ) );
		},
		easeInOutCirc: function (x) {
			return x < 0.5 ?
				( 1 - sqrt( 1 - pow( 2 * x, 2 ) ) ) / 2 :
				( sqrt( 1 - pow( -2 * x + 2, 2 ) ) + 1 ) / 2;
		},
		easeInElastic: function (x) {
			return x === 0 ? 0 : x === 1 ? 1 :
				-pow( 2, 10 * x - 10 ) * sin( ( x * 10 - 10.75 ) * c4 );
		},
		easeOutElastic: function (x) {
			return x === 0 ? 0 : x === 1 ? 1 :
				pow( 2, -10 * x ) * sin( ( x * 10 - 0.75 ) * c4 ) + 1;
		},
		easeInOutElastic: function (x) {
			return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
				-( pow( 2, 20 * x - 10 ) * sin( ( 20 * x - 11.125 ) * c5 )) / 2 :
				pow( 2, -20 * x + 10 ) * sin( ( 20 * x - 11.125 ) * c5 ) / 2 + 1;
		},
		easeInBack: function (x) {
			return c3 * x * x * x - c1 * x * x;
		},
		easeOutBack: function (x) {
			return 1 + c3 * pow( x - 1, 3 ) + c1 * pow( x - 1, 2 );
		},
		easeInOutBack: function (x) {
			return x < 0.5 ?
				( pow( 2 * x, 2 ) * ( ( c2 + 1 ) * 2 * x - c2 ) ) / 2 :
				( pow( 2 * x - 2, 2 ) *( ( c2 + 1 ) * ( x * 2 - 2 ) + c2 ) + 2 ) / 2;
		},
		easeInBounce: function (x) {
			return 1 - bounceOut( 1 - x );
		},
		easeOutBounce: bounceOut,
		easeInOutBounce: function (x) {
			return x < 0.5 ?
				( 1 - bounceOut( 1 - 2 * x ) ) / 2 :
				( 1 + bounceOut( 2 * x - 1 ) ) / 2;
		}
	});

	});


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mediaQuery = __webpack_require__(4);
	var $ = __webpack_require__(2);
	__webpack_require__(10);

	var Styleguide = function() {
	  this.init();
	};

	Styleguide.prototype = {
	  init: function() {

	    $(document).on('click', '.js-showcode', function(e) {
	      e.preventDefault();
	      var $this = $(this);
	      var $p = $this.parent().parent();
	      $this.toggleClass('is-active');

	      if($this.hasClass('is-active')){
	        var $codewrap = $('<div class="sg-code-wrap"><pre class="prettyprint"><code></code></pre></div>');
	        // var code = $p.next().find('.l-grid').html();
	        var code = $p.next().data('sg-code');
	        $codewrap.find('code').text(code);
	        $p.append($codewrap);
	        $codewrap.hide().slideDown(400);
	        prettyPrint();
	      }else{
	        $p.find('.sg-code-wrap').slideUp(400, function(){
	          $(this).remove();
	        });
	      }

	    });
	  }
	};

	module.exports = Styleguide;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!function(){var q=null;window.PR_SHOULD_USE_CONTINUATION=!0;
	(function(){function S(a){function d(e){var b=e.charCodeAt(0);if(b!==92)return b;var a=e.charAt(1);return(b=r[a])?b:"0"<=a&&a<="7"?parseInt(e.substring(1),8):a==="u"||a==="x"?parseInt(e.substring(2),16):e.charCodeAt(1)}function g(e){if(e<32)return(e<16?"\\x0":"\\x")+e.toString(16);e=String.fromCharCode(e);return e==="\\"||e==="-"||e==="]"||e==="^"?"\\"+e:e}function b(e){var b=e.substring(1,e.length-1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g),e=[],a=
	b[0]==="^",c=["["];a&&c.push("^");for(var a=a?1:0,f=b.length;a<f;++a){var h=b[a];if(/\\[bdsw]/i.test(h))c.push(h);else{var h=d(h),l;a+2<f&&"-"===b[a+1]?(l=d(b[a+2]),a+=2):l=h;e.push([h,l]);l<65||h>122||(l<65||h>90||e.push([Math.max(65,h)|32,Math.min(l,90)|32]),l<97||h>122||e.push([Math.max(97,h)&-33,Math.min(l,122)&-33]))}}e.sort(function(e,a){return e[0]-a[0]||a[1]-e[1]});b=[];f=[];for(a=0;a<e.length;++a)h=e[a],h[0]<=f[1]+1?f[1]=Math.max(f[1],h[1]):b.push(f=h);for(a=0;a<b.length;++a)h=b[a],c.push(g(h[0])),
	h[1]>h[0]&&(h[1]+1>h[0]&&c.push("-"),c.push(g(h[1])));c.push("]");return c.join("")}function s(e){for(var a=e.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g),c=a.length,d=[],f=0,h=0;f<c;++f){var l=a[f];l==="("?++h:"\\"===l.charAt(0)&&(l=+l.substring(1))&&(l<=h?d[l]=-1:a[f]=g(l))}for(f=1;f<d.length;++f)-1===d[f]&&(d[f]=++x);for(h=f=0;f<c;++f)l=a[f],l==="("?(++h,d[h]||(a[f]="(?:")):"\\"===l.charAt(0)&&(l=+l.substring(1))&&l<=h&&
	(a[f]="\\"+d[l]);for(f=0;f<c;++f)"^"===a[f]&&"^"!==a[f+1]&&(a[f]="");if(e.ignoreCase&&m)for(f=0;f<c;++f)l=a[f],e=l.charAt(0),l.length>=2&&e==="["?a[f]=b(l):e!=="\\"&&(a[f]=l.replace(/[A-Za-z]/g,function(a){a=a.charCodeAt(0);return"["+String.fromCharCode(a&-33,a|32)+"]"}));return a.join("")}for(var x=0,m=!1,j=!1,k=0,c=a.length;k<c;++k){var i=a[k];if(i.ignoreCase)j=!0;else if(/[a-z]/i.test(i.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi,""))){m=!0;j=!1;break}}for(var r={b:8,t:9,n:10,v:11,
	f:12,r:13},n=[],k=0,c=a.length;k<c;++k){i=a[k];if(i.global||i.multiline)throw Error(""+i);n.push("(?:"+s(i)+")")}return RegExp(n.join("|"),j?"gi":"g")}function T(a,d){function g(a){var c=a.nodeType;if(c==1){if(!b.test(a.className)){for(c=a.firstChild;c;c=c.nextSibling)g(c);c=a.nodeName.toLowerCase();if("br"===c||"li"===c)s[j]="\n",m[j<<1]=x++,m[j++<<1|1]=a}}else if(c==3||c==4)c=a.nodeValue,c.length&&(c=d?c.replace(/\r\n?/g,"\n"):c.replace(/[\t\n\r ]+/g," "),s[j]=c,m[j<<1]=x,x+=c.length,m[j++<<1|1]=
	a)}var b=/(?:^|\s)nocode(?:\s|$)/,s=[],x=0,m=[],j=0;g(a);return{a:s.join("").replace(/\n$/,""),d:m}}function H(a,d,g,b){d&&(a={a:d,e:a},g(a),b.push.apply(b,a.g))}function U(a){for(var d=void 0,g=a.firstChild;g;g=g.nextSibling)var b=g.nodeType,d=b===1?d?a:g:b===3?V.test(g.nodeValue)?a:d:d;return d===a?void 0:d}function C(a,d){function g(a){for(var j=a.e,k=[j,"pln"],c=0,i=a.a.match(s)||[],r={},n=0,e=i.length;n<e;++n){var z=i[n],w=r[z],t=void 0,f;if(typeof w==="string")f=!1;else{var h=b[z.charAt(0)];
	if(h)t=z.match(h[1]),w=h[0];else{for(f=0;f<x;++f)if(h=d[f],t=z.match(h[1])){w=h[0];break}t||(w="pln")}if((f=w.length>=5&&"lang-"===w.substring(0,5))&&!(t&&typeof t[1]==="string"))f=!1,w="src";f||(r[z]=w)}h=c;c+=z.length;if(f){f=t[1];var l=z.indexOf(f),B=l+f.length;t[2]&&(B=z.length-t[2].length,l=B-f.length);w=w.substring(5);H(j+h,z.substring(0,l),g,k);H(j+h+l,f,I(w,f),k);H(j+h+B,z.substring(B),g,k)}else k.push(j+h,w)}a.g=k}var b={},s;(function(){for(var g=a.concat(d),j=[],k={},c=0,i=g.length;c<i;++c){var r=
	g[c],n=r[3];if(n)for(var e=n.length;--e>=0;)b[n.charAt(e)]=r;r=r[1];n=""+r;k.hasOwnProperty(n)||(j.push(r),k[n]=q)}j.push(/[\S\s]/);s=S(j)})();var x=d.length;return g}function v(a){var d=[],g=[];a.tripleQuotedStrings?d.push(["str",/^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/,q,"'\""]):a.multiLineStrings?d.push(["str",/^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/,
	q,"'\"`"]):d.push(["str",/^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/,q,"\"'"]);a.verbatimStrings&&g.push(["str",/^@"(?:[^"]|"")*(?:"|$)/,q]);var b=a.hashComments;b&&(a.cStyleComments?(b>1?d.push(["com",/^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/,q,"#"]):d.push(["com",/^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\n\r]*)/,q,"#"]),g.push(["str",/^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/,q])):d.push(["com",
	/^#[^\n\r]*/,q,"#"]));a.cStyleComments&&(g.push(["com",/^\/\/[^\n\r]*/,q]),g.push(["com",/^\/\*[\S\s]*?(?:\*\/|$)/,q]));if(b=a.regexLiterals){var s=(b=b>1?"":"\n\r")?".":"[\\S\\s]";g.push(["lang-regex",RegExp("^(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*("+("/(?=[^/*"+b+"])(?:[^/\\x5B\\x5C"+b+"]|\\x5C"+s+"|\\x5B(?:[^\\x5C\\x5D"+b+"]|\\x5C"+
	s+")*(?:\\x5D|$))+/")+")")])}(b=a.types)&&g.push(["typ",b]);b=(""+a.keywords).replace(/^ | $/g,"");b.length&&g.push(["kwd",RegExp("^(?:"+b.replace(/[\s,]+/g,"|")+")\\b"),q]);d.push(["pln",/^\s+/,q," \r\n\t\u00a0"]);b="^.[^\\s\\w.$@'\"`/\\\\]*";a.regexLiterals&&(b+="(?!s*/)");g.push(["lit",/^@[$_a-z][\w$@]*/i,q],["typ",/^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/,q],["pln",/^[$_a-z][\w$@]*/i,q],["lit",/^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i,q,"0123456789"],["pln",/^\\[\S\s]?/,
	q],["pun",RegExp(b),q]);return C(d,g)}function J(a,d,g){function b(a){var c=a.nodeType;if(c==1&&!x.test(a.className))if("br"===a.nodeName)s(a),a.parentNode&&a.parentNode.removeChild(a);else for(a=a.firstChild;a;a=a.nextSibling)b(a);else if((c==3||c==4)&&g){var d=a.nodeValue,i=d.match(m);if(i)c=d.substring(0,i.index),a.nodeValue=c,(d=d.substring(i.index+i[0].length))&&a.parentNode.insertBefore(j.createTextNode(d),a.nextSibling),s(a),c||a.parentNode.removeChild(a)}}function s(a){function b(a,c){var d=
	c?a.cloneNode(!1):a,e=a.parentNode;if(e){var e=b(e,1),g=a.nextSibling;e.appendChild(d);for(var i=g;i;i=g)g=i.nextSibling,e.appendChild(i)}return d}for(;!a.nextSibling;)if(a=a.parentNode,!a)return;for(var a=b(a.nextSibling,0),d;(d=a.parentNode)&&d.nodeType===1;)a=d;c.push(a)}for(var x=/(?:^|\s)nocode(?:\s|$)/,m=/\r\n?|\n/,j=a.ownerDocument,k=j.createElement("li");a.firstChild;)k.appendChild(a.firstChild);for(var c=[k],i=0;i<c.length;++i)b(c[i]);d===(d|0)&&c[0].setAttribute("value",d);var r=j.createElement("ol");
	r.className="linenums";for(var d=Math.max(0,d-1|0)||0,i=0,n=c.length;i<n;++i)k=c[i],k.className="L"+(i+d)%10,k.firstChild||k.appendChild(j.createTextNode("\u00a0")),r.appendChild(k);a.appendChild(r)}function p(a,d){for(var g=d.length;--g>=0;){var b=d[g];F.hasOwnProperty(b)?D.console&&console.warn("cannot override language handler %s",b):F[b]=a}}function I(a,d){if(!a||!F.hasOwnProperty(a))a=/^\s*</.test(d)?"default-markup":"default-code";return F[a]}function K(a){var d=a.h;try{var g=T(a.c,a.i),b=g.a;
	a.a=b;a.d=g.d;a.e=0;I(d,b)(a);var s=/\bMSIE\s(\d+)/.exec(navigator.userAgent),s=s&&+s[1]<=8,d=/\n/g,x=a.a,m=x.length,g=0,j=a.d,k=j.length,b=0,c=a.g,i=c.length,r=0;c[i]=m;var n,e;for(e=n=0;e<i;)c[e]!==c[e+2]?(c[n++]=c[e++],c[n++]=c[e++]):e+=2;i=n;for(e=n=0;e<i;){for(var p=c[e],w=c[e+1],t=e+2;t+2<=i&&c[t+1]===w;)t+=2;c[n++]=p;c[n++]=w;e=t}c.length=n;var f=a.c,h;if(f)h=f.style.display,f.style.display="none";try{for(;b<k;){var l=j[b+2]||m,B=c[r+2]||m,t=Math.min(l,B),A=j[b+1],G;if(A.nodeType!==1&&(G=x.substring(g,
	t))){s&&(G=G.replace(d,"\r"));A.nodeValue=G;var L=A.ownerDocument,o=L.createElement("span");o.className=c[r+1];var v=A.parentNode;v.replaceChild(o,A);o.appendChild(A);g<l&&(j[b+1]=A=L.createTextNode(x.substring(t,l)),v.insertBefore(A,o.nextSibling))}g=t;g>=l&&(b+=2);g>=B&&(r+=2)}}finally{if(f)f.style.display=h}}catch(u){D.console&&console.log(u&&u.stack||u)}}var D=window,y=["break,continue,do,else,for,if,return,while"],E=[[y,"auto,case,char,const,default,double,enum,extern,float,goto,inline,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],
	"catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"],M=[E,"alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,delegate,dynamic_cast,explicit,export,friend,generic,late_check,mutable,namespace,nullptr,property,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"],N=[E,"abstract,assert,boolean,byte,extends,final,finally,implements,import,instanceof,interface,null,native,package,strictfp,super,synchronized,throws,transient"],
	O=[N,"as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,internal,into,is,let,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var,virtual,where"],E=[E,"debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"],P=[y,"and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],
	Q=[y,"alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"],W=[y,"as,assert,const,copy,drop,enum,extern,fail,false,fn,impl,let,log,loop,match,mod,move,mut,priv,pub,pure,ref,self,static,struct,true,trait,type,unsafe,use"],y=[y,"case,done,elif,esac,eval,fi,function,in,local,set,then,until"],R=/^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)\b/,
	V=/\S/,X=v({keywords:[M,O,E,"caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",P,Q,y],hashComments:!0,cStyleComments:!0,multiLineStrings:!0,regexLiterals:!0}),F={};p(X,["default-code"]);p(C([],[["pln",/^[^<?]+/],["dec",/^<!\w[^>]*(?:>|$)/],["com",/^<\!--[\S\s]*?(?:--\>|$)/],["lang-",/^<\?([\S\s]+?)(?:\?>|$)/],["lang-",/^<%([\S\s]+?)(?:%>|$)/],["pun",/^(?:<[%?]|[%?]>)/],["lang-",
	/^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i],["lang-js",/^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i],["lang-css",/^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i],["lang-in.tag",/^(<\/?[a-z][^<>]*>)/i]]),["default-markup","htm","html","mxml","xhtml","xml","xsl"]);p(C([["pln",/^\s+/,q," \t\r\n"],["atv",/^(?:"[^"]*"?|'[^']*'?)/,q,"\"'"]],[["tag",/^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i],["atn",/^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],["lang-uq.val",/^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/],["pun",/^[/<->]+/],
	["lang-js",/^on\w+\s*=\s*"([^"]+)"/i],["lang-js",/^on\w+\s*=\s*'([^']+)'/i],["lang-js",/^on\w+\s*=\s*([^\s"'>]+)/i],["lang-css",/^style\s*=\s*"([^"]+)"/i],["lang-css",/^style\s*=\s*'([^']+)'/i],["lang-css",/^style\s*=\s*([^\s"'>]+)/i]]),["in.tag"]);p(C([],[["atv",/^[\S\s]+/]]),["uq.val"]);p(v({keywords:M,hashComments:!0,cStyleComments:!0,types:R}),["c","cc","cpp","cxx","cyc","m"]);p(v({keywords:"null,true,false"}),["json"]);p(v({keywords:O,hashComments:!0,cStyleComments:!0,verbatimStrings:!0,types:R}),
	["cs"]);p(v({keywords:N,cStyleComments:!0}),["java"]);p(v({keywords:y,hashComments:!0,multiLineStrings:!0}),["bash","bsh","csh","sh"]);p(v({keywords:P,hashComments:!0,multiLineStrings:!0,tripleQuotedStrings:!0}),["cv","py","python"]);p(v({keywords:"caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",hashComments:!0,multiLineStrings:!0,regexLiterals:2}),["perl","pl","pm"]);p(v({keywords:Q,
	hashComments:!0,multiLineStrings:!0,regexLiterals:!0}),["rb","ruby"]);p(v({keywords:E,cStyleComments:!0,regexLiterals:!0}),["javascript","js"]);p(v({keywords:"all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,throw,true,try,unless,until,when,while,yes",hashComments:3,cStyleComments:!0,multilineStrings:!0,tripleQuotedStrings:!0,regexLiterals:!0}),["coffee"]);p(v({keywords:W,cStyleComments:!0,multilineStrings:!0}),["rc","rs","rust"]);
	p(C([],[["str",/^[\S\s]+/]]),["regex"]);var Y=D.PR={createSimpleLexer:C,registerLangHandler:p,sourceDecorator:v,PR_ATTRIB_NAME:"atn",PR_ATTRIB_VALUE:"atv",PR_COMMENT:"com",PR_DECLARATION:"dec",PR_KEYWORD:"kwd",PR_LITERAL:"lit",PR_NOCODE:"nocode",PR_PLAIN:"pln",PR_PUNCTUATION:"pun",PR_SOURCE:"src",PR_STRING:"str",PR_TAG:"tag",PR_TYPE:"typ",prettyPrintOne:D.prettyPrintOne=function(a,d,g){var b=document.createElement("div");b.innerHTML="<pre>"+a+"</pre>";b=b.firstChild;g&&J(b,g,!0);K({h:d,j:g,c:b,i:1});
	return b.innerHTML},prettyPrint:D.prettyPrint=function(a,d){function g(){for(var b=D.PR_SHOULD_USE_CONTINUATION?c.now()+250:Infinity;i<p.length&&c.now()<b;i++){for(var d=p[i],j=h,k=d;k=k.previousSibling;){var m=k.nodeType,o=(m===7||m===8)&&k.nodeValue;if(o?!/^\??prettify\b/.test(o):m!==3||/\S/.test(k.nodeValue))break;if(o){j={};o.replace(/\b(\w+)=([\w%+\-.:]+)/g,function(a,b,c){j[b]=c});break}}k=d.className;if((j!==h||e.test(k))&&!v.test(k)){m=!1;for(o=d.parentNode;o;o=o.parentNode)if(f.test(o.tagName)&&
	o.className&&e.test(o.className)){m=!0;break}if(!m){d.className+=" prettyprinted";m=j.lang;if(!m){var m=k.match(n),y;if(!m&&(y=U(d))&&t.test(y.tagName))m=y.className.match(n);m&&(m=m[1])}if(w.test(d.tagName))o=1;else var o=d.currentStyle,u=s.defaultView,o=(o=o?o.whiteSpace:u&&u.getComputedStyle?u.getComputedStyle(d,q).getPropertyValue("white-space"):0)&&"pre"===o.substring(0,3);u=j.linenums;if(!(u=u==="true"||+u))u=(u=k.match(/\blinenums\b(?::(\d+))?/))?u[1]&&u[1].length?+u[1]:!0:!1;u&&J(d,u,o);r=
	{h:m,c:d,j:u,i:o};K(r)}}}i<p.length?setTimeout(g,250):"function"===typeof a&&a()}for(var b=d||document.body,s=b.ownerDocument||document,b=[b.getElementsByTagName("pre"),b.getElementsByTagName("code"),b.getElementsByTagName("xmp")],p=[],m=0;m<b.length;++m)for(var j=0,k=b[m].length;j<k;++j)p.push(b[m][j]);var b=q,c=Date;c.now||(c={now:function(){return+new Date}});var i=0,r,n=/\blang(?:uage)?-([\w.]+)(?!\S)/,e=/\bprettyprint\b/,v=/\bprettyprinted\b/,w=/pre|xmp/i,t=/^code$/i,f=/^(?:pre|code|xmp)$/i,
	h={};g()}};"function"==="function"&&__webpack_require__(11)&&!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return Y}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))})();}()


/***/ },
/* 11 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mediaQuery = __webpack_require__(4);
	var $ = __webpack_require__(2);

	var IntroAnimation = function($element) {
	  this.$el = $element;
	  this.init();
	};

	IntroAnimation.prototype = {
	  init: function() {
	    var timestamp = Date.now(),
	      timediff = 86400000,
	      timelocal = 0;

	    if (localStorage['ksu-timestamp']) {
	      timelocal = localStorage['ksu-timestamp'];
	    }

	    if (timestamp - timelocal >= timediff) {
	      this.playIntro();

	      localStorage.setItem('ksu-timestamp', timestamp);
	    }else{
	      $('.header-lion').show();
	      $('.l-site-width').css('visibility', 'visible');
	      $('.main-header').css('visibility', 'visible');
	      $('.mobilenav-header').css('top', 0);
	    }

	    $(window).keydown(function(e) {
	      if (e.which == 73) {
	        localStorage.setItem('ksu-timestamp', 0);
	        location.reload();
	      }
	    });
	  },

	  playIntro: function() {
	    $('.l-site-width').css('visibility', 'visible').addClass('animate-in');
	    $('.main-header').css('visibility', 'visible').addClass('animate-in-header');
	    $('.header-lion').show();
	    this.$el.show().delay(2500).fadeOut(500);
	    $('.intro__lion').delay(2000).fadeOut(500);
	    $('.intro-flagge-img').addClass('animate-in');
	    if (!mediaQuery.is('mobile')) {
	      $('.header-logo').hide().delay(2500).fadeIn(500);
	    }
	  }
	};

	module.exports = IntroAnimation;


/***/ }
]);