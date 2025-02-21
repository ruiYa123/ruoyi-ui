<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane size="16">
          <el-col>
            <div>
              <div style="margin: 5px">
                资源列表
              </div>
              <el-divider></el-divider>
              <div class="head-container">
                <!-- 搜索框 -->
                <el-input
                  v-model="filterText"
                  placeholder="请输入设备名称"
                  clearable
                  size="small"
                  prefix-icon="el-icon-search"
                  style="margin-bottom: 20px"
                  @input="handleFilter"
                />
              </div>
              <div class="head-container">
                <!-- 树组件 -->
                <el-tree
                  :data="data"
                  :props="defaultProps"
                  ref="tree"
                  node-key="id"
                  default-expand-all
                  highlight-current
                  check-strictly
                  @node-click="handleNodeClick"
                  @check-change="handleCheckChange"
                >
                  <span
                    class="custom-tree-node"
                    slot-scope="{ node, data }"
                    style="display: flex; justify-content: space-between; align-items: center; width: 100%;"
                  >
                    <span>{{ node.label }}</span>
                    <span v-if="node.level === 1" style="margin-left: auto;">
                      <el-button type="text" size="mini" @click="addAssignment(node)" @click.stop>
                        <i class="el-icon-plus"></i>
                      </el-button>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>
          </el-col>
        </pane>
        <pane size="84">
          <!-- 表单和按钮部分 -->
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="true" style="display: flex; justify-content: space-between; align-items: center;">
            <el-form-item prop="roleName">
              项目名称 -> 设备名称
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <div>
<!--                <el-button type="primary" plain>配置文件上传</el-button>-->
              </div>
            </el-form-item>
          </el-form>
          <el-row :gutter="10" style="margin-bottom: 10px">
            <el-col :span="12">
              <el-button type="primary" :class="{'primary-active': queryParams.state === 0}" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="changeState(0)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-edit-outline" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">未打标</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="success" :class="{'success-active': queryParams.state === 1}" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="changeState(1)">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-finished" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">已打标</span>
                </div>
              </el-button>
            </el-col>
          </el-row>
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" style="display: flex; justify-content: space-between; align-items: center;">
            <el-form-item label="资源名称" prop="roleName">
              <el-input
                v-model="queryParams.roleName"
                placeholder="请输入资源名称"
                clearable
                style="width: 240px"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <div style="display: flex; justify-content: center;">
            <el-button type="primary" plain @click="handleAdd">上传图片</el-button>
            <el-button type="success" plain>下载全部</el-button>
            <el-button type="danger" @click="handleDeleteBatch" plain>批量删除</el-button>
          </div>

          <div class="card-container">
            <el-row>
              <el-col
                :span="5"
                v-for="(item, index) in resourcesList"
                :key="item.id"
                :offset="index % 4 !== 0 ? 1 : 0"
                style="margin-top: 5px; margin-bottom: 5px;"
              >
                <el-card
                  :body-style="{ padding: '0px' }"
                  v-on:click.native="toggleSelectCard(item.id)"
                  :class="{ selected: selectedIndex.includes(item.id) }"
                >
                  <img :src="getRelativePath(item.imgPath)" class="image" />
                  <div style="padding: 14px;">
                    <span>{{ item.imgName }}</span>
                    <div class="bottom clearfix">
                      <time class="time">{{ item.createTime }}</time>
                      <el-button type="text" class="button"><i class="el-icon-delete" style="color: red" @click="handleDelete(item)" @click.stop></i> </el-button>
                      <el-button type="text" class="button"><i class="el-icon-download" style="color: green; margin-right: 5px" @click.stop></i> </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />

          <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="图片名称" prop="imgName">
                <el-input v-model="form.imgName" placeholder="请输入图片名称" />
              </el-form-item>
              <el-form-item label="是否打标" prop="state">
                <el-radio-group v-model="form.state">
                  <el-radio :label="1">已打标</el-radio>
                  <el-radio :label="0">未打标</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="图片描述" prop="description">
                <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
              </el-form-item>
              <el-form-item label="上传图片" prop="image">
                <el-upload
                  class="upload-demo"
                  drag
                  ref="upload"
                  action="https://jsonplaceholder.typicode.com/posts/"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :file-list="fileList"
                  list-type="picture"
                  :auto-upload="false"
                  multiple
                  :on-change="handleChange"
                  >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                </el-upload>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </el-dialog>
        </pane>
      </splitpanes>
    </el-row>
    <add-assignment-dialog
      :open.sync="isAddAssignmentDialogOpen"
      :title="'添加任务'"
      :is-project="isPorject"
      :form.sync="assignmentForm"
      :on-submit="handleAddAssignmentSubmit"
    />
  </div>
