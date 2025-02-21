<template>
  <el-dialog :title="title" :visible.sync="open" append-to-body>
    <el-form ref="form" :model="localForm" :rules="rules" label-width="150px">
      <el-form-item label="任务名称" prop="assignmentName">
        <el-input v-model="localForm.assignmentName" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item v-if="!isProject" label="所属项目" prop="projectId">
        <el-select v-model="localForm.projectId" placeholder="请选择所属项目">
          <el-option
            v-for="project in projectOptions"
            :key="project.id"
            :label="project.name"
            :value="project.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联模型" prop="modelId">
        <el-select v-model="localForm.modelId" placeholder="请选择所属项目">
          <el-option
            v-for="model in modelOptions"
            :key="model.id"
            :label="model.name"
            :value="model.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="预训练模式" prop="pretrainMode">
        <el-input v-model="localForm.pretrainMode" placeholder="请输入预训练模式" />
      </el-form-item>
      <el-form-item label="训练次数" prop="epoch">
        <el-input v-model="localForm.epoch" placeholder="请输入训练次数" />
      </el-form-item>
      <el-form-item label="批大小" prop="batchSize">
        <el-input v-model="localForm.batchSize" placeholder="请输入批大小" />
      </el-form-item>
      <el-form-item label="图像大小" prop="imgSize">
        <el-input v-model="localForm.imgSize" placeholder="请输入图像大小" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="localForm.description" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listModel } from '@/api/business/model';
import { listProject } from '@/api/business/project';
import { addAssignment, updateAssignment } from '@/api/business/assignment'

export default {
  props: {
    open: Boolean,
    title: String,
    form: Object,
    isProject: false,
    onSubmit: {
      type: Function,
      default: () => {} // 提供一个默认的空函数
    }
  },
  data() {
    return {
      isProject: false,
      projectOptions: [],
      modelOptions: [],
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
      }
    };
  },
  created() {
    this.getProjectList();
    this.getModelList();
  },
  watch: {
    open(newVal) {
      if (!newVal) {
        this.cancel()
      }
    }
  },
  computed: {
    localForm: {
      get() {
        return this.form;
      },
      set(value) {
        this.$emit('update:form', value);
      }
    },
    localOpen: {
      get() {
        return this.open;
      },
      set(value) {
        this.$emit('update:open', value);
      }
    }
  },
  methods: {
    getModelList() {
      listModel().then(response=> {
        this.modelOptions = response.rows.map(item => ({
          id: item.id,
          name: item.modelName
        }))
      })
    },
    getProjectList() {
      listProject().then(response => {
        this.projectOptions = response.rows.map(item => ({
          id: item.id,
          name: item.projectName
        }));

      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAssignment(this.form).then(() => {
              this.$modal.msgSuccess("修改成功");
              this.localOpen = false;
              this.onSubmit(this.localForm.id);
            });
          } else {
            addAssignment(this.form).then(() => {
              this.$modal.msgSuccess("新增成功");
              this.localOpen = false;
              this.onSubmit(this.localForm.id, 0);
            });
          }
        }
      });
    },
    resetForm() {
      this.localForm = {
        id: null,
        assignmentName: null,
        projectId: null,
        modelId: null,
        pretrainMode: null,
        epoch: null,
        batchSize: null,
        imgSize: null,
        description: null
      };
    },
    cancel() {
      this.localOpen = false;
      this.resetForm();
      this.$emit('update:open', false);
    }
  }
};
</script>
