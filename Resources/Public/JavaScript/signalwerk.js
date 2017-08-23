'use strict';

// http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
$.fn.serializeObject = function () {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function () {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

// Wait for the DOM to be ready
$(function () {

  // form restore
  $('#contact-form').squirrel('init', {
    clear_on_submit: false,
    storage_key: "squirrel"
  });

  if ($('input[name="--contact-form[bill_separate]"]').is(':checked')) {
    $(".contact-form-bill").show();
  } else {
    $(".contact-form-bill").hide();
  }
  $('input[name="--contact-form[bill_separate]"]').change(function (e) {

    if ($(this).is(':checked')) {
      $(".contact-form-bill").show();
      $(this).attr("checked", "checked");
    } else {
      $(".contact-form-bill").hide();
      $(this).removeAttr("checked");
    }
  });

  if ($('input[name="--contact-form[ausbildung]"]').is(':checked')) {
    $(".contact-form-onSfGZ-group").show();
  } else {
    $(".contact-form-onSfGZ-group").hide();
  }
  $('input[name="--contact-form[ausbildung]"]').change(function (e) {

    if ($(this).is(':checked')) {
      $(".contact-form-onSfGZ-group").show();
      $(this).attr("checked", "checked");
    } else {
      $(".contact-form-onSfGZ-group").hide();
      $(this).removeAttr("checked");
    }
  });

  // Initialize form validation on the registration form.
  // It has the name attribute "registration"
  $("#contact-form").validate({
    // Specify validation rules
    rules: {
      // The key name on the left side is the name attribute
      // of an input field. Validation rules are defined
      // on the right side
      '--contact-form[anrede]': "required",
      '--contact-form[Name]': "required",
      '--contact-form[Vorname]': "required",
      '--contact-form[Strasse]': "required",
      '--contact-form[Postleitzahl]': "required",
      '--contact-form[Ort]': "required",
      '--contact-form[E-Mail]': {
        required: true,
        // Specify that email should be validated
        // by the built-in "email" rule
        email: true
      },
      '--contact-form[Geburtsdatum]': "required",
      '--contact-form[Berufstatigkeit]': "required",

      '--contact-form[bill_Strasse]': {
        required: {
          depends: function depends(element) {
            return $("#contact-form-bill-separate").is(":checked");
          }
        }
      },
      '--contact-form[bill_Postleitzahl]': {
        required: {
          depends: function depends(element) {
            return $("#contact-form-bill-separate").is(":checked");
          }
        }
      },
      '--contact-form[bill_Ort]': {
        required: {
          depends: function depends(element) {
            return $("#contact-form-bill-separate").is(":checked");
          }
        }
      },
      '--contact-form[onSfGZ]': {
        required: {
          depends: function depends(element) {
            return $("#contact-form-ausbildung").is(":checked");
          }
        }
      },
      '--contact-form[agb]': "required"

    },
    // Specify validation error messages
    messages: {
      '--contact-form[anrede]': "Bitte ausfüllen.",
      '--contact-form[Name]': "Bitte ausfüllen.",
      '--contact-form[Vorname]': "Bitte ausfüllen.",
      '--contact-form[Strasse]': "Bitte ausfüllen.",
      '--contact-form[Postleitzahl]': "Bitte ausfüllen.",
      '--contact-form[Ort]': "Bitte ausfüllen.",
      '--contact-form[E-Mail]': "Bitte ausfüllen.",
      '--contact-form[Geburtsdatum]': "Bitte ausfüllen.",
      '--contact-form[Berufstatigkeit]': "Bitte ausfüllen.",
      '--contact-form[bill_Strasse]': "Bitte ausfüllen.",
      '--contact-form[bill_Postleitzahl]': "Bitte ausfüllen.",
      '--contact-form[bill_Ort]': "Bitte ausfüllen.",
      '--contact-form[onSfGZ]': "Bitte Ausbildungsart wählen.",
      '--contact-form[agb]': "Sie müssen die allgemeinen Geschäftsbedingungen akzeptieren"
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function submitHandler(form) {
      $.ajax({
        type: "POST",
        url: "/signalwerk/course/enroll",
        data: {
          'data': $('.form-control').serializeObject()
        },
        success: function success(msg) {
          window.location.href = './anmeldung/danke.html';
        },
        error: function error(returnval) {
          // window.location.href = './anmeldung/danke.html';
          window.location.href = './anmeldung/error.html';
        }
      });
    }
  });
});
//# sourceMappingURL=signalwerk.js.map
