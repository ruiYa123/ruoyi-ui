<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane size="60" style="padding-right: 10px">
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="true" style="display: flex; justify-content: space-between; align-items: center;">
            <el-form-item style="margin-left: auto;">
              <div >
                <el-button type="primary" plain>新建任务</el-button>
              </div>
            </el-form-item>
          </el-form>
          <el-row :gutter="10" style="margin-bottom: 10px">
            <el-col :span="8">
              <el-button type="success" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-finished" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">已训练任务</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-time" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">队列中任务</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="info" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-wallet" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">未训练任务</span>
                </div>
              </el-button>
            </el-col>

          </el-row>
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" style="display: flex; justify-content: space-between; align-items: center;">
            <el-form-item label="任务名称" prop="roleName">
              <el-input
                v-model="queryParams.roleName"
                placeholder="请输入任务名称"
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

<!--          <div style="display: flex; justify-content: center;">-->
<!--            <el-button type="primary" plain>上传图片</el-button>-->
<!--            <el-button type="success" plain>下载全部</el-button>-->
<!--            <el-button type="danger" plain>批量删除</el-button>-->
<!--          </div>-->

          <div>
            <el-table v-loading="false" :data="roleList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" align="center" />
              <el-table-column label="任务编号" prop="roleId" width="100px"/>
              <el-table-column label="所属项目" prop="roleName" :show-overflow-tooltip="true"/>
              <el-table-column label="算法模型" prop="roleKey" :show-overflow-tooltip="true"/>
              <el-table-column label="创建时间" prop="roleSort"/>
              <el-table-column label="备注" prop="roleSort"/>
              <el-table-column label="操作" prop="roleSort"/>
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
          <div style="display: flex; justify-content: space-between; align-items: center;">
            任务名称
            <el-button type="primary" plain style="margin-left: auto;">修改配置</el-button>
          </div>
          <el-divider></el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="所属项目" :span="2">xxxxx</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">
              xxxx
            </el-descriptions-item>
            <el-descriptions-item label="模型" >
              xxxx
            </el-descriptions-item>
            <el-descriptions-item label="资源数量">
              16
            </el-descriptions-item>
            <el-descriptions-item label="训练次数" >
              xxxx
            </el-descriptions-item>
            <el-descriptions-item label="训练数" >
              xxxx
            </el-descriptions-item>
            <el-descriptions-item label="批大小" >
              xxxx
            </el-descriptions-item>
            <el-descriptions-item label="图像大小">
              xxxx
            </el-descriptions-item>
          </el-descriptions>
          <el-collapse v-model="activeName" class="custom-collapse">
            <el-collapse-item name="1" title="当前训练">
<!--              <template #title>-->
<!--                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">-->
<!--                  <span>当前训练</span>-->
<!--                  <div style="display: flex; justify-content: flex-end; margin-right: 10px">-->
<!--                    <el-button type="primary" plain @click.stop>开始训练</el-button>-->
<!--                    <el-button type="warning" plain @click.stop>停止训练</el-button>-->
<!--                    <el-button type="danger" plain @click.stop>删除项目</el-button>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </template>-->
              <div style="margin-bottom: 20px">
                <el-button type="primary" plain @click.stop>开始训练</el-button>
                <el-button type="warning" plain @click.stop>停止训练</el-button>
                <el-button type="danger" plain @click.stop>删除项目</el-button>
              </div>
              <div class="container">
                <el-progress type="circle" :percentage="25"></el-progress>
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>训练日志</span>
                    <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
                  </div>
                  <div v-for="o in 4" :key="o" class="text item">
                    {{'列表内容 ' + o }}
                  </div>
                </el-card>
              </div>
            </el-collapse-item>
            <el-collapse-item name="2" title="训练记录">
              <div style="margin-bottom: 20px">
                <el-table v-loading="false" :data="roleList" @selection-change="handleSelectionChange">
                  <el-table-column label="训练次数" prop="roleId" width="100px"/>
                  <el-table-column label="开始时间" prop="roleName" :show-overflow-tooltip="true"/>
                  <el-table-column label="完成时间" prop="roleKey" :show-overflow-tooltip="true"/>
                  <el-table-column label="信息" prop="roleSort"/>
                  <el-table-column label="备注" prop="roleSort"/>
                  <el-table-column label="操作" prop="roleSort"/>
                </el-table>
              </div>
            </el-collapse-item>
          </el-collapse>
        </pane>
      </splitpanes>
    </el-row>
  </div>
</template>

<script>
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import Treeselect from '@riophae/vue-treeselect'

export default {
  components: { Treeselect, Splitpanes, Pane },
  data() {
    return {
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      total: 2,
      activeName: ["1", "2"],
      data: [{
        id: 1,
        label: '项目 1',
        children: [{
          id: 2,
          label: '设备1'
        }]
      }, {
        id: 3,
        label: '项目2',
        children: [{
          id: 4,
          label: '设备2'
        }, {
          id: 5,
          label: '设备3'
        }]
      }],
      defaultProps: {
        children: "children",
        label: "label",
      },
      showSearch: true,
      currentDate: new Date().toLocaleDateString(),
      selectedIndex: [],
      items: [
        {
          name: '好吃的汉堡',
          image: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        },
        {
          name: '美味的披萨',
          image: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        },
        {
          name: '好吃的汉堡',
          image: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        },
        {
          name: '美味的披萨',
          image: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        },
        {
          name: '好吃的汉堡',
          image: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        },
        {
          name: '美味的披萨',
          image: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        }
        // 可以继续添加更多项目
      ]
    };
  },
  methods: {
    selectCard(index) {
      this.selectedIndex = index;
    },
    toggleSelectCard(index) {
      const selectedIndex = this.selectedIndex;
      const selectedIndexPos = selectedIndex.indexOf(index);
      if (selectedIndexPos === -1) {
        // 如果索引不在数组中，添加它
        selectedIndex.push(index);
      } else {
        // 如果索引已经在数组中，移除它
        selectedIndex.splice(selectedIndexPos, 1);
      }
    },
    handleCheckChange(data, checked, indeterminate) {
      // 如果节点有子节点，则认为是父节点
      if (data.children && data.children.length > 0) {
        // 取消选中状态
        this.$refs.tree.setChecked(data.id, false, true);
      }
    }
  }
};
</script>
<style scoped lang="scss">
.sidebar {
  width: 20%;
  //background-color: #f5f5f5; /* 可选：给左侧栏一个背景颜色 */
  padding: 10px;
}
.selected {
  border: 1px solid #409eff; /* 选中时的边框颜色 */
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5); /* 选中时的阴影效果 */
}


.card-container {
  height: 345px;
  overflow-y: auto;
  margin: 10px 0;
}

.sidebar {
  width: 20%;
  padding: 10px;
}

.time {
  font-size: 13px;
  color: #999;
}


.container {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  width: 90%; /* 确保容器占满父级宽度 */
}

.progress {
  flex: 0 0 30%; /* 固定占用30%的宽度 */
}

.box-card {
  flex: 0 0 70%; /* 固定占用70%的宽度 */
  margin-left: 20px; /* 如果需要，可以调整间距 */
}


</style>
