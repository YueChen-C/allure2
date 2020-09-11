import './styles.scss';
import {scaleLinear, scalePoint, scaleTime} from 'd3-scale';
import {schemeCategory20, scaleOrdinal} from 'd3-scale';
import {zoom} from 'd3-zoom'
import {timeFormat,timeParse} from 'd3-time-format'
import {extent, max} from 'd3-array';
import {area, stack, line, curveNatural} from 'd3-shape';
import translate from '../../helpers/t';
import BaseChartView from '../../components/graph-base/BaseChartView';
import TooltipView from '../../components/tooltip/TooltipView';
import {axisBottom, axisLeft} from "d3-axis";



class LineChartView extends BaseChartView {
    PAD_BOTTOM = 50;

    initialize(options) {
        this.x = scalePoint();
        this.y = scaleLinear();

        this.tooltip = new TooltipView({position: 'top'});
        this.color = options.colors || scaleOrdinal(schemeCategory20);

        options.notStacked && this.stack.offset(() => {
        });
        this.yTickFormat = options.yTickFormat || (d => d);
    }

    onAttach() {

        const data = this.model.toJSON()[0];
        if (data) {
            this.doShow(data);
        } else {
            this.$el.html(`<div class="widget__noitems">${translate('chart.trend.empty')}</div>`);
        }
        super.onAttach();
    }


    doShow(data) {
        this.setupViewport();
        var focusChartMargin = { top: 20, right: 0, bottom: 170, left: 80 };
        var contextChartMargin = { top: 360, right: 0, bottom: 90, left: 80 };

        // width of both charts
        var chartWidth = this.width - focusChartMargin.left - focusChartMargin.right;

        // height of either chart
        var focusChartHeight = this.height - focusChartMargin.top - focusChartMargin.bottom;
        var contextChartHeight = this.height - contextChartMargin.top - contextChartMargin.bottom;

        // bootstraps the d3 parent selection
        this.svg
            .append("svg")
            .attr("width", chartWidth + focusChartMargin.left + focusChartMargin.right)
            .attr("height", focusChartHeight + focusChartMargin.top + focusChartMargin.bottom)
            .append("g")
            .attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")");

        // function to parse date field
        var parseTime = timeParse("%d/%H:%M:%S");

        //group all dates to get range for x axis later
        var dates = [];
        for (let key of Object.keys(data)) {
            data[key].memoryData.forEach(bucketRecord => {
                dates.push(parseTime(bucketRecord.date));
            });
        }

        //get max Y axis value by searching for the highest conversion rate
        var maxYAxisValue = -Infinity;
        for (let key of Object.keys(data)) {
            let maxYAxisValuePerBucket = Math.ceil(max(data[key].memoryData, d => d["memory"]));
            maxYAxisValue = Math.max(maxYAxisValuePerBucket, maxYAxisValue+50);
        }

        // set the height of both y axis
        var yFocus = scaleLinear().range([focusChartHeight, 0]);
        var yContext = scaleLinear().range([contextChartHeight, 0]);

        // set the width of both x axis
        var xFocus = scaleTime().range([0, chartWidth]);
        var xContext = scaleTime().range([0, chartWidth]);

        // create both x axis to be rendered
        var xAxisFocus = axisBottom(xFocus)
            .ticks(10)
            .tickFormat(timeFormat("%d/%H:%M"));

        // create the one y axis to be rendered
        var yAxisFocus = axisLeft(yFocus).tickFormat(d => d + " MB");

        // build brush
        // build zoom for the focus chart
        // as specified in "filter" - zooming in/out can be done by pinching on the trackpad while mouse is over focus chart
        // zooming in can also be done by double clicking while mouse is over focus chart
        var tmp_zoom = zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([
                [0, 0],
                [chartWidth, focusChartHeight],
            ])
            .extent([
                [0, 0],
                [chartWidth, focusChartHeight],
            ])
            .filter(() => this.event.ctrlKey || this.event.type === "dblclick" || this.event.type === "mousedown");

        // create a line for focus chart
        var lineFocus = line()
            .x(d => xFocus(parseTime(d.date)))
            .y(d => yFocus(d.memory))
            .curve(curveNatural);

        // append the clip
        var focusChartLines = this.svg
            .append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")")
            .attr("clip-path", "url(#clip)");

        /* eslint-enable */

        // create focus chart
        var focus = this.svg
            .append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")");

        xFocus.domain(extent(dates));
        yFocus.domain([0, maxYAxisValue]);
        xContext.domain(extent(dates));
        yContext.domain(yFocus.domain());

        // add axis to focus chart
        focus
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + focusChartHeight + ")")
            .call(xAxisFocus);
        focus
            .append("g")
            .attr("class", "y-axis")
            .call(yAxisFocus);

        // get list of bucket names
        var bucketNames = [];
        for (let key of Object.keys(data)) {
            bucketNames.push(key);
        }

        // match colors to bucket name
        var colors = scaleOrdinal()
            .domain(bucketNames)
            .range(["#3498db", "#3cab4b", "#e74c3c", "#73169e", "#2ecc71"]);

        const legend = this.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(Object.keys(data))
            .enter().append("g")
            .attr("transform", function(d, i) {
                return "translate("+focusChartMargin.left+"," + i * 20 + ")";
            });
        legend.append("rect")
            .attr("x", 10)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", function(d) {
                return colors(d);
            });

        //append legend texts
        legend.append("text")
            .attr("x", 35)
            .attr("y", 12)
            .attr("dy", "0.32em")
            .attr("text-anchor", "start")
            .text(function(d) {
                return 'UDID：'+d+' AVG：'+data[d].average.toFixed(2)+' MB';
            });
        // go through data and create/append lines to both charts
        for (let key of Object.keys(data)) {
            let bucket = data[key].memoryData;
            focusChartLines
                .append("path")
                .datum(bucket)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", d => colors(key))
                .attr("stroke-width", 1.5)
                .attr("d", lineFocus);

        }
        this.svg
            .append("rect")
            .attr("cursor", "move")
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .attr("class", "zoom")
            .attr("width", chartWidth)
            .attr("height", focusChartHeight)
            .attr("transform", "translate(" + focusChartMargin.left + "," + focusChartMargin.top + ")")
            .call(tmp_zoom);

        // contextBrush.call(brush.move, [0, chartWidth]);

        // focus chart x label
        focus.append("text")
            .attr("transform", "translate(" + chartWidth / 2 + " ," + (focusChartHeight + focusChartMargin.top + 25) + ")")
            .style("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Times");

        // focus chart y label
        focus.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (-focusChartMargin.left + 20) + "," + focusChartHeight / 2 + ")rotate(-90)")
            .style("font-size", "18px")
            .text("Memory Rate");


    }

}

export default LineChartView;
