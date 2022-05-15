(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["UserList"] = factory();
	else
		root["UserList"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/_Resources/Static/Packages/signalwerk.sfgz/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./Resources/Private/JavaScript/courseview.js":
/*!****************************************************!*\
  !*** ./Resources/Private/JavaScript/courseview.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction htmlEscape(str) {\n  return str.replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\").replace(/\"/g, \"&quot;\").replace(/`/g, \"&#96;\").replace(/'/g, \"&#39;\");\n}\n\n(function ($) {\n  $.fn.uncheckableRadio = function () {\n    return this.each(function () {\n      var radio = this,\n          label = $('label[for=\"' + radio.id + '\"]');\n      if (label.length === 0) {\n        label = $(radio).closest(\"label\");\n      }\n      var label_radio = label.add(radio);\n      label_radio.mousedown(function () {\n        $(radio).data(\"wasChecked\", radio.checked);\n      });\n      label_radio.click(function () {\n        if ($(radio).data(\"wasChecked\")) {\n          radio.checked = false;\n        }\n      });\n    });\n  };\n})(jQuery);\n\nfunction update() {\n  var submitBtn = $(\"#filter-form-submit\");\n  // submitBtn.attr('disabled', 'disabled');\n  // console.log('submitBtn', submitBtn);\n  submitBtn.addClass(\"button-submitting\");\n\n  $(\"radio\").bind(\"click\", function () {\n    $(this).removeAttr(\"checked\");\n  });\n\n  $(\".noResult\").addClass(\"hidden\");\n\n  // Assign handlers immediately after making the request,\n  // and remember the jqXHR object for this request\n  $.ajax({\n    dataType: \"json\",\n    url: \"/signalwerk/courseoverview/getAjaxData\",\n    data: {\n      filterTxt: $(\"input[name=text]\").val() // text\n    }\n  }).done(function (data) {\n    data.hits.sort(function (a, b) {\n      return a.title.localeCompare(b.title);\n    });\n\n    var html = data.hits.length ? data.hits.map(function (course) {\n      return \"<div>\\n          <a\\n            data-id=\\\"\" + htmlEscape(course.id) + \"\\\"\\n            class=\\\"courseview-listeitem--root noLine\\\"\\n            href=\\\"./angebot/detail.html?kurs=\" + htmlEscape(course.coursid) + \"\\\"\\n          >\\n            <div class=\\\"courseview-listeitem\\\">\\n              <div class=\\\"courseview-listeitem__nr\\\">\\n                <p>\" + htmlEscape(course.coursid) + \"&nbsp;</p>\\n              </div>\\n              <div class=\\\"courseview-listeitem__title\\\">\\n                <h3>\" + htmlEscape(course.title) + \"</h3>\\n              </div>\\n              <div class=\\\"courseview-listeitem__date\\\">\\n                <p>\\n                  \" + course.executions.sort(function (a, b) {\n        console.log({ a: a, b: b });\n        return a.start.sort - b.start.sort;\n      }).map(function (execution) {\n        return htmlEscape(execution.start.print) + \" \\u2013 \" + htmlEscape(execution.end.print) + \"<br />\";\n      }).join(\"\") + \"\\n                </p>\\n              </div>\\n            </div>\\n          </a>\\n        </div>\";\n    }).join(\"\") : \"<h3 class=\\\"noResult\\\">Keine Treffer.</h3>\";\n\n    $(\"#courseview-result\").html(html);\n  }).fail(function () {\n    console.log(\"error\");\n  }).always(function () {\n    submitBtn.removeClass(\"button-submitting\");\n  });\n}\n\n// Wait for the DOM to be ready\n$(function () {\n  $(\"input[type=radio]\").uncheckableRadio();\n\n  // form restore\n  $(\"#filter-form\").submit(function (event) {\n    update();\n    return false;\n  });\n\n  // load on start\n  update();\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9SZXNvdXJjZXMvUHJpdmF0ZS9KYXZhU2NyaXB0L2NvdXJzZXZpZXcuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Vc2VyTGlzdC9SZXNvdXJjZXMvUHJpdmF0ZS9KYXZhU2NyaXB0L2NvdXJzZXZpZXcuanM/NDEyYiJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBodG1sRXNjYXBlKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKVxuICAgIC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKVxuICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxuICAgIC5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKVxuICAgIC5yZXBsYWNlKC9gL2csIFwiJiM5NjtcIilcbiAgICAucmVwbGFjZSgvJy9nLCBcIiYjMzk7XCIpO1xufVxuXG4oZnVuY3Rpb24gKCQpIHtcbiAgJC5mbi51bmNoZWNrYWJsZVJhZGlvID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJhZGlvID0gdGhpcyxcbiAgICAgICAgbGFiZWwgPSAkKCdsYWJlbFtmb3I9XCInICsgcmFkaW8uaWQgKyAnXCJdJyk7XG4gICAgICBpZiAobGFiZWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGxhYmVsID0gJChyYWRpbykuY2xvc2VzdChcImxhYmVsXCIpO1xuICAgICAgfVxuICAgICAgdmFyIGxhYmVsX3JhZGlvID0gbGFiZWwuYWRkKHJhZGlvKTtcbiAgICAgIGxhYmVsX3JhZGlvLm1vdXNlZG93bihmdW5jdGlvbiAoKSB7XG4gICAgICAgICQocmFkaW8pLmRhdGEoXCJ3YXNDaGVja2VkXCIsIHJhZGlvLmNoZWNrZWQpO1xuICAgICAgfSk7XG4gICAgICBsYWJlbF9yYWRpby5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkKHJhZGlvKS5kYXRhKFwid2FzQ2hlY2tlZFwiKSkge1xuICAgICAgICAgIHJhZGlvLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59KShqUXVlcnkpO1xuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIHZhciBzdWJtaXRCdG4gPSAkKFwiI2ZpbHRlci1mb3JtLXN1Ym1pdFwiKTtcbiAgLy8gc3VibWl0QnRuLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gIC8vIGNvbnNvbGUubG9nKCdzdWJtaXRCdG4nLCBzdWJtaXRCdG4pO1xuICBzdWJtaXRCdG4uYWRkQ2xhc3MoXCJidXR0b24tc3VibWl0dGluZ1wiKTtcblxuICAkKFwicmFkaW9cIikuYmluZChcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnJlbW92ZUF0dHIoXCJjaGVja2VkXCIpO1xuICB9KTtcblxuICAkKFwiLm5vUmVzdWx0XCIpLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuXG4gIC8vIEFzc2lnbiBoYW5kbGVycyBpbW1lZGlhdGVseSBhZnRlciBtYWtpbmcgdGhlIHJlcXVlc3QsXG4gIC8vIGFuZCByZW1lbWJlciB0aGUganFYSFIgb2JqZWN0IGZvciB0aGlzIHJlcXVlc3RcbiAgJC5hamF4KHtcbiAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgdXJsOiBcIi9zaWduYWx3ZXJrL2NvdXJzZW92ZXJ2aWV3L2dldEFqYXhEYXRhXCIsXG4gICAgZGF0YToge1xuICAgICAgZmlsdGVyVHh0OiAkKFwiaW5wdXRbbmFtZT10ZXh0XVwiKS52YWwoKSwgLy8gdGV4dFxuICAgIH0sXG4gIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGRhdGEuaGl0cy5zb3J0KChhLCBiKSA9PiBhLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSkpO1xuXG4gICAgICBjb25zdCBodG1sID0gZGF0YS5oaXRzLmxlbmd0aFxuICAgICAgICA/IGRhdGEuaGl0c1xuICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgKGNvdXJzZSkgPT5cbiAgICAgICAgICAgICAgICBgPGRpdj5cbiAgICAgICAgICA8YVxuICAgICAgICAgICAgZGF0YS1pZD1cIiR7aHRtbEVzY2FwZShjb3Vyc2UuaWQpfVwiXG4gICAgICAgICAgICBjbGFzcz1cImNvdXJzZXZpZXctbGlzdGVpdGVtLS1yb290IG5vTGluZVwiXG4gICAgICAgICAgICBocmVmPVwiLi9hbmdlYm90L2RldGFpbC5odG1sP2t1cnM9JHtodG1sRXNjYXBlKGNvdXJzZS5jb3Vyc2lkKX1cIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb3Vyc2V2aWV3LWxpc3RlaXRlbVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY291cnNldmlldy1saXN0ZWl0ZW1fX25yXCI+XG4gICAgICAgICAgICAgICAgPHA+JHtodG1sRXNjYXBlKGNvdXJzZS5jb3Vyc2lkKX0mbmJzcDs8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY291cnNldmlldy1saXN0ZWl0ZW1fX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgPGgzPiR7aHRtbEVzY2FwZShjb3Vyc2UudGl0bGUpfTwvaDM+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY291cnNldmlldy1saXN0ZWl0ZW1fX2RhdGVcIj5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICR7Y291cnNlLmV4ZWN1dGlvbnNcbiAgICAgICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh7IGEsIGIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuc3RhcnQuc29ydCAtIGIuc3RhcnQuc29ydDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAoZXhlY3V0aW9uKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7aHRtbEVzY2FwZShleGVjdXRpb24uc3RhcnQucHJpbnQpfSDigJMgJHtodG1sRXNjYXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRpb24uZW5kLnByaW50XG4gICAgICAgICAgICAgICAgICAgICAgICApfTxiciAvPmBcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAuam9pbihcIlwiKX1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L2Rpdj5gXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuam9pbihcIlwiKVxuICAgICAgICA6IGA8aDMgY2xhc3M9XCJub1Jlc3VsdFwiPktlaW5lIFRyZWZmZXIuPC9oMz5gO1xuXG4gICAgICAkKFwiI2NvdXJzZXZpZXctcmVzdWx0XCIpLmh0bWwoaHRtbCk7XG4gICAgfSlcbiAgICAuZmFpbChmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIpO1xuICAgIH0pXG4gICAgLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG4gICAgICBzdWJtaXRCdG4ucmVtb3ZlQ2xhc3MoXCJidXR0b24tc3VibWl0dGluZ1wiKTtcbiAgICB9KTtcbn1cblxuLy8gV2FpdCBmb3IgdGhlIERPTSB0byBiZSByZWFkeVxuJChmdW5jdGlvbiAoKSB7XG4gICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiKS51bmNoZWNrYWJsZVJhZGlvKCk7XG5cbiAgLy8gZm9ybSByZXN0b3JlXG4gICQoXCIjZmlsdGVyLWZvcm1cIikuc3VibWl0KGZ1bmN0aW9uIChldmVudCkge1xuICAgIHVwZGF0ZSgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgLy8gbG9hZCBvbiBzdGFydFxuICB1cGRhdGUoKTtcbn0pO1xuIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUhBO0FBUUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUdBO0FBa0JBO0FBQ0E7QUFDQTtBQUVBO0FBQUE7QUF0QkE7QUFDQTtBQW9DQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./Resources/Private/JavaScript/courseview.js\n");

/***/ }),

/***/ 1:
/*!**********************************************************!*\
  !*** multi ./Resources/Private/JavaScript/courseview.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./Resources/Private/JavaScript/courseview.js */"./Resources/Private/JavaScript/courseview.js");


/***/ })

/******/ })["default"];
});