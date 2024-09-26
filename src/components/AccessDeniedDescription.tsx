import { useConfigs } from 'containers/ConfigsContext'
import { GITHUB_OAUTH } from 'env'
import { platform } from 'platforms'
import { GitHub } from 'platforms/GitHub'
import React from 'react'

export function AccessDeniedDescription() {
  const { accessToken } = useConfigs().value
  const hasToken = Boolean(accessToken)

  return (
    <div className={'description-area'}>
      <h2>拒绝访问</h2>
      {hasToken ? (
        <>
          <p>
            当前访问令牌无效或未授予访问该项目的权限。
          </p>
          {platform === GitHub && (
            <p>
              如果您使用 OAuth 设置 Gitako，可以在
              <a href={`https://github.com/settings/connections/applications/${GITHUB_OAUTH.clientId}`}>
              这里
              </a>
              授予或请求访问权限, 或者尝试清除并重新设置令牌。
            </p>
          )}
        </>
      ) : (
        <p>
          Gitako 需要访问令牌才能读取此项目。请在下面的设置面板中设置访问令牌。
        </p>
      )}
    </div>
  )
}
