<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模型ID" prop="modelId">
        <el-select
          v-model="queryParams.modelId"
          placeholder="请选择模型"
          clearable
          @change="handleQuery">
          <el-option
            v-for="model in models"
            :key="model.id"
            :label="model.modelName"
            :value="model.id">
          </el-option>
        </el-select>
      </el-form-item>

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
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:project:add']"
        >新增项目</el-button>
      </el-col>
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--          type="success"-->
      <!--          plain-->
      <!--          icon="el-icon-edit"-->
      <!--          size="mini"-->
      <!--          :disabled="single"-->
      <!--          @click="handleUpdate"-->
      <!--          v-hasPermi="['system:project:edit']"-->
      <!--        >修改</el-button>-->
      <!--      </el-col>-->
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--          type="danger"-->
      <!--          plain-->
      <!--          icon="el-icon-delete"-->
      <!--          size="mini"-->
      <!--          :disabled="multiple"-->
      <!--          @click="handleDelete"-->
      <!--          v-hasPermi="['system:project:remove']"-->
      <!--        >删除</el-button>-->
      <!--      </el-col>-->
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--          type="warning"-->
      <!--          plain-->
      <!--          icon="el-icon-download"-->
      <!--          size="mini"-->
      <!--          @click="handleExport"-->
      <!--          v-hasPermi="['system:project:export']"-->
      <!--        >导出</el-button>-->
      <!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <template>
      <el-collapse
        accordion
        :value="activeName"
        class="custom-collapse"
      >
        <el-collapse-item name="1" disabled>
          <template #title>
            <div class="collapse-title">
              <span>{{ projectDetail.projectName }}</span>
              <div class="button-group">
                <el-button type="info" size="mini" plain @click="handleUpdate(projectDetail)">资源管理</el-button>
                <el-button type="primary" size="mini" plain @click="handleUpdate(projectDetail)">编辑项目</el-button>
                <el-button type="danger" size="mini" plain @click="handleDelete(projectDetail)">删除项目</el-button>
              </div>
            </div>
          </template>
          <el-descriptions :column="2">
            <el-descriptions-item label="算法模型">{{ projectDetail.modelName }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ projectDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="设备列表" :span="2">
              <template>
                <el-tag v-for="(device, index) in projectDetail.deviceList" :key="index" size="small" style="margin-right: 8px;">
                  {{ device }}
                </el-tag>
              </template>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
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
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      highlight-current-row>

      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="项目ID" align="center" prop="id" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="模型" align="center" prop="modelName" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:project:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:project:remove']"
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模型" prop="modelId">
          <el-select v-model="form.modelId" placeholder="请选择模型">
            <el-option
              v-for="model in models"
              :key="model.id"
              :label="model.modelName"
              :value="model.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
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
import { listProject, getProject, delProject, addProject, updateProject } from "@/api/miaoxiangBussiness/project";
import { listModel } from '@/api/miaoxiangBussiness/model'

export default {
  name: "Project",
  data() {
    return {
      activeName: null,
      projectDetail: {},
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
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modelId: null,
        projectName: null,
        description: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        modelId: [
          { required: true, message: "模型不能为空", trigger: "blur" }
        ],
        projectName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
      },
      models: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      listProject(this.queryParams).then(response => {
        this.projectList = response.rows;
        this.total = response.total;
        this.projectDetail = this.projectList[0]
        this.handleRowClick(this.projectList[0])
        this.loading = false;
      });
      listModel().then(response => {
        this.models = response.rows;
      })
    },
    handleRowClick(row) {
      this.activeName = null;
      setTimeout(() => {
        this.$refs.projectTable.setCurrentRow(row);
        this.projectDetail = row;
        this.activeName = "1";
      }, 500);
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
        modelId: null,
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
      this.title = "添加【请填写功能名称】";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getProject(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改【请填写功能名称】";
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
      this.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项？').then(function() {
        return delProject(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/project/export', {
        ...this.queryParams
      }, `project_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped lang="scss">
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
}

.button-group {
  display: flex;
  //gap: 8px;
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

