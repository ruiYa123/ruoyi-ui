<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane size="40" style="padding-right: 10px">
          <el-row :gutter="10" style="margin-bottom: 10px">
            <el-col :span="6">
              <el-button type="success" :class="{'success-active': queryParams.state === 0}" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="handleStateQuery(0)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <el-badge :value="completedCount" :max="99" :hidden="completedCount == 0 || completedCount == null" class="custom-badge">
                    <i class="el-icon-finished" style="font-size: 32px;"></i>
                  </el-badge>
                  <span style="font-size: 14px; margin-top: 5px;">已训练任务</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button :class="{'primary-active': queryParams.state === 1}" type="primary" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="handleStateQuery(1)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <el-badge :value="trainingCount" :max="99" :hidden="trainingCount == 0 || trainingCount == null" class="custom-badge">
                    <i class="el-icon-sort" style="font-size: 32px;"></i>
                  </el-badge>
                  <span style="font-size: 14px; margin-top: 5px;">训练中任务</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button :class="{'info-active': queryParams.state === 2}" type="info" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="handleStateQuery(2)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <el-badge :value="queuedCount" :max="99" :hidden="queuedCount === 0 || queuedCount == null" class="custom-badge">
                    <i class="el-icon-time" style="font-size: 32px;"></i>
                  </el-badge>
                  <span style="font-size: 14px; margin-top: 5px;">队列中任务</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button :class="{'warning-active': queryParams.state === 3}" type="warning" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="handleStateQuery(3)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <el-badge :value="unstartedCount" :max="99" :hidden="unstartedCount === 0 || unstartedCount == null" class="custom-badge">
                    <i class="el-icon-wallet" style="font-size: 32px;"></i>
                  </el-badge>
                  <span style="font-size: 14px; margin-top: 5px;">未训练任务</span>
                </div>
              </el-button>
            </el-col>
          </el-row>
          <el-form :model="queryParams" class="search-form-class" ref="queryForm" size="small" :inline="true" v-show="showSearch">
            <el-form-item label="任务名称" prop="assignmentName">
              <el-input
                v-model="queryParams.assignmentName"
                placeholder="请输入任务名称"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
                v-hasPermi="['business:assignment:add']"
              >新建任务</el-button>
            </el-form-item>
          </el-form>
          <div>
            <el-table
              ref="assignmentTable"
              v-loading="loading"
              :data="assignmentList"
              @row-click="handleRowClick"
              highlight-current-row
            >
              <el-table-column label="任务名称" align="center" prop="assignmentName" />
              <el-table-column label="所属项目" align="center">
                <template v-slot="scope">
                  {{ getProjectName(scope.row.projectId) }}
                </template>
              </el-table-column>
              <el-table-column label="描述" align="center" prop="description" />
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click="handleUpdate(scope.row)"
                    @click.stop
                    v-hasPermi="['business:assignment:edit']"
                  >修改</el-button>
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleDelete(scope.row)"
                    @click.stop
                    v-hasPermi="['business:assignment:remove']"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getListPage"
          />
        </pane>
        <pane size="60" style="overflow-y: auto; max-height: 100vh; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: flex-end; align-items: center;">
            <div style="flex-grow: 1; font-size: 24px; font-weight: bold">
              {{ assignmentDetail.assignmentName }}
            </div>
            <el-button
              v-if="selectedAssignmentId"
              type="success"
              plain
              @click="downloadModel(assignmentDetail)"
            >下载模型</el-button>
            <el-button
              v-if="selectedAssignmentId"
              type="primary"
              plain
              @click="handleAddResource(assignmentDetail)"
            >添加资源</el-button>
            <el-button
              v-if="selectedAssignmentId"
              type="primary"
              plain
              @click="handleUpdate(assignmentDetail)"
            >修改配置</el-button>
          </div>

          <el-divider></el-divider>
          <div style="overflow-y: auto; max-height: calc(100vh - 200px);"> <!-- Adjust height as needed -->
            <el-descriptions :column="2" border v-loading="loading">
              <el-descriptions-item label="所属项目" :span="2">
                {{ getProjectName(assignmentDetail.projectId) || '暂无数据' }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间" :span="2">
                {{ assignmentDetail.createTime || '暂无数据' }}
              </el-descriptions-item>
              <el-descriptions-item label="训练次数">
                {{ assignmentDetail.epoch || '暂无数据' }}
              </el-descriptions-item>
              <el-descriptions-item label="预训练模式">
                {{ assignmentDetail.pretrainMode | modelFilter }}
              </el-descriptions-item>
              <el-descriptions-item label="批大小">
                {{ assignmentDetail.batchSize || '暂无数据' }}
              </el-descriptions-item>
              <el-descriptions-item label="图像大小">
                {{ assignmentDetail.imgSize || '暂无数据' }}
              </el-descriptions-item>
            </el-descriptions>

            <el-collapse v-model="activeName" class="custom-collapse">
              <el-collapse-item name="1" title="当前训练">
                <div style="margin-bottom: 20px;">
                  <el-button
                    v-if="selectedAssignmentId && (this.queryParams.state === 0 || this.queryParams.state=== 2 || this.queryParams.state===3)"
                    type="success"
                    plain
                    @click.stop="startPrioritizeAssignment"
                  >插队训练</el-button>
                  <el-button
                    v-if="selectedAssignmentId && (this.queryParams.state === 0 || this.queryParams.state===3)"
                    type="primary"
                    plain
                    @click.stop="startAssignment"
                  >加入训练队列</el-button>
                  <el-button
                    v-if="selectedAssignmentId && (this.queryParams.state === 1 || this.queryParams.state === 2)"
                    type="warning"
                    plain
                    @click.stop="stopAssignment"
                  >停止训练</el-button>
                  <el-button
                    v-if="selectedAssignmentId"
                    type="danger"
                    plain
                    @click.stop
                    @click="handleDelete(assignmentDetail)"
                    v-hasPermi="['business:assignment:remove']"
                  >删除任务</el-button>
                </div>
                <div class="container" style="min-height: 350px">
                  <div v-if="activeName.includes('1')" style="display: flex; align-items: center;">
                    <div style="margin: 10px;">
                      <el-progress type="circle" :percentage="progress"></el-progress>
                      <el-tag style="display: flex; align-items: center; justify-content: center; height: 32px; padding: 0 10px;" v-if="trainProcess !== null && trainProcess !== ''">
                        {{trainProcess}}中
                      </el-tag>
                    </div>
                    <div v-if="assignmentDetail.state === 1" style="margin-left: 10px;">
                      <LineChart :data="jsonData"/>
                    </div>
                    <div v-if="assignmentDetail.state === 0" style="margin-left: 10px;">
                      <img
                        :src="getRelativePath(getProjectName(assignmentDetail.projectId) + '_' + assignmentDetail.assignmentName)"
                        alt="训练状态图像"
                        style="max-width: 100%; height: 350px;"
                      />
                    </div>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item name="2" title="训练记录">
                <div style="margin-bottom: 20px">
                  <el-table
                    ref="trainTable"
                    v-loading="trainLoading"
                    :data="trainList"
                    @selection-change="handleSelectionChange"
                    @row-click="handleTrainRowClick"
                    highlight-current-row
                  >
                    <el-table-column label="轮次" align="center" width="80">
                      <template slot-scope="scope">
                        {{ trainTotal - (trainQueryParams.pageNum - 1) * trainQueryParams.pageSize - scope.$index }}
                      </template>
                    </el-table-column>
                    <el-table-column label="状态" width="70px" align="center" prop="state">
                      <template slot-scope="scope">
                        <span v-if="scope.row.state === 1">训练中</span>
                        <span v-else-if="scope.row.state === 2">失败</span>
                        <span v-else-if="scope.row.state === 0">成功</span>
                        <span v-else-if="scope.row.state === 3">暂停</span>
                        <span v-else>未知状态</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="进度" width="60px" align="center" prop="progress" />
                    <el-table-column label="训练开始时间" align="center" prop="createTime" />
                    <el-table-column label="训练结束时间" align="center" prop="updateTime" />
                  </el-table>
                  <pagination
                    v-show="trainTotal>0"
                    :total="trainTotal"
                    :page.sync="trainQueryParams.pageNum"
                    :limit.sync="trainQueryParams.pageSize"
                    :page-sizes="[5,10,15,20]"
                    @pagination="getTrainList(null)"
                  />
                </div>
              </el-collapse-item>
              <el-collapse-item v-if="checkRole(['admin'])" name="3" title="训练日志">
                <el-card class="box-card">
                  <div slot="header" class="clearfix" style="font-size: 20px; font-weight: bold">
                    <span>训练日志</span>
                  </div>
                  <div class="card-content" @scroll="handleScroll">
                    <div v-for="trainLog in trainLogs" :key="trainLog.index" class="text item">
                      <span>{{ trainLog.content }}</span>
                      <span class="create-time">{{ trainLog.createTime }}</span>
                    </div>
                  </div>
                </el-card>
              </el-collapse-item>
            </el-collapse>
          </div>
        </pane>

      </splitpanes>
    </el-row>
    <add-assignment-dialog
      :open.sync="open"
      :title="title"
      :form.sync="form"
      :on-submit="getList"
      :is-project="isProject"
    />
  </div>
</template>

<script>
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { getProject, listAllProject } from '@/api/business/project'
import {
  delAssignment, getAssignment, getProcessChart,
  getStateCounts,
  listAssignment,
  startAssignment,
  startPrioritizeAssignment, stopAssignment
} from '@/api/business/assignment'
import { getTrain, getTrainDetail, listTrain } from '@/api/business/train'
import AddAssignmentDialog from '@/views/business/assignment/addAssignmentDialog.vue'
import resources from '@/views/business/resources/index.vue'
import { listTrainLog } from '@/api/business/trainLog'
import config from '@/config'
import LineChart from '@/views/dashboard/LineChart.vue'
import { checkRole } from '@/utils/permission'

export default {
  name: "Assignment",
  components: { LineChart, Splitpanes, Pane, AddAssignmentDialog },
  filters: {
    modelFilter(model) {
      const modelMap = {
        'N': '微型模型',
        'S': '小型模型',
        'M': '中型模型',
        'L': '大型模型',
        'X': '超大型模型'
      }
      return modelMap[model] || '暂无数据'
    }
  },
  data() {
    return {
      jsonData: {
      },
      assignmentDetail: {},
      selectedAssignmentId: null,

      // 遮罩层
      loading: false,
      trainLoading: false,
      trainList: [],
      trainTotal: 0,
      progress: 0,
      trainQueryParams: {
        assignmentId: null,
        pageNum: 1,
        pageSize: 5,
        orderByColumn: 'id'
      },
      trainLogQueryParams: {
        assignmentTrainId: null,
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'id'
      },
      isProject: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 任务表格数据
      assignmentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      completedCount: null,
      queuedCount: null,
      unstartedCount: null,
      trainingCount: null,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        assignmentName: null,
        projectId: null,
        modelId: null,
        pretrainMode: null,
        epoch: null,
        batchSize: null,
        imgSize: null,
        description: null,
        state: 1,
        orderByColumn: 'id'
      },
      // 表单参数
      form: {},
      projectOptions: [],
      activeName: ["1"],
      trainLogs: {},
      trainLogTotal: 0,
      selectedTrainRecord: null,
      currentIndex: 0,
      trainProcess: '',
    };
  },
  beforeDestroy() {
    if (this.fetchLogsInterval) {
      clearInterval(this.fetchLogsInterval);
    }
  },
  created() {
    Promise.all([this.getProjectList()])
      .then(() => {
        this.queryParams.state = this.$route.query.state ? parseInt(this.$route.query.state) : 1
        const id = this.$route.query.id;
        this.getList(id);
        this.startFetchingLogs();
      });


  },
  methods: {
    checkRole,
    getRelativePath(fullPath) {
      console.log(fullPath)
      return `http://${config.fileServer.ip}:${config.fileServer.port}/${fullPath}/BoxPR_curve.png`;
    },

    downloadModel(detail) {
      let notifyInstance;
      try {
        // 显示通知，表示正在打包资源
        notifyInstance = this.$notify({
          message: `${detail.assignmentName} 资源下载中...`,
          type: 'info',
          duration: 0, // 持续显示，直到手动关闭
          iconClass: 'el-icon-loading'
        });

        const projectName = this.getProjectName(detail.projectId); // 获取项目名称
        const assignmentName = detail.assignmentName; // 获取任务名称
        const zipName = `${projectName}_${assignmentName}_model.zip`; // ZIP 文件名

        // 构建文件夹路径
        const folderPath = `${projectName}_${assignmentName}`;

        // 构建下载文件夹的 URL
        const downloadUrl = `http://${config.fileServer.ip}:${config.fileServer.port}/download/${folderPath}`; // 假设你的服务器在这个地址
        // 发起下载请求
        fetch(downloadUrl)
          .then(response => {
            if (!response.ok) throw new Error(`无法下载文件夹: ${downloadUrl}`);
            return response.blob(); // 将响应转换为 Blob
          })
          .then(content => {
            // 下载 ZIP 文件
            saveAs(content, zipName);
            notifyInstance.close();
            notifyInstance = this.$notify({
              message: `${detail.assignmentName} 资源下载成功`,
              type: 'success'
            });
          })
          .catch(error => {
            console.error('下载失败:', error);
            notifyInstance.close();
            this.$message.error('压缩包下载失败');
            notifyInstance = this.$notify({
              message: `${detail.assignmentName} 压缩包下载失败`,
              type: 'error'
            });
          });
      } catch (error) {
        console.error('下载失败:', error);
        this.$message.error('压缩包下载失败');
        if (notifyInstance) {
          notifyInstance.close();
        }
      }
    },
    stopAssignment() {
      stopAssignment(this.selectedAssignmentId).then(() => {
        this.getList(this.selectedAssignmentId, 3)
      })
    },
    startAssignment() {
      startAssignment(this.selectedAssignmentId).then(() => {
        this.getList(this.selectedAssignmentId, 2)
      })
    },
    startPrioritizeAssignment() {
      this.queryParams.pageNum = 1
      startPrioritizeAssignment(this.selectedAssignmentId).then(() => {
        this.getList(this.selectedAssignmentId, 2)
      })
    },
    /** 查询任务列表 */
    getListPage() {
      this.getList(null, this.queryParams.state)
    },
    getList(id, state) {
      this.selectedTrainRecord = null
      this.trainLogs = []
      this.loading = true;
      if (state) {
        this.queryParams.state = state
      }
      if (this.queryParams.state === 2) {
        this.queryParams.orderByColumn = null
      }
      listAssignment(this.queryParams).then(response => {
        this.queryParams.orderByColumn = 'id'
        this.assignmentList = response.rows;
        this.total = response.total;
        if (this.assignmentList.length > 0) {
          if (id != null) {
            let find = this.assignmentList.find(e => e.id === parseInt(id))
            if (find) {
              this.handleRowClick(find);
            } else {
              if (this.queryParams.pageNum === Math.ceil(this.total / this.queryParams.pageSize)) {
                this.$modal.msgWarning('未找到此任务')
              } else {
                this.queryParams.pageNum++
                this.getList(id)
              }
            }
          } else {
            this.handleRowClick(this.assignmentList[0])
          }
        } else {
          this.handleRowClick(null)
        }
        getStateCounts().then(res => {
          this.completedCount = res.data[0]
          this.trainingCount = res.data[1]
          this.queuedCount = res.data[2]
          this.unstartedCount = res.data[3]
          this.loading = false;
        })
      });
    },
    handleTrainRowClick(row) {
      this.selectedTrainRecord = row;
      this.$refs.trainTable.setCurrentRow(row);
      this.progress = row.progress;
      this.getTrainLog(row.id);
    },
    getTrainLog(trainId) {
      this.trainLogQueryParams = {
        assignmentTrainId: trainId,
          pageNum: 1,
          pageSize: 10,
          orderByColumn: 'id'
      };
      listTrainLog(this.trainLogQueryParams).then(res => {
        this.trainLogs = res.rows
        this.trainLogTotal = res.total;
      })
    },
    startFetchingLogs() {
      this.fetchLogsInterval = setInterval(() => {
        if (this.selectedTrainRecord) {
          getTrainDetail(this.selectedTrainRecord.id).then(res => {
            this.progress = res.data.progress || 0.0
            this.trainProcess = res.data.trainProcess
            if (res.data.jsonData) {
              Object.keys(res.data.jsonData).forEach(key => {
                this.$set(this.jsonData, key, res.data.jsonData[key]);
              });
            }
          })
          const tempTrainLogQueryParams = {
            assignmentTrainId: this.selectedTrainRecord.id,
            pageNum: 1,
            pageSize: 10,
            orderByColumn: 'id'
          }
          listTrainLog(tempTrainLogQueryParams).then(res => {
            const newLogs = res.rows;
            const existingIds = this.trainLogs.map(log => log.id);
            const uniqueNewLogs = newLogs.filter(log => !existingIds.includes(log.id));
            this.trainLogs = [...uniqueNewLogs, ...this.trainLogs];
          });
        }
      }, 2000);
    },
    handleScroll(event) {
      const container = event.target;
      const bottomThreshold = 3 * 40;

      if (container.scrollHeight - container.scrollTop - container.clientHeight <= bottomThreshold) {
        this.loadMoreLogs();
      }
    },

    loadMoreLogs() {
      if (this.trainLogQueryParams.loading || this.trainLogs.length >= this.trainLogTotal) {
        return;
      }

      this.trainLogQueryParams.pageNum += 1;
      this.trainLogQueryParams.loading = true;

      listTrainLog(this.trainLogQueryParams).then(res => {
        this.trainLogs = [...this.trainLogs, ...res.rows];
        this.trainLogTotal = res.total;
        this.trainLogQueryParams.loading = false;
      }).catch(() => {
        this.trainLogQueryParams.loading = false;
      });
    },
    getTrainList(id) {
      this.trainLoading = true;
      this.trainQueryParams.assignmentId = id;
      this.selectedTrainRecord = null
      this.trainLogs = []
      listTrain(this.trainQueryParams).then(response => {
        this.trainList = response.rows;
        this.trainTotal = response.total;
        if (this.trainList.length > 0) {
          this.selectedTrainRecord = this.trainList[0];
          this.progress = this.selectedTrainRecord.progress
          this.getTrainLog(this.selectedTrainRecord.id)
          this.$refs.trainTable.setCurrentRow(this.selectedTrainRecord);
        } else {
          this.progress = 0
        }
        this.trainLoading = false;
      });
    },
    getProjectName(id) {
      if (id) {
        const project = this.projectOptions.find(option => option.id === id);
        return project ? project.name : null;
      }
    },
    getProjectList() {
      listAllProject().then(response => {
        this.projectOptions = response.data.map(item => ({
          id: item.id,
          name: item.projectName
        }));
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        state: null,
        id: null,
        assignmentName: null,
        projectId: null,
        modelId: null,
        pretrainMode: null,
        epoch: null,
        batchSize: null,
        imgSize: null
      };
      this.resetForm("form");
    },
    handleRowClick(row) {
      this.selectedTrainRecord = null
      this.trainLogs = []
      this.activeName = [];
      if (row) {
        this.selectedAssignmentId = row.id
        this.$refs.assignmentTable.setCurrentRow(row);
        this.assignmentDetail = { ...row };
        if (row) {
          this.getTrainList(row.id)
        }
      } else {
        this.trainList = []
        this.trainTotal = 0
        this.selectedAssignmentId = null
        this.$refs.assignmentTable.setCurrentRow(null);
        this.assignmentDetail = {};
        this.selectedTrainRecord = null;
        this.progress = 0.0
        this.$refs.trainTable.setCurrentRow(null);
      }


      setTimeout(() => {
        this.activeName = ["1"];
      }, 500);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    handleStateQuery(state) {
      this.queryParams.state = state;
      this.resetQuery()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加任务";
      this.isProject = false
    },
    handleAddResource(assignmentDetail) {
      this.$router.push({
        path: '/resources',
        query: {
          id: assignmentDetail.id,
          projectId: assignmentDetail.projectId
        }
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      this.title = "修改任务";
      this.isProject = true
      getAssignment(id).then(response => {
        this.form = response.data;
        this.form.state = null;
        this.open = true;
      });
    },
    /** 提交按钮 */
    handleCancel() {
      this.open = false;
      this.reset();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除任务：' + row.assignmentName + '?').then(() => {
        resources.methods.handleDeleteDirectory(this.getProjectName(row.projectId), row.assignmentName)
        return delAssignment(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('business/assignment/export', {
        ...this.queryParams
      }, `assignment_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style scoped lang="scss">
.search-form-class{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.success-active {
  background-color: #13CE66;
  color: white;

  i {
    color: white;
  }
}

.primary-active {
  background-color: #1890FF;
  color: white;

  i {
    color: white;
  }
}

.info-active {
  background-color: #909399;
  color: white;

  i {
    color: white;
  }
}

.warning-active {
  background-color: #FFBA00;
  color: white;

  i {
    color: white;
  }
}

.card-content {
  height: 150px;
  overflow-y: auto;
}
.text.item {
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-time {
  color: #bfbfbf; /* 浅灰色 */
  font-size: 12px; /* 较小的字体 */
  text-align: right; /* 右对齐文本 */
  flex-shrink: 0; /* 防止时间被压缩 */
  margin-left: 10px; /* 与内容之间的间距 */
  margin-right: 10px;
}


.container {
  display: flex;
  align-items: center;
  width: 90%;
}

.progress {
  flex: 0 0 30%;
}

.box-card {
  flex: 0 0 85%;
  margin-left: 20px;
}

.collapse-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 32px;
  font-weight: bold;
}

.custom-badge ::v-deep.el-badge__content {
  background-color: #ec6d6d;
  //min-width: 25px;
}

</style>
