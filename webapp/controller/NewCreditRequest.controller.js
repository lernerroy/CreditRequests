/*global location */

sap.ui.define(
  [
    "IAI/zcns_mng_crd12/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "IAI/zcns_mng_crd12/model/formatter",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    MessageToast,
    Fragment,
    UIColumn,
    MColumn,
    ColumnListItem,
    Filter,
    FilterOperator
  ) {
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
        _getViewModel: function () {
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

        onAccountAssignmentChange: function (oEvent) {
          var oViewModel = this._getViewModel();
          var sVal = oEvent.getSource().getSelectedKey();
          oViewModel.setProperty("/wbsVisible", sVal === "P" ? true : false);
          oViewModel.setProperty(
            "/costCenterVisible",
            sVal === "K" ? true : false
          );
          oViewModel.setProperty("/assetVisible", sVal === "A" ? true : false);
          oViewModel.setProperty(
            "/networkVisible",
            sVal === "N" ? true : false
          );
        },

        _bindView: function () {
          var oModel = this.getModel();

          var oContext = oModel.createEntry("/credit_requestSet", {
            properties: {},
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
            success: function (oEvent) {
              self
                .getModel("newCreditRequestViewModel")
                .setProperty("/busy", false);
              MessageToast.show(
                self.getResourceBundle().getText("newCreditRequestSuccessMsg")
              );
              self.onNavBack();
            },
            error: function (error) {
              self
                .getModel("newCreditRequestViewModel")
                .setProperty("/busy", false);
            },
          });
        },

        onCancel: function () {
          this.onNavBack();
        },

        // ================= Value Helps ===================
        onMaterialValueHelpRequested: function (oEvent) {
          var oView = this.getView();
          var self = this;

          if (!self._oMaterialDialog) {
            Fragment.load({
              id: oView.getId(),
              name: "IAI.zcns_mng_crd12.fragments.material",
              controller: this,
            }).then(function (oDialog) {
              self._oMaterialDialog = oDialog;
              // connect dialog to the root view of this component (models, lifecycle)
              oView.addDependent(oDialog);
              oDialog.open();
              self._handleMaterialValueHelp(oDialog);
            });
          } else {
            self._oMaterialDialog.open();            
          }
        },

        _handleMaterialValueHelp: function (oDialog) {
          var self = this;

          oDialog.getTableAsync().then(function (oTable) {
            var oModel = self.getModel();
            oTable.setModel(oModel);

            // For Desktop and tabled the default table is sap.ui.table.Table
            if (oTable.bindRows) {
              // Bind rows to the ODataModel and add columns
              oTable.bindAggregation("rows", {
                path: "/MaterialSet",
                events: {
                  dataReceived: function () {
                    oDialog.update();
                  },
                },
              });
              oTable.addColumn(
                new UIColumn({
                  label: self.getResourceBundle().getText("materialCode"),
                  template: "Matnr",
                })
              );
              oTable.addColumn(
                new UIColumn({
                  label: self.getResourceBundle().getText("materialText"),
                  template: "Maktx",
                })
              );
            }

            // For Mobile the default table is sap.m.Table
            if (oTable.bindItems) {
              // Bind items to the ODataModel and add columns
              oTable.bindAggregation("items", {
                path: "/MaterialSet",
                template: new ColumnListItem({
                  cells: [
                    new Label({ text: "{Matnr}" }),
                    new Label({ text: "{Maktx}" }),
                  ],
                }),
                events: {
                  dataReceived: function () {
                    oDialog.update();
                  },
                },
              });
              oTable.addColumn(
                new MColumn({
                  header: new Label({
                    text: self.getResourceBundle().getText("materialCode"),
                  }),
                })
              );
              oTable.addColumn(
                new MColumn({
                  header: new Label({
                    text: self.getResourceBundle().getText("materialText"),
                  }),
                })
              );
            }
            oDialog.update();
          });
        },

        onMaterialValueHelpOkPress: function (oEvent) {
          var aTokens = oEvent.getParameter("tokens");
          if (aTokens && aTokens.length) {
            var sKey = aTokens[0].getKey();
            this.getModel().setProperty(
              "Matnr",
              sKey,
              this._oForm.getBindingContext()
            );
          }
          oEvent.getSource().close();
        },
        onMaterialValueHelpCancelPress: function (oEvent) {
          oEvent.getSource().close();
        },
        onMaterialFilterSearch: function (oEvent) {
          var aSelectionSet = oEvent.getParameter("selectionSet");
          var aFilters =
            aSelectionSet &&
            aSelectionSet.reduce(function (aResult, oControl) {
              if (oControl.getValue()) {
                aResult.push(
                  new Filter({
                    path: oControl.getName(),
                    operator: FilterOperator.Contains,
                    value1: oControl.getValue(),
                  })
                );
              }

              return aResult;
            }, []);

          var oFilter = new Filter({
            filters: aFilters,
            and: true,
          });

          var self = this;
          this._oMaterialDialog.getTableAsync().then(function (oTable) {
            if (oTable.bindRows) {
              oTable.getBinding("rows").filter(oFilter);
            }
            if (oTable.bindItems) {
              oTable.getBinding("items").filter(oFilter);
            }
            self._oMaterialDialog.update();
          });
        },
      }
    );
  }
);
