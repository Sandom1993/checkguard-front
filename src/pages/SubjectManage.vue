<template>
  <h-page-container>
    <h-layout direction="vertical">
      <h-layout-header class="pageHeader">
        <div>业户管理</div>
      </h-layout-header>
      <h-page-content>
        <h-page-search label-position="left" class="searchDiv" :options="{
          xl: 1800,
          lg: 1400,
          md: 1000,
          sm: 600
        }">
          <h-page-search-item label="业户名称:" label-width="80px">
            <el-input v-model="search.subjectName"/>
          </h-page-search-item>
          <h-page-search-item label="经营许可证号:" label-width="100px">
            <el-input v-model="search.licenseKey"/>
          </h-page-search-item>
          <template slot="pageSearchAction">
            <el-button @click="getSubjectTable" type="primary">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </template>
        </h-page-search>
        <h-page-action>
          <el-button type="iconButton" icon="h-icon-add" @click="showDialog(-1)">添加</el-button>
          <el-button type="iconButton" icon="h-icon-delete" @click="deleteSubject">删除</el-button>
        </h-page-action>
        <h-page-table>
          <el-table
            ref="multipleTable"
            reserve-selection
            :data="tableData"
            show-overflow-title
            @selection-change="handleSelectionChange"
            stripe
          >
            <el-table-column
              type="selection"
            >
            </el-table-column>
            <el-table-column
              key="order"
              prop="order"
              label="序号"
              width="100"
            />
            <el-table-column
              prop="subjectName"
              label="业户名称"
              key="subjectName"
              width="150"
            />
            <el-table-column
              key="licenseKey"
              prop="licenseKey"
              label="经营许可证号"
              width="200"
            />
            <el-table-column
              key="userList"
              prop="userList"
              label="用户列表"
              width="300"
            />

            <el-table-column
              key="decription"
              label="操作"
              width="300"
            >
              <template slot-scope="scope">
                <el-button @click="showDialog(scope.$index)" type="link" size="small">编辑</el-button>
                <el-button type="link" size="small" @click="$router.push({ path: `/editUser/${scope.row.uuid}` })">分配用户</el-button>
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

    <el-dialog
      :title="dialogFormMode===0 ? '新增业户' : '编辑业户'"
      :visible.sync="dialogFormVisible"
      :area="[480,300]"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="业户名称" required>
          <el-input v-model="form.subjectName"></el-input>
        </el-form-item>
        <el-form-item label="经营许可证号" required>
          <el-input v-model="form.licenseKey"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editSubject">
          确 定
        </el-button>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>

  </h-page-container>
</template>
<script>
export default {
  name: 'BasicTable',
  data () {
    return {
      tableData: [],
      search: { currentPage: 1, pageSize: 20, subjectName: '', licenseKey: '' }, // 检索参数
      total: 0, // 总数据条数
      form: { subjectName: '', licenseKey: '', uuid: '' }, // 对话框表单
      dialogFormVisible: false,
      dialogFormMode: 0, // 0新增 1修改
      selections: [] // 选中的数据
    }
  },
  watch: {},
  mounted () {
    this.getSubjectTable()
  },
  methods: {
    currentChange (currentPage) { // 切页
      this.search.currentPage = currentPage
      this.getSubjectTable()
    },
    getSubjectTable () { // 拿表格
      this.$http
        .post('subjectManage/getSubjectTable', this.search) // 获取已有平台信息
        .then(response => {
          this.tableData = response.data.list.sort((a, b) => {
            return a.subjectName.localeCompare(b.subjectName, 'zh')
          })
          this.tableData.forEach((item, index) => { item.order = index + 1 })
          this.total = response.data.total
        })
    },
    handleReset () {
      this.search.subjectName = ''
      this.search.licenseKey = ''
    },
    showDialog (index) { // 打开对话框
      this.dialogFormMode = index === -1 ? 0 : 1
      this.form = index === -1
        ? { subjectName: '', licenseKey: '' }
        : { subjectName: this.tableData[index].subjectName, licenseKey: this.tableData[index].licenseKey, uuid: this.tableData[index].uuid }
      this.dialogFormVisible = true
    },
    handleSelectionChange (selections) {
      this.selections = selections
    },
    deleteSubject () {
      const para = []
      this.selections.map(item => para.push(item.uuid))
      this.$http
        .post('subjectManage/deleteSubjects', { uuids: para })
        .then(response => {
          if (response.msg !== 'success') {
            this.$message(response.msg)
          } else {
            this.$message('删除成功')
            this.getSubjectTable()
          }
        })
    },
    editSubject () {
      const url = this.dialogFormMode === 0
        ? 'subjectManage/addSubject'
        : 'subjectManage/editSubject'
      this.$http
        .post(url, this.form)
        .then(response => {
          if (response.msg !== 'success') {
            this.$message(response.msg)
          } else {
            this.$message('操作成功')
            this.getSubjectTable()
            this.dialogFormVisible = false
          }
        })
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
</style>
