// Wait for the DOM to be ready
$(function() {

  // form restore
  $('#filter-form').submit(function( event ) {

      var submitBtn = $("#filter-form-submit");
      // submitBtn.attr('disabled', 'disabled');
      // console.log('submitBtn', submitBtn);
      submitBtn.addClass('button-submitting');


      $('radio').bind('click', function() {
          $(this).removeAttr('checked');
      });

      $('.noResult').addClass('hidden');

      let cat = [];
      $('.filterCat').each(function( index ) {
        let val = $('input[name='+ $( this ).attr('name') + ']:checked').val();
        if (val !== '*') {
          cat.push(val);
        }
      });

      console.log('--- CAT:', cat.join(','))

      console.log('--- AJAX:', $('.ajax-list').data('list'));

      // Assign handlers immediately after making the request,
      // and remember the jqXHR object for this request
      $.ajax({
        url: '/',
        data: {
          nodeName: $('.ajax-list').data('list'),
          cat: cat.join(','),
        },
      })
        .done(function( response ) {
          // .unwrap()
          $('.ajax-list').html(response).children().children().unwrap();
        })
        .fail(function() {
          console.log( "error" );
        })
        .always(function() {
          // console.log( "complete" );
          submitBtn.removeClass('button-submitting');
        });

      return false;

    });
});
