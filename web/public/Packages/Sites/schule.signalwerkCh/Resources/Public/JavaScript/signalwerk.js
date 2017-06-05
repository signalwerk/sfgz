'use strict';

// main
(function ($) {
  $(function () {

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

    navToggle.addEventListener('click', (e) => {
      navContent.classList.toggle('navigation__content--open')
    });
  });
})(jQuery);
//# sourceMappingURL=signalwerk.js.map
