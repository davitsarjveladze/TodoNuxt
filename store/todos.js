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

  // updating current list item by id
  update(state, item) {
    let objIndex = state.list.findIndex((obj => obj.id === item.id));
    state.list[objIndex] = item;
  },
}
