<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane size="20">
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
                  :filter-node-method="filterNode"
                  @node-click="handleNodeClick"
                  @check-change="handleCheckChange"
                  style="overflow: auto"
                >
                  <span
                    class="custom-tree-node"
                    slot-scope="{ node, data }"
                    style="display: flex; justify-content: space-between; align-items: center; width: 100%;"
                  >
                    <span>{{ node.label }}</span>
                    <span v-if="node.level === 1" style="margin-left: auto;">
                      <el-button type="text" size="mini" @click="addAssignment(node)" @click.stop>
                        <i class="el-icon-plus" style="color: #13CE66"></i>
                      </el-button>
                      <el-button type="text" size="mini" @click="toProject(node)" @click.stop>
                        <i class="el-icon-right"></i>
                      </el-button>
                    </span>
                    <span v-if="node.level === 2" style="margin-left: auto;">
                      <el-button type="text" size="mini" @click="removeDirectory(node)" @click.stop>
                        <i class="el-icon-close" style="color: #FF4949"></i>
                      </el-button>
                      <el-button type="text" size="mini" @click="downloadFolder(node)" @click.stop>
                        <i class="el-icon-download" style="color: #13CE66"></i>
                      </el-button>
                      <el-button type="text" size="mini" @click="toAssignment(node)" @click.stop>
                        <i class="el-icon-right"></i>
                      </el-button>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>
          </el-col>
        </pane>
        <pane size="80">
          <!-- 表单和按钮部分 -->
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="true" style="display: flex; justify-content: space-between; align-items: center;">
            <el-form-item v-if="selectedProjectName && selectedAssignmentName" style="margin-top: 20px">
              <el-tag>
                {{selectedProjectName}}
              </el-tag>
               ->
              <el-badge
                v-if="resourcesList.length > 0 && resourcesList[0].unMarkedCount != null && resourcesList[0].unMarkedCount !== ''"
                :value="'未打标:' + resourcesList[0].unMarkedCount"
                @click="handleClickBadge"
              >
                <el-tag>
                  {{selectedAssignmentName}}
                </el-tag>
              </el-badge>
              <el-tag v-else>
                {{selectedAssignmentName}}
              </el-tag>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <div>
              </div>
            </el-form-item>
          </el-form>
