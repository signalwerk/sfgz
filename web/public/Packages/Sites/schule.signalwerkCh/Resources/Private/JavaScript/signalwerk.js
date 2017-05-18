// main
(function($) {
  $(function() {

    var $grid = $('.neos-contentcollection').masonry({
      // options
      itemSelector: '.schule-signalwerkch-newsitem',
      columnWidth: '.news-item__sizer',
      percentPosition: true
    });

    $grid.imagesLoaded().progress( function() {
      $grid.masonry('layout');
    });

  });
})(jQuery);
