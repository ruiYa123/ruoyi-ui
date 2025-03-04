<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">总项目数</div>
            <div class="stat-value">{{ projectTotal }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">总任务数</div>
            <div class="stat-value">{{ assignmentTotal }}</div>
          </div>
        </el-card>
      </el-col>
<!--      <el-col :span="8">-->
<!--        <el-card shadow="hover">-->
<!--          <div class="stat-item">-->
<!--            <div class="stat-title">在线客户端</div>-->
<!--            <div class="stat-value">{{ onlineClients }}</div>-->
<!--          </div>-->
<!--        </el-card>-->
<!--      </el-col>-->
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-title">训练中任务数</div>
              <div class="stat-value">{{ trainingAssignment }}</div>
            </div>
          </el-card>
        </el-col>
    </el-row>

    <!-- 任务状态分布图表 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="mb-20"  style="height: 350px;">
          <div ref="chart" style="height: 350px;"></div>
        </el-card>
        <el-card  style="height: 350px;">
          <div slot="header" class="client-header">
            <span>训练中任务</span>
          </div>
          <div style="height: 280px; overflow: auto;">
            <div v-for="assignment in assignmentsInProgress" :key="assignment.id" class="assignment-card">
              <el-card shadow="hover"
                       :style="{
                         background: `linear-gradient(90deg, rgba(232, 245, 233) ${assignment.progress}%, rgba(255, 255, 255, 1) ${assignment.progress}%)`
                       }"
                       @click.native="toAssignment(assignment.id)"
              >
                <div class="assignment-content">
                  <div class="assignment-name">{{ assignment.assignmentName }}</div>
                  <div class="project-name">
                    <el-button type="primary" @click.stop="toProject(assignment.projectId)">
                      {{ projectMap[assignment.projectId] }}
                        <el-icon class="el-icon-right" ></el-icon>
                    </el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card style="height: 350px" class="mb-20">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
