/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"IAI/zcns_mng_crd12/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
