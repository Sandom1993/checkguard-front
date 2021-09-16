export default [
  {
    path: '/',
    redirect: '/subjectManage'
  },
  {
    path: '/error/:type',
    name: 'Error',
    component: 'Error' // 注意提供ErrorPage组件内的多语言翻译
  },
  {
    name: 'subjectManage',
    path: '/subjectManage/',
    menuCode: '001',
    component: 'SubjectManage'
  },
  {
    name: 'platformSelfInspect',
    path: '/platformSelfInspect/',
    menuCode: '002',
    component: 'PlatformSelfInspect'
  },
  {
    name: 'editUser',
    path: '/editUser/:id',
    menuCode: '001',
    component: 'EditUser'
  }
]