<!--          <el-row :gutter="10" style="margin-bottom: 10px">-->
<!--            <el-col :span="12">-->
<!--              <el-button type="primary" :class="{'primary-active': queryParams.state === 0}" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="changeState(0)">-->
<!--                <div style="display: flex; flex-direction: column; align-items: center;">-->
<!--                  <i class="el-icon-edit-outline" style="font-size: 32px;"></i>-->
<!--                  <span style="font-size: 14px; margin-top: 5px;">未打标</span>-->
<!--                </div>-->
<!--              </el-button>-->
<!--            </el-col>-->
<!--            <el-col :span="12">-->
<!--              <el-button type="success" :class="{'success-active': queryParams.state === 1}" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click="changeState(1)">-->
<!--                <div style="display: flex; flex-direction: column; align-items: center;">-->
<!--                  <i class="el-icon-finished" style="font-size: 32px;"></i>-->
<!--                  <span style="font-size: 14px; margin-top: 5px;">已打标</span>-->
<!--                </div>-->
<!--              </el-button>-->
<!--            </el-col>-->
<!--          </el-row>-->
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
              <el-form-item label="资源名称" prop="roleName">
                <el-input
                  v-model="queryParams.imgName"
                  placeholder="请输入资源名称"
                  clearable
                  style="width: 240px"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="是否打标">
                <el-select
                  v-model="queryParams.state"
                  placeholder="请选择是否打标"
                  clearable
                  style="width: 240px"
                  @change="handleQuery"
                >
                 <el-option
                   v-for="item in stateOptions"
                   :key="item.state"
                   :label="item.label"
                   :value="item.state"
                 ></el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>



          </el-form>
          <el-row>
            <el-col v-if="currentNode" :span="12" style="display: flex; margin-top: 20px">
              <el-button type="primary" plain @click="handleAdd">上传图片</el-button>
              <el-button type="success" plain @click="handleDownloadAll">批量下载</el-button>
              <el-button type="danger" @click="handleDeleteBatch" plain>批量删除</el-button>
            </el-col>
            <el-col :span="12">
              <pagination
                v-show="total > 0"
                :total="total"
                :page-sizes="[4, 8, 12, 16]"
                :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize"
                @pagination="getList"
              />
            </el-col>
          </el-row>
          <div class="card-container">
            <el-row v-if="resourcesList.length > 0">
              <el-col
                :span="5"
                v-for="(item, index) in resourcesList"
                :key="item.path"
                :offset="index % 4 !== 0 ? 1 : 0"
                style="margin-top: 5px; margin-bottom: 5px;"
              >
                <el-card
                  :body-style="{ padding: '0px' }"
                  v-on:click.native="toggleSelectCard(item)"
                  :class="{ selectedCard: selectedIndex.includes(item) }"
                  :style="{
                    backgroundColor: item.jsonPath === null
                      ? (selectedIndex.includes(item) ? '#c0b2f5' : '#f59393')
                      : (selectedIndex.includes(item) ?'#e8e8fc' :'')
                  }"

                >
                  <img :src="getRelativePath(item.path)" class="image"  alt="" style="height: 300px;"/>
                  <div style="padding: 14px;">
                    <div style="height: 40px">
                      <span >{{ item.name }}</span>
                    </div>
                    <div class="bottom clearfix">
                      <time class="time">{{ item.createTime }}</time>
                      <el-button type="text" class="button"><i class="el-icon-delete" style="color: red" @click="handleDelete(item)" @click.stop></i> </el-button>
                      <el-button type="text" class="button"><i class="el-icon-download" style="color: green; margin-right: 5px" @click.stop="handleDownload(item)"></i> </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-card v-else style="text-align: center; color: #999; margin-top: 20px;">
              <span style="display: flex; justify-content: center; height: 500px; align-items: center; font-size: 26px; font-weight: bolder">暂无数据</span>
            </el-card>

          </div>


          <el-dialog :title="title" :visible.sync="open" width="400px" @close="handleDialogClose" append-to-body>
            <el-form ref="form" :model="form" :rules="rules">
              <input
                type="file"
                ref="directoryInput"
                webkitdirectory
                @change="handleDirectoryUpload"
                style="display: none;"
              />
              <el-form-item>
                <el-upload
                  class="upload-demo"
                  drag
                  ref="upload"
                  action="https://jsonplaceholder.typicode.com/posts/"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :file-list="fileList"
                  :auto-upload="false"
                  multiple
                  accept=".bmp,.json"
                  :on-change="handleChange"
                  :before-upload="handleBeforeUpload"
                  >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <el-button type="primary" @click.stop="triggerDirectoryUpload" style="margin-top: 5px;">
                    上传文件夹
                  </el-button>
                </el-upload>

              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-badge :value="fileList.length" style="margin-right: 10px">
                <el-button type="primary" @click="submitForm">确认上传</el-button>
              </el-badge>
              <el-button @click="handleDialogClose">取 消</el-button>
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
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Treeselect from '@riophae/vue-treeselect'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import {
  addResources,
  delResources,
  getResources,
  listAll,
  listImages,
  updateResources
} from '@/api/business/resources'
import { listProject } from '@/api/business/project'
import { listAllAssignment } from '@/api/business/assignment'
import AddAssignmentDialog from '@/views/business/assignment/addAssignmentDialog.vue'
import config from '@/config'
import { Notification } from 'element-ui'

