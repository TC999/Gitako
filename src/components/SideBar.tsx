import { PinIcon, TabIcon } from '@primer/octicons-react'
import { AccessDeniedDescription } from 'components/AccessDeniedDescription'
import { FileExplorer } from 'components/FileExplorer'
import { Footer } from 'components/Footer'
import { MetaBar } from 'components/MetaBar'
import { Portal } from 'components/Portal'
import { ToggleShowButton } from 'components/ToggleShowButton'
import { useConfigs } from 'containers/ConfigsContext'
import { platform, platformName } from 'platforms'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IIFC } from 'react-iifc'
import { useWindowSize } from 'react-use'
import { Config } from 'utils/config/helper'
import { cx } from 'utils/cx'
import * as DOMHelper from 'utils/DOMHelper'
import * as features from 'utils/features'
import { detectBrowser, formatWithShortcut } from 'utils/general'
import { useConditionalHook } from 'utils/hooks/useConditionalHook'
import { useAfterRedirect, usePJAXAPI } from 'utils/hooks/useFastRedirect'
import { useLoadedContext } from 'utils/hooks/useLoadedContext'
import { ResizeState } from 'utils/hooks/useResizeHandler'
import { useStateIO } from 'utils/hooks/useStateIO'
import { SideBarErrorContext } from '../containers/ErrorContext'
import { SideBarStateContext } from '../containers/SideBarState'
import { Theme } from '../containers/Theme'
import { useOnShortcutPressed } from '../utils/hooks/useOnShortcutPressed'
import { FocusTarget } from './FocusTarget'
import { LoadingIndicator } from './LoadingIndicator'
import { RoundIconButton } from './RoundIconButton'
import { SettingsBarContent } from './settings/SettingsBar'
import { SidebarContext } from './SidebarContext'
import { SideBarResizeHandler } from './SideBarResizeHandler'

export function SideBar() {
  usePJAXAPI()
  platform.usePlatformHooks?.()
  useMarkGitakoGlobalAttributes()

  const error = useLoadedContext(SideBarErrorContext).value

  const [shouldExpand, setShouldExpand, toggleShowSideBar] = useShouldExpand()
  useFocusSidebarOnExpand(shouldExpand)
  const pendingFocusTarget = useStateIO<FocusTarget>(null)
  useShowSidebarKeyboard(
    shouldExpand,
    setShouldExpand,
    toggleShowSideBar,
    pendingFocusTarget.onChange,
  )

  const configContext = useConfigs()

  const blockLeaveRef = useRef(false)
  const { sidebarToggleMode, shortcut, focusSearchInputShortcut } = configContext.value
  const onResizeStateChange = useCallback((state: ResizeState) => {
    blockLeaveRef.current = state === 'resizing'
  }, [])

  const heightForSafari = useConditionalHook(
    () => detectBrowser() === 'Safari',
    () => useWindowSize().height, // eslint-disable-line react-hooks/rules-of-hooks
  )

  const sidebarContextValue = useMemo(() => ({ pendingFocusTarget }), [pendingFocusTarget])

  const placement = configContext.value.sidebarPlacement

  return (
    <Theme>
      <ToggleShowButtonWrapper
        shouldExpand={shouldExpand}
        setShouldExpand={setShouldExpand}
        toggleShowSideBar={toggleShowSideBar}
      />
      <SidebarContext.Provider value={sidebarContextValue}>
        <div className={'gitako-side-bar'}>
          <div
            className={cx(
              'gitako-side-bar-body-wrapper',
              `toggle-mode-${sidebarToggleMode}`,
              `placement-${placement}`,
              {
                collapsed: error || !shouldExpand,
              },
            )}
            style={{ height: heightForSafari }}
            onMouseLeave={() => {
              if (blockLeaveRef.current) return
              if (sidebarToggleMode === 'float') setShouldExpand(false)
            }}
          >
            {features.resize && placement === 'right' && (
              <SideBarResizeHandler onResizeStateChange={onResizeStateChange} />
            )}
            <div className={'gitako-side-bar-body'}>
              <div className={'gitako-side-bar-content'}>
                <div className={'header'}>
                  <div className={'side-bar-position-controls'}>
                    {sidebarToggleMode === 'persistent' && (
                      <RoundIconButton
                        icon={TabIcon}
                        aria-label={formatWithShortcut('收起', shortcut)}
                        sx={{
                          transform: 'rotateY(180deg)',
                        }}
                        onClick={toggleShowSideBar}
                      />
                    )}
                    {platformName !== 'Gitee' && (
                      <RoundIconButton
                        icon={PinIcon}
                        aria-label={'固定'}
                        iconColor={sidebarToggleMode === 'persistent' ? 'fg.default' : undefined}
                        sx={{
                          transform: 'rotateY(180deg)',
                        }}
                        onClick={() =>
                          configContext.onChange({
                            sidebarToggleMode:
                              sidebarToggleMode === 'persistent' ? 'float' : 'persistent',
                          })
                        }
                      />
                    )}
                  </div>
                  <MetaBar />
                </div>
                <IIFC>
                  {() => {
                    switch (useLoadedContext(SideBarStateContext).value) {
                      case 'getting-access-token':
                        return <LoadingIndicator text={'获取令牌...'} />
                      case 'after-getting-access-token':
                      case 'meta-loading':
                        return <LoadingIndicator text={'获取仓库元数据...'} />
                      case 'error-due-to-auth':
                        return <AccessDeniedDescription />
                      case 'meta-loaded':
                      case 'tree-loading':
                      case 'tree-rendering':
                      case 'tree-rendered':
                        return <FileExplorer />
                    }
                  }}
                </IIFC>
              </div>
              <IIFC>
                {() => {
                  const [showSettings, setShowSettings] = useState(false)
                  const toggleShowSettings = useCallback(() => setShowSettings(show => !show), [])

                  useOnShortcutPressed(
                    focusSearchInputShortcut,
                    useCallback(() => setShowSettings(false), []),
                  )

                  return (
                    <>
                      {showSettings && <SettingsBarContent toggleShow={toggleShowSettings} />}
                      <Footer toggleShowSettings={toggleShowSettings} />
                    </>
                  )
                }}
              </IIFC>
            </div>
            {features.resize && placement === 'left' && (
              <SideBarResizeHandler onResizeStateChange={onResizeStateChange} />
            )}
          </div>
        </div>
      </SidebarContext.Provider>
    </Theme>
  )
}

