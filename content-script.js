var popup = $("<div></div>").attr('id', 'popup').hide();
$('body').after(popup);

var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('css/main.css');
(document.head||document.documentElement).appendChild(style);

chrome.runtime.sendMessage({greeting: "hello"});

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

ratesUSD = {
	"USD" : 1,
	"JPY" : 100.83,
}

ratesJPY = {
	"USD" : 0.0099,
	"JPY" : 1,
}

var baseCurrency;
var targetCurrency;

var running = false;

$(document).on("keypress", function (e) {
	// keyboard letter 'e' 
	if (running && e.which == 101) {
		var selectedString = window.getSelection().toString();
		var parsedString = selectedString.replace(/[^\d\.\-\ ]/g, '');
		var coords = getSelectionCoords();
		if (!(isNaN(parsedString))) {
			var baseValue = Number(parsedString);
			var exchangeValue = fx.convert(baseValue, {from: baseCurrency, to: targetCurrency});
			var exchangeValueRounded = Math.round(exchangeValue * 100) / 100
			popup.text(numberWithCommas(exchangeValueRounded) + " " + targetCurrency);
			popup.css({left: coords.x + window.scrollX, top: coords.y + window.scrollY - 30});
			popup.show();
		}
	}
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	running = message.running;
	fx.base = message.base;
	if (message.base == "USD") {
		fx.rates = ratesUSD;
	} else {
		fx.rates = ratesJPY;
	}
	baseCurrency = message.base;
	targetCurrency = message.target;
	var data = {}
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

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}