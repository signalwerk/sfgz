// https://2ality.com/2015/01/template-strings-html.html
function htmlEscape(str) {
  return str
    .replace(/&/g, "&amp;") // first!
    .replace(/>/g, "&gt;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

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
        $(radio).data("wasChecked", radio.checked);
      });
      label_radio.click(function () {
        if ($(radio).data("wasChecked")) {
          radio.checked = false;
        }
      });
    });
  };
})(jQuery);

function update() {
  var submitBtn = $("#filter-form-submit");
  // submitBtn.attr('disabled', 'disabled');
  // console.log('submitBtn', submitBtn);
  submitBtn.addClass("button-submitting");

  $("radio").bind("click", function () {
    $(this).removeAttr("checked");
  });

  $(".noResult").addClass("hidden");

  // Assign handlers immediately after making the request,
  // and remember the jqXHR object for this request
  $.ajax({
    dataType: "json",
    url: "/signalwerk/courseoverview/getAjaxData",
    data: {
      filterTxt: $("input[name=text]").val(), // text
    },
  })
    .done(function (data) {
      console.log("---- ", data);

      const html = data.hits.length
        ? data.hits
            .map(
              (course) =>
                `<div>
          <a
            data-id="${htmlEscape(course.id)}"
            class="courseview-listeitem--root noLine"
            href="./angebot/detail.html?kurs=${htmlEscape(course.coursid)}"
          >
            <div class="courseview-listeitem">
              <div class="courseview-listeitem__nr">
                <p>${htmlEscape(course.coursid)}&nbsp;</p>
              </div>
              <div class="courseview-listeitem__title">
                <h3>${htmlEscape(course.title)}</h3>
              </div>
              <div class="courseview-listeitem__date">
                <p>
                  ${course.executions
                    .map(
                      (execution) =>
                        `${htmlEscape(execution.start)} – ${htmlEscape(
                          execution.end
                        )}<br />`
                    )
                    .join("")}
                </p>
              </div>
            </div>
          </a>
        </div>`
            )
            .join("")
        : `<h3 class="noResult">Keine Treffer.</h3>`;

      $("#courseview-result").html(html);

      {
        /* <div>
<a data-id="653d4bda-f2de-415b-bd69-662fab2b0f50" class="courseview-listeitem--root noLine" href="./angebot/detail.html?kurs=2570">
  <div class="courseview-listeitem">
    <div class="courseview-listeitem__nr">
      <p>2570&nbsp;</p>
    </div>
    <div class="courseview-listeitem__title">
      <h3>Fördermodul Lernen</h3>
    </div>
    <div class="courseview-listeitem__date">
      <p>
        

21.02.2022 – 21.08.2022<br>


      </p>
    </div>
  </div>
</a>
</div> */
      }

      // console.log( "success" );
      $(".courseview-listeitem--root").addClass("hidden");

      if (!data.data.length) {
        $(".noResult").removeClass("hidden");
      }

      data.data.forEach((item) => {
        $('.courseview-listeitem--root[data-id="' + item + '"]').removeClass(
          "hidden"
        );
      });
    })
    .fail(function () {
      console.log("error");
    })
    .always(function () {
      // console.log( "complete" );
      submitBtn.removeClass("button-submitting");
    });
}

// Wait for the DOM to be ready
$(function () {
  $("input[type=radio]").uncheckableRadio();

  // form restore
  $("#filter-form").submit(function (event) {
    update();
    return false;

    // event.preventDefault();
  });

  update();
});