function ToggleShowButtonWrapper({
  shouldExpand,
  setShouldExpand,
  toggleShowSideBar,
}: {
  shouldExpand: boolean
  setShouldExpand: React.Dispatch<React.SetStateAction<boolean>>
  toggleShowSideBar: () => void
}) {
  const logoContainerElement = useLogoContainerElement()
  const { sidebarToggleMode } = useConfigs().value
  return (
    <Portal into={logoContainerElement}>
      <ToggleShowButton
        className={cx({
          hidden: shouldExpand,
        })}
        onHover={sidebarToggleMode === 'float' ? () => setShouldExpand(true) : undefined}
        onClick={toggleShowSideBar}
      />
    </Portal>
  )
}

function useFocusSidebarOnExpand(shouldExpand: boolean) {
  useEffect(() => {
    // prevent keeping focus within Gitako
    if (!shouldExpand) document.body.focus()
  }, [shouldExpand])
}

function useMarkGitakoGlobalAttributes() {
  useEffect(() => {
    const detach = DOMHelper.attachStickyGitakoPlatform()
    DOMHelper.markGitakoPlatform()
    return () => detach()
  }, [])
  useEffect(() => {
    const detach = DOMHelper.attachStickyGitakoReadyState()
    DOMHelper.markGitakoReadyState(true)
    return () => {
      detach()
      DOMHelper.markGitakoReadyState(false)
    }
  }, [])
}

function useLogoContainerElement() {
  const [logoContainerElement, setLogoContainerElement] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setLogoContainerElement(DOMHelper.insertLogoMountPoint())
  }, [])
  return logoContainerElement
}

function useUpdateBodyIndentOnStateUpdate(shouldExpand: boolean) {
  const { sidebarToggleMode, sidebarPlacement } = useConfigs().value
  useEffect(() => {
    if (!(sidebarToggleMode === 'persistent' && shouldExpand)) return

    const detach = DOMHelper.attachStickyBodyIndent()
    DOMHelper.setBodyIndent(sidebarPlacement)
    return () => {
      detach()
      DOMHelper.setBodyIndent(false)
    }
  }, [sidebarToggleMode, shouldExpand, sidebarPlacement])
}

