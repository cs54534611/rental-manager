// miniprogram/custom-tab-bar/index.js
const app = getApp();

Component({
  data: {
    selected: 0,
    role: 'admin',
    tabs: []
  },

  attached() {
    this.loadTabBar();
  },

  ready() {
    // 组件准备好后也刷新一次
    this.loadTabBar();
  },

  show() {
    // 页面显示时刷新 tabBar 状态
    this.loadTabBar();
  },

  observers: {
    // 监听页面路径变化
  },

  methods: {
    loadTabBar() {
      const role = app.globalData.role || wx.getStorageSync('role') || 'admin';
      
      // emoji 图标映射
      const iconMap = {
        'home': '🏠', 'house': '🏠', 'contract': '📄', 'money': '💰',
        'rentals': '💵', 'repair': '🔧', 'meter': '📊', 'chart': '📈',
        'user': '👤', 'settings': '⚙️'
      };
      const getIcon = (key) => iconMap[key] || '📌';
      
      if (role === 'tenant') {
        // 租客：房源、合同、租金、报修（无财务）
        this.setData({ tabs: [
          { pagePath: '/pages/houses/list', text: '房源', icon: getIcon('house') },
          { pagePath: '/pages/contracts/list', text: '合同', icon: getIcon('contract') },
          { pagePath: '/pages/rentals/list', text: '租金', icon: getIcon('money') },
          { pagePath: '/pages/repairs/list', text: '报修', icon: getIcon('repair') },
          { pagePath: '/pages/settings/index', text: '我的', icon: getIcon('user') }
        ]});
      } else if (role === 'repair') {
        // 维修人员：报修、抄表、我的
        this.setData({ tabs: [
          { pagePath: '/pages/repairs/list', text: '报修', icon: getIcon('repair') },
          { pagePath: '/pages/meter/list', text: '抄表', icon: getIcon('meter') },
          { pagePath: '/pages/settings/index', text: '我的', icon: getIcon('user') }
        ]});
      } else if (role === 'finance') {
        // 财务：房源、租金、财务、我的
        this.setData({ tabs: [
          { pagePath: '/pages/houses/list', text: '房源', icon: getIcon('house') },
          { pagePath: '/pages/rentals/list', text: '租金', icon: getIcon('money') },
          { pagePath: '/pages/finance/index', text: '财务', icon: getIcon('chart') },
          { pagePath: '/pages/settings/index', text: '我的', icon: getIcon('user') }
        ]});
      } else {
        // 管理员/超级管理员：首页、房源、租金、财务、我的
        this.setData({ tabs: [
          { pagePath: '/pages/index/index', text: '首页', icon: getIcon('home') },
          { pagePath: '/pages/houses/list', text: '房源', icon: getIcon('house') },
          { pagePath: '/pages/rentals/list', text: '租金', icon: getIcon('money') },
          { pagePath: '/pages/finance/index', text: '财务', icon: getIcon('chart') },
          { pagePath: '/pages/settings/index', text: '我的', icon: getIcon('user') }
        ]});
      }

      this.setData({ role });
      
      // 设置当前选中的 tab
      this.updateSelectedTab();
    },

    updateSelectedTab() {
      const currentPages = getCurrentPages();
      if (currentPages.length > 0) {
        const currentPath = '/' + currentPages[currentPages.length - 1].route;
        const tabs = this.data.tabs;
        const index = tabs.findIndex(t => t.pagePath === currentPath);
        if (index >= 0) {
          this.setData({ selected: index });
        } else {
          // 尝试模糊匹配
          const simplePath = currentPath.split('/').pop();
          const idx = tabs.findIndex(t => t.pagePath.includes(simplePath));
          if (idx >= 0) {
            this.setData({ selected: idx });
          }
        }
      }
    },

    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const tab = this.data.tabs[index];
      if (tab) {
        // 官方 tabBar 页面列表（与 app.json 保持一致）
        const officialTabs = [
          '/pages/index/index',
          '/pages/houses/list',
          '/pages/contracts/list',
          '/pages/rentals/list',
          '/pages/repairs/list',
          '/pages/finance/index',
          '/pages/meter/list',
          '/pages/settings/index'
        ];
        
        if (officialTabs.includes(tab.pagePath)) {
          wx.switchTab({ url: tab.pagePath });
        } else {
          // 非官方 tab 页面用 navigateTo
          wx.navigateTo({ url: tab.pagePath });
        }
      }
    }
  }
});

// 全局监听页面切换
const originalSwitchTab = wx.switchTab;
wx.switchTab = function(options) {
  originalSwitchTab(options);
};
