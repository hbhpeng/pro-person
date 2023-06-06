import {
  BookOutline as BookIcon,
  ConstructOutline,
  DocumentOutline,
  DocumentTextOutline,
  DocumentsOutline,
  ExtensionPuzzleOutline,
  HomeOutline,
  LeafOutline,
  ManOutline,
  MegaphoneOutline,
  NewspaperOutline,
  PersonOutline as PersonIcon,
  SkullOutline,
  TriangleOutline,
  WineOutline as WineIcon,
} from '@vicons/ionicons5'

import type { MenuOption } from 'naive-ui'

import type { Component } from 'vue'
import { h } from 'vue'
import { NIcon } from 'naive-ui'

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: '职业',
    key: 'job',
    icon: renderIcon(ConstructOutline),
    children: [
      {
        label: '设计创意师',
        key: 'job-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '演讲家',
        key: 'job-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '美食家',
        key: 'job-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '广告商',
        key: 'job-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '保险销售',
        key: 'job-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '家庭教师',
        key: 'job-6',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '脱口秀',
        key: 'job-7',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '辩论家',
        key: 'job-8',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '装修设计师',
        key: 'job-9',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '法律顾问',
        key: 'job-10',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '论文',
    key: 'artical',
    icon: renderIcon(DocumentTextOutline),
    disabled: false,
    children: [
      {
        label: '写简易论文',
        key: 'artical-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '论文降重',
        key: 'artical-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '叙事者',
        key: 'artical-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '叙事者',
        key: 'artical-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '文字扩写',
        key: 'artical-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '论文大纲',
        key: 'artical-6',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '编程',
    key: 'program',
    disabled: false,
    icon: renderIcon(ExtensionPuzzleOutline),
    children: [
      {
        label: '写代码',
        key: 'program-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '解释代码',
        key: 'program-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '正则表达式',
        key: 'program-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: 'SQL优化',
        key: 'program-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '优化重构代码',
        key: 'program-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '前端助手',
        key: 'program-6',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '文案',
    key: 'copywriting',
    icon: renderIcon(NewspaperOutline),
    children: [
      {
        label: '小红书文案',
        key: 'copywriting-1',
        icon: renderIcon(DocumentsOutline),
      },
      {
        label: '视频脚本',
        key: 'copywriting-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '写广告文案',
        key: 'copywriting-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '短视频口播文案',
        key: 'copywriting-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '抖音探店文案',
        key: 'copywriting-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '文章排版',
        key: 'copywriting-6',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '写作',
    key: 'writing',
    icon: renderIcon(WineIcon),
    children: [
      {
        label: '小红书文案',
        key: 'writing-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '视频脚本',
        key: 'writing-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '写广告文案',
        key: 'writing-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '短视频口播文案',
        key: 'writing-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '抖音探店文案',
        key: 'writing-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '文章排版',
        key: 'writing-6',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '企业',
    key: 'company',
    icon: renderIcon(HomeOutline),
    children: [
      {
        label: 'PPT大纲',
        key: 'company-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '面试模拟',
        key: 'company-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '职业顾问',
        key: 'company-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '企划师',
        key: 'company-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '年终总结',
        key: 'company-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '周报',
        key: 'company-6',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '简历编辑',
        key: 'company-7',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '调查问卷',
        key: 'company-8',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '产品经理',
        key: 'company-9',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '情感',
    icon: renderIcon(ManOutline),
    key: 'love',
    children: [
      {
        label: '虚拟女友',
        key: 'love-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '情感表白',
        key: 'love-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '礼物挑选师',
        key: 'love-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '虚拟男友',
        key: 'love-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '心理健康顾问',
        key: 'love-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '佛祖答疑',
        key: 'love-6',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '故事',
    icon: renderIcon(DocumentOutline),
    key: 'story',
    children: [
      {
        label: '知乎回答',
        key: 'story-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '小说家',
        key: 'story-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '脱口秀',
        key: 'story-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '说书人',
        key: 'story-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '儿童故事',
        key: 'story-5',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '翻译',
    icon: renderIcon(MegaphoneOutline),
    key: 'interupt',
    children: [
      {
        label: '中翻译外',
        key: 'interupt-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '外翻译中',
        key: 'interupt-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '中文转emoji',
        key: 'interupt-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: 'emoji转中文',
        key: 'interupt-4',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '教育',
    icon: renderIcon(BookIcon),
    key: 'teacher',
    children: [
      {
        label: '找论文',
        key: 'teacher-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '读后感',
        key: 'teacher-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '英语口语老师',
        key: 'teacher-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '家庭教师',
        key: 'teacher-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '儿童故事',
        key: 'teacher-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '单词填空',
        key: 'teacher-6',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '健康',
    icon: renderIcon(LeafOutline),
    key: 'health',
    children: [
      {
        label: '减肥计划',
        key: 'health-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '母婴专家',
        key: 'health-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '心里健康顾问',
        key: 'health-3',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '游戏',
    icon: renderIcon(SkullOutline),
    key: 'game',
    children: [
      {
        label: '剧本杀',
        key: 'game-1',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '互动小说',
        key: 'game-2',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '龙与地下城',
        key: 'game-3',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '脑筋急转弯',
        key: 'game-4',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '狐娘萌萌',
        key: 'game-5',
        icon: renderIcon(PersonIcon),
      },
      {
        label: '文字冒险',
        key: 'game-6',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
  {
    label: '画图',
    icon: renderIcon(TriangleOutline),
    key: 'draw',
    children: [
      {
        label: '画图提示词',
        key: 'draw-1',
        icon: renderIcon(PersonIcon),
      },
    ],
  },
]

export default menuOptions
