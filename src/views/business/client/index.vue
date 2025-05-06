<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧客户端列表 -->
      <el-col :span=6>
        <div class="client-list">
          <span v-if="clientList.length === 0">未有识别的客户端</span>
          <el-card
            v-else
            v-for="client in clientList"
            :key="client.id"
            class="client-card"
            :class="{ 'selected-card': selectedClientId === client.id }"
            :style="{
              backgroundColor: selectedClientId === client.id
                ? client.state === 0
                  ? '#c0dcfc'
                  : client.state === 1
                  ? '#b7e1cd'
                  : '#ffcccc'
                : client.state === 0
                ? '#E8F4FF'
                : client.state === 1
                ? '#e8f5e9'
                : '#ffebee'
            }"
            @click.native="selectClient(client)"
          >
            <el-descriptions :column="1">
              <template #title>
                <div class="title-container">
                  <span>{{ client.name }}</span>
                  <div class="active-button">
                    <el-button
                      @click.stop="activeClientHandler(client)"
                      :type="client.active === 1 ? 'success' : 'warning'"
                      size="mini"
                    >
                      {{ client.active === 1 ? '已激活' : '休眠' }}
                    </el-button>
                  </div>
                </div>
              </template>
              <el-descriptions-item label="客户端名称">
                <el-row>
                  <el-col :span="24">{{ client.name }}</el-col>
                </el-row>
              </el-descriptions-item>
              <el-descriptions-item label="IP地址">{{ client.ip }}</el-descriptions-item>
              <el-descriptions-item label="端口">{{ client.port }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag effect="dark" :type="client.state | statusFilter">{{ client.state | statusTextFilter }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>


        </div>
      </el-col>

      <!-- 右侧操作区域 -->
      <el-col :span=18>
        <el-card class="operation-panel">
          <!-- 折叠区域 -->
          <el-collapse v-model="activeNames" accordion>
            <!-- 资源使用情况 -->
            <el-collapse-item name="1">
              <template #title>
                <div class="resource-usage-title">
                  <span>设备信息</span>
                  <div v-if="!activeNames.includes('1')" class="usage-summary">
                    <span class="usage-item" v-for="(usage, index) in resourceUsage" :key="index">
                      <span class="usage-label">{{ usage.label }}:</span>
                      <el-progress
                        :percentage="usage.percentage"
                        :stroke-width="6"
                        :show-text="false"
                        :color="usage.color"
                        style="width: 60px; margin-left: 8px;"
                      />
                      <span class="usage-value">{{ usage.percentage }}%</span>
                    </span>
                  </div>
                </div>
              </template>
              <!-- 分块展示 -->
              <div>
                <el-row :gutter="20" style="margin-bottom: 20px;">
                  <el-col :span=24>
                    <el-card>
                      <el-row :gutter="20">
                        <el-col :span=16>
                          <el-descriptions title="系统信息" :column="2" border>
                            <el-descriptions-item label="操作系统">{{ systemInfo.OS }} - {{ systemInfo.OS_Version }}</el-descriptions-item>
                            <el-descriptions-item label="机器名称">{{ systemInfo.Machine_Name }}</el-descriptions-item>
                            <el-descriptions-item label="内存大小">{{ systemInfo.RAM_total + 'MB'}}</el-descriptions-item>
                            <el-descriptions-item label="网络状态">{{ systemInfo.Network_Status }}</el-descriptions-item>
                          </el-descriptions>
                        </el-col>
                        <el-col :span=8>
                          <PieChart  v-if="activeNames === '1'" :title="'Disk 使用情况'" :data="diskData" :unit="'MB'"/>
                        </el-col>
                      </el-row>
                    </el-card>
                  </el-col>
                </el-row>

                <el-row :gutter="20" style="margin-bottom: 20px;">
                  <el-col :span=24>
                    <el-card>
                      <el-row :gutter="20">
                        <el-col :span=8>
                          <el-descriptions title="CPU 信息" :column="1" border>
                            <el-descriptions-item label="CPU型号">{{ systemInfo.CPU_Model }}</el-descriptions-item>
                            <el-descriptions-item label="CPU核心数">{{ systemInfo.CPU_core }}</el-descriptions-item>
                            <el-descriptions-item label="CPU线程数">{{ systemInfo.CPU_threads }}</el-descriptions-item>
                          </el-descriptions>
                        </el-col>
                        <el-col :span=8>
                          <PieChart  v-if="activeNames === '1'" :title="'CPU 使用情况'" :data="cpuData" :unit="'%'"/>
                        </el-col>
                        <el-col :span=8>
                          <PieChart  v-if="activeNames === '1'" :title="'CPU 内存使用情况'" :data="cpuMemData" :unit="'MB'"/>
                        </el-col>
                      </el-row>
                    </el-card>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span=24>
                    <el-card>
                      <el-row :gutter="20">
                        <el-col :span=8>
                          <el-descriptions title="GPU 信息" :column="1" border>
                            <el-descriptions-item label="GPU型号">{{ systemInfo.GPU_Model }}</el-descriptions-item>
                            <el-descriptions-item label="GPU核心数">{{ systemInfo.GPU_core }}</el-descriptions-item>
                          </el-descriptions>
                        </el-col>
                        <el-col :span=8>
                          <PieChart  v-if="activeNames === '1'" :title="'GPU 使用情况'" :data="gpuData" :unit="'%'"/>
                        </el-col>
                        <el-col :span=8>
                          <PieChart  v-if="activeNames === '1'" :title="'GPU 内存使用情况'" :data="gpuMemData" :unit="'MB'"/>
                        </el-col>
                      </el-row>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </el-collapse-item>

            <el-collapse-item name="4">
              <template #title>
                <div class="task-title-container">
                  <span class="task-title">训练任务信息</span>
                  <div v-if="activeNames !== '4'">
                    <div v-if="assignmentInfo.AssignmentName" class="task-summary">
                      <el-tag class="task-name">{{ assignmentInfo.AssignmentName }}</el-tag>
                      <el-progress
                        :percentage="assignmentInfo.trainPercentage"
                        class="title-progress"
                        :show-text="false"
                        style="width: 100px; margin-left: 8px;"
                      />
                      <span class="usage-value">{{ assignmentInfo.trainPercentage }}%</span>
                    </div>
                    <span v-else class="no-task">暂无进行中的训练任务</span>
                  </div>
                </div>
              </template>

              <div v-if="assignmentInfo.AssignmentName" class="task-content">
                <el-row :gutter="20">
                  <!-- 左侧圆形进度条 -->
                  <el-col :span=6 class="progress-container">
                    <el-progress
                      :percentage="assignmentInfo.trainPercentage"
                      type="circle"
                      :width="120"
                      :stroke-width="8"
                    />
<!--                    <div class="progress-label">训练进度</div>-->
                    <el-tooltip content="只有在训练模型阶段才可以停止任务">
                      <span>
                        <el-button
                          type="warning" plain
                          class="progress-label"
                          :disabled="this.assignmentInfo.Train_Process !== 'Train_Model'"
                          @click="stopTrainHandler"
                        >停止任务</el-button>
                      </span>
                    </el-tooltip>

                  </el-col>

                  <!-- 右侧参数信息 -->
                  <el-col :span=18 class="params-container">
                    <el-descriptions :column="2" border>
                      <el-descriptions-item label="任务名称" :span=2>
                        <el-tag effect="dark" type="info">{{ assignmentInfo.AssignmentName }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="所属项目">
                        <el-tag>{{ assignmentInfo.ProjectName || '-' }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="训练阶段">
                        <el-tag type="warning">{{ assignmentInfo.Train_Process }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="开始时间">
                        {{ assignmentInfo.startTime || '2024-03-20 14:30' }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </el-col>
                </el-row>
              </div>

              <div v-else class="no-task-panel">
                <el-empty description="当前没有进行中的训练任务" :image-size="85" />
              </div>
            </el-collapse-item>

            <!-- 指令发送区域 -->
            <el-collapse-item title="指令发送" name="3">
              <el-form :model="commandForm" label-width="120px">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 10px;">
                  <el-form-item label="选择指令">
                    <el-select v-model="commandForm.commandStr" placeholder="请选择指令">
                      <el-option label="获取客户端状态信息" value="GetClientState"></el-option>
                      <el-option label="获取训练进度详细信息" value="GetTrainState"></el-option>
                      <el-option label="开始训练" value="StartTrain"></el-option>
                      <el-option label="停止训练" value="StopTrain"></el-option>
                      <el-option label="暂停训练" value="PauseTrain"></el-option>
                      <el-option label="调整训练参数" value="ChangeTrainPara"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-button type="primary" @click="sendCommand" style="margin-left: 50px; margin-bottom: 20px">发送指令</el-button>
                </div>

                <el-form-item label="项目名称" v-if="commandForm.commandStr === 'StartTrain' || commandForm.commandStr === 'ChangeTrainPara'">
                  <el-input v-model="commandForm.projectName" />
                </el-form-item>
                <el-form-item label="任务名称" v-if="commandForm.commandStr === 'StartTrain' || commandForm.commandStr === 'ChangeTrainPara'">
                  <el-input v-model="commandForm.assignmentName" />
                </el-form-item>

                <el-form-item label="训练参数" v-if="commandForm.commandStr === 'StartTrain' || commandForm.commandStr === 'ChangeTrainPara'">
                  <el-input v-model="commandForm.trainPara.PreTrain_Model" placeholder="预训练模型 (N/S/M/L/X)" />
                  <el-input v-model="commandForm.trainPara.Epoch" placeholder="Epoch (30~300)" />
                  <el-input v-model="commandForm.trainPara.BatchSize" placeholder="BatchSize" />
                  <el-input v-model="commandForm.trainPara.ImgSize" placeholder="ImgSize" />
                </el-form-item>
              </el-form>
            </el-collapse-item>

            <!-- 日志列表 -->
            <el-collapse-item title="日志列表" name="2">
              <div class="log-container">
                <ClientLog :client-id="selectedClientId" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改客户端对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户端名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入客户端名称" />
        </el-form-item>
        <el-form-item label="客户端ip" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入客户端ip" />
        </el-form-item>
        <el-form-item label="客户端端口" prop="port">
          <el-input v-model="form.port" placeholder="请输入客户端端口" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-input v-model="form.state" placeholder="请输入状态" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getClient,
  delClient,
  addClient,
  updateClient,
  listAllClient,
  getClientStatus,
  sendCommandToClient,
  activeClient, stopTrain
} from '@/api/business/client'
import ClientLog from '@/views/business/clientLog/index.vue'
import PieChart from '@/components/echarts/pieCharts.vue' // 引入饼图组件

export default {
  name: "Client",
  components: { ClientLog, PieChart },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status] || 'info'
    },
    statusTextFilter(status) {
      const statusMap = {
        0: '空闲',
        1: '训练中',
        2: '离线'
      }
      return statusMap[status] || '未知'
    },
    logStatusFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'danger'
      }
      return statusMap[status] || 'info'
    },
    logStatusTextFilter(status) {
      const statusMap = {
        0: '成功',
        1: '失败'
      }
      return statusMap[status] || '未知'
    }
  },
  data() {
    return {
      systemInfo: {
        OS: '-',
        OS_Version: '-',
        Machine_Name: '-',
        CPU_Model: '-',
        GPU_Model: '-',
        Network_Status: '-',
        CPU_core: '_',
        CPU_threads: '_',
        GPU_core: '_',
        RAM_total: '_'
      },
      resourceDetail: {
        CPU_Mem: { Used_MB: 0, Total_MB: 0 },
        GPU_Mem: { Used_MB: 0, Total_MB: 0 },
        Disk: { Used_MB: 0, Total_MB: 0 }
      },
      trainProcess: '-',
      selectedClientId: 0,
      commandForm: {
        commandStr: '',
        clientName: '',
        projectName: '',
        trainPara: {
          PreTrain_Model: '',
          Epoch: '',
          BatchSize: '',
          ImgSize: ''
        }
      },
      assignmentInfo: {
        assignmentName: '',
        trainPercentage: 0,
        pretrainMode: '',
        epoch: 0,
        batchSize: 0,
        imgSize: 0,
        description: ''
      },
      logList: [],
      logLoading: false,
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      clientList: [],
      title: "",
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        ip: null,
        port: null,
        state: null,
      },
      pieData: [],
      form: {},
      rules: {
        name: [
          { required: true, message: "客户端名称不能为空", trigger: "blur" }
        ],
        ip: [
          { required: true, message: "客户端ip不能为空", trigger: "blur" }
        ],
        port: [
          { required: true, message: "客户端端口不能为空", trigger: "blur" }
        ],
        state: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ]
      },
      cpuData: [],
      cpuMemData: [],
      gpuData: [],
      gpuMemData: [],
      diskData: [],
      activeNames: '4',
      clientStatusInterval: null,
      selectedClientName: '',
    };
  },
  created() {
    this.getList();
    this.clientStatusInterval = setInterval(() => this.fetchAndSetClientStatus(this.selectedClientName), 2000);

  },
  computed: {
    resourceUsage() {
      return [
        {
          label: 'CPU',
          percentage: this.calculateUsage(this.cpuData),
          color: '#409EFF'
        },
        {
          label: 'GPU',
          percentage: this.calculateUsage(this.gpuData),
          color: '#E6A23C'
        },
        {
          label: 'DISK',
          percentage: this.calculateUsage(this.diskData),
          color: '#909399'
        },
        {
          label: 'CPU MEM',
          percentage: this.calculateUsage(this.cpuMemData),
          color: '#67C23A'
        },
        {
          label: 'GPU MEM',
          percentage: this.calculateUsage(this.gpuMemData),
          color: '#F56C6C'
        }
      ];
    },
    pieChartData() {
      return [
        { title: 'CPU', data: this.cpuData, unit: '%' },
        { title: 'CPU MEM', data: this.cpuMemData, unit: 'MB' },
        { title: 'GPU', data: this.gpuData, unit: '%' },
        { title: 'GPU MEM', data: this.gpuMemData, unit: 'MB' },
        { title: 'DISK', data: this.diskData, unit: 'MB' }
      ];
    }
  },
  beforeDestroy() {
    if (this.clientStatusInterval) {
      clearInterval(this.clientStatusInterval);
    }
  },
  methods: {
    stopTrainHandler() {
      stopTrain(this.selectedClientName).then(e => {
        this.$message.success('已发送暂停任务指令');
        row.active = e.data
      })
    },
    activeClientHandler(row) {
      activeClient(row.id).then(e => {
        this.$message.success(e.data === 1? '激活客户端成功': '客户端停止接取任务');
        row.active = e.data
      })
    },
    calculateUsage(data) {
      let tempData;
      if (!data || data.length === 0) {
        tempData = [{ value: 0, name: '已使用' },]
      } else {
        tempData = data
        console.log(data)
      }
      const used = tempData.find(item => item.name === '已使用').value;
      const total = tempData.reduce((sum, item) => sum + item.value, 0);
      return total > 0 ? parseFloat(((used / total) * 100).toFixed(2)) : 0;
    },
    selectClient(client) {
      this.selectedClientId = Number(client.id);
      this.commandForm.clientName = client.name;
      this.selectedClientName = client.name
      this.fetchAndSetClientStatus(client.name);
    },
    async fetchAndSetClientStatus(clientName) {
      listAllClient(this.queryParams).then(response => {
        this.clientList = response.data;

      });
      if (!clientName || clientName === '') return;
      const status = await getClientStatus(clientName);
      try {
        const clientState = status.data.mcGetClientStateFeedBack.ClientState
        // 更新系统信息
          this.systemInfo = {
            OS: clientState.SystemInfo?.OS || '-',
            RAM_total: clientState.SystemInfo?.RAM_Total_MB || '-',
            OS_Version: clientState.SystemInfo?.OS_Version || '-',
            Machine_Name: clientState.SystemInfo?.Machine_Name || '-',
            CPU_Model: clientState.SystemInfo?.CPU_Model || '-',
            GPU_Model: clientState.SystemInfo?.GPU_Model || '-',
            Network_Status: clientState.SystemInfo?.Network_Status || '-',
            CPU_core: clientState.ResourceUsage?.CPU.Cores || '_',
            CPU_threads: clientState.ResourceUsage?.CPU.Threads || '_',
            GPU_core: clientState.ResourceUsage?.GPU.Cores || '_'
          };

          // 更新资源详细信息
          this.resourceDetail = {
            CPU_Mem: {
              Used_MB: status.data.ResourceUsage?.CPU?.Mem?.Used_MB || 0,
              Total_MB: status.data.ResourceUsage?.CPU?.Mem?.Total_MB || 0
            },
            GPU_Mem: {
              Used_MB: status.data.ResourceUsage?.GPU?.Mem?.Used_MB || 0,
              Total_MB: status.data.ResourceUsage?.GPU?.Mem?.Total_MB || 0
            },
            Disk: {
              Used_MB: status.data.ResourceUsage?.Disk?.Used_MB || 0,
              Total_MB: status.data.ResourceUsage?.Disk?.Total_MB || 0
            }

          };
          console.log(clientState)
          console.log(clientState.ResourceUsage)
          console.log(clientState.ResourceUsage.CPU.Usage)
          this.cpuData = this.formatPieData(clientState.ResourceUsage.CPU.Usage);
          this.cpuMemData = this.formatPieData(clientState.ResourceUsage.CPU.Mem.Used_MB, clientState.ResourceUsage.CPU.Mem.Total_MB);
          this.gpuData = this.formatPieData(clientState.ResourceUsage.GPU.Usage);
          this.gpuMemData = this.formatPieData(clientState.ResourceUsage.GPU.Mem.Used_MB, clientState.ResourceUsage.GPU.Mem.Total_MB);
          this.diskData = this.formatPieData(clientState.ResourceUsage.Disk.Used_MB, clientState.ResourceUsage.Disk.Total_MB);

          // 更新训练过程状态
          this.trainProcess = status.data.mcGetTrainStateFeedBack.TrainState?.Train_Process || '-';
        } catch (e) {
          this.systemInfo= {
            OS: '-',
              OS_Version: '-',
              Machine_Name: '-',
              CPU_Model: '-',
              GPU_Model: '-',
              Network_Status: '-',
              CPU_core: '_',
              CPU_threads: '_',
              GPU_core: '_',
              RAM_total: '_'
          }
          this.resourceDetail= {
            CPU_Mem: { Used_MB: 0, Total_MB: 0 },
            GPU_Mem: { Used_MB: 0, Total_MB: 0 },
            Disk: { Used_MB: 0, Total_MB: 0 }
          }
          this.trainProcess= '-'
          this.cpuData = []
          this.cpuMemData = []
          this.gpuData =[]
          this.gpuMemData = []
          this.diskData = []
        }
        try {
          const trainState = status.data.mcGetTrainStateFeedBack.TrainState

          this.assignmentInfo = {
            trainPercentage: trainState.Train_Percentage,
            ...trainState
          }
        } catch (e) {
          this.assignmentInfo = {
            assignmentName: null,
            trainPercentage: null,
          }
      }
    },
    formatPieData(value, total) {
      if (total) {
        if (total === 0) {
          return []
        }
        return [
          { value: value, name: '已使用' },
          { value: total - value, name: '剩余' }
        ];
      } else {
        value = Number(value.replace('%', ''))
        if (value === 0) {
          return []
        }
        return [
          { value: Number(value.toFixed(2)), name: '已使用' },
          { value: Number((100 - value).toFixed(2)), name: '剩余' }
        ];
      }

    },
    async sendCommand() {
      if (!this.commandForm.commandStr) {
        this.$message.warning('请选择有效指令');
        return;
      }

      // 获取当前选中客户端的信息
      const selectedClient = this.clientList.find(client => client.id === this.selectedClientId);
      if (!selectedClient) {
        this.$message.warning('请先选择客户端');
        return;
      }

      try {
        // 构建 jsonMessage 字段
        const jsonMessage = JSON.stringify({
          CommandStr: this.commandForm.commandStr,
          ClientName: selectedClient.name,
          ...(this.commandForm.commandStr === 'StartTrain' || this.commandForm.commandStr === 'ChangeTrainPara' ?
            { ProjectName: this.commandForm.projectName,
              AssignmentName: this.commandForm.assignmentName,
              TrainPara: this.commandForm.trainPara
            } : {})
        });

        // 调用后端接口
        const { data } = await sendCommandToClient({
          name: selectedClient.name,
          jsonMessage
        });

        this.$message.success('指令发送成功');
      } catch (error) {
        this.$message.error('指令发送失败');
      }
    },
    getList() {
      this.loading = true;
      listAllClient(this.queryParams).then(response => {
        this.clientList = response.data;
        if (this.clientList.length > 0) {
          this.selectClient(this.clientList[0]);
        }
        this.loading = false;
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: null,
        name: null,
        ip: null,
        port: null,
        state: null,
        createTime: null
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加客户端";
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getClient(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改客户端";
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateClient(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addClient(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除客户端编号为"' + ids + '"的数据项？').then(function() {
        return delClient(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleExport() {
      this.download('business/client/export', {
        ...this.queryParams
      }, `client_${new Date().getTime()}.xlsx`);
    }
  }
};
</script>

<style lang="scss" scoped>

.client-list {
  max-height: calc(100vh - 150px);
  overflow-y: auto;

  .client-card {
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;

    ::v-deep .el-descriptions__title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .title-container {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .active-button {
          margin-left: auto;
          flex-shrink: 0;
        }
      }
    }



    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    ::v-deep.el-descriptions__body {
      background-color: inherit !important;
    }

    &.selected-card {
      border: 1px solid #409EFF;

      ::v-deep.el-descriptions__body {
        background-color: inherit !important;
      }
    }
  }
}

.operation-panel {

  .command-area {
    margin-bottom: 20px;
  }

  .resource-usage-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .usage-summary {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-left: 5px;
  }

  .usage-item {
    display: flex;
    align-items: center;
  }

  .usage-label {
    font-weight: bold;
    margin-right: 2px;
    margin-left: 2px;
  }

  .usage-value {
    margin-left: 3px;
    font-size: 10px;
    color: #666;
  }

  .log-area {
    margin-top: 20px;
  }
}
.client-log {
  max-height: 300px; /* 设置最大高度 */
  overflow-y: auto; /* 超出内容时出现垂直滚动条 */
  padding-right: 10px; /* 给滚动条留空间 */
  border: 1px solid #e4e7ed; /* 可选：给日志区域加个边框 */
  border-radius: 4px; /* 可选：圆角边框 */
}

.assignment-details {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.no-assignment {
  padding: 20px;
  text-align: center;
  color: #909399;
}

::v-deep .el-descriptions__body {
  background: #ffffff;
}

::v-deep .el-progress-bar {
  padding-right: 0;
  margin-right: 0;
}

.task-title-container {
  display: flex;
  align-items: center;
  width: 100%;

  .task-title {
    margin-right: 20px;
  }

  .task-summary {
    display: flex;
    align-items: center;
    flex-grow: 1;

    .task-name {
      margin-right: 15px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .title-progress {
      margin-left: 30px;
    }
  }

  .no-task {
    color: #909399;
    font-size: 0.9em;
  }
}

.task-content {
  padding: 16px;

  .progress-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;

    .progress-label {
      margin-top: 12px;
      color: #606266;
      font-size: 14px;
    }
  }

  .params-container {
    padding: 0 20px;

    .description-text {
      line-height: 1.6;
      color: #606266;
    }

    ::v-deep .el-tag {
      margin: 2px 0;
    }
  }
}

.no-task-panel {
  padding: 11px 0;
  text-align: center;
  background: #f8f9fa;
}

::v-deep .el-collapse-item__content {
  padding-bottom: 10px;
  max-height: 630px;
  overflow-y: auto;
  overflow-x: hidden;
}


</style>
