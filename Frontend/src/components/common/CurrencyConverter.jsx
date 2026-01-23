import React, { useState } from "react";
import Card from "./Card";

const CurrencyConverter = ({ amount = 2999 }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const exchangeRates = {
    USD: { rate: 0.012, symbol: "$", name: "US Dollar" },
    EUR: { rate: 0.011, symbol: "€", name: "Euro" },
    GBP: { rate: 0.0095, symbol: "£", name: "British Pound" },
    AED: { rate: 0.044, symbol: "د.إ", name: "UAE Dirham" },
    SGD: { rate: 0.016, symbol: "S$", name: "Singapore Dollar" },
    AUD: { rate: 0.019, symbol: "A$", name: "Australian Dollar" },
    CAD: { rate: 0.017, symbol: "C$", name: "Canadian Dollar" },
  };

  const convertedAmount = (amount * exchangeRates[selectedCurrency].rate).toFixed(2);
  const currencyInfo = exchangeRates[selectedCurrency];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">💱</span>
          </div>
          <div>
            <h3 className="text-xl font-secondary font-bold text-navy">
              Currency Converter
            </h3>
            <p className="text-sm text-gray-600">
              See prices in your local currency
            </p>
          </div>
        </div>

        {/* INR Amount */}
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Indian Rupee (INR)</p>
          <p className="text-3xl font-bold text-navy">
            ₹{amount.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Currency Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Convert to:
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg font-medium"
          >
            {Object.entries(exchangeRates).map(([code, info]) => (
              <option key={code} value={code}>
                {info.symbol} {info.name} ({code})
              </option>
            ))}
          </select>
        </div>

        {/* Converted Amount */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
          <p className="text-sm mb-1 opacity-90">Approximate Amount</p>
          <p className="text-3xl font-bold">
            {currencyInfo.symbol}
            {convertedAmount}
          </p>
          <p className="text-xs mt-2 opacity-75">
            Exchange rate: 1 INR = {currencyInfo.symbol}
            {exchangeRates[selectedCurrency].rate}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Prices shown are approximate conversions for
            reference only. All payments are processed in Indian Rupees (₹).
            Exchange rates are updated periodically.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CurrencyConverter;
