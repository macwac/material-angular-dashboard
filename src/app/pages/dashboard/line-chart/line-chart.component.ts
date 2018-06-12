import * as d3 from 'd3';
import * as nv from 'nvd3';

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-line-chart',
  styleUrls: ['./line-chart.component.scss'],
  templateUrl: './line-chart.component.html',
})
export class LineChartComponent implements OnInit {
  private container;
  private maxX = 14;
  private xStep = 0.125;
  private columns = this.maxX / 2;
  private margin = 20;
  private data;
  private xDrawStep = 4;
  private drawStep = this.xStep * this.xDrawStep;
  private durationResizeAnimation = 500;
  private svg;
  private svgHeight;
  private svgWidth;
  private barsLayout;
  private lineChart;
  private timer;
  private xAxis = 'TIME';
  private yAxis = 'REVENUE';

  public ngOnInit() {
    this.container = d3.select('.line-chart__container');
    this.data = [
      {
        values: [],
        key: 'Awesome',
        color: 'rgb(80, 150, 215)',
        graphFunction(i) {
          const INTERVAL_1 = 2.8;
          const INTERVAL_2 = 7.1;
          const INTERVAL_3 = 11.0;

          if (i < INTERVAL_1) {
            this.values.push({ x: i, y: (3.43 * i * i - 6.7 * i) / 14 });
          } else if (i < INTERVAL_2) {
            this.values.push({ x: i, y: -(i - 7.1) * (i - 7.1) / 10.26 + 2.378 });
          } else if (i < INTERVAL_3) {
            this.values.push({ x: i, y: -0.4 / (i - 4.3) + 2.53 });
          } else {
            this.values.push({
              x: i,
              y: ((i - 11.4) * (i - 11.4) * (i - 11.4)) / 13 + 2.476,
            });
          }
        },
      },
      {
        values: [],
        key: 'Good',
        color: 'rgb(0, 188, 212)',
        fillOpacity: 0.00001,
        area: true,

        graphFunction(i) {
          const INTERVAL_1 = 3.0;
          const INTERVAL_2 = 8.2;

          if (i < INTERVAL_1) {
            this.values.push({ x: i, y: (3.255 * i * i - 9.6 * i) / 16 });
          } else {
            if (i < INTERVAL_2) {
              this.values.push({ x: i, y: (-1.055 * (i - 8.03) * (i - 8.03) + 27) / 15 });
            } else {
              this.values.push({ x: i, y: ((i - 9) * (i - 9) * (i - 9)) / 120 + 1.805 });
            }
          }
        },
      },
      {
        values: [],
        key: 'Fail',
        color: 'rgb(255, 82, 82)',

        graphFunction(i) {
          const INTERVAL_1 = 3.1;
          const INTERVAL_2 = 10.3;

          if (i < INTERVAL_1) {
            this.values.push({ x: i, y: (2.255 * i * i - 9.1 * i) / 13 });
          } else {
            if (i < INTERVAL_2) {
              this.values.push({ x: i, y: .82 * Math.sin((i - 4.5) / 2.1) });
            } else {
              this.values.push({ x: i, y: -(i - 13) * (i - 13) * (i - 13) / 64 });
            }
          }
        },
      },
    ];

    if (this.container[0][0]) {
      this.drawChart();
    }
  }

  private addSvgContainer() {
    this.svg = this.container.append('div').append('svg');
  }

  private getSvgSizes() {
    const svgWidth = getComputedStyle(this.svg[0][0]).width;
    const svgHeight = getComputedStyle(this.svg[0][0]).height;
    this.svgWidth = svgWidth.slice(0, svgWidth.length - 2);
    this.svgHeight = +svgHeight.slice(0, svgHeight.length - 2) - this.margin;
  }

  private addAxisLabels() {
    this.container.selectAll('svg .y-axis-label').remove();
    this.container.select('svg')
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('x', -(23 + this.yAxis.length * 7))
      .attr('y', '12')
      .attr('transform', 'rotate(-90)')
      .text(this.yAxis || '');

    this.container.select('svg')
      .append('text')
      .attr('class', 'x-axis-label')
      .text(this.xAxis || '');
  }

