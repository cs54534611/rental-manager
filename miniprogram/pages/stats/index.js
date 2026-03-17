// miniprogram/pages/stats/index.js
const app = getApp();

Page({
  data: {
    overview: {
      houses: { total: 0, rented: 0, vacant: 0, occupancyRate: 0 },
      income: { receivable: 0, actual: 0 }
    },
    distribution: [],
    repairStats: { total: 0, completed: 0, avgCost: 0 },
    colors: ['#fee2e2', '#d1fae5', '#fef3c7']
  },

  onLoad() {
    this.loadStats();
  },

  async loadStats() {
    try {
      const overviewRes = await app.request({ url: '/stats/overview' });
      this.setData({ overview: overviewRes.data });

      const distRes = await app.request({ url: '/stats/houses/distribution' });
      this.setData({ distribution: distRes.data });

      const repairRes = await app.request({ url: '/stats/repairs/stats' });
      this.setData({ repairStats: repairRes.data });
    } catch (err) {
      console.error(err);
    }
  },

  // 导出数据
  async onExport(e) {
    const type = e.currentTarget.dataset.type;
    const typeNames = { houses: '房源', tenants: '租客', contracts: '合同', rentals: '租金', repairs: '报修' };
    
    wx.showLoading({ title: '导出中...', mask: true });
    
    try {
      const res = await app.request({ 
        url: '/stats/export/' + type,
        responseType: 'text'
      });
      
      if (!res.data) {
        wx.hideLoading();
        wx.showToast({ title: '暂无数据', icon: 'none' });
        return;
      }
      
      const fs = wx.getFileSystemManager();
      const filePath = wx.env.USER_DATA_PATH + '/' + typeNames[type] + '列表.csv';
      
      fs.writeFile({
        filePath: filePath,
        data: res.data,
        encoding: 'utf8',
        success: () => {
          wx.hideLoading();
          wx.showToast({ title: '导出成功' });
          setTimeout(() => {
            wx.openDocument({ filePath: filePath, success: () => {}, fail: () => {} });
          }, 500);
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '保存失败', icon: 'none' });
          console.error(err);
        }
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '导出失败', icon: 'none' });
      console.error(err);
    }
  },

  goToImport() {
    wx.navigateTo({ url: '/pages/stats/import' });
  }
});
