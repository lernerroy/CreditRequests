/*global location */

sap.ui.define(
  [
    "IAI/zcns_mng_crd12/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "IAI/zcns_mng_crd12/model/formatter",
    "sap/m/MessageToast"
  ],
  function (BaseController, JSONModel, formatter, MessageToast) {
    "use strict";

    return BaseController.extend(
      "IAI.zcns_mng_crd12.controller.NewCreditRequest",
      {
        formatter: formatter,

        /* =========================================================== */

        /* lifecycle methods                                           */

        /* =========================================================== */

        onInit: function () {
          var oViewModel = new JSONModel({
            busy: false,
            delay: 0,
            wbsVisible: false,
            costCenterVisible: false,
            assetVisible: false,
            networkVisible: false,
          });


          this.getRouter()
            .getRoute("newCreditRequest")
            .attachPatternMatched(this._onObjectMatched, this);

          this.setModel(oViewModel, "newCreditRequestViewModel");
        },
        _getViewModel: function(){
            return this.getModel("newCreditRequestViewModel");
        },
        /* =========================================================== */

        _onObjectMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").objectId;

          this.getModel()
            .metadataLoaded()
            .then(
              function () {
                this._bindView();
              }.bind(this)
            );
        },

        onAccountAssignmentChange: function(oEvent){
            var oViewModel = this._getViewModel();

            oViewModel.setProperty("/wbsVisible", oEvent.getParameter("value") ? true : false);
            oViewModel.setProperty("/costCenterVisible", oEvent.getParameter("value") ? true : false);
            oViewModel.setProperty("/assetVisible", oEvent.getParameter("value") ? true : false);
            oViewModel.setProperty("/networkVisible", oEvent.getParameter("value") ? true : false);
        },

        _bindView: function () {
          var oModel = this.getModel();

          var oContext = oModel.createEntry("/credit_requestSet", {
            properties: {}
          });

          this._oForm = this.getView().byId("creditRequestForm");
          this._oForm.setBindingContext(oContext);
        },

        onSave: function () {
          var oForm = this._oForm;
          var oItem = oForm.getBindingContext().getObject();

          var self = this;

          this.getModel("newCreditRequestViewModel").setProperty("/busy", true);
          // submit changes to server
          this.getModel().submitChanges({
              success: function(oEvent){
                self.getModel("newCreditRequestViewModel").setProperty("/busy", false);
                MessageToast.show(self.getResourceBundle().getText("newCreditRequestSuccessMsg"));
                self.onNavBack();
              },
              error: function(error) {
                self.getModel("newCreditRequestViewModel").setProperty("/busy", false);
              }
          });

        },

        onCancel: function() {
            this.onNavBack();
        },

        // ================= Value Helps ===================
        onValueHelpRequest: function (oEvent) {
          alert("Request");
        },
      }
    );
  }
);
