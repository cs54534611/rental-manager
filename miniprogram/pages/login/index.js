// miniprogram/pages/login/index.js
const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    loginType: 'admin',  // admin 或 tenant
    loading: false
  },

  onLoad() {
    // 如果已经登录，直接跳转到首页
    if (app.globalData.token) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onLoginTypeChange(e) {
    this.setData({ loginType: e.detail.value, username: '', password: '' });
  },

  async onLogin() {
    const { username, password, loginType } = this.data;
    
    if (!username) {
      return wx.showToast({ title: loginType === 'tenant' ? '请输入手机号' : '请输入用户名', icon: 'none' });
    }
    if (!password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' });
    }

    this.setData({ loading: true });

    try {
      const res = await app.login(username, password, loginType);
      
      // 根据角色跳转不同页面
      const role = res.data.user.role;
      
      wx.showToast({ title: '登录成功', icon: 'success' });
      
      setTimeout(() => {
        if (role === 'tenant') {
          // 租客跳转到房源列表（reLaunch刷新自定义tabBar）
          wx.reLaunch({ url: '/pages/houses/list' });
        } else if (role === 'repair') {
          // 维修人员跳转到报修列表
          wx.reLaunch({ url: '/pages/repairs/list' });
        } else {
          // 管理员/财务跳转到首页
          wx.reLaunch({ url: '/pages/index/index' });
        }
      }, 1500);
      
    } catch (err) {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
