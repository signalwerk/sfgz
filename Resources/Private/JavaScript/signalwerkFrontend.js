// main
function pad(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

(function($) {
  $(function() {
    // add random class
    var rng = Math.floor(Math.random() * 20) + 1;
    $("body").addClass("random" + pad(rng, 2));

    // foldout handling
    $(".foldout-title").click(function() {
      $(this)
        .toggleClass("active")
        .next()
        .children(".foldout-content")
        .toggleClass("show");
    });

    createNewsGrid();

    var navToggle = document.querySelector(".navigation__toggle");
    var navContent = document.querySelector(".navigation__content");

    navToggle.addEventListener("click", function(event) {
      navContent.classList.toggle("navigation__content--open");
    });

    // give all anchor tags with href beginning with "http" a target attribute of "_blank"

    var $extLinks = $("a[href^=http]");

    $extLinks.each(function(index) {
      var $this = $(this);
      var isTargetBlank = $this.attr("target") === "_blank";

      if (!isTargetBlank) {
        $this.attr("target", "_blank");
      }
    });

    // background animation queing

    var $body = $("body");
    var store = localStorage;
    // var delta = 259200000; // 3 days -> ms
    var delta = 0; // deactivate right now

    var lastPlayed = parseInt(store.animationLastPlayed, 10);
    if (store.animationLastPlayed === undefined) {
      lastPlayed = 0;
    }
    var isTimeToPlay = lastPlayed + delta < Date.now();

    if ($body.hasClass("noBackground")) {
      if (isTimeToPlay) {
        store.setItem("animationLastPlayed", Date.now());
      } else {
        $body.addClass("no-animation");
      }
    }
  });
})(jQuery);

function createNewsGrid() {
  var $grid = $(".columns-masonry > .column").masonry({
    horizontalOrder: true,
    itemSelector: ".news-item",
    columnWidth: ".news-item__sizer",
    gutter: ".news-item__gutter",
    percentPosition: true
  });

  $grid.imagesLoaded().progress(function(instance, image) {
    $grid.masonry("layout");
    $(image.img)
      .closest(".news-item")
      .addClass("news-item--image-loaded");
  });
}
