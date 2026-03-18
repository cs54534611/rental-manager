// miniprogram/pages/tenants/list.js
const app = getApp();

Page({
  data: {
    tenants: [],
    keyword: ''
  },

  onLoad() {
    this.loadTenants();
  },

  onShow() {
    this.loadTenants();
  },

  async loadTenants() {
    try {
      const res = await app.request({ url: '/tenants', data: { keyword: this.data.keyword } });
      this.setData({ tenants: res.data.list });
    } catch (err) { console.error(err); }
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.loadTenants();
  },

  goToDetail(e) {
    wx.navigateTo({ url: '/pages/tenants/detail?id=' + e.currentTarget.dataset.id });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/tenants/add' });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该租客吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: '/tenants/' + id, method: 'DELETE' });
            wx.showToast({ title: '删除成功' });
            this.loadTenants();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
