
import LineTrendWidgetView from "./LineTrendWidgetView";
// import TrendCollection from "../../data/trend/TrendCollection";
import LineCollection from "../../data/line/LineCollection";

allure.api.addWidget(
    'performance',
    'memory-trend',
    LineTrendWidgetView,
    LineCollection
);
allure.api.addWidget(
    'performance',
    'cpu-trend',
    LineTrendWidgetView,
    LineCollection
);