<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-row :gutter="10" style="margin-bottom: 10px">
          <el-col :span="12">
            <el-button
              type="warning"
              :class="{'warning-active': queryParams.state === 1}"
              plain
              class="status-btn"
              @click="handleStateQuery(1)"
            >
              <div class="btn-content">
                <i class="el-icon-warning"></i>
                <span class="btn-text">告警日志</span>
              </div>
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button
              type="primary"
              :class="{'primary-active': queryParams.state === 0}"
              plain
              class="status-btn"
              @click="handleStateQuery(0)"
            >
              <div class="btn-content">
                <i class="el-icon-success"></i>
                <span class="btn-text">正常日志</span>
              </div>
            </el-button>
          </el-col>
        </el-row>

        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" class="search-form">

          <el-form-item label="日志类型" prop="commandStr">
            <el-input
              v-model="queryParams.commandStr"
              placeholder="请输入日志类型"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item class="form-actions">
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          :data="clientLogList"
          stripe
          border
          highlight-current-row
          class="log-table"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="客户端" align="center" prop="clientId" width="120">
            <template slot-scope="scope">
              <span>{{ getClientName(scope.row.clientId) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="命令类型" align="center" prop="commandStr" width="180" />
          <el-table-column label="日志内容" align="center" prop="content" />
          <el-table-column label="日志时间" align="center" prop="createTime" width="180px"/>
          <el-table-column label="状态" align="center" width="120">
            <template slot-scope="scope">
              <el-tag :type="scope.row.state === 1 ? 'danger' : 'success'">
                {{ scope.row.state === 1 ? '告警' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="queryParams.state === 1" label="操作" align="center" width="120" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.state === 1"
                type="text"
                icon="el-icon-check"
                @click="handleConfirm(scope.row)"
                class="confirm-btn"
              >处置</el-button>
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listClientLog, updateClientLog } from "@/api/business/clientLog";
import { listAllClient } from '@/api/business/client'

export default {
  name: "ClientLog",
  props: {
    clientId: {
      required: true,
      type: Number,
    }
  },
  data() {
    return {
      loading: true,
      clientLogList: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        clientId: null,
        commandStr: null,
        orderByColumn: 'createTime',
        state: 1
      },
      clientOptions: [],
      showSearch: true
    };
  },
  created() {
    this.getList();
    this.getClientOptions();
  },
  watch: {
    clientId(newClientId) {
      this.queryParams.clientId = newClientId;
      this.handleQuery();
    }
  },
  methods: {
    getClientName(clientId) {
      const client = this.clientOptions.find(option => option.id === clientId);
      return client ? client.name : '';
    },
    getList() {
      this.loading = true;
      listClientLog(this.queryParams).then(response => {
        this.clientLogList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getClientOptions() {
      listAllClient().then(response => {
        this.clientOptions = response.data;
      });
    },
    handleStateQuery(state) {
      this.queryParams.state = state;
      this.handleQuery();
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleConfirm(row) {
      this.$confirm('确认处置该告警日志?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.state = 0;
        updateClientLog(row).then(() => {
          this.$message.success("处置成功");
          this.getList();
        });
      });
    }
  }
};
</script>

<style scoped lang="scss">
.status-btn {
  width: 100%;
  padding: 20px;
  font-size: 14px;
  height: 100px;

  .btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    i {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .btn-text {
      font-size: 14px;
    }
  }
}

.warning-active {
  background-color: #FFBA00;
  border-color: #FFBA00;
  color: white;

  i, .btn-text {
    color: white !important;
  }
}

.primary-active {
  background-color: #1890FF;
  border-color: #1890FF;
  color: white;

  i, .btn-text {
    color: white !important;
  }
}

.search-form {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;

  ::v-deep .el-form-item {
    margin-bottom: 0;
  }
}

.form-actions {
  margin-left: auto;
}

.log-table {
  margin-top: 20px;

  ::v-deep .el-table__header {
    th {
      background-color: #f5f7fa;
      font-weight: bold;
    }
  }
}

.confirm-btn {
  color: #67c23a;
  font-weight: bold;

  &:hover {
    color: #85ce61;
  }
}
</style>
