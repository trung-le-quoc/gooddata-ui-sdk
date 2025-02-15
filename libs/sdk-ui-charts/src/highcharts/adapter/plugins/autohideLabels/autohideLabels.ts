// (C) 2007-2022 GoodData Corporation
import { getChartType } from "../../../chartTypes/_chartCreators/helpers";

import {
    getDataLabelsGdcVisible,
    minimizeDataLabel,
    hideDataLabel,
    getDataLabelsGdcTotalsVisible,
} from "../../../chartTypes/_chartCreators/dataLabelsHelpers";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import {
    autohideColumnLabels,
    autohideColumnTotalLabels,
    handleColumnLabelsOutsideChart,
} from "./autohideColumnLabels";
import { autohideBarLabels, autohideBarTotalLabels, handleBarLabelsOutsideChart } from "./autohideBarLabels";
import autohidePieLabels from "./autohidePieLabels";
import autohideLabelsOverlappingItsShape from "./autohideLabelsOverlappingItsShape";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const autohideLabels = (Highcharts: any): void => {
    Highcharts.wrap(
        Highcharts.Chart.prototype,
        "hideOverlappingLabels",
        function (proceed: any, labels: any) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const chart = this;
            const chartType = getChartType(this);
            const dataLabelsUserVisibility = getDataLabelsGdcVisible(this);
            const totalLabelsVisibility = getDataLabelsGdcTotalsVisible(this);

            if (totalLabelsVisibility === "auto") {
                switch (chartType) {
                    case VisualizationTypes.COLUMN:
                        autohideColumnTotalLabels(chart);
                        break;
                    case VisualizationTypes.BAR:
                        autohideBarTotalLabels(chart);
                        break;
                }
            }

            if (dataLabelsUserVisibility === "auto") {
                switch (chartType) {
                    case VisualizationTypes.COLUMN:
                        autohideColumnLabels(chart);
                        return;
                    case VisualizationTypes.BAR:
                        autohideBarLabels(chart);
                        return;
                    case VisualizationTypes.PIE:
                    case VisualizationTypes.DONUT:
                        autohidePieLabels(chart);
                        return;
                    case VisualizationTypes.TREEMAP:
                    case VisualizationTypes.HEATMAP:
                        autohideLabelsOverlappingItsShape(chart);
                        return;
                    case VisualizationTypes.BUBBLE:
                        autohideLabelsOverlappingItsShape(chart, (point) => {
                            // only hide is not enough for combination with default label collision detection
                            minimizeDataLabel(point);
                            hideDataLabel(point);
                        });
                        proceed.call(this, labels);
                        return;
                }
            } else if (dataLabelsUserVisibility === true) {
                switch (chartType) {
                    case VisualizationTypes.COLUMN:
                        handleColumnLabelsOutsideChart(chart);
                        return;
                    case VisualizationTypes.BAR:
                        handleBarLabelsOutsideChart(chart);
                        return;
                }
            }

            proceed.call(this, labels);
        },
    );
};

export default autohideLabels;
