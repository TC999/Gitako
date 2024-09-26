import { GearIcon, SyncIcon } from '@primer/octicons-react'
import { Link } from '@primer/react'
import { ReloadContext } from 'containers/ReloadContext'
import { VERSION } from 'env'
import React, { useContext } from 'react'
import { RoundIconButton } from './RoundIconButton'
import { wikiLinks } from './settings/SettingsBar'

type Props = {
  toggleShowSettings: () => void
}

export function Footer(props: Props) {
  const { toggleShowSettings } = props
  const reload = useContext(ReloadContext)
  return (
    <div className={'gitako-footer'}>
      <div className="gitako-footer-section">
        <Link
          className={'version'}
          href={wikiLinks.changeLog}
          title={'Gitako 更改日志'}
          target="_blank"
          rel="noopener noreferrer"
        >
          {VERSION}
        </Link>
        <Link
          title="就要说再见了。"
          href={wikiLinks.bye}
          target="_blank"
          rel="noopener noreferrer"
        >
          👋
        </Link>
      </div>
      <div>
        <RoundIconButton
          aria-label={'重载'}
          icon={SyncIcon}
          iconColor="fg.muted"
          onClick={() => reload()}
        />
        <RoundIconButton
          aria-label={'设置'}
          icon={GearIcon}
          iconColor="fg.muted"
          onClick={toggleShowSettings}
        />
      </div>
    </div>
  )
}
