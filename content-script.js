var popup = $("<div></div>").attr('id', 'popup').hide();
$('body').after(popup);

var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('css/main.css');
(document.head||document.documentElement).appendChild(style);

/** 
	NOTE: There are many API's out there for getting currency exchange rates.
	(1) Open Exchange Rates - limit of 1000 hits, consider storing values if used
	(2) Google (i.e. https://www.google.com/finance/converter?a=100&from=USD&to=BTC&meta=ei%3Doj6zV4mjK8GC0gSZ-LHwDw)
	(3) Yahoo (i.e. http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDEUR%22,%20%22USDJPY%22,%20%22USDBGN%22,%20%22USDCZK%22,%20%22USDDKK%22,%20%22USDGBP%22,%20%22USDHUF%22,%20%22USDLTL%22,%20%22USDLVL%22,%20%22USDPLN%22,%20%22USDRON%22,%20%22USDSEK%22,%20%22USDCHF%22,%20%22USDNOK%22,%20%22USDHRK%22,%20%22USDRUB%22,%20%22USDTRY%22,%20%22USDAUD%22,%20%22USDBRL%22,%20%22USDCAD%22,%20%22USDCNY%22,%20%22USDHKD%22,%20%22USDIDR%22,%20%22USDILS%22,%20%22USDINR%22,%20%22USDKRW%22,%20%22USDMXN%22,%20%22USDMYR%22,%20%22USDNZD%22,%20%22USDPHP%22,%20%22USDSGD%22,%20%22USDTHB%22,%20%22USDZAR%22,%20%22USDISK%22)&env=store://datatables.org/alltableswithkeys)
	(4) --USING-- Rate Exchange (i.e. http://rate-exchange.herokuapp.com/fetchRate?from=CAD&to=USD)
**/

// (1) Open Exchange Rates
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

// TODO: Now doing currency API calls, so (1) update UI to allow selecting of different currencies, (2) make UX better
 
var baseCurrency;
var targetCurrency;

var running = false;

var showing = false;

chrome.runtime.sendMessage({name: "contentScriptStartup"}, function(response) {
	handleMessage(response);
});

// NOTE: using fx because it can handle lots of rates if we choose to store many rates at once (to save API calls)
$(document).on("keypress", function (e) {
	// keyboard letter 'e'
	if (running && e.which == 101) {
		if (showing) {
			popup.hide();
			showing = false;
		} else {
			var selectedString = window.getSelection().toString();
			var parsedString = selectedString.replace(/[^\d\.\-\ ]/g, '');
			var coords = getSelectionCoords();
			if (!(isNaN(parsedString)) && parsedString.length > 0) {
				var baseValue = Number(parsedString);
				var exchangeValue = fx.convert(baseValue, {from: baseCurrency, to: targetCurrency});
				var exchangeValueRounded = Math.round(exchangeValue * 100) / 100
				popup.text(numberWithCommas(exchangeValueRounded) + " " + targetCurrency);
				popup.css({left: coords.x + window.scrollX, top: coords.y + window.scrollY - 30});
				popup.show();
				showing = true;
			}
		}
	}
});

$(document).on("mousedown", function() {
	popup.hide();
	showing = false;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	handleMessage(message);
});

function handleMessage(message) {
	fx.rates = {};
	fx.rates[message.base] = 1;
	fx.rates[message.target] = message.rate;
	fx.base = message.base;
	baseCurrency = message.base;
	targetCurrency = message.target;
	running = message.running;
}

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