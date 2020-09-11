
import TrendCollection from '../../data/trend/TrendCollection';
import LineTrendWidgetView from "./LineTrendWidgetView";

allure.api.addWidget(
    'performance',
    'line-trend',
    LineTrendWidgetView,
    TrendCollection
);