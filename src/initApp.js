import store from '@/store'
import { mountVueInstance, errorLoadPage, renderThemeFromCssUrl } from 'dolphin-plugin-tools'
import router from './router'
import App from './App'
import ErrorPage from '@/components/ErrorPage'

async function initApp (Vue) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { userInfo } = await store.dispatch('setUserInfo')
    await Promise.all([renderTheme(userInfo)])
    // 初始化vue实例
    mountVueInstance(Vue, App, {
      store,
      router
    })
  } catch (error) {
    await renderTheme({ skin: 'redblack' })
    errorLoadPage(Vue, ErrorPage)
  }
}

async function renderTheme ({ skin }) {
  try {
    const assetsUrl = process.env.BASE_URL + process.env.VUE_APP_ASSETS
    // public/static/skin/xxx/skin.css
    const requestUrl = `${assetsUrl}/skin/${skin}/skin.css`
    await renderThemeFromCssUrl(requestUrl)
  } catch (error) {
    console.error('设置自定义皮肤失败')
    throw error
  }
}

export default initApp
