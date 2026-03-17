// miniprogram/app.js
App({
  globalData: {
    apiBase: 'http://192.168.0.139:3000/api',
    userInfo: null
  },
  
  onLaunch() {
    // 检查登录状态
    this.checkLogin();
  },
  
  checkLogin() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
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
