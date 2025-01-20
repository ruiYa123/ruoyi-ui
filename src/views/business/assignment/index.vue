<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane size="60" style="padding-right: 10px">
          <el-row :gutter="10" style="margin-bottom: 10px">
            <el-col :span="8">
              <el-button type="success" :class="{'success-active': queryParams.state === 1}" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="handleStateQuery(1)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-finished" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">已训练任务</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button :class="{'primary-active': queryParams.state === 2}" type="primary" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="handleStateQuery(2)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-time" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">队列中任务</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button :class="{'info-active': queryParams.state === 0}" type="info" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="handleStateQuery(0)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-wallet" style="font-size: 32px;"></i>
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
            <el-form-item label="预训练模式" prop="pretrainMode">
              <el-input
                v-model="queryParams.pretrainMode"
                placeholder="请输入预训练模式"
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
              <el-table-column label="使用模型" align="center">
                <template v-slot="scope">
                  {{ getModelName(scope.row.modelId) }}
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
            @pagination="getList"
          />
        </pane>
        <pane size="40">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 24px">
            {{ assignmentDetail.assignmentName }}
            <el-button
              type="primary"
              plain
              style="margin-left: auto;"
              @click="handleUpdate(assignmentDetail)"
            >修改配置</el-button>
          </div>
          <el-divider></el-divider>
          <el-descriptions :column="2" border v-loading="loading">
            <el-descriptions-item label="所属项目" :span="2">
              {{ getProjectName(assignmentDetail.projectId) || '暂无数据' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">
              {{ assignmentDetail.createTime || '暂无数据' }}
            </el-descriptions-item>
            <el-descriptions-item label="模型">
              {{ getModelName(assignmentDetail.modelId) || '暂无数据' }}
            </el-descriptions-item>
            <el-descriptions-item label="资源数量">
              {{ assignmentDetail.resourceCount || '暂无数据' }}
            </el-descriptions-item>
            <el-descriptions-item label="训练次数">
              {{ assignmentDetail.epoch || '暂无数据' }}
            </el-descriptions-item>
            <el-descriptions-item label="预训练模式">
              {{ assignmentDetail.pretrainMode || '暂无数据' }}
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
              <div style="margin-bottom: 20px">
                <el-button
                  type="primary"
                  plain
                  @click.stop
                >开始训练</el-button>
                <el-button
                  type="warning"
                  plain
                  @click.stop
                >停止训练</el-button>
                <el-button
                  type="danger"
                  plain
                  @click.stop
                  @click="handleDelete(assignmentDetail)"
                  v-hasPermi="['business:assignment:remove']"
                >删除项目</el-button>
              </div>
              <div class="container">
                <el-progress type="circle" :percentage="progress" style="margin: 10px"></el-progress>
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>训练日志</span>
                    <el-button style="float: right; padding: 3px 0" type="text">清空日志</el-button>
                  </div>
                  <!-- 设置固定高度和滚动条 -->
                  <div class="card-content">
                    <div v-for="o in 20" :key="o" class="text item">
                      {{ '日志内容 ' + o }}
                    </div>
                  </div>
                </el-card>
              </div>
            </el-collapse-item>
            <el-collapse-item name="2" title="训练记录">
              <div style="margin-bottom: 20px">
                <el-table v-loading="trainLoading" :data="trainList" @selection-change="handleSelectionChange">
                  <el-table-column label="状态" align="center" prop="state">
                    <template slot-scope="scope">
                      <span v-if="scope.row.state === '0'">训练中</span>
                      <span v-else-if="scope.row.state === '1'">成功</span>
                      <span v-else-if="scope.row.state === '2'">失败</span>
                      <span v-else>未知状态</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="进度" align="center" prop="progress" />
                  <el-table-column label="备注" align="center" prop="description" />
                </el-table>
                <pagination
                  v-show="trainTotal>0"
                  :total="trainTotal"
                  :page.sync="trainQueryParams.pageNum"
                  :limit.sync="trainQueryParams.pageSize"
                  @pagination="getTrainList"
                />
              </div>
            </el-collapse-item>
          </el-collapse>
        </pane>
      </splitpanes>
    </el-row>
    <el-dialog :title="title" :visible.sync="open" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="任务名称" prop="assignmentName">
          <el-input v-model="form.assignmentName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择所属项目">
            <el-option
              v-for="[id, projectName] in projectOptions"
              :key="id"
              :label="projectName"
              :value="id">
            </el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="关联模型" prop="modelId">
          <el-select v-model="form.modelId" placeholder="请选择所属项目">
            <el-option
              v-for="[id, modelName] in modelOptions"
              :key="id"
              :label="modelName"
              :value="id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预训练模式" prop="pretrainMode">
          <el-input v-model="form.pretrainMode" placeholder="请输入预训练模式" />
        </el-form-item>
        <el-form-item label="训练次数" prop="epoch">
          <el-input v-model="form.epoch" placeholder="请输入训练次数" />
        </el-form-item>
        <el-form-item label="批大小" prop="batchSize">
          <el-input v-model="form.batchSize" placeholder="请输入批大小" />
        </el-form-item>
        <el-form-item label="图像大小" prop="imgSize">
          <el-input v-model="form.imgSize" placeholder="请输入图像大小" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
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
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { listModel } from '@/api/business/model';
import { listProject } from '@/api/business/project';
import {
  addAssignment,
  delAssignment, getAssignment,
  getStateCounts,
  listAssignment,
  updateAssignment
} from '@/api/business/assignment'
import { listTrain } from '@/api/business/train'

export default {
  components: { Splitpanes, Pane },
  data() {
    return {
      assignmentDetail: {},
      // 遮罩层
      loading: false,
      trainLoading: false,
      trainList: [],
      trainTotal: 0,
      progress: 0,
      trainQueryParams: {
        assignmentId: null,
        pageNum: 1,
        pageSize: 10
      },
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
      completedCount: {},
      queuedCount: {},
      unstartedCount: {},
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
      modelOptions: new Map(),
      projectOptions: new Map(),
      // 表单校验
      rules: {
        assignmentName: [
          { required: true, message: "任务名称不能为空", trigger: "blur" }
        ],
        projectId: [
          { required: true, message: "关联的项目不能为空", trigger: "blur" }
        ],
        modelId: [
          { required: true, message: "关联的模型不能为空", trigger: "blur" }
        ],
        pretrainMode: [
          { required: true, message: "预训练模式不能为空", trigger: "blur" }
        ],
        epoch: [
          { required: true, message: "训练次数不能为空", trigger: "blur" }
        ],
        batchSize: [
          { required: true, message: "批大小不能为空", trigger: "blur" }
        ],
        imgSize: [
          { required: true, message: "图像大小不能为空", trigger: "blur" }
        ],
      },
      activeName: ["1", "2"]
    };
  },
  created() {
    Promise.all([this.getProjectList(), this.getModelList()])
      .then(() => {
        this.queryParams.state = this.$route.query.state ? parseInt(this.$route.query.state) : 1
        const id = this.$route.query.id;
        this.getList(id);
      });
  },
  methods: {
    /** 查询任务列表 */
    getList(id) {
      this.loading = true;
      listAssignment(this.queryParams).then(response => {
        this.assignmentList = response.rows;
        this.total = response.total;
        if (id != null) {
          console.log(this.assignmentList.find(e=> e.id === parseInt(id)))
          this.handleRowClick(this.assignmentList.find(e=> e.id === parseInt(id)));
        } else {
          this.handleRowClick(this.assignmentList[0])
        }
        getStateCounts().then(res => {
          this.unstartedCount = res.data[0]
          this.completedCount = res.data[1]
          this.queuedCount = res.data[2]
          this.loading = false;
        })
      });
    },
    getTrainList(id) {
      this.trainLoading = true;
      this.trainQueryParams.assignmentId = id;
      listTrain(this.trainQueryParams).then(response => {
        this.trainList = response.rows;
        this.trainTotal = response.total;
        if (this.trainList.length > 0) {
          let lastTrain = this.trainList[this.trainList.length - 1];
          this.progress = lastTrain.progress
        } else {
          this.progress = 0
        }
        this.trainLoading = false;
      });
    },
    getProjectName(projectId) {
      return this.projectOptions.get(projectId)
    },
    getModelName(modelId) {
      return this.modelOptions.get(modelId)
    },
    getModelList() {
      listModel().then(response=> {
        this.modelOptions = new Map(
          response.rows.map(item => [item.id, item.modelName]))
      })
    },
    getProjectList() {
      listProject().then(response => {
        this.projectOptions = new Map(
          response.rows.map(item => [item.id, item.projectName]))
      })
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
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
      this.activeName = [];
      this.assignmentDetail = { ...row };
      this.$refs.assignmentTable.setCurrentRow(row);
      this.getTrainList(row.id)

      setTimeout(() => {
        this.activeName = ["1", "2"];
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getAssignment(id).then(response => {
        this.form = response.data;
        console.log(this.form)
        this.open = true;
        this.title = "修改任务";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAssignment(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAssignment(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.queryParams.state = 0
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除任务：' + row.assignmentName + '?').then(function() {
        return delAssignment(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
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

.card-content {
  max-height: 200px; /* 设置最大高度 */
  overflow-y: auto;  /* 启用垂直滚动条 */
}
.text.item {
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
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
  flex: 0 0 70%;
  margin-left: 20px;
}


</style>
