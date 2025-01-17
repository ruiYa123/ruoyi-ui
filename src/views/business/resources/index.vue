<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="deptName" placeholder="请输入设备名称" clearable size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px" />
            </div>
            <div class="head-container">
              <el-tree
                :data="data"
                :props="defaultProps"
                :filter-node-method="filterNode"
                ref="tree"
                node-key="id"
                default-expand-all
                highlight-current
                check-strictly
                @node-click="handleCheckChange"
              >
                <span class="custom-tree-node" slot-scope="{ node, data }" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>{{ node.label }}</span>
                  <span v-if="node.level === 1" style="margin-left: auto;">
                    <el-button
                      type="text"
                      size="mini"
                      @click="() => append(data)"
                    >
                      <i class="el-icon-plus"></i>
                    </el-button>
                  </span>
                </span>
              </el-tree>
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
              <div >
                <el-button type="primary" plain>配置文件上传</el-button>
              </div>
            </el-form-item>
          </el-form>
          <el-row :gutter="10" style="margin-bottom: 10px">
            <el-col :span="12">
              <el-button type="primary" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <i class="el-icon-edit-outline" style="font-size: 32px;"></i>
                  <span style="font-size: 14px; margin-top: 5px;">未打标</span>
                </div>
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="success" plain style="width: 100%; padding: 20px; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
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
            <el-button type="primary" plain>上传图片</el-button>
            <el-button type="success" plain>下载全部</el-button>
            <el-button type="danger" plain>批量删除</el-button>
          </div>

          <div class="card-container">
            <el-row>
              <el-col
                :span="5"
                v-for="(item, index) in items"
                :key="index"
                :offset="index % 4 !== 0 ? 1 : 0"
                style="margin-top: 5px; margin-bottom: 5px;"
              >
                <el-card
                  :body-style="{ padding: '0px' }"
                  v-on:click.native="toggleSelectCard(index)"
                  :class="{ selected: selectedIndex.includes(index) }"
                >
                  <img :src="item.image" class="image" />
                  <div style="padding: 14px;">
                    <span>{{ item.name }}</span>
                    <div class="bottom clearfix">
                      <time class="time">{{ currentDate }}</time>
                      <el-button type="text" class="button"><i class="el-icon-delete" style="color: red" @click.stop></i> </el-button>
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
  height: 850px;
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
  clear: both
}

</style>
