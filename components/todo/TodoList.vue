<template>
<div class="">
  <List :tasks="todoList"></List>
</div>
</template>

<script>
import List from "./List";
export default {
  name: "TodoList",
  components: {
    List
  },
  data() {
    return {
      todoList : [],
    }
  },
  mounted() {
    // Taking Full list from Api
    this.$store.dispatch('todos/getList');
  },
  watch : {
    // Watching to Todolist store
    '$store.state.todos.list' : {
      handler () {
        this.todoList = JSON.parse(JSON.stringify(this.$store.state.todos.list))
      },
      deep : true
    }
  }
}
</script>

