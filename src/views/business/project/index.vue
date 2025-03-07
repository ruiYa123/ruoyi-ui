<template>
  <div class="app-container">
    <el-form :model="queryParams" class="search-form-class" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
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
          v-hasPermi="['business:project:add']"
        >新增项目</el-button>
      </el-form-item>
    </el-form>
    <template>
      <el-collapse
        accordion
        :value="activeName"
        class="custom-collapse"
      >
        <el-collapse-item name="1" disabled>
          <template #title>
            <div class="collapse-title">
              <span v-if="activeName === '1'">{{ projectDetail.projectName }}</span>
              <span v-else><i class="el-icon-loading"></i></span>
              <div v-if="projectDetail.id" class="button-group">
                <el-button type="info" size="mini" plain @click="toResources(projectDetail)">资源管理</el-button>
                <el-button type="primary" size="mini" plain @click="addAssignment">添加任务</el-button>
                <el-button type="primary" size="mini" plain @click="handleUpdate(projectDetail)">编辑项目</el-button>
                <el-button type="danger" size="mini" plain @click="handleDelete(projectDetail)">删除项目</el-button>
              </div>
            </div>
          </template>
          <el-descriptions :column="2">
              <el-descriptions-item label="创建时间" :span="2">{{ projectDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="任务列表" :span="2">
              <template v-if="projectDetail.assignmentList.length > 0">
                <el-button
                  v-for="(assignment, index) in projectDetail.assignmentList"
                  :key="index"
                  type="primary"
                  plain
                  size="mini"
                  style="margin-right: 8px;"
                  @click="toAssignment(assignment)"
                  v-hasPermi="['business:project:list']"
                >{{ assignment.assignmentName }}</el-button>
              </template>
            </el-descriptions-item>
            <el-descriptions-item label="项目描述" :span="2">
              {{ projectDetail.description }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
      </el-collapse>
    </template>
    <el-table
      ref="projectTable"
      v-loading="loading"
      :data="projectList"
      @row-click="handleRowClick"
      highlight-current-row>

      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="项目描述" align="center" prop="description" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            @click.stop
            v-hasPermi="['business:project:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            @click.stop
            v-hasPermi="['business:project:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改项目对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <add-assignment-dialog
      :open.sync="isAddAssignmentDialogOpen"
      :title="'添加任务'"
      :form.sync="assignmentForm"
      :on-submit="handleAddAssignmentSubmit"
    />
  </div>
</template>

<script>
import { listProject, getProject, delProject, addProject, updateProject } from "@/api/business/project";
import { listAllAssignment, listAssignment } from '@/api/business/assignment'
import { mapGetters } from 'vuex'
import AddAssignmentDialog from '@/views/business/assignment/addAssignmentDialog.vue'

export default {
  name: "Project",
  components: { AddAssignmentDialog },
  data() {
    return {
      activeName: null,
      projectDetail: {
        assignmentList: [], // 确保初始化
      },
      // 遮罩层
      loading: true,
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
      // 【请填写功能名称】表格数据
      projectList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      isAddAssignmentDialogOpen: false,
      assignmentForm: {
        assignmentName: '',
        projectId: null,
        modelId: null,
        pretrainMode: '',
        epoch: null,
        batchSize: null,
        imgSize: null,
        description: ''
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modelId: null,
        projectName: null,
        description: null,
        orderByColumn: 'id'
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        projectName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
      },
    };
  },
  computed: {
    ...mapGetters(['permission_routes'])
  },
  created() {
    const id = this.$route.query.id;
    this.getList(id);
  },
  methods: {
    getList(id) {
      this.loading = true;
      listProject(this.queryParams).then(response => {
        this.projectList = response.rows;
        this.total = response.total;
        if (this.projectList.length > 0) {
          if (id != null) {
            let find = this.projectList.find(e => e.id === parseInt(id))
            if (find) {
              this.handleRowClick(find)
            } else {
              if (this.queryParams.pageNum === Math.ceil(this.total / this.queryParams.pageSize)) {
                this.$modal.msgWarning('未找到此任务')
              } else {
                this.queryParams.pageNum++
                this.getList(id)
              }
            }
          } else {
            this.projectDetail = this.projectList[0]
            this.projectDetail.assignmentList = []
            this.handleRowClick(this.projectList[0])
          }
        } else {
          this.activeName = '1';
          this.projectDetail.projectName = '暂无项目';
        }
        this.$nextTick(() => {
          this.loading = false;
        });
      });
    },
    addAssignment() {
      this.assignmentForm.projectId = this.projectDetail.id;
      this.isAddAssignmentDialogOpen = true;
    },
    handleAddAssignmentSubmit() {
      this.activeName = null;
      listAllAssignment({projectId: this.projectDetail.id}).then(response => {
        this.projectDetail.assignmentList = response.data;
      });
      setTimeout(() => {
        this.projectDetail = Object.assign({}, this.projectDetail);
        this.activeName = "1";
      }, 300);
      this.assignmentForm = {
        assignmentName: '',
          projectId: null,
          modelId: null,
          pretrainMode: '',
          epoch: null,
          batchSize: null,
          imgSize: null,
          description: ''
      }
    },
    toAssignment(assignment) {
      this.$router.push({
        path: '/assignment',
        query: {
          id: assignment.id,
          state: assignment.state
        }
      });
    },
    toResources(project) {
      this.$router.push({
        path: '/resources',
        query: {
          projectId: project.id,
        }
      });
    },

    handleRowClick(row) {
      this.activeName = null;
      this.$refs.projectTable.setCurrentRow(row);
      listAllAssignment({projectId: row.id}).then(response => {
        this.projectDetail.assignmentList = response.data;
      });
      setTimeout(() => {
        this.projectDetail = Object.assign({}, this.projectDetail, row);
        this.activeName = "1";
      }, 300);
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
        projectName: null,
        description: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
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
      this.title = "添加项目";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getProject(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改项目";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateProject(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProject(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除项目：' + row.projectName + '？').then(function() {
        return delProject(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('business/project/export', {
        ...this.queryParams
      }, `project_${new Date().getTime()}.xlsx`)
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
.custom-collapse ::v-deep {
  background-color: transparent;
  //margin-bottom: 10px;
  position: relative;
  min-height: 200px;

  .collapse-content {
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .el-collapse-item__wrap {
    position: absolute;
    width: 100%;
    z-index: 1;
  }

  .el-collapse-item.is-disabled {
    .el-collapse-item__header {
      color: black;
    }
  }

  .el-collapse-item__arrow {
    display: none;
  }
}

.collapse-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 32px;
  font-weight: bold;
}

.button-group {
  display: flex;
  margin-left: auto;
}

//.custom-collapse ::v-deep {
//  .el-collapse-item__header,
//  .el-descriptions-item__label,
//  .el-descriptions-item__content {
//    font-size: 50px !important; // 你可以根据需要调整此值
//  }
//}
</style>

