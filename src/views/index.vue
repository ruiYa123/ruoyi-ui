<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
      <el-row :gutter="20" >
        <el-col :span="16">
          <el-carousel :interval="5000" type="card" height="160px">
            <el-carousel-item v-for="notice in announcement" :key="notice.id">
              <el-card
                shadow="always"
                style="background-color: #e1f5fe; height: 140px; cursor: pointer;"
              >
                <div style="display: flex; align-items: center; justify-content: center;">
                  <div style="height: 20px; text-align: center; font-weight: bold; flex-grow: 1;"> {{ notice.noticeTitle }}</div>
                  <el-button type="text" class="el-icon-zoom-in" @click="openDialog(notice, 'view')" style="cursor: pointer; margin-left: 10px;"></el-button>
                </div>

                <editor v-model="notice.noticeContent" :height="80" read-only :show-toolbar="false" style="margin: 0; padding: 0;"/>
              </el-card>
            </el-carousel-item>
          </el-carousel>
        </el-col>
        <el-col :span="8" style="display: flex; flex-direction: column; height: 100%; position: relative;">
          <div v-if="notices.length === 0" style="flex: 1; display: flex; justify-content: center; align-items: center; height: 100%">
            <el-card style="height: 150px; width: 100%; background-color: #fafafa; display: flex; justify-content: center; align-items: center;">
              <div style="font-size: 18px; font-weight: bold;">暂无未读通知</div>
            </el-card>
          </div>


          <div v-else>
            <div v-for="(card, index) in notices" :key="index" :style="getCardStyle(index)" class="stacked-card">
              <el-card style="height: 150px; position: relative; background-color: #FFF8E6; border-radius: 10px; overflow: hidden;">
                <div style="padding: 10px; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                  <div style="font-size: 18px; font-weight: bold;"><i class="el-icon-warning-outline"></i>    {{ card.noticeTitle }}</div>
                </div>
                <el-button type="text" @click="confirmDelete(card)" style="position: absolute; bottom: 10px; right: 10px;">
                  <i class="el-icon-right"></i>查看通知
                </el-button>
              </el-card>
            </div>
          </div>
        </el-col>

      </el-row>

    <!-- 任务状态分布图表 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="mb-20"  style="height: 300px;">
          <el-col  :span="4">
            <el-card shadow="hover" style="margin-bottom: 3px">
              <div class="stat-item">
                <div class="stat-title">总项目数</div>
                <div class="stat-value">{{ projectTotal }}</div>
              </div>
            </el-card>
            <el-card shadow="hover" style="margin-bottom: 3px">
              <div class="stat-item">
                <div class="stat-title">总任务数</div>
                <div class="stat-value">{{ assignmentTotal }}</div>
              </div>
            </el-card>
            <el-card shadow="hover" style="margin-bottom: 3px">
              <div class="stat-item">
                <div class="stat-title">训练中任务数</div>
                <div class="stat-value">{{ trainingAssignment }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span = "20">
          <div ref="chart" style="height: 300px;"></div>
          </el-col>
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
        <el-card style="height: 300px" class="mb-20">
          <div  class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />客户账号
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
    <el-dialog :visible.sync="dialogVisible">
      <template #title>
        <span>{{ selectedNotice.noticeTitle }}</span>
      </template>
      <div>
        <editor v-model="selectedNotice.noticeContent" :min-height="300" read-only :show-toolbar="false" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleDialogAction">确 认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import userInfo from "./userInfo";
// import resetPwd from "./resetPwd";
import { mapGetters, mapActions } from 'vuex';
import { getUserProfile } from "@/api/system/user";
import * as echarts from 'echarts';
import { listAllProject } from '@/api/business/project'
import { listAllAssignment, listTraining } from '@/api/business/assignment'
import { listAllClient } from '@/api/business/client'
import userAvatar from '@/views/system/user/profile/userAvatar.vue'
import { checkRole } from '@/utils/permission'
import { listAllNotice } from '@/api/system/notice'

export default {
  components: { userAvatar },
  data() {
    return {
      dialogVisible: false,
      selectedNotice: {},
      announcement: [],
      messsage: [],
      user: {},
      trainingAssignment: 0,
      projects: [],
      assignments: [],
      clients: [],
      projectMap: {}, // 用于映射项目 ID 到项目名称
      noticeToDelete: null, // 用于存储待删除的通知
      dialogActionType: '',
    };
  },


  computed: {
    ...mapGetters(['notices']),
    projectTotal() {
      return this.projects.length;
    },
    uncheckedCount() {
      return this.notices.filter(notice => !notice.checked).length;
    },
    assignmentTotal() {
      return this.assignments.length;
    },
    assignmentsInProgress() {
      return this.assignments.filter(a => a.state === 1);
    }
  },

  methods: {
    ...mapActions('notice', ['fetchNotices', 'addNotice', 'removeNotice', 'checkNotice']),
    getCardStyle(index) {
      // 计算每个卡片的样式，使其堆叠并露出一个角
      return {
        position: 'absolute',
        width: '80%',

        top: `${index * 10}px`, // 每个卡片向下偏移10px
        left: `${index * 10}px`, // 每个卡片向右偏移10px
        zIndex: this.notices.length - index, // 确保最上层的卡片 zIndex 最高
      };
    },
    confirmDelete(card) {
      this.noticeToDelete = card;
      this.openDialog(card, 'delete');
    },
    openDialog(notice, actionType) {
      this.selectedNotice = notice; // 设置当前选择的通知
      this.dialogActionType = actionType; // 设置对话框操作类型
      this.dialogVisible = true; // 打开对话框
    },
    handleDialogAction() {
      if (this.dialogActionType === 'delete') {
        this.deleteNotice();
      } else {
        this.dialogVisible = false; // 关闭对话框
      }
    },
    deleteNotice() {
      if (this.noticeToDelete) {
        console.log(this.noticeToDelete)
        this.checkNotice(this.noticeToDelete.noticeId); // 调用删除方法
        this.dialogVisible = false; // 关闭对话框
        this.noticeToDelete = null; // 清空待删除的通知
      }
    },
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
        yAxis: { type: 'value', minInterval: 1 },
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
    listAllNotice().then(res => {
      console.log(res.data)
      this.announcement = res.data.filter(notice => notice.noticeType === "2");
      this.messsage=  res.data.filter(notice => notice.noticeType === "1");
    })
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

    this.assignments.forEach(assignment => {
      if (assignment.state !== 1) return;
      this.trainingAssignment++
    });

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
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
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
  margin-bottom: 16px;
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
  font-size: 14px;
  color: #606266; /* 添加项目名称的颜色 */
}
.stacked-card {
  background-color: rgba(255, 0, 0, 0.1); /* 添加背景色以便调试 */
  transition: all 0.3s ease; /* 添加过渡效果 */
  margin-left: 10px;
}

</style>
