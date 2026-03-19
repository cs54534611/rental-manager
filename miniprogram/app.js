// miniprogram/app.js - 根据角色显示不同TabBar
App({
  globalData: {
    apiBase: 'http://192.168.0.139:3000/api',
    userInfo: null,
    token: null,
    role: null
  },
  
  onLaunch() {
    this.checkLogin();
    
    if (!this.globalData.token) {
      wx.reLaunch({ url: '/pages/login/index' });
    }
  },
  
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const role = wx.getStorageSync('role');
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.role = role;
    }
  },
  
  // 登录
  login(username, password, loginType = 'admin') {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBase + '/auth/login',
        method: 'POST',
        data: { username, password, loginType },
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          if (res.data.code === 0) {
            const { token, user } = res.data.data;
            this.globalData.token = token;
            this.globalData.userInfo = user;
            this.globalData.role = user.role;
            wx.setStorageSync('token', token);
            wx.setStorageSync('userInfo', user);
            wx.setStorageSync('role', user.role);
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  
  // 登出
  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.role = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('role');
    wx.reLaunch({ url: '/pages/login/index' });
  },
  
  // 获取当前用户角色
  getRole() {
    return this.globalData.role || wx.getStorageSync('role') || 'admin';
  },
  
  // 检查是否是管理员
  isAdmin() {
    const role = this.getRole();
    return role === 'super' || role === 'admin';
  },
  
  // 根据角色获取TabBar配置
  getTabBarConfig(role) {
    const configs = {
      // 管理员/财务 - 完整功能
      'super': [
        { pagePath: '/pages/index/index', text: '首页', icon: 'home', activeIcon: 'home-active' },
        { pagePath: '/pages/houses/list', text: '房源', icon: 'house', activeIcon: 'house-active' },
        { pagePath: '/pages/rentals/list', text: '租金', icon: 'money', activeIcon: 'money-active' },
        { pagePath: '/pages/finance/index', text: '财务', icon: 'chart', activeIcon: 'chart-active' },
        { pagePath: '/pages/settings/index', text: '我的', icon: 'user', activeIcon: 'user-active' }
      ],
      'admin': [
        { pagePath: '/pages/index/index', text: '首页', icon: 'home', activeIcon: 'home-active' },
        { pagePath: '/pages/houses/list', text: '房源', icon: 'house', activeIcon: 'house-active' },
        { pagePath: '/pages/rentals/list', text: '租金', icon: 'money', activeIcon: 'money-active' },
        { pagePath: '/pages/finance/index', text: '财务', icon: 'chart', activeIcon: 'chart-active' },
        { pagePath: '/pages/settings/index', text: '我的', icon: 'user', activeIcon: 'user-active' }
      ],
      // 财务 - 只看房源、租金、财务
      'finance': [
        { pagePath: '/pages/houses/list', text: '房源', icon: 'house', activeIcon: 'house-active' },
        { pagePath: '/pages/rentals/list', text: '租金', icon: 'money', activeIcon: 'money-active' },
        { pagePath: '/pages/finance/index', text: '财务', icon: 'chart', activeIcon: 'chart-active' },
        { pagePath: '/pages/settings/index', text: '我的', icon: 'user', activeIcon: 'user-active' }
      ],
      // 维修人员 - 只看报修和抄表
      'repair': [
        { pagePath: '/pages/repairs/list', text: '报修', icon: 'repair', activeIcon: 'repair-active' },
        { pagePath: '/pages/meter/list', text: '抄表', icon: 'meter', activeIcon: 'meter-active' },
        { pagePath: '/pages/settings/index', text: '我的', icon: 'user', activeIcon: 'user-active' }
      ],
      // 租客 - 看自己的房源和报修
      'tenant': [
        { pagePath: '/pages/houses/list', text: '房源', icon: 'house', activeIcon: 'house-active' },
        { pagePath: '/pages/contracts/list', text: '合同', icon: 'contract', activeIcon: 'contract-active' },
        { pagePath: '/pages/rentals/list', text: '租金', icon: 'money', activeIcon: 'money-active' },
        { pagePath: '/pages/repairs/list', text: '报修', icon: 'repair', activeIcon: 'repair-active' }
      ]
    };
    
    return configs[role] || configs['admin'];
  },
  
  // 封装请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBase + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : ''
        },
        success: (res) => {
          if (res.data.code === 0) {
            resolve(res.data);
          } else if (res.data.code === 403) {
            // 无权限
            wx.showToast({ title: res.data.message || '无权限', icon: 'none' });
            reject(res.data);
          } else if (res.statusCode === 401) {
            // token过期或无效，跳转登录
            this.logout();
            wx.showToast({ title: '请重新登录', icon: 'none' });
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/login/index' });
            }, 1500);
            reject(res.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  },
  
  // 工具方法
  formatDate(date, separator = '-') {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}`;
  },
  
  formatMoney(amount) {
    return '¥' + (amount || 0).toLocaleString();
  },
  
  // 状态映射
  getHouseStatus(status) {
    const map = { 0: '空置', 1: '已出租', 2: '待出租' };
    return map[status] || '未知';
  },
  
  getRentStatus(status) {
    const map = { 0: '未付', 1: '已付', 2: '逾期', 3: '减免' };
    return map[status] || '未知';
  },
  
  getRepairStatus(status) {
    const map = { 
      0: '待受理', 1: '已受理', 2: '已派单', 3: '处理中', 
      4: '待确认', 5: '已完成', 6: '已评价' 
    };
    return map[status] || '未知';
  }
});