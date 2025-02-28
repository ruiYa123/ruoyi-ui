<template>
  <div :style="{ width: '100%', height: '300px', position: 'relative' }">
    <div ref="chart" :style="{ width: '100%', height: '100%' }"></div>
    <div v-if="isNoData" :style="noDataStyle">暂无数据</div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'PieChart',
  props: {
    title: String,
    data: Array,
    unit: ''
  },
  data() {
    return {
      chart: null
    };
  },
  computed: {
    isNoData() {
      return this.data.every(item => item.value === 0);
    },
    noDataStyle() {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '16px',
        color: '#999'
      };
    }
  },
  mounted() {
    this.initChart();
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.updateChart();
      }
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart);
      this.setChartOptions();
    },
    updateChart() {
      if (this.chart) {
        const isZeroData = this.data.length === 1 && this.data[0].value === 0;
        const option = {
          series: [
            {
              data: this.data,
              label: {
                show: !isZeroData // 动态更新 label 显示状态
              }
            }
          ]
        };
        this.chart.setOption(option, false); // 使用 setOption 更新数据，避免销毁图表
      } else {
        this.initChart(); // 如果图表尚未初始化，则初始化
      }
    },
    setChartOptions() {
      console.log(this.data)
      let isZeroData = false;
      if (this.data.length === 0) {
        isZeroData = true
      }
      isZeroData = this.data.length === 1 && this.data[0].value === 0;
      console.log(isZeroData)
      const option = {
        title: {
          text: this.title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `${params.seriesName}<br/>${params.marker} ${params.name}: ${params.value} ${this.unit}`;
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: this.title,
            type: 'pie',
            radius: '50%',
            data: this.data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
          }
        ]
      };
      this.chart.setOption(option);
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

};
</script>

<style scoped>
</style>
