sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
  "use strict";

  return {
    currencyValue: function (sValue) {
      if (!sValue) {
        return "";
      }

      return parseFloat(sValue).toFixed(2);
    },

    oDataDateFormat: function (oDate) {
        debugger;
      if (!oDate) {
        return null;
      }
      return DateFormat.getDateTimeInstance({
        pattern: "yyyy-MM-ddTKK:mm:ss",
      }).format(oDate);
    },
  };
});