<!--            <div class="text-center">-->
<!--              <userAvatar />-->
<!--            </div>-->
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />客户名称
                <div class="pull-right">{{ user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="userName" />联系人姓名
                <div class="pull-right">{{ user.fullName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="location" />客户地址
                <div class="pull-right">{{ user.address }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />联系人电话
                <div class="pull-right">{{ user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />联系人邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>

                <li class="list-group-item">
                  <svg-icon icon-class="tree" />客户所属部门
                  <div class="pull-right" v-if="user.dept">{{ user.dept.deptNames }}</div>
                </li>
<!--              <li class="list-group-item">-->
<!--                <svg-icon icon-class="tree" />职位-->
<!--                <div class="pull-right" v-if="user.dept">{{ postGroup }}</div>-->
<!--              </li>-->
<!--              <li class="list-group-item">-->
<!--                <svg-icon icon-class="peoples" />所属角色-->
<!--                <div class="pull-right">{{ roleGroup }}</div>-->
<!--              </li>-->
<!--              <li class="list-group-item">-->
<!--                <svg-icon icon-class="date" />创建日期-->
<!--                <div class="pull-right">{{ user.createTime }}</div>-->
<!--              </li>-->
            </ul>
          </div>
        </el-card>
          <el-card v-if="checkRole(['admin'])" style="height: 350px">
            <div slot="header" class="client-header">
              <span>客户端信息</span>
            </div>
            <div style="height: 280px; overflow: auto">
              <div v-for="client in clients" :key="client.id">
                <el-card shadow="hover"
                         style="margin-bottom: 10px;"
                         :style="{
                   backgroundColor:
                     client.state === 0 ? '#E8F4FF' :
                     client.state === 1 ? '#e8f5e9' :
                     '#ffebee'
                 }"
                >
                  <div slot="header" class="client-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ client.name }}</span>
                    <el-tag :type="clientStateStyle(client.state).type" effect="dark">
                      {{ clientStateStyle(client.state).text }}
                    </el-tag>
                  </div>
                  <div class="client-info" style="font-size: 14px; line-height: 1;">
                    <div style="display: flex; justify-content: flex-start;">
                      <span style="flex-basis: 200px;">IP: {{ client.ip }}</span>
                      <span style="flex-basis: 100px;">端口: {{ client.port }}</span>
                    </div>
                    <div>最后上线: {{ client.createTime }}</div>
                  </div>
                </el-card>

              </div>
            </div>
          </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import userInfo from "./userInfo";
// import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";
import * as echarts from 'echarts';
import { listAllProject } from '@/api/business/project'
import { listAllAssignment, listTraining } from '@/api/business/assignment'
import { listAllClient } from '@/api/business/client'
import userAvatar from '@/views/system/user/profile/userAvatar.vue'
import { checkRole } from '@/utils/permission'

export default {
  components: { userAvatar },
  data() {
    return {
      user: {},
      trainingAssignment: 0,
      projects: [],
      assignments: [],
      clients: [],
      projectMap: {} // 用于映射项目 ID 到项目名称
    };
  },

  computed: {
    projectTotal() {
      return this.projects.length;
    },
    assignmentTotal() {
      return this.assignments.length;
    },
    onlineClients() {
      return this.clients.filter(c => c.state !== 2).length;
    },
    assignmentsInProgress() {
      return this.assignments.filter(a => a.state === 1);
    }
  },

  methods: {
    checkRole,
    toAssignment(assignmentId) {
      this.$router.push({
        path: '/assignment',
        query: {
          id: assignmentId,
          state: 1
        }
      });
    },
    toProject(projectId) {
      this.$router.push({
        path: '/project',
        query: {
          id: projectId
        }
      });
    },
    getUser() {
      getUserProfile().then(response => {
        this.user = response.data;
        this.roleGroup = response.roleGroup;
        this.postGroup = response.postGroup;
      });
    },
    // 客户端状态样式
    clientStateStyle(state) {
      switch (state) {
        case 0:
          return { type: 'warning', text: '空闲' };
        case 1:
          return { type: 'success', text: '训练中' };
        case 2:
          return { type: 'danger', text: '离线' };
        default:
          return { type: 'info', text: '未知' };
      }
    },

    // 初始化图表
    initChart() {
      const chart = echarts.init(this.$refs.chart);

      // 处理数据：按项目统计任务状态
      const projectMap = new Map();
      this.projects.forEach(p => {
        projectMap.set(p.id, {
          name: p.projectName,
          states: [0, 0, 0, 0] // 对应 0-3 四种状态
        });
      });

      this.assignments.forEach(a => {
        const project = projectMap.get(a.projectId);
        if (project && a.state >= 0 && a.state <= 3) {
          project.states[a.state]++;
        }
      });

      // 图表配置
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['已训练', '训练中', '队列中', '未训练'],
          top: 30
        },
        xAxis: {
          type: 'category',
          data: [...projectMap.values()].map(p => p.name)
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '已训练',
            type: 'bar',
            stack: 'total',
            data: [...projectMap.values()].map(p => p.states[0]),
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '训练中',
            type: 'bar',
            stack: 'total',
            data: [...projectMap.values()].map(p => p.states[1]),
            itemStyle: { color: '#E6A23C' }
          },
          {
            name: '队列中',
            type: 'bar',
            stack: 'total',
            data: [...projectMap.values()].map(p => p.states[2]),
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '未训练',
            type: 'bar',
            stack: 'total',
            data: [...projectMap.values()].map(p => p.states[3]),
            itemStyle: { color: '#909399' }
          }
        ]
      };

      chart.setOption(option);
      window.addEventListener('resize', () => chart.resize());
    }
  },

  async mounted() {
    this.getUser()
    const [
      { data: projects },
      { data: assignments },
    ] = await Promise.all([
      listAllProject(),
      listTraining(),
    ]);
    let clients = null;
    if (checkRole(['admin'])) {
      const response = await listAllClient();
      clients = response.data;
    }
    this.clients = clients;
    this.projects = projects;
    this.assignments = assignments;

    this.projectMap = projects.reduce((map, project) => {
      map[project.id] = project.projectName;
      return map;
    }, {});

    this.trainingAssignment = 0

    this.$nextTick(this.initChart);
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.client-info div {
  margin: 8px 0;
  color: #606266;
}

.mb-20 {
  margin-bottom: 20px;
}

.assignment-card {
  margin-bottom: 10px;
}

.assignment-content {
  display: flex;
  align-items: center;
}

.assignment-name {
  flex: 1;
  padding: 10px;
  font-size: 16px;
}

.project-name {
  //padding: 10px;
  font-size: 14px;
  color: #606266; /* 添加项目名称的颜色 */
}
</style>
