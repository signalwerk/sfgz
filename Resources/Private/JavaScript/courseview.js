function htmlEscape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/`/g, "&#96;")
    .replace(/'/g, "&#39;");
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

function renderCourses(courses) {
  return courses
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
          .sort((a, b) => {
            console.log({ a, b });
            return a.start.sort - b.start.sort;
          })
          .map(
            (execution) =>
              `${htmlEscape(execution.start.print)} – ${htmlEscape(
                execution.end.print
              )}<br />`
          )
          .join("")}
      </p>
    </div>
  </div>
</a>
</div>`
    )
    .join("");
}

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
      const categories = {};

      // data.hits.sort((a, b) => a.title.localeCompare(b.title));

      data.categories.forEach((category) => {
        categories[category.id] = { ...category, courses: [] };
      });

      data.hits.forEach((hit) => {
        hit.categories.forEach((category) => {
          categories[category].courses.push(hit);
        });
      });

      let html = null;

      if (data.hits.length) {
        html = [];
        for (const [key, category] of Object.entries(categories)) {
          // console.log(`${key}: ${value}`);

          if (category.courses.length) {
            html.push(`<div class="courseview-category"><h3>${category.title}</h3></div>`);
            html.push(renderCourses(category.courses));
          }
        }
        html = html.join("\n");
      } else {
        html = `<h3 class="noResult">Keine Treffer.</h3>`;
      }

      $("#courseview-result").html(html);
    })
    .fail(function () {
      console.log("error");
    })
    .always(function () {
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
  });

  // load on start
  update();
});
