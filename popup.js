var currencies = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUP', 'CVE', 'CYP', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EEK', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LVL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MTL', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SKK', 'SLL', 'SOS', 'SRD', 'STD', 'SYP', 'SZL', 'THB', 'TJS', 'TMM', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'USS', 'UYU', 'UZS', 'VEB', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XFO', 'XFU', 'XOF', 'XPD', 'XPF', 'XPT', 'XTS', 'XXX', 'YER', 'ZAR', 'ZMK', 'ZWD'];

var base;
var target;

chrome.runtime.sendMessage({name: "popupStartup"}, function(response) {
  base = response.base;
  target = response.target;
  load();
});

function load() {

  var fromCurrencySelector = document.getElementById("fromCurrencySelector");
  var toCurrencySelector = document.getElementById("toCurrencySelector");

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
    fromCurrencySelector.addEventListener('change', function() {
      base = this.value; // in case switching both at once
      chrome.runtime.sendMessage({name: "popupChange", base: this.value, target: target}, function(response) {
        //
      });
    });
    toCurrencySelector.addEventListener('change', function() {
      target = this.value; // in case switching both at once
      chrome.runtime.sendMessage({name: "popupChange", base: base, target: this.value}, function(response) {
        //
      });
    });
  }
}
