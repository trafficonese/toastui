import "widgets";
import * as utils from "./utils";

export function ProxyGrid() {
  if (HTMLWidgets.shinyMode) {
    Shiny.addCustomMessageHandler("proxy-toastui-grid-addrows", function (obj) {
      var grid = utils.getWidget(obj.id);
      if (typeof grid != "undefined") {
        const data = [];
        for (let i = 0; i < obj.data.nrow; i += 1) {
          const row = {};
          for (let j = 0; j < obj.data.ncol; j += 1) {
            row[obj.data.colnames[j]] = obj.data.data[j][i];
          }
          data.push(row);
        }
        grid.appendRows(data, true);
      }
    });
  }
}
