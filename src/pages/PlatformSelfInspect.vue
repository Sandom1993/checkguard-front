<template>
  <h-page-container>
    <h-layout direction="vertical">
      <h-layout-header class="pageHeader">
        <div>平台自查</div>
      </h-layout-header>
      <h-page-content>
        <h-page-search label-position="left" class="searchDiv" :options="{
          xl: 4000,
          lg: 3600,
          md: 800,
          sm: 600
        }">
          <h-page-search-item label="查岗时间:" label-width="80px">
            <div class="block">
              <el-date-picker
                v-model="date"
                type="daterange"
                start-placeholder="今天"
                end-placeholder="今天"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
              />
            </div>
          </h-page-search-item>
          <template slot="pageSearchAction">
            <el-button type="primary" @click="getInspectTable">查询</el-button>
          </template>
        </h-page-search>
        <h-page-action>
          <el-button
            type="primary"
            :icon="inspectLoading ? '' : 'h-icon-message'"
            @click="inspect"
            class="inspectBtn"
            :loading="inspectLoading">
            查岗
          </el-button>
          <span class="countText" v-show="inspectLoading">{{`查岗倒计时：${times}秒`}}</span>
        </h-page-action>
        <h-page-table>
          <el-table
            ref="multipleTable"
            :data="tableData"
            show-overflow-title
            force-scroll="horizontal"
            stripe
          >
            <el-table-column
              key="order"
              prop="order"
              label="序号"
              width="80"
            />
            <el-table-column
              prop="checkTime"
              label="查岗时间"
              key="checkTime"
              width="200"
            />
            <el-table-column
              key="questionName"
              prop="questionName"
              label="查岗问题"
              width="300"
            />
            <el-table-column
              key="processing"
              label="查岗状态"
              width="150"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.processing ? 'danger' : 'success'"
                  close-transition
                >
                  {{scope.row.processing ? '正在查岗中' : '已完成'}}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              key="onDutyNum"
              prop="onDutyNum"
              label="在岗人数"
              width="100"
            />
            <el-table-column
              key="notOnDutyNum"
              prop="notOnDutyNum"
              label="不在岗人数"
              width="100"
            />
            <el-table-column
              key="decription"
              label="操作"
              width="100"
            >
              <template slot-scope="scope">
                <el-button
                  @click="showDialog(scope.row.questionId, scope.row.checkTime ,scope.row.questionName)"
                  type="link"
                  size="small"
                  :disabled="scope.row.processing">详情</el-button>
              </template>
            </el-table-column>

          </el-table>
          <el-pagination
            slot="pagination"
            :current-page="search.pageNo"
            :page-sizes="[20]"
            :page-size="search.pageSize"
            :total="total"
            @current-change="currentChange"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </h-page-table>
      </h-page-content>
    </h-layout>
    <!-- 详情弹窗 -->
    <el-dialog
      :title="`查岗详情-${detailQuestion}`"
      :visible="dialogFormVisible"
      size="large"
      @close = "dialogClose"
      top = "5%"
    >
      <h-page-content>
        <h-page-search label-position="left" class="searchDiv" :options="{
          xl: 2000,
          lg: 1200,
          md: 800,
          sm: 600
        }">
          <h-page-search-item label="用户名称:" label-width="80px" >
            <el-input placeholder="所有用户" v-model="searchDetail.userName"/>
          </h-page-search-item>
          <h-page-search-item label="是否在岗:" label-width="80px">
            <el-select v-model="searchDetail.isWork">
              <el-option
                label="所有记录"
                :value="2"/>
              <el-option
                label="在岗记录"
                :value="1"/>
              <el-option
                label="不在岗记录"
                :value="0"/>
            </el-select>
          </h-page-search-item>
          <template slot="pageSearchAction">
            <el-button type="primary" @click="getDetailTable">查询</el-button>
          </template>
        </h-page-search>
        <h-page-table>
          <el-table
            ref="detailTableData"
            :data="detailTableData"
            show-overflow-title
            force-scroll="horizontal"
            stripe
          >
            <el-table-column
              key="order"
              prop="order"
              label="序号"
              width="80"
            />
            <el-table-column
              prop="userName"
              label="用户名"
              key="userName"
              width="150"
            />
            <el-table-column
              key="subjectName"
              prop="subjectName"
              label="所属业户"
              width="200"
            />
            <el-table-column
              key="answerContent"
              prop="answerContent"
              label="回答内容"
              width="300"
            />
            <el-table-column
              key="answerTime"
              prop="answerTime"
              label="回答时间"
              width="250"
            />
            <el-table-column
              key="isWork"
              label="查岗状态"
              width="150"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.checkStatus === 0 ? 'danger' : 'success'"
                  close-transition
                >
                  {{scope.row.checkStatus === 0 ? '不在岗' : '在岗'}}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </h-page-table>
      </h-page-content>
      <div slot="footer" class="dialog-footer">
        <el-pagination
          slot="pagination"
          :current-page="searchDetail.pageNo"
          :page-sizes="[20]"
          :page-size="searchDetail.pageSize"
          :total="totalDetail"
          @current-change="detailCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-dialog>

  </h-page-container>
