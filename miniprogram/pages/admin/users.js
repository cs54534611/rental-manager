// miniprogram/pages/admin/users.js - 管理员用户管理
const app = getApp();

Page({
  data: {
    users: [],
    roleMap: {
      'super': '超级管理员',
      'admin': '管理员',
      'finance': '财务',
      'repair': '维修人员',
      'tenant': '租客'
    },
    roles: [
      { id: 'admin', name: '管理员' },
      { id: 'finance', name: '财务' },
      { id: 'repair', name: '维修人员' },
      { id: 'tenant', name: '租客' }
    ]
  },

  onLoad() {
    this.loadUsers();
  },

  async loadUsers() {
    try {
      const res = await app.request({ url: '/auth/users' });
      // API返回格式: { code: 0, data: [...] }
      const userList = res.data.data || res.data || [];
      this.setData({ users: userList });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false, editUser: null });
  },

  // 角色选择器变化
  onRoleChange(e) {
    const roleOptions = this.data.roles.map(r => r.name);
    this.setData({ 
      roleIndex: e.detail.value,
      selectedRole: this.data.roles[e.detail.value].id
    });
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({ showModal: true, editUser: null });
  },

  // 编辑用户
  onEdit(e) {
    const user = e.currentTarget.dataset.user;
    this.setData({ showModal: true, editUser: user });
  },

  // 删除用户
  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该管理员吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: `/auth/users/${id}`, method: 'DELETE' });
            wx.showToast({ title: '删除成功' });
            this.loadUsers();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 提交表单
  async onSubmit(e) {
    const { username, password, role, name, phone } = e.detail.value;
    
    if (!username || !password) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' });
    }

    try {
      if (this.data.editUser) {
        // 更新
        await app.request({ 
          url: `/auth/users/${this.data.editUser.id}`, 
          method: 'PUT',
          data: { role, name, phone }
        });
        wx.showToast({ title: '更新成功' });
      } else {
        // 添加
        await app.request({ 
          url: '/auth/users', 
          method: 'POST', 
          data: { username, password, role, name, phone }
        });
        wx.showToast({ title: '添加成功' });
      }
      
      this.setData({ showModal: false });
      this.loadUsers();
    } catch (err) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    }
  }
});
