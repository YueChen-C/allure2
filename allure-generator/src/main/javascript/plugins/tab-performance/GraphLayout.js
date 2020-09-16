import AppLayout from '../../layouts/application/AppLayout';


import LineTrendWidgetView from "../widget-line-trend/LineTrendWidgetView";
import LineCollection from "../../data/line/LineCollection";
import WidgetsGridLineView from "../../components/widgets-grid-line/WidgetsGridLineView";


export default class GraphLayout extends AppLayout {
    initialize() {
        this.collection = new LineCollection(LineTrendWidgetView,{name:'memory-trend'});
        console.log(this.collection)
    }

    loadData() {
        return this.collection.fetch();
    }

    getContentView() {

        return new WidgetsGridLineView({model: this.collection, tabName: 'performance'});

        // return new LineTrendWidgetView({model: this.collection});
    }
}
