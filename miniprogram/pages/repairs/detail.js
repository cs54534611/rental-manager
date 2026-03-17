// miniprogram/pages/repairs/detail.js
const app = getApp();

Page({
  data: {
    repair: {},
    staffList: [],
    typeMap: { 1: '水电', 2: '门窗', 3: '家电', 4: '家具', 5: '其他' },
    urgencyMap: { 1: '普通', 2: '紧急', 3: '非常紧急' },
    statusMap: { 0: '待受理', 1: '已受理', 2: '已派单', 3: '处理中', 4: '待确认', 5: '已完成', 6: '已评价' },
    actionMap: { 0: '受理', 1: '派单', 2: '开始处理', 3: '完成维修', 4: '确认完成' }
  },

  onLoad(options) {
    if (options.id) {
      this.loadRepair(options.id);
      this.loadStaff();
    }
  },

  async loadRepair(id) {
    try {
      const res = await app.request({ url: '/repairs/' + id });
      this.setData({ repair: res.data });
    } catch (err) { console.error(err); }
  },

  async loadStaff() {
    try {
      const res = await app.request({ url: '/staff', data: { status: 1 } });
      this.setData({ staffList: res.data || [] });
    } catch (err) { console.error(err); }
  },

  async onAssignStaff(e) {
    const index = e.detail.value;
    const staff = this.data.staffList[index];
    if (!staff) return;
    
    try {
      await app.request({ 
        url: '/repairs/' + this.data.repair.id + '/status', 
        method: 'PATCH',
        data: { handler: staff.name, status: 2 }
      });
      wx.showToast({ title: '分配成功' });
      this.loadRepair(this.data.repair.id);
    } catch (err) {
      wx.showToast({ title: '分配失败', icon: 'none' });
    }
  },

  onUpdateStatus(e) {
    const nextStatus = e.currentTarget.dataset.status;
    wx.showModal({
      title: '确认操作',
      content: '确定要执行此操作吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ 
              url: '/repairs/' + this.data.repair.id + '/status', 
              method: 'PATCH',
              data: { status: nextStatus }
            });
            wx.showToast({ title: '操作成功' });
            this.loadRepair(this.data.repair.id);
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 预览照片
  previewPhoto(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({ urls: this.data.repair.photos, current: url });
  }
});
