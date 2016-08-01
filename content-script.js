var popup = $("<div></div>").hide().css({position: "absolute", "z-index": "7777", width: "auto", height: "auto", "max-width": "600px", left: "0px", top: "0px"});
$('body').after(popup);

// $.getJSON(
//   // NB: using Open Exchange Rates here, but you can use any source!
//   'https://openexchangerates.org/api/latest.json?app_id=0f72ef31c1ed43e3bd2be66951ac951e',
//   function(data) {
//     // Check money.js has finished loading:
//     if ( typeof fx !== "undefined" && fx.rates ) {
//       fx.rates = data.rates;
//       fx.base = data.base;
//     } else {
//       // If not, apply to fxSetup global:
//       var fxSetup = {
//         rates : data.rates,
//         base : data.base
//       }
//     }
//   }
// );

fx.base = "USD";
fx.rates = {
	"EUR" : 0.745101, // eg. 1 USD === 0.745101 EUR
	"GBP" : 0.647710, // etc...
	"HKD" : 7.781919,
	"USD" : 1,        // always include the base rate (1:1)
	"JPY" : 102.31,
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var baseCurrency = "USD";
	var targetCurrency = "JPY";
	var data = {}
	if (message.method == "getSelection") {
		console.log(window.getSelection().toString());
			var selectedString = window.getSelection().toString();
			var coords = getSelectionCoords();
			if (!(isNaN(selectedString))) {
				var baseValue = Number(selectedString);
				var exchangeValue = fx.convert(baseValue, {from: baseCurrency, to: targetCurrency});
				popup.text(exchangeValue);
				popup.css({left: coords.x + window.scrollX, top: coords.y + window.scrollY - 20});
				popup.show();
				console.log(exchangeValue);
			}
	}
	sendResponse(data);
});

// SOURCE: http://stackoverflow.com/questions/9495007/indenting-code-in-sublime-text-2
function getSelectionCoords(win) {
  win = win || window;
  var doc = win.document;
  var sel = doc.selection, range, rects, rect;
  var x = 0, y = 0;
  if (sel) {
    if (sel.type != "Control") {
      range = sel.createRange();
      range.collapse(true);
      x = range.boundingLeft;
      y = range.boundingTop;
    }
  } else if (win.getSelection) {
    sel = win.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getClientRects) {
        range.collapse(true);
        rects = range.getClientRects();
        if (rects.length > 0) {
          rect = rects[0];
        }
        x = rect.left;
        y = rect.top;
      }
  		// Fall back to inserting a temporary element
  		if (x == 0 && y == 0) {
      	var span = doc.createElement("span");
      	if (span.getClientRects) {
					// Ensure span has dimensions and position by
					// adding a zero-width space character
					span.appendChild( doc.createTextNode("\u200b") );
					range.insertNode(span);
					rect = span.getClientRects()[0];
					x = rect.left;
					y = rect.top;
					var spanParent = span.parentNode;
					spanParent.removeChild(span);

					// Glue any broken text nodes back together
					spanParent.normalize();
        }
      }
    }
  }
  return { x: x, y: y };
}