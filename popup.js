var currencies = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUP', 'CVE', 'CYP', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EEK', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LVL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MTL', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SKK', 'SLL', 'SOS', 'SRD', 'STD', 'SYP', 'SZL', 'THB', 'TJS', 'TMM', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'USS', 'UYU', 'UZS', 'VEB', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XFO', 'XFU', 'XOF', 'XPD', 'XPF', 'XPT', 'XTS', 'XXX', 'YER', 'ZAR', 'ZMK', 'ZWD'];

var base;
var target;
var running;

chrome.runtime.sendMessage({name: "popupStartup"}, function(response) {
  base = response.base;
  target = response.target;
  running = response.running;
  load();
});

var fromCurrencySelector = document.getElementById("fromCurrencySelector");
var toCurrencySelector = document.getElementById("toCurrencySelector");

var toggleSwitch = document.getElementById("toggle");
var separator = document.getElementById("separator");

fromCurrencySelector.onchange = function() {
  base = this.value; // in case switching both at once
  chrome.runtime.sendMessage({name: "popupChange", base: this.value, target: target});
};

toCurrencySelector.onchange = function() {
  target = this.value; // in case switching both at once
  chrome.runtime.sendMessage({name: "popupChange", base: base, target: this.value});
};

function load() {

  // Popuplate currencies for the two selectors and set their 'change' listeners
  for (var i=0; i<currencies.length; i++) {
    var fromOption = document.createElement("option");
    fromOption.value = currencies[i];
    fromOption.textContent = currencies[i];
    var toOption = fromOption.cloneNode(true);
    if (currencies[i] == base) {
      fromOption.selected = true;
    }
    fromCurrencySelector.appendChild(fromOption);
    if (currencies[i] == target) {
      toOption.selected = true;
    }
    toCurrencySelector.appendChild(toOption);
  }

  // Set the UI based on on/off state
  if (running) {
    turnOnUI();
  } else {
    turnOffUI();
  }

  // Toggle switch listener
  toggleSwitch.addEventListener('change', function() {
    if (toggleSwitch.checked) {
      turnOnUI();
      chrome.runtime.sendMessage({name: "toggle", running: true}, function(response) {
        //
      });
    } else {
      turnOffUI();
      chrome.runtime.sendMessage({name: "toggle", running: false}, function(response) {
        //
      });
    }
  });
}

function turnOffUI() {
  fromCurrencySelector.disabled = true;
  toCurrencySelector.disabled = true;
  toggleSwitch.checked = false;
  separator.style.color = "#ccc";
  separator.style.cursor = "default";
  separator.onclick = null;
}

function turnOnUI() {
  fromCurrencySelector.disabled = false;
  toCurrencySelector.disabled = false;
  toggleSwitch.checked = true;
  separator.style.color = "black";
  separator.style.cursor = "pointer";
  separator.onclick = function() {
    var fromCurrency = fromCurrencySelector.options[fromCurrencySelector.selectedIndex].value;
    var toCurrency = toCurrencySelector.options[toCurrencySelector.selectedIndex].value;
    fromCurrencySelector.value = toCurrency;
    toCurrencySelector.value = fromCurrency;
    base = toCurrency;
    target = fromCurrency;
    chrome.runtime.sendMessage({name: "popupChange", base: base, target: target});
  }
}