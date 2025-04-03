import { listAllNotice } from '@/api/system/notice'; // 导入获取通知的 API

const state = {
  notices: JSON.parse(localStorage.getItem('notices')) || [] // 从 localStorage 获取 notices
};

const mutations = {
  SET_NOTICES(state, notices) {
    state.notices = notices; // 更新通知列表
    localStorage.setItem('notices', JSON.stringify(notices)); // 保存到 localStorage
  },
  ADD_NOTICE(state, notice) {
    state.notices.push(notice); // 添加单个通知
    localStorage.setItem('notices', JSON.stringify(state.notices)); // 更新 localStorage
  },
  REMOVE_NOTICE(state, noticeId) {
    state.notices = state.notices.filter(notice => notice.id !== noticeId); // 根据 ID 删除通知
    localStorage.setItem('notices', JSON.stringify(state.notices)); // 更新 localStorage
  },
  CLEAN_NOTICES(state) {
    state.notices = []; // 清空通知列表
    localStorage.removeItem('notices'); // 清除 localStorage
  },
  CHECK_NOTICE(state, noticeId) {
    console.log(noticeId)
    const notice = state.notices.find(notice => notice.noticeId === noticeId);
    if (notice) {
      console.log(notice)
      notice.checked = true; // 将 checked 设置为 true
      localStorage.setItem('notices', JSON.stringify(state.notices)); // 更新 localStorage
    }
  }
};

const actions = {
  async fetchNotices({ commit }) {
    try {
      const response = await listAllNotice();
      const notices = response.data.filter(notice => notice.noticeType === "1").map(notice => {
        return {
          ...notice,
          checked: false
        };
      });
      commit('SET_NOTICES', notices); // 提交 mutation 更新 state
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    }
  },
  addNotice({ commit }, notice) {
    commit('ADD_NOTICE', notice); // 添加通知
  },
  removeNotice({ commit }, noticeId) {
    commit('REMOVE_NOTICE', noticeId); // 删除通知
  },
  cleanNotices({ commit }) {
    commit('CLEAN_NOTICES'); // 清空通知
  },
  checkNotice({ commit }, noticeId) {
    commit('CHECK_NOTICE', noticeId); // 将指定通知的 checked 状态设置为 true
  }

};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
