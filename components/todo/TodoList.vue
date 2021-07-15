<template>
<div class="container">
  <div class="card" >
<!--    header -->
    <div class="card-header d-flex justify-content-between">
      <span>Todo list</span>
<!--      New Task modal button-->
      <b-button v-b-modal.modal-1 >New Task</b-button>
    </div>
<!--    End header-->
<!--    List items-->
    <b-list-group v-if="todoList.length > 0" :class="todoList.length > 12 ? 'list-scroll' : ''">
      <template  v-for="todo in todoList" >
        <b-list-group-item  :key="todo.id">
          <b-form-checkbox v-model="todo.status"
                           unchecked-value="0"
                           v-on:change.native="todoStatusChange(todo)"
          >
                              {{todo.title}}
          </b-form-checkbox>
        </b-list-group-item>
      </template>
    </b-list-group>
<!--    End List items-->
  </div>
<!--  Adding modal -->
  <b-modal id="modal-1" @ok="addTodo()" title="Enter task">
    <input type="text" v-model="tmpTitle" class="form-control" id="title">
  </b-modal>
<!--  End Adding modal-->
</div>
</template>

<script>

export default {
  name: "TodoList",
  data() {
    return {
      todoList : [],
      tmpTitle : '',
    }
  },
  mounted() {
    // Taking Full list from Api
    this.$store.dispatch('todos/getList');
  },
  methods : {
    // Change list Item on server and client sides
    todoStatusChange(item) {
      // Request to server for Changing Status
      this.$store.$axios.get('todos/update',{
        params: {
          id : item.id,
          status :item.status === '0' ? 0 : 1,
          title : item.title
        }
      }).then((data) => {
        // Changing in Store if Everything is OK on server
        if (data.data.status === 1) {
          this.$store.commit('todos/update', {
            item
          })
        }
        // Set Default value for New task title
        this.tmpTitle = '';
      })
    },
    // Adding new task in todolist
    addTodo () {
      this.$store.$axios.get('todos/insert',{
        params: {
          title: this.tmpTitle,
        }
      }).then((data) => {
        // adding on Store if everything is okay
        if (data.data.status === 1) {
          this.$store.commit('todos/add', {
            title: this.tmpTitle,
            status : false,
            id : data.data.id,
          })
        }
        this.tmpTitle = '';
      })
    },
  },
  watch : {
    // Watching toTodo list store object for Rewrite local Todolist
    '$store.state.todos.list' : {
      handler () {
        this.todoList = JSON.parse(JSON.stringify(this.$store.state.todos.list))
      },
      deep : true
    }
  }
}
</script>

<style scoped>
  .list-scroll {
    position:relative;
    overflow-y:auto;
    height:600px;
  }
</style>
