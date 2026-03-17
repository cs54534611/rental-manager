// miniprogram/pages/houses/detail.js
const app = getApp();

Page({
  data: {
    house: {},
    statusMap: { 0: '空置', 1: '已出租', 2: '待出租' }
  },

  onLoad(options) {
    if (options.id) {
      this.loadHouse(options.id);
    }
  },

  onShow() {
    if (this.data.house.id) {
      this.loadHouse(this.data.house.id);
    }
  },

  async loadHouse(id) {
    try {
      const res = await app.request({ url: '/houses/' + id });
      this.setData({ house: res.data });
    } catch (err) { 
      console.error(err); 
    }
  },

  // 上传照片
  onUploadPhoto() {
    const that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePaths = res.tempFilePaths;
        wx.showLoading({ title: '上传中...' });
        
        try {
          for (const filePath of tempFilePaths) {
            await app.request({
              url: '/houses/upload/' + that.data.house.id + '/photo',
              method: 'POST',
              data: { photo: filePath }
            });
          }
          
          wx.showToast({ title: '上传成功' });
          that.loadHouse(that.data.house.id);
        } catch (err) {
          wx.showToast({ title: '上传失败', icon: 'none' });
        } finally {
          wx.hideLoading();
        }
      }
    });
  },

  onEdit() {
    wx.navigateTo({ url: '/pages/houses/add?id=' + this.data.house.id });
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该房源吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: '/houses/' + this.data.house.id, method: 'DELETE' });
            wx.showToast({ title: '删除成功' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
