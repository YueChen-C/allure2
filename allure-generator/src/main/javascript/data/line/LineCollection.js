import {Collection, Model} from 'backbone';
import {uniq, flatten, keys, values, omit} from 'underscore';
export default class LineCollection extends Collection {

    initialize(models, options) {
        this.options = options;
    }

    url() {
        return `widgets/${this.options.name}.json`;
    }
    parse(data) {
        console.log(data)
        return data
    }

    getWidgetData(name) {
        const items = this.get(name);
        return new Model(items);
    }
}

