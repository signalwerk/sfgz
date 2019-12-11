'use strict';

// Wait for the DOM to be ready
$(function () {

  // form restore
  $('#filter-form').submit(function (event) {

    var submitBtn = $("#filter-form-submit");
    // submitBtn.attr('disabled', 'disabled');
    // console.log('submitBtn', submitBtn);
    submitBtn.addClass('button-submitting');

    // $('radio').bind('click', function() {
    //     $(this).removeAttr('checked');
    // });

    $('.noResult').addClass('hidden');

    var cat = [];
    $('.filterCat').each(function (index) {
      var val = $(this).val();
      // let val = $('input[name='+ $( this ).attr('name') + ']:checked').val();
      if (val !== '*') {
        cat.push(val);
      }
    });

    // Assign handlers immediately after making the request,
    // and remember the jqXHR object for this request
    $.ajax({
      url: '/',
      data: {
        nodeName: $('.ajax-list').data('list'),
        cat: cat.join(','),
        filterTxt: $('input[name=text]').val() || '' // text
      }
    }).done(function (response) {
      // .unwrap()
      $('.ajax-list').html(response).children().children().unwrap();
    }).fail(function () {
      console.log("error");
    }).always(function () {
      // console.log( "complete" );
      submitBtn.removeClass('button-submitting');
    });

    return false;
  });
});
//# sourceMappingURL=filterview.js.map