  private buildBackground() {
    this.addSvgContainer();
    this.getSvgSizes();

    const bars = Array(this.columns).fill(this.svgHeight);

    this.barsLayout = this.svg.append('g')
      .attr('class', 'bars')
      .attr('transform', 'translate(' + this.margin + ', 0)')
      .selectAll('rect')
      .data(bars)
      .enter()
      .append('rect');

    this.addAxisLabels();

    this.setBackgroundSizes();
  }

  private setBackgroundSizes() {
    const availableBarWidth = (this.svgWidth - 2 * this.margin) / this.columns;
    const barWidth = availableBarWidth / 2;
    this.barsLayout
      .attr('fill', '#4a4a4a')
      .attr('y', this.margin)
      .attr('height', (d, i) => d)
      .transition().duration(this.durationResizeAnimation)
      .attr('width', barWidth)
      .attr('x', (d, i) => i * availableBarWidth);
    this.container.select('svg .x-axis-label')
      .transition().duration(this.durationResizeAnimation)
      .attr('x', this.svgWidth - this.margin - 7 - this.xAxis.length * 7)
      .attr('y', this.svgHeight - (this.svgHeight) / 4 + this.margin + this.maxX);
  }

  private drawChart() {
    this.buildBackground();
    this.buildLegend();
    this.buildNvGraph();
    this.animateGraphs();
  }

  private buildNvGraph() {
    this.tuneNvGraph();

    nv.addGraph(() => {
      this.svg.datum(this.data)
        .transition().duration(0)
        .call(this.lineChart);
      nv.utils.windowResize(this.resizeBackground.bind(this));
      nv.utils.windowResize(this.lineChart.update);
      return this.lineChart;
    });
  }

  private tuneNvGraph() {
    this.lineChart = nv.models.lineChart()
      .margin({ top: this.margin, right: this.margin, bottom: 0, left: this.margin })
      .useInteractiveGuideline(true)
      .xDomain([0, this.maxX])
      .yDomain([-1.01, 3])
      .showLegend(false)
      .showYAxis(true)
      .showXAxis(true)
      .pointSize(5);

    this.lineChart.tooltip.enabled(false);
    this.lineChart.interactiveLayer.tooltip.enabled(false);

    this.lineChart.xAxis
      .showMaxMin(false)
      .tickValues([0]);

    this.lineChart.yAxis
      .showMaxMin(false)
      .ticks(10);
  }

  private buildLegend() {
    const legend = this.container.append('div')
      .attr('class', 'legend')
      .selectAll('.legend__item')
      .data(this.data)
      .enter()
      .append('div')
      .attr('class', 'legend__item');

    legend.append('div')
      .attr('class', 'legend__mark pull-left')
      .style('background-color', d => d.color);

    legend.append('div')
      .attr('class', 'legend__text')
      .text(d => d.key);
  }

  private resizeBackground() {
    this.getSvgSizes();
    this.setBackgroundSizes();
  }

  private animateGraphs() {
    let i = 0;
    this.timer = setInterval(
      () => {
        this.calcAllGraphs(i);
        this.drawNextStep(i);
        i += this.xStep;
        this.checkEndOfAnimation(i);
      },
      Math.round(400 / ((this.maxX / this.xStep) / this.xDrawStep)),
    );
  }

  private drawNextStep(i) {
    if (i !== 0 && i % this.drawStep === 0 || i === this.maxX) {
      this.lineChart.update();
    }
  }

  private checkEndOfAnimation(i) {
    if (i >= this.maxX + 1) {
      this.lineChart.duration(this.durationResizeAnimation);
      this.data.forEach((item) => {
        item.fillOpacity = 0.11;
      });

      clearInterval(this.timer);
      this.lineChart.update();
    }
  }

  private calcAllGraphs(i) {
    this.data.forEach(item => item.graphFunction(i));
  }
}