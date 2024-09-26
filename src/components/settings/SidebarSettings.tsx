import { SimpleConfigFieldCheckbox } from 'components/settings/SimpleConfigField/Checkbox'
import { useConfigs } from 'containers/ConfigsContext'
import React from 'react'
import { subIO } from 'utils/general'
import { KeyboardShortcutSetting } from './KeyboardShortcutSetting'
import { SettingsSection } from './SettingsSection'
import { SimpleConfigFieldSelect } from './SimpleConfigField/SelectInput'

export function SidebarSettings() {
  const { sidebarToggleMode } = useConfigs().value

  return (
    <SettingsSection title={'侧边栏'}>
      <KeyboardShortcutSetting
        label={'切换侧边栏的键盘快捷键'}
        {...subIO(useConfigs(), 'shortcut')}
      />
      <KeyboardShortcutSetting
        label={'聚焦搜索输入的键盘快捷键'}
        {...subIO(useConfigs(), 'focusSearchInputShortcut')}
      />
      <SimpleConfigFieldSelect
        field={{
          key: 'sidebarPlacement',
          label: '侧边栏位置',
          tooltip: '更改侧边栏位置',
        }}
        options={[
          {
            key: 'left',
            value: 'left',
            label: '左',
          },
          {
            key: 'right',
            value: 'right',
            label: '右 (*实验性)',
          },
        ]}
      />
      <SimpleConfigFieldCheckbox
        field={{
          key: 'intelligentToggle',
          label: '自动展开',
          disabled: sidebarToggleMode === 'float',
          tooltip: `Gitako 会在浏览源文件、拉取请求等时展开。否则会折叠。${
            sidebarToggleMode === 'float' ? '\n现在禁用，因为侧边栏处于浮动模式。' : ''
          }`,
          overwrite: {
            value: enabled => (sidebarToggleMode === 'float' ? false : enabled === null),
            onChange: checked => (checked ? null : true),
          },
        }}
      />
    </SettingsSection>
  )
}
