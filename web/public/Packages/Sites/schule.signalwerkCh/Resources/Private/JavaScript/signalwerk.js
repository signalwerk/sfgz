// main
(function($) {
  $(function() {

    var $grid = $('.columns-masonry > .column').masonry({
      horizontalOrder: true,
      itemSelector: '.news-item',
      columnWidth: '.news-item__sizer',
      gutter: '.news-item__gutter',
      percentPosition: true
    });

    $grid.imagesLoaded().progress( function() {
      $grid.masonry('layout');
    });

  });
})(jQuery);