</template>
<script>
export default {
  data () {
    return {
      date: [], // 初始日期
      search: { pageNo: 1, pageSize: 20 }, // 检索参数
      searchDetail: { pageNo: 1, pageSize: 20, questionId: '', userName: '', isWork: 2 }, // 检索参数
      detailQuestion: '', // 用于详情弹窗标题显示
      tableData: [],
      detailTableData: [],
      total: 0, // 总数据条数
      totalDetail: 0, // 详情条目数
      dialogFormVisible: false,
      dialogFormMode: 0, // 0新增 1修改
      inspectLoading: false, // 倒计时状态，废弃
      times: 600 // 倒计时，废弃
    }
  },
  mounted () {
    this.getInspectTable()
  },
  computed: {
    todayTime () { // 今天的日期
      const today = new Date()
      return `${today.getFullYear()}-${this.formatDate(today.getMonth() + 1)}-${this.formatDate(today.getDate())}`
    }
  },
  methods: {
    currentChange (pageNo) { // 切页
      this.search.pageNo = pageNo
      this.getInspectTable()
    },
    detailCurrentChange (pageNo) { // 详情表切页
      this.searchDetail.pageNo = pageNo
      this.getDetailTable()
    },
    getInspectTable () { // 拿表格
      const para = {
        startTime: `${this.date.length === 0 ? this.todayTime : this.date[0]} 00:00:00`,
        endTime: `${this.date.length === 0 ? this.todayTime : this.date[1]} 23:59:59`,
        ...this.search
      }
      this.$http
        .post('platformSelfInspect/getInspectTable', para) // 获取已有查岗信息
        .then(response => {
          this.tableData = response.data.list
          this.tableData.forEach((item, index) => { item.order = index + 1 })
          this.total = response.data.total
        })
    },
    getDetailTable () { // 拿详情表格
      this.$http
        .post('platformSelfInspect/getInspectDetail', this.searchDetail) // 获取一次查岗详情信息
        .then(response => {
          this.detailTableData = response.data.list
          this.detailTableData.forEach((item, index) => { item.order = index + 1 })
          this.totalDetail = response.data.total
        })
    },
    inspect () { // 自查，后台开始倒计时
      this.$http
        .post('platformSelfInspect/inspect') // 开始一次自查
        .then(response => {
          this.$message(
            response.data === null
              ? '查岗成功'
              : `上次查岗进行中，大约${response.data}秒后可以再次查岗`
          )
        })
      /* 这里前端倒计时功能暂时废弃
      this.inspectLoading = true
      this.timer = setInterval(() => {
        this.times--
        if (this.times === 0) {
          this.inspectLoading = false
          this.times = 600
          clearInterval(this.timer)
        }
      }, 1000)
      */
    },
    dialogClose () {
      this.searchDetail = { pageNo: 1, pageSize: 20, questionId: '', userName: '', isWork: 2 } // 重置检索参数
      this.dialogFormVisible = false
    },
    showDialog (id, time, question) { // 打开对话框
      this.dialogFormVisible = true
      this.searchDetail.questionId = id
      this.detailQuestion = `(提问内容：${question},查岗时间：${time})`
      this.getDetailTable()
    },
    formatDate (date) { // 格式化日期
      if (date < 10) {
        return `0${date}`
      } else { return date }
    }
  }
}
</script>
<style lang="scss">
  .pageHeader{
    padding:12px;
    width: 100%;
    div{
      font-size: 120%;
      border-bottom: 1px solid #E0E0E0;
      padding:8px 16px;
    }
  }
  .searchDiv{border-bottom: 0px;padding: 0;}
  .el-form{padding:0px 16px 8px 16px;}
  .inspectBtn{width: 100px;}
  .countText{display: inline-block;width: 150px;color:red;text-align: center;}
  .el-dialog__footer{height:80px}
</style>
