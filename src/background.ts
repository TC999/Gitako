import 'webext-dynamic-content-scripts'
import addPermissionToggle from 'webext-permission-toggle'

addPermissionToggle({
  title: '在此域上启用 Gitako',
  reloadOnSuccess: '重载以激活 Gitako？',
})