</template>

<script>
import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import Treeselect from '@riophae/vue-treeselect'
import { listResources, getResources, delResources, addResources, updateResources } from "@/api/business/resources"
import { listProject } from '@/api/business/project'
import { listAllAssignment} from '@/api/business/assignment'
import AddAssignmentDialog from '@/views/business/assignment/addAssignmentDialog.vue'

export default {
  components: { AddAssignmentDialog, Treeselect, Splitpanes, Pane },
  data() {
    return {
      filterText: "",
      form: {
        state: 0,
      },
      rules: {
        imgName: [
          { required: true, message: "图片名称不能为空", trigger: "blur" }
        ],
        state: [
          { required: true, message: "图片状态不能为空", trigger: "blur" }
        ],
      },
      fileList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        imgName: null,
        assignmentId: null,
        imgPath: null,
        imgSize: null,
        description: null,
        state: 0,
      },
      currentNode: null,
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      resourcesList: [],
      title: "",
      open: false,
      data: [],
      isPorject: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      currentDate: new Date().toLocaleDateString(),
      selectedIndex: [],
      projectOptions: [],
      assignmentOptions: [],
      selectedAssignmentName: '',
      selectedProjectName: '',
      assignmentForm: {},
      isAddAssignmentDialogOpen: false,
      tempProjectId: null
    };
  },
  created() {
    const id = this.$route.query.id;
    const projectId = this.$route.query.projectId;
    this.getResourcesTree().then(() => {
      this.setDefaultSelectedNode(id, projectId);
    });
  },
  methods: {
    addAssignment(node) {
      this.assignmentForm.projectId = node.data.id;
      this.isProject = true;
      this.tempProjectId = node.data.id;
      this.isAddAssignmentDialogOpen = true;
    },

    getRelativePath(fullPath) {
      const publicPath = 'public/';
      const index = fullPath.indexOf(publicPath);

      if (index !== -1) {
        return fullPath.substring(index + publicPath.length);
      }

      return '';
    },

    handleAddAssignmentSubmit() {
      console.log(this.tempProjectId)
      this.getResourcesTree().then(() => {
        this.setDefaultSelectedNode(null, this.tempProjectId);
      });
    },

    handleChange(file, fileList) {

      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handlePreview() {
    },
    handleBeforeUpload(file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        this.$message.error('只能上传图片文件！');
        return false;
      }
      file.url = URL.createObjectURL(file);
      this.fileList.push(file);
      return false; // 阻止自动上传
    },

    changeState(state) {
      this.queryParams.state = state;
      this.getList();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleFilter() {
      this.$refs.tree.filter(this.filterText);
    },
    selectCard(index) {
      this.selectedIndex = index;
    },
    toggleSelectCard(index) {
      console.log(index)
      const selectedIndex = this.selectedIndex;
      const selectedIndexPos = selectedIndex.indexOf(index);
      if (selectedIndexPos === -1) {
        this.selectedIndex.push(index);
      } else {
        this.selectedIndex.splice(selectedIndexPos, 1);
      }
    },
    handleNodeClick(data, node, component) {
      const tree = this.$refs.tree;
      if (node.level === 1) {
        tree.setCurrentKey(this.currentNode);
      } else {
        tree.setCurrentKey(node.key);
        this.currentNode = node.key
        this.selectedAssignmentName = data.label;
        this.selectedProjectName = node.parent.data.label;
      }
      this.getList()
    },
    handleCheckChange(data, checked, indeterminate) {
      const tree = this.$refs.tree;
      const node = tree.getNode(data);

      if (node.level === 1) {
        tree.setChecked(node.data.id, false, true);
      }

      if (checked) {
        tree.setCurrentKey(node.data.id);
        this.currentNode = node.data.id;
        this.getList()
      } else {
        tree.setCurrentKey(node.data.id);
      }
    },
    getList() {
      this.loading = true;
      this.queryParams.assignmentId = this.currentNode
      listResources(this.queryParams).then(response => {
        this.resourcesList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    async getResourcesTree() {
      const projectResponse = await listProject();
      const projectMap = new Map(
        projectResponse.rows.map(item => [item.id, { id: item.id, label: item.projectName, children: [] }])
      );
      const queryParams = {
        orderByColumn: 'id'
      }
      const assignmentResponse = await listAllAssignment(queryParams);
      assignmentResponse.data.forEach(item => {
        const assignment = { id: item.id, label: item.assignmentName, state: item.state };
        const project = projectMap.get(item.projectId);
        if (project) {
          project.children.push(assignment);
        }
      });

      this.data = Array.from(projectMap.values());
    },
      setDefaultSelectedNode(id, projectId) {
      let checkedId = null
      if (id) {
        checkedId = id;
      } else if (projectId) {
        const projectNode = this.data.find(project => project.id == projectId);
        if (projectNode && projectNode.children && projectNode.children.length > 0) {
          checkedId = projectNode.children[0].id;
        }
      } else {
        for (const project of this.data) {
          if (project.children && project.children.length > 0) {
            checkedId = project.children[0].id;
            break;
          }
        }
      }
      this.currentNode = checkedId
      for (const parentNode of this.data) {
        if (parentNode.children && parentNode.children.length > 0) {
          const childNode = parentNode.children.find(child => child.id === checkedId);
          if (childNode) {
            this.selectedAssignmentName = childNode.label;
            this.selectedProjectName = parentNode.label;
            break;
          }
        }
      }
      this.$nextTick(() => {
        this.currentNode = checkedId
        this.$refs.tree.setCurrentKey(checkedId);
      });
      this.getList();
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: null,
        imgName: null,
        assignmentId: null,
        imgPath: null,
        imgSize: null,
        description: null,
        state: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null
      };
      this.fileList = []
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
      this.form.assignmentId = this.currentNode
      this.title = "添加资源";
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getResources(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改资源";
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        const formData = new FormData();
        if (valid) {
          Object.entries(this.form).forEach(([key, value]) => {
            if (value !== null) {
              formData.append(key, value);
            }
          });
          this.fileList.forEach(file => {
            formData.append('files[]', file.raw);
          });
          formData.append('assignmentName', this.selectedAssignmentName);
          formData.append('projectName', this.selectedProjectName);
          if (this.form.id != null) {
            updateResources(formData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addResources(formData).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDeleteBatch() {
      this.$modal.confirm('是否确认删除这些资源？').then(() => {
        console.log('before delete');
        return delResources(this.selectedIndex);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleDelete(row) {
      const ids = row.id;
      this.$modal.confirm('是否确认删除资源编号为"' + ids + '"的数据项？').then(function() {
        return delResources(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleExport() {
      this.download('business/resources/export', {
        ...this.queryParams
      }, `resources_${new Date().getTime()}.xlsx`);
    }
  }
};
</script>

<style scoped lang="scss">
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

.sidebar {
  width: 20%;
  padding: 10px;
}

.selected {
  border: 1px solid #409eff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.card-container {
  overflow-y: auto;
  margin: 10px 0;
}

.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
</style>
