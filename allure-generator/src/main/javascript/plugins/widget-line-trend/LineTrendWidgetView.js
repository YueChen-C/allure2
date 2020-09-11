import './styles.scss';
import template from './LineTrendWidgetView.hbs';
import {View} from 'backbone.marionette';
import {className, regions} from '../../decorators/index';
import LineChartView from "../../components/graph-line-chart/lineChartView";


@regions({
    chart: '.line-trend__chart'
})
@className('line-trend')
class LineTrendWidgetView extends View {
    template = template;

    onRender() {
        this.showChildView('chart', new LineChartView({
            model: this.model,
            hideLines: true,
            hidePoints: true
        }));
    }
}

export default LineTrendWidgetView;
