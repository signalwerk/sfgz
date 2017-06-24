'use strict';

// main
(function ($) {
  $(function () {

    // foldout handling
    $('.foldout-title').click(function () {
      $(this).toggleClass('active').next().children('.foldout-content').toggleClass('show');
    });

    var $grid = $('.columns-masonry > .column').masonry({
      horizontalOrder: true,
      itemSelector: '.news-item',
      columnWidth: '.news-item__sizer',
      gutter: '.news-item__gutter',
      percentPosition: true
    });

    $grid.imagesLoaded().progress(function (instance, image) {
      $grid.masonry('layout');
      $(image.img).closest('.news-item').addClass('news-item--image-loaded');
    });

    var navToggle = document.querySelector('.navigation__toggle');
    var navContent = document.querySelector('.navigation__content');

    navToggle.addEventListener('click', function (event) {
      navContent.classList.toggle('navigation__content--open');
    });

    // give all anchor tags with href beginning with "http" a target attribute of "_blank"

    var $extLinks = $('a[href^=http]');

    $extLinks.each(function (index) {
      var $this = $(this);
      var isTargetBlank = $this.attr('target') === '_blank';

      if (!isTargetBlank) {
        $this.attr('target', '_blank');
      }
    });
  });
})(jQuery);
//# sourceMappingURL=signalwerk.js.map
