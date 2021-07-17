<template>

  <section class="tasks">
    <div class="list-header" >
      <h1>
        Todo List
        <transition name="fade">
          <small v-if="incomplete">({{ incomplete }})</small>
        </transition>
      </h1>
      <div class="tasks__clear button-group pull-right">
        <button class="button-style clear-completed-color"
                @click="clearCompleted"
        >
          <i class="fa fa-check"></i> Clear Completed
        </button>
        <button class="button-style clear-all-color"
                @click="clearAll"
        >
          <i class="fa fa-trash"></i> Clear All
        </button>
      </div>
    </div>


    <div class="form-group" style="margin-bottom: 30px">
      <input class="form-field" @keyup.enter="addTask" v-model="newTask"  placeholder="Email">
      <span @click="addTask"><i class="fa fa-plus"></i><b>NEW</b></span>
    </div>



    <transition-group name="fade" tag="ul" style="padding: 0">
      <template v-for="(task, index) in tasks">
        <ListItem
          @remove="removeTask(index)"
          @complete="completeTask(task)"
          :task="task"
          :key="'itme' + index"
        ></ListItem>
      </template>

    </transition-group>
  </section>
</template>

<script>
import ListItem from "./ListItem";
export default {
  name: "List",
  components : {
    ListItem
  },
  props: {
    tasks: {default: []}
  },
  data() {
    return {
      todoList : [],
      tmpTitle : '',
      newTask: '',
    }
  },
  computed: {
    incomplete() {
      return this.tasks.filter(this.inProgress).length;
    }
  },
  mounted() {
    // Taking Full list from Api
    this.$store.dispatch('todos/getList');
  },
  methods : {
    addTask() {
      if (this.newTask) {
        this.tasks.push({
          title: this.newTask,
          completed: false
        });
        this.newTask = '';
      }
    },
    completeTask(task) {
      task.completed = ! task.completed;
    },
    removeTask(index) {
      this.tasks.splice(index, 1);
    },
    clearCompleted() {
      this.tasks = this.tasks.filter(this.inProgress);
    },
    clearAll() {
      this.tasks = [];
    },

    inProgress(task) {
      return ! this.isCompleted(task);
    },
    isCompleted(task) {
      return task.completed;
    },
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
}
</script>

