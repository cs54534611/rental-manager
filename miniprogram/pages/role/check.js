// miniprogram/pages/role/check.js - 角色权限检查页面
const app = getApp();

Page({
  data: {
    role: '',
    roleName: '',
    permissions: {},
    menuItems: [
      { key: 'houses', name: '房源管理', icon: 'house', actions: [] },
      { key: 'tenants', name: '租客管理', icon: 'user', actions: [] },
      { key: 'contracts', name: '合同管理', icon: 'contract', actions: [] },
      { key: 'rentals', name: '租金管理', icon: 'money', actions: [] },
      { key: 'repairs', name: '报修管理', icon: 'repair', actions: [] },
      { key: 'staff', name: '维修人员', icon: 'staff', actions: [] },
      { key: 'stats', name: '数据统计', icon: 'chart', actions: [] },
      { key: 'finance', name: '财务管理', icon: 'finance', actions: [] },
      { key: 'backup', name: '数据备份', icon: 'backup', actions: [] },
      { key: 'settings', name: '系统设置', icon: 'settings', actions: [] },
      { key: 'meter', name: '抄表记录', icon: 'meter', actions: [] },
      { key: 'checkout', name: '退房管理', icon: 'checkout', actions: [] }
    ]
  },

  onLoad() {
    this.loadRoleInfo();
  },

  loadRoleInfo() {
    const role = app.getRole();
    const roleNames = {
      'super': '超级管理员',
      'admin': '管理员',
      'finance': '财务人员',
      'repair': '维修人员',
      'tenant': '租客'
    };
    
    // 角色权限配置
    const rolePerms = {
      'super': ['houses', 'tenants', 'contracts', 'rentals', 'repairs', 'staff', 'stats', 'finance', 'backup', 'settings', 'meter', 'checkout'],
      'admin': ['houses', 'tenants', 'contracts', 'rentals', 'repairs', 'staff', 'stats', 'finance', 'backup', 'settings', 'meter', 'checkout'],
      'finance': ['houses', 'tenants', 'contracts', 'rentals', 'stats', 'finance'],
      'repair': ['repairs', 'meter'],
      'tenant': ['houses', 'contracts', 'rentals', 'repairs']
    };
    
    const allowed = rolePerms[role] || [];
    const menus = this.data.menuItems.filter(m => allowed.includes(m.key));
    
    this.setData({
      role: role,
      roleName: roleNames[role] || '未知',
      menuItems: menus
    });
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
