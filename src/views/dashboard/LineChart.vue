<template>
  <div>
    <div ref="chart" style="width: 700px; height: 350px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      myChart: null,
    };
  },
  mounted() {
    this.myChart = echarts.init(this.$refs.chart);
    this.renderChart();
  },
  watch: {
    data: {
      handler: 'renderChart',
      deep: true,
    },
  },
  methods: {
    renderChart() {

      // 获取所有键并转换为数字
      const labels = Array.from({ length: 101 }, (_, i) => i);
      // 根据键获取损失和准确率数据
      const lossData = labels.map(key => (this.data[key.toFixed(1)] ? this.data[key.toFixed(1)][0].toFixed(2) : null));
      const accuracyData = labels.map(key => (this.data[key.toFixed(1)] ? this.data[key.toFixed(1)][1].toFixed(2)  : null));

      const option = {
        title: {
          text: 'Loss and Accuracy Curve',
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['Loss', 'Accuracy'],
        },
        xAxis: {
          type: 'category',
          data: labels,
          name: 'Training Progress (%)',
          nameLocation: 'middle',
          nameGap: 30,
          min:0,
          max:100
        },
        yAxis: {
          type: 'value',
          name: 'Value',
          min: 0,
          // max: 1,
        },
        series: [
          {
            name: 'Loss',
            type: 'line',
            data: lossData,
            smooth: true,
            lineStyle: {
              color: 'rgba(255, 99, 132, 1)',
            },
            connectNulls: true,
            showSymbol: false,
          },
          {
            name: 'Accuracy',
            type: 'line',
            data: accuracyData,
            smooth: true,
            lineStyle: {
              color: 'rgba(54, 162, 235, 1)',
            },
            connectNulls: true,
            showSymbol: false,
          },
        ],
      };

      this.myChart.setOption(option, { notMerge: true });
    }
  },
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.dispose();
    }
  },
};
</script>

<style scoped>
/* 这里可以添加样式 */
</style>
