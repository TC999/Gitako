import { Box, Button, Spinner, Text, TextInput } from '@primer/react'
import { wikiLinks } from 'components/settings/SettingsBar'
import { useConfigs } from 'containers/ConfigsContext'
import { SideBarStateContext } from 'containers/SideBarState'
import { platform } from 'platforms'
import { Gitea } from 'platforms/Gitea'
import { Gitee } from 'platforms/Gitee'
import React, { useCallback, useEffect, useState } from 'react'
import { IIFC } from 'react-iifc'
import { useLoadedContext } from 'utils/hooks/useLoadedContext'
import { useStateIO } from 'utils/hooks/useStateIO'
import { SettingsSection } from './SettingsSection'

const ACCESS_TOKEN_REGEXP = /^([0-9a-fA-F]+|gh[pousr]_[A-Za-z0-9_]+)$/

export function AccessTokenSettings() {
  const configContext = useConfigs()
  const { accessToken } = configContext.value
  const hasAccessToken = Boolean(accessToken)
  const [accessTokenInputValue, setAccessTokenInputValue] = useState('')
  const useAccessTokenHint = useStateIO<React.ReactNode>('')
  const focusInput = useStateIO(false)
  const sidebarState = useLoadedContext(SideBarStateContext).value

  const { value: accessTokenHint } = useAccessTokenHint

  useEffect(() => {
    // clear input when access token updates
    setAccessTokenInputValue('')
  }, [accessToken])

  const saveToken = useCallback(
    async (
      hint: typeof useAccessTokenHint.value = (
        <span>
          <a href="#" onClick={() => window.location.reload()}>
            重载
          </a>{' '}
          激活!
        </span>
      ),
    ) => {
      if (accessTokenInputValue) {
        configContext.onChange({ accessToken: accessTokenInputValue })
        setAccessTokenInputValue('')
        useAccessTokenHint.onChange(hint)
      }
    },
    [accessTokenInputValue], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <SettingsSection
      title={
        <>
          访问令牌{' '}
          <a
            href={wikiLinks.createAccessToken}
            title="需要令牌才能访问私有仓库或绕过 API 速率限制"
            target="_blank"
            rel="noopener noreferrer"
          >
            (?)
          </a>
        </>
      }
    >
      {sidebarState === 'getting-access-token' ? (
        <Box display="inline-flex" alignItems="center" sx={{ gap: 2 }}>
          <Spinner size="small" />
          <Text>获取令牌</Text>
        </Box>
      ) : hasAccessToken ? (
        <IIFC>
          {() => {
            const [showConfirmButton, setShowConfirmButton] = useState(false)
            return (
              <Box>
                {showConfirmButton ? (
                  <IIFC>
                    {() => {
                      const [allowClear, setAllowClear] = useState(false)
                      const waitForSeconds = 3
                      const timePast = useTimePast(1000, waitForSeconds * 1000)
                      useEffect(() => {
                        const timeout = setTimeout(() => setAllowClear(true), waitForSeconds * 1000)
                        return () => clearTimeout(timeout)
                      }, [])
                      const countDown = waitForSeconds - timePast

                      return (
                        <Box>
                          <Text as="p">您确定清除令牌？</Text>
                          <Box display="inline-flex" sx={{ gap: 2 }}>
                            <Button
                              variant="danger"
                              disabled={!allowClear}
                              onClick={() => configContext.onChange({ accessToken: '' })}
                            >
                              {countDown ? `确定 (${countDown}秒)` : `确定`}
                            </Button>
                            <Button onClick={() => setShowConfirmButton(false)}>取消</Button>
                          </Box>
                        </Box>
                      )
                    }}
                  </IIFC>
                ) : (
                  <Box>
                    <Text as="p">您的令牌已保存。</Text>
                    <Button onClick={() => setShowConfirmButton(true)}>清除</Button>
                  </Box>
                )}
              </Box>
            )
          }}
        </IIFC>
      ) : (
        <div>
          {platform === Gitea ? (
            // TODO
            <Text>注：Gitea 的 OAuth 不可用</Text>
          ) : platform === Gitee ? (
            // disabled for Gitee as it does not support dynamic redirect_uri
            <Text>注：Gitee 的 OAuth 不可用</Text>
          ) : (
            <a
              className={'link-button'}
              onClick={() => {
                if (platform.isEnterprise()) {
                  alert(`企业版 OAuth 不可用。`)
                  return
                }
                // use js here to make sure redirect_uri is latest url
                window.location.href = platform.getOAuthLink()
              }}
            >
              使用 OAuth (推荐)
            </a>
          )}
          <div className={'access-token-input-control'}>
            <TextInput
              sx={{ marginRight: 1 }}
              className={'access-token-input'}
              value={accessTokenInputValue}
              placeholder="或者在此输入"
              onFocus={() => focusInput.onChange(true)}
              onBlur={() => focusInput.onChange(false)}
              onChange={({ currentTarget: { value } }) => {
                setAccessTokenInputValue(value)
                useAccessTokenHint.onChange(
                  ACCESS_TOKEN_REGEXP.test(value) ? '' : 'Gitako 无法识别该令牌。',
                )
              }}
              onKeyPress={({ key }) => {
                if (key === 'Enter') saveToken()
              }}
            />
            <Button onClick={() => saveToken()} disabled={!accessTokenInputValue}>
              保存
            </Button>
          </div>
        </div>
      )}
      {accessTokenHint && <span className={'hint'}>{accessTokenHint}</span>}
    </SettingsSection>
  )
}

function useTimePast(unit = 1000, max?: number) {
  const [timePast, setTimePast] = useState(0)
  useEffect(() => {
    const checkInterval = (unit / 10) >> 0 // 10x check times for better accuracy
    const start = Date.now()
    let memoLastValue = 0
    const interval = setInterval(() => {
      const now = Date.now()
      const pastInMilliseconds = now - start
      const pastInSeconds = (pastInMilliseconds / 1000) >> 0
      if (pastInSeconds !== memoLastValue) {
        setTimePast(pastInSeconds)
        memoLastValue = pastInSeconds

        if (max && pastInMilliseconds >= max) clearInterval(interval)
      }
    }, checkInterval)

    return () => clearInterval(interval)
  }, [unit, max])

  return timePast
}
