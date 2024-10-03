import { useConfigs } from 'containers/ConfigsContext'
import { errors, platform, platformName } from 'platforms'
import { useCallback } from 'react'
import { useLoadedContext } from 'utils/hooks/useLoadedContext'
import { SideBarErrorContext } from '../../containers/ErrorContext'
import { SideBarStateContext } from '../../containers/SideBarState'

export function useHandleNetworkError() {
  const { accessToken } = useConfigs().value
  const changeErrorContext = useLoadedContext(SideBarErrorContext).onChange
  const changeStateContext = useLoadedContext(SideBarStateContext).onChange

  return useCallback(
    function handleNetworkError(err: Error) {
      const message = platform.mapErrorMessage?.(err) || err.message
      if (message === errors.EMPTY_PROJECT) {
        changeErrorContext('这个项目似乎是空的。')
        return
      }

      if (message === errors.BLOCKED_PROJECT) {
        changeErrorContext('访问此项目被阻止。')
        return
      }

      if (
        message === errors.NOT_FOUND ||
        message === errors.BAD_CREDENTIALS ||
        message === errors.API_RATE_LIMIT
      ) {
        changeStateContext('error-due-to-auth')
        return
      }

      if (message === errors.CONNECTION_BLOCKED) {
        if (accessToken) changeErrorContext(`无法连接至 ${platformName}.`)
        else changeStateContext('error-due-to-auth')

        return
      }

      if (message === errors.SERVER_FAULT) {
        changeErrorContext(`${platformName} 服务器宕机。`)
        return
      }

      changeStateContext('disabled')
      changeErrorContext('意外发生了。')
      throw err
    },
    [accessToken, changeErrorContext, changeStateContext],
  )
}
