// miniprogram/pages/index/index.js
const app = getApp();

Page({
  data: {
    loading: true,
    overview: {
      houses: { total: 0, rented: 0, vacant: 0, occupancyRate: 0 },
      income: { receivable: 0, actual: 0 },
      todos: { expiringContracts: 0, pendingRentals: 0, pendingRepairs: 0, pendingAmount: 0 }
    },
    expiringContracts: []
  },

  onLoad() {
    this.loadOverview();
  },

  onShow() {
    this.loadOverview();
  },

  async loadOverview() {
    this.setData({ loading: true });
    try {
      const res = await app.request({ url: '/stats/overview' });
      this.setData({ overview: res.data });
      
      // 获取即将到期合同
      const contractsRes = await app.request({ url: '/contracts/warning/expiring?days=30' });
      this.setData({ expiringContracts: contractsRes.data.slice(0, 3) });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 导航跳转
  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  // 快捷功能
  goToAddHouse() {
    wx.navigateTo({ url: '/pages/houses/add' });
  },
  
  goToAddContract() {
    wx.navigateTo({ url: '/pages/contracts/add' });
  },
  
  goToAddRental() {
    wx.navigateTo({ url: '/pages/rentals/add' });
  },
  
  goToRepairs() {
    wx.navigateTo({ url: '/pages/repairs/list' });
  },

  goToContracts() {
    wx.navigateTo({ url: '/pages/contracts/list' });
  },

  goToRentals() {
    wx.navigateTo({ url: '/pages/rentals/list' });
  },
  
  goToStats() {
    wx.navigateTo({ url: '/pages/stats/index' });
  }
});
