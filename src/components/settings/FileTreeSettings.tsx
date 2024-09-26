import { wikiLinks } from 'components/settings/SettingsBar'
import { SimpleConfigFieldCheckbox } from 'components/settings/SimpleConfigField/Checkbox'
import React from 'react'
import { Config } from 'utils/config/helper'
import { Option } from '../Inputs/SelectInput'
import { SettingsSection } from './SettingsSection'
import { SimpleConfigFieldSelect } from './SimpleConfigField/SelectInput'

const iconOptions: Option<Config['icons']>[] = [
  {
    key: 'rich',
    value: 'rich',
    label: `VSCode 图标`,
  },
  {
    key: 'dim',
    value: 'dim',
    label: `VSCode 图标 (单色)`,
  },
  {
    key: 'native',
    value: 'native',
    label: `GitHub 图标`,
  },
]

const recursiveToggleFolderOptions: Option<Config['recursiveToggleFolder']>[] = [
  {
    key: 'shift',
    value: 'shift',
    label: `⇧(shift)`,
  },
  {
    key: 'alt',
    value: 'alt',
    label: `⌥(alt)`,
  },
]

export function FileTreeSettings() {
  return (
    <SettingsSection title={'文件树'}>
      <SimpleConfigFieldSelect
        field={{
          key: 'recursiveToggleFolder',
          label: '按住时递归切换文件夹',
        }}
        options={recursiveToggleFolderOptions}
      />
      <SimpleConfigFieldSelect
        field={{
          key: 'icons',
          label: '图标',
        }}
        options={iconOptions}
      />
      <SimpleConfigFieldCheckbox
        field={{
          key: 'compressSingletonFolder',
          label: '压缩单例文件夹',
          wikiLink: wikiLinks.compressSingletonFolder,
          tooltip: '合并文件夹及其唯一子文件夹，使用户界面更紧凑。',
        }}
      />
      <SimpleConfigFieldCheckbox
        field={{
          key: 'restoreExpandedFolders',
          label: '恢复已展开的文件夹',
          tooltip: '清除搜索输入后文件夹将再次展开',
        }}
      />
      <SimpleConfigFieldCheckbox
        field={{
          key: 'commentToggle',
          label: '显示拉取请求文件注释',
          tooltip: '在拉取请求中的文件名旁边显示评论数。',
        }}
      />
      <SimpleConfigFieldCheckbox
        field={{
          key: 'showDiffInText',
          label: '以文本形式显示拉取请求文件差异',
          tooltip: '更精确地查看差异统计数据',
        }}
      />
      <SimpleConfigFieldCheckbox
        field={{
          key: 'compactFileTree',
          label: '紧凑文件树布局',
          tooltip: '更有效地查看文件树结构。',
        }}
      />
    </SettingsSection>
  )
}