export default {
  components: { AddAssignmentDialog, Treeselect, Splitpanes, Pane },
  data() {
    return {
      stateOptions: [
        {state: 0, label: '未打标'},
        {state: 1, label: '已打标'}
      ],
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
        pageSize: 8,
        imgName: null,
        assignmentId: null,
        imgPath: null,
        imgSize: null,
        description: null,
        state: null,
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
      isPorject: true,
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

    const projectId = this.$route.query.projectId;
    let id = null
    if (this.$route.query.projectId && this.$route.query.id) {
      id = projectId + '-' +this.$route.query.id;

    }
    this.getResourcesTree().then(() => {
      this.setDefaultSelectedNode(id, projectId);
    });
  },
  mounted() {
    // this.$nextTick(() => {
    //   this.$refs.upload.$children[0].$refs.input.webkitdirectory = true
    // })
  },
  methods: {
    triggerDirectoryUpload() {
      this.$refs.directoryInput.click();
    },
    toAssignment(assignment) {
      const dashIndex = assignment.data.id.indexOf('-');
      let id = null;
      if (dashIndex !== -1) {
        id = assignment.data.id.slice(dashIndex + 1)
      }      this.$router.push({
        path: '/assignment',
        query: {
          id: id,
          state: assignment.data.state
        }
      });
    },
    toProject(project) {
      console.log(project)
      this.$router.push({
        path: '/project',
        query: {
          id: project.data.id
        }
      });
    },
    handleClickBadge() {
      this.queryParams.state = 0
      this.getList()
    },
    handleDirectoryUpload(event) {
      const files = event.target.files;
      const validExtensions = ['bmp', 'json'];

      const existingFileNames = new Set(this.fileList.map(file => file.name));

      const newFiles = Array.from(files).filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return validExtensions.includes(extension) && !existingFileNames.has(file.name);
      }).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        raw: file
      }));
      if (newFiles.length === 0) {
        this.$message.warning('文件夹中没有新的 BMP 或 JSON 文件。');
      } else {
        this.fileList = this.fileList.concat(newFiles);
      }
    },
    addAssignment(node) {
      this.assignmentForm.projectId = node.data.id;
      this.isProject = true;
      this.tempProjectId = node.data.id;
      this.isAddAssignmentDialogOpen = true;
    },

    handleDialogClose() {
      this.$refs.directoryInput.value = '';
      this.fileList = [];
      this.open = false;
    },

    getFileNameFromPath(filePath) {
      // 使用 / 或 \ 作为分隔符
      const parts = filePath.split(/[/\\]/);
      return parts[parts.length - 1];
   },
    getRelativePath(fullPath) {
      return `http://${config.fileServer.ip}:${config.fileServer.port}/${fullPath}`;
    },
    async downloadFolder(node) {
      let notifyInstance;
      try {
        notifyInstance = Notification({
          message: node.data.label + '  资源打包中...',
          type: 'info',
          duration: 0, // 持续显示，直到手动关闭
          iconClass: 'el-icon-loading'
        });
        const zip = new JSZip();
        const projectName = node.parent.data.label;
        const assignmentName = node.data.label;
        const zipName = `${projectName}_${assignmentName}.zip`;

        const response = await listAll({ projectName: projectName, assignmentName: assignmentName });
        const files = [];

        response.data.forEach(item => {
          files.push(item.path);
          if (item.jsonPath) files.push(item.jsonPath);
        });

        for (const filePath of files) {
          const relativePath = this.getRelativePath(filePath).replace(/\\/g, '/');
          const fetchResponse = await fetch(relativePath);
          if (!fetchResponse.ok) throw new Error(`无法下载文件: ${relativePath}`);
          const blob = await fetchResponse.blob();
          console.log(relativePath)
          const fileName = relativePath.split('/').slice(-3).join('/'); // 去除项目名和任务名前的路径
          zip.file(fileName, blob);
        }

        // 生成并下载ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, zipName);
        this.updateNotification(notifyInstance, node.data.label + '  资源打包成功，开始下载', 'success')

      } catch (error) {
        console.error('下载失败:', error);
        this.$message.error('压缩包下载失败');
        this.updateNotification(notifyInstance, node.data.label + '  压缩包下载失败', 'error')
      }
    },
    handleDownloadAll() {
      if (this.selectedIndex.length === 0 ) {
        this.$modal.msgWarning("请选择需要下载的资源");
      }
      this.selectedIndex.forEach((item, index) => {
        setTimeout(() => {
          this.downloadFile(item.path);
          if (item.jsonPath) {
            this.downloadFile(item.jsonPath);
          }
        }, index * 100);
      });
    },
    handleDownload(row) {
      this.downloadFile(row.path);
      if (row.jsonPath) {
        this.downloadFile(row.jsonPath);
      }
    },
    downloadFile(filePath) {
      const fileUrl = this.getRelativePath(filePath); // 获取完整的文件URL

      // 使用 fetch 获取文件并强制下载
      fetch(fileUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('网络响应失败');
          }
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.getFileNameFromPath(filePath); // 设置下载文件名
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url); // 释放内存
        })
        .catch(error => {
          console.error('下载失败:', error);
          this.$message.error('文件下载失败');
        });
    },


    handleAddAssignmentSubmit() {
      this.getResourcesTree().then(() => {
        this.setDefaultSelectedNode(null, this.tempProjectId);
      });
    },

    handleChange(file, fileList) {
      const existingFileNames = new Set(this.fileList.map(file => file.name));
      const newFiles = fileList.filter(file => !existingFileNames.has(file.name));
      console.log(newFiles)
      if (newFiles.length === 0) {
        this.$message.warning(`存在同名或相同文件`);
      } else {
        this.fileList = this.fileList.concat(newFiles);
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handlePreview() {
    },
    handleBeforeUpload(file) {
      const isBmp = file.type === 'image/bmp';
      const isJson = file.type === 'application/json';
      if (!isBmp && !isJson) {
        this.$message.error('只能上传 BMP 或 JSON 文件!');
        return false;
      }
      return true;
    },

    changeState(state) {
      this.queryParams.state = state;
      this.queryParams.pageNum = 1
      this.getList();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleFilter() {
      console.log(this.filterText )
      this.$refs.tree.filter(this.filterText);
    },
    selectCard(index) {
      this.selectedIndex = index;
    },
    toggleSelectCard(index) {
      console.log(index)
      console.log('select')
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
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleCheckChange(data, checked, indeterminate) {
      const tree = this.$refs.tree;
      const node = tree.getNode(data);
      this.queryParams.pageNum = 1
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
      this.selectedIndex = []
      this.loading = true;
      const params = this.queryParams
      params.assignmentName = this.selectedAssignmentName
      params.projectName = this.selectedProjectName
      listImages(params).then(response => {
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
        const assignment = { id: item.projectId + '-' + item.id, label: item.assignmentName, state: item.state };
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
          console.log(project)
          if (project.children && project.children.length > 0) {
            checkedId = project.children[0].id;
            console.log(checkedId)
            break;
          }
        }
      }
      this.currentNode = checkedId
      for (const parentNode of this.data) {
        if (parentNode.children && parentNode.children.length > 0) {
          const childNode = parentNode.children.find(child => child.id === this.currentNode);
          console.log(childNode)
          if (childNode) {
            this.selectedProjectName = parentNode.label;
            this.selectedAssignmentName = childNode.label;
            break;
          }
        }
      }
      this.$nextTick(() => {
        // this.currentNode = checkedId
        this.$refs.tree.setCurrentKey(this.currentNode);
        console.log(this.currentNode)
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
      this.queryParams =  {
        pageNum: 1,
          pageSize: this.queryParams.pageSize,
          imgName: null,
          assignmentId: null,
          imgPath: null,
          imgSize: null,
          description: null,
          state: null,
      },
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
      if (this.currentNode != null) {
        const dashIndex = this.currentNode.indexOf('-');
        if (dashIndex !== -1) {
          this.form.assignmentId = this.currentNode.slice(dashIndex + 1)
        }
        this.title = "添加资源";
      }
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
    updateNotification(notifyInstance, message, type) {
      if (notifyInstance) {
        notifyInstance.close();
      }
      Notification({
        message: message,
        type: type,
        duration: 3000
      });
    },
    submitForm() {
      if (this.fileList.length === 0) {
        this.$modal.msgWarning("请添加资源");
        return
      }
      this.$refs["form"].validate(valid => {
        const formData = new FormData();
        if (valid) {
          const notifyInstance = Notification({
            message: this.selectedAssignmentName + '  资源文件正在上传中...',
            type: 'info',
            duration: 0, // 持续显示，直到手动关闭
            iconClass: 'el-icon-loading'
          });
          Object.entries(this.form).forEach(([key, value]) => {
            if (value !== null) {
              formData.append(key, value);
            }
          });

          this.fileList.forEach(file => {
            formData.append('files[]', file.raw, file.raw.name);
          });
          formData.append('assignmentName', this.selectedAssignmentName);
          formData.append('projectName', this.selectedProjectName);
          if (this.form.id != null) {
            const dashIndex = this.form.id.indexOf('-');

            // 如果找到 "-", 提取其后的子字符串
            if (dashIndex !== -1) {
              const numberStr = this.form.id.slice(dashIndex + 1);

              // 尝试将提取的子字符串转换为数字
              this.form.id = Number(numberStr)
            }
            updateResources(formData).then(response => {
              this.open = false;
              this.getList();
              this.fileList = [];
              this.updateNotification(notifyInstance, this.selectedAssignmentName + '  资源文件上传成功', 'success');
            }).catch(() =>
              this.updateNotification(notifyInstance, this.selectedAssignmentName + '  资源文件上传失败', 'error'));
          } else {
            addResources(formData).then(response => {
              this.open = false;
              this.getList();
              this.fileList = [];
              this.updateNotification(notifyInstance, this.selectedAssignmentName + '  资源文件上传成功', 'success');
            }).catch(() =>
              this.updateNotification(notifyInstance, this.selectedAssignmentName + '  资源文件上传失败', 'error'))
          }
        }
      });
    },
    async removeDirectory(node) {
      const projectName = node.parent.data.label;
      const assignmentName = node.data.label;

      const confirm = await this.$modal.confirm(`是否确认删除 ${assignmentName} 的所有资源？`);

      try {

        const response = await listAll({ projectName: projectName, assignmentName: assignmentName });
          const paths = response.data.reduce((acc, item) => {
            acc.push(item.path);
            if (item.jsonPath) acc.push(item.jsonPath);
            return acc;
          }, []);

          await delResources({ path: paths });
          this.getList();
          this.$modal.msgSuccess("删除成功");
      } catch (error) {
        this.$modal.msgError("删除失败");
      }
    },

    handleDeleteBatch() {
      if (this.selectedIndex.length === 0 ) {
        this.$modal.msgWarning("请选择需要删除的资源");
        return
      }
      this.$modal.confirm('是否确认删除这些资源？').then(() => {
        const path = [];
        this.selectedIndex.forEach(index => {
          path.push(index.path)
          if(index.jsonPath) {
            path.push(index.jsonPath)
          }
        })
        return delResources({ path: path }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        });
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除资源："' + row.name + '"的数据项？').then(() => {
        const path = []
        path.push(row.path)
        if (row.jsonPath) {
          path.push(row.jsonPath)
        }

        // 发送删除请求
        return delResources({path: path}).catch((error) => {
          // 处理错误
          this.$modal.msgError("删除失败: " + (error.message || error)); // 显示错误消息
        });
      }).then(() => {
        this.getList(); // 刷新列表
        this.$modal.msgSuccess("删除成功"); // 显示成功消息
      });
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

.selectedCard {
  border: 1px solid #409eff;
  box-shadow: 0 0 50px rgba(64, 158, 255, 0.5);
}

.card-container {
  overflow-y: auto;
  height: 675px;
  margin-top: 10px;
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



.upload-demo {
  ::v-deep .el-upload-dragger {
    height: 200px !important;
  }
  ::v-deep.el-upload-list {
    max-height: 150px; /* 设置文件列表的最大高度 */
    overflow-y: auto; /* 启用垂直滚动条 */
  }
}
</style>
