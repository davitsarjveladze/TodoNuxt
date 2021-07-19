export const state = () => ({
  list: []
})

export const actions = {
  // get full list from server
  async getList({commit}) {
    let list = []
    this.$axios.$get('/todos/getall').then((result) => {
      if (result.status === 1) {
        commit('setList',result.data)
      }
    })
  }
}

export const mutations = {
  // adding single Item on end of list
  add(state, item) {
    state.list.push(item)
  },

  // set full list
  setList(state,list) {
    state.list = list
  },

  sliceByIndex(state,index) {
    state.list.splice(index, 1)
  },

  clearCompleted(state) {
    state.list = state.list.filter(x => !x.status)
  },

  clearAll(state) {
    state.list = []
  },

  updateOrder(state,data) {
    state.list[data['index']]['order'] = data['currentOrder']
    state.list.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0))
  },

  // updating current list item by id
  update(state, data) {
    state.list[data['index']] = data['item'];
  },
}
