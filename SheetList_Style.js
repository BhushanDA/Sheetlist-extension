define(["qlik", "jquery"], function (qlik, $) {
  "use strict";

  return {
    definition: {
      type: "items",
      component: "accordion",
      items: {
        style: {
          type: "items",
          label: "Style",
          items: {
            boxTitle: { type: "string", label: "Box Title", ref: "props.boxTitle", defaultValue: "Click a sheet to navigate:" },
            boxTitleColor: { type: "string", label: "Box Title Color", ref: "props.boxTitleColor", defaultValue: "#333333" },
            boxTitleFontSize: { type: "number", label: "Box Title Font Size", ref: "props.boxTitleFontSize", defaultValue: 16 },
            boxTitleBold: { type: "boolean", label: "Bold Box Title", ref: "props.boxTitleBold", defaultValue: true },
            boxTitleItalic: { type: "boolean", label: "Italic Box Title", ref: "props.boxTitleItalic", defaultValue: false },

            listFontColor: { type: "string", label: "List Font Color", ref: "props.listFontColor", defaultValue: "#007acc" },
            listFontSize: { type: "number", label: "List Font Size", ref: "props.listFontSize", defaultValue: 14 },
            listBold: { type: "boolean", label: "Bold List Items", ref: "props.listBold", defaultValue: false },
            listItalic: { type: "boolean", label: "Italic List Items", ref: "props.listItalic", defaultValue: false },

            borderColor: { type: "string", label: "Border Color", ref: "props.borderColor", defaultValue: "#cccccc" },
            borderWidth: { type: "number", label: "Border Width (px)", ref: "props.borderWidth", defaultValue: 1 },
            borderRadius: { type: "number", label: "Border Radius (px)", ref: "props.borderRadius", defaultValue: 6 },
            backgroundColor: { type: "string", label: "Background Color", ref: "props.backgroundColor", defaultValue: "#ffffff" },
            showThumbnails: { type: "boolean", label: "Show Sheet Thumbnails", ref: "props.showThumbnails", defaultValue: true },
            showSheetNames: { type: "boolean", label: "Show Sheet Names", ref: "props.showSheetNames", defaultValue: true },
            hideSheets: { type: "string", label: "Sheets to Hide (comma-separated)", ref: "props.hideSheets", defaultValue: "" }
          }
        },
        settings: { uses: "settings" }
      }
    },

    paint: function ($element, layout) {
      var app = qlik.currApp(this);

      var titleWeight = layout.props.boxTitleBold ? "bold" : "normal";
      var titleStyle = layout.props.boxTitleItalic ? "italic" : "normal";
      var listWeight = layout.props.listBold ? "bold" : "normal";
      var listStyle = layout.props.listItalic ? "italic" : "normal";

      var hideList = layout.props.hideSheets
        ? layout.props.hideSheets.split(",").map(s => s.trim().toLowerCase())
        : [];

      // Container
      var container = $("<div>").css({
        padding: "12px",
        border: layout.props.borderWidth + "px solid " + layout.props.borderColor,
        "border-radius": layout.props.borderRadius + "px",
        "background-color": layout.props.backgroundColor,
        "box-shadow": "0 2px 6px rgba(0,0,0,0.1)"
      });

      // Box Title
      var title = $("<div>").text(layout.props.boxTitle).css({
        "text-align": "center",
        "font-size": layout.props.boxTitleFontSize + "px",
        color: layout.props.boxTitleColor,
        "font-weight": titleWeight,
        "font-style": titleStyle,
        "margin-bottom": "10px",
        "padding-bottom": "6px",
        "border-bottom": "2px solid #e0e0e0"
      });

      // Sheet list
      var $ul = $("<ul>").css({
        padding: 0,
        margin: 0,
        "list-style-type": "none"
      });

      container.append(title).append($ul);
      $element.html(container);

      // Fetch sheets
      app.getAppObjectList("sheet", function (reply) {
        var sheets = reply.qAppObjectList.qItems || [];
        sheets.sort((a, b) => (a.qData.rank || 0) - (b.qData.rank || 0));
        $ul.empty();

        sheets.forEach(sheet => {
          if (hideList.includes(sheet.qMeta.title.toLowerCase())) return;

          var li = $("<li>").css({
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            "margin-bottom": "4px",
            cursor: "pointer",
            color: layout.props.listFontColor,
            "font-size": layout.props.listFontSize + "px",
            "font-weight": listWeight,
            "font-style": listStyle
          });

          if (layout.props.showThumbnails && sheet.qData?.thumbnail?.qUrl) {
            li.append($("<img>").attr("src", sheet.qData.thumbnail.qUrl).css({width: "24px", height: "24px", "border-radius": "4px"}));
          }
          if (layout.props.showSheetNames) {
            li.append($("<span>").text(sheet.qMeta.title));
          }

          li.on("click", () => qlik.navigation.gotoSheet(sheet.qInfo.qId));
          li.hover(() => li.css("text-decoration", "underline"), () => li.css("text-decoration", "none"));

          $ul.append(li);
        });
      });
    }
  };
});