const getDerivedExpansion = ({
  intelligentToggle,
  sidebarToggleMode,
}: Pick<Config, 'intelligentToggle' | 'sidebarToggleMode'>) =>
  sidebarToggleMode === 'persistent'
    ? intelligentToggle === null // auto-expand checked
      ? platform.shouldExpandSideBar()
      : intelligentToggle // read saved expand state
    : false // do not expand in float mode

function useGetDerivedExpansion() {
  const { intelligentToggle, sidebarToggleMode } = useConfigs().value
  return useCallback(
    () => getDerivedExpansion({ intelligentToggle, sidebarToggleMode }),
    [intelligentToggle, sidebarToggleMode],
  )
}

function useUpdateBodyIndentAfterRedirect(update: (shouldExpand: boolean) => void) {
  const { intelligentToggle, sidebarToggleMode, sidebarPlacement } = useConfigs().value
  useAfterRedirect(
    useCallback(() => {
      // check and update expand state if pinned and auto-expand checked
      if (sidebarToggleMode === 'persistent') {
        const shouldExpand = getDerivedExpansion({ intelligentToggle, sidebarToggleMode })
        update(shouldExpand)
        // Below DOM mutation cannot be omitted, if do, body indent may get lost when shouldExpand is true for both before & after redirecting
        DOMHelper.setBodyIndent(shouldExpand && sidebarPlacement)
      }
    }, [update, sidebarToggleMode, intelligentToggle, sidebarPlacement]),
  )
}

// Save expand state on toggle if auto expand is off
function useSaveExpandStateOnToggle(shouldExpand: boolean) {
  const configContext = useConfigs()
  const { intelligentToggle } = configContext.value
  useEffect(() => {
    if (intelligentToggle !== null) configContext.onChange({ intelligentToggle: shouldExpand })
  }, [shouldExpand, intelligentToggle]) // eslint-disable-line react-hooks/exhaustive-deps
}

function useCollapseOnNoPermissionWhenTokenHasBeenSet(
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const { accessToken, intelligentToggle, sidebarToggleMode } = useConfigs().value
  const state = useLoadedContext(SideBarStateContext).value
  const hideSidebarOnInvalidToken =
    sidebarToggleMode === 'persistent' &&
    intelligentToggle === null &&
    !!accessToken &&
    state === 'error-due-to-auth'
  useEffect(() => {
    if (hideSidebarOnInvalidToken) setShowSideBar(false)
  }, [hideSidebarOnInvalidToken, setShowSideBar])
}

function useShouldExpand() {
  const getDerivedExpansion = useGetDerivedExpansion()
  const error = useLoadedContext(SideBarErrorContext).value
  const [shouldExpand, setShouldExpand] = useState(getDerivedExpansion)
  const toggleShowSideBar = useCallback(() => setShouldExpand(show => !show), [setShouldExpand])

  const $shouldExpand = error ? false : shouldExpand

  useSaveExpandStateOnToggle($shouldExpand)
  useUpdateBodyIndentOnStateUpdate($shouldExpand)
  useUpdateBodyIndentAfterRedirect(setShouldExpand)
  useCollapseOnNoPermissionWhenTokenHasBeenSet(setShouldExpand)

  return [$shouldExpand, setShouldExpand, toggleShowSideBar] as const
}

function useShowSidebarKeyboard(
  shouldExpand: boolean,
  setShouldExpand: React.Dispatch<React.SetStateAction<boolean>>,
  toggleShowSideBar: () => void,
  setFocusTarget: React.Dispatch<React.SetStateAction<FocusTarget>>,
) {
  const config = useConfigs().value

  useOnShortcutPressed(
    config.shortcut,
    useCallback(
      e => {
        DOMHelper.cancelEvent(e)
        toggleShowSideBar()
        if (!shouldExpand) setFocusTarget('files')
      },
      [shouldExpand, toggleShowSideBar, setFocusTarget],
    ),
  )

  useOnShortcutPressed(
    config.focusSearchInputShortcut,
    useCallback(
      e => {
        DOMHelper.cancelEvent(e)
        if (!shouldExpand) setShouldExpand(true)
        setFocusTarget('search')
      },
      [shouldExpand, setShouldExpand, setFocusTarget],
    ),
  )
}
