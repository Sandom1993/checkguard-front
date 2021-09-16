<template>
  <h-page-container>
      <h-layout-header class="pageHeader">
        <div>分配用户</div>
      </h-layout-header>
      <h-page-content>
        <el-row style="margin:20px 0">
          <el-col :span="4" class="colBox">
            <el-tree
              :data.sync="treeData"
              ref="tree"
              lazy
              parent-key="parentId"
              node-key="orgId"
              @current-change="currentChange"
              :props="defaultProps"
              :load="loadNode"
            ></el-tree>
          </el-col>
          <el-col :span="8" class="colBox leftin">
            <el-table
              ref="multipleTable"
              :data="rightData"
              force-scroll
              style="width: 100%"
              @selection-change="rightSelectionChange">
              <el-table-column
                type="selection">
              </el-table-column>
              <el-table-column :label="`待添加 ${rightData.length} 项`">
                <el-table-column
                  prop="userName"
                  label="姓名">
                </el-table-column>
                <el-table-column
                  prop="userDescription"
                  label="用户描述"
                  width="300">
                </el-table-column>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="9" class="colBox rightTable">
            <el-table
              ref="multipleTable"
              :data="chooseData"
              force-scroll
              style="width: 100%"
            >
              <el-table-column :label="`已选择共 ${chooseData.length} 项`">
                <el-table-column
                  prop="userName"
                  label="姓名">
                </el-table-column>
                <el-table-column
                  label="操作">
                  <template slot-scope="scope">
                    <el-button type="" icon="h-icon-delete" @click ="deleteChoose(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <h-page-footer>
          <el-button type="primary" style="margin:10px 40px 0 0" @click="saveUser">保存</el-button>
          <el-button type="default" @click="abort">取消</el-button>
        </h-page-footer>
      </h-page-content>
  </h-page-container>
</template>

<script>
export default {
  data () {
    return {
      treeData: [], // 左侧树的数据
      rightData: [], // 列表显示的数据
      chooseData: [], // 选中的数据
      rightSelectionData: [], // 右侧被选中的数据
      defaultProps: { label: 'name', isLeaf: 'leaf' }, // 树的属性配置
      deleteList: [] // 被删除的用户列表
    }
  },

  mounted () {
    this.getUserList()
  },

  methods: {
    async findOrgsAndResource (orgId) { // 异步获取组织树
      return new Promise((resolve, reject) => {
        this.$http
          .post('subjectManage/getOrgTree', { orgId: orgId })
          .then(response => {
            var getTreeData = response.data
            getTreeData.forEach((value, index) => {
              value.icon = 'h-icon-info_organization'
            })
            resolve(getTreeData)
          })
      })
    },

    async loadNode (node, resolve) { // 加载下级树事件
      if (node.level === 0) {
        await this.findOrgsAndResource('').then(data => {
          resolve(data)
        })
      } else {
        await this.findOrgsAndResource(node.data.orgId).then(data => {
          resolve(data)
        })
      }
    },
    getUserList () { // 获取上一次已经分配的用户列表
      this.$http
        .post('subjectManage/getUserList', { uuid: this.$route.params.id })
        .then(response => {
          if (response.msg === 'success') {
            this.chooseData = response.data
          } else {
            this.$message(response.msg)
          }
        })
    },
    currentChange (row) { // 点击组织
      this.$http
        .post('subjectManage/getOrgUser', { orgId: row.orgId })
        .then(response => {
          if (response.msg === 'success') {
            this.rightData = response.data
            this.deleteList.forEach(item => {
              if (item.deptId === row.orgId && !this.rightData.some(e => e.userId === item.userId)) this.rightData.push(item)
            })
          }
        })
    },
    rightSelectionChange (selection) { // 左侧列表勾选事件
      this.rightSelectionData = selection
      const waitAddData = this.rightSelectionData.filter(e => {
        return !this.chooseData.some(select => select.userName === e.userName)
      })
      this.chooseData = this.chooseData.concat(waitAddData)
    },
    saveUser () { // 提交保存分配用户
      const para = {
        uuid: this.$route.params.id,
        userList: this.chooseData
      }
      this.$http
        .post('subjectManage/updateUser', para)
        .then(response => {
          if (response.msg !== 'success') {
            this.$message(response.msg)
          } else {
            this.$message('操作成功')
            this.$router.push({ path: '/subjectManage' })
          }
        })
    },
    deleteChoose (index) { // 删除一个已选择的用户
      this.deleteList.push(this.chooseData[index])
      this.chooseData.splice(index, 1)
    },
    abort () {
      this.$router.push({ path: '/subjectManage' })
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
  .colBox{height:70vh;border:1px solid #E0E0E0;}
  .leftin{margin-left:-1px;}
  .rightTable{margin-left:40px;}
</style>
