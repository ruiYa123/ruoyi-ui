<template>
  <div>
    <div ref="chart" style="width: 100%; height: 400px;"></div>
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
      deep: true, // 深度监听，以便在数据结构变化时重新渲染图表
    },
  },
  methods: {
    renderChart() {
      const labels = Object.keys(this.data);
      const lossData = labels.map(key => this.data[key][0]);
      const accuracyData = labels.map(key => this.data[key][1]);

      const option = {
        title: {
          text: 'Loss and Accuracy over Training Progress',
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
        },
        yAxis: {
          type: 'value',
          name: 'Value',
          min: 0,
          max: 1,
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
          },
          {
            name: 'Accuracy',
            type: 'line',
            data: accuracyData,
            smooth: true,
            lineStyle: {
              color: 'rgba(54, 162, 235, 1)',
            },
          },
        ],
      };

      this.myChart.setOption(option);
    },
  },
  beforeDestroy() {
    // 清理 ECharts 实例
    if (this.myChart) {
      this.myChart.dispose();
    }
  },
};
</script>

<style scoped>

</style>
