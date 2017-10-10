(function ($) {
    $.fn.uncheckableRadio = function () {
        return this.each(function () {
            var radio = this,
                label = $('label[for="' + radio.id + '"]');
            if (label.length === 0) {
                label = $(radio).closest("label");
            }
            var label_radio = label.add(radio);
            label_radio.mousedown(function () {
                $(radio).data('wasChecked', radio.checked);
            });
            label_radio.click(function () {
                if ($(radio).data('wasChecked')) {
                    radio.checked = false;
                }
            });
        });
    };
})(jQuery);

// Wait for the DOM to be ready
$(function() {

  $('input[type=radio]').uncheckableRadio();

  // form restore
  $('#filter-form').submit(function( event ) {

      var submitBtn = $("#filter-form-submit");
      // submitBtn.attr('disabled', 'disabled');
      // console.log('submitBtn', submitBtn);
      submitBtn.addClass('button-submitting');


      $('radio').bind('click', function() {
          $(this).removeAttr('checked');
      });

      // Assign handlers immediately after making the request,
      // and remember the jqXHR object for this request
      $.ajax({
        dataType: "json",
        url: '/signalwerk/courseoverview/getAjaxData',
        data: {
          filterTxt: $('input[name=text]').val(), // month
          filterID: [
            $('input[name=category]:checked').val(), // category
            $('select[name=day]').val(), // day
            $('select[name=month]').val(), // month
          ].join(','),
        },
      })
        .done(function( data ) {

          // console.log( "success" );
          $('.courseview-listeitem--root').addClass('hidden');
          data.data.forEach(item => {
            // console.log( "show:", item);
            $('.courseview-listeitem--root[data-id="'+item+'"]').removeClass('hidden');
          })

        })
        .fail(function() {
          console.log( "error" );
        })
        .always(function() {
          // console.log( "complete" );
          submitBtn.removeClass('button-submitting');
        });


      return false;

      // event.preventDefault();
    });
});
