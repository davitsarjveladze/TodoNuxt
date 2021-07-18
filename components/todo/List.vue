<template>
    <section class="tasks">
      <div class="list-header" >
        <h1>
          Todo List
          <transition name="fade">
            <small v-if="incomplete">({{ incomplete }})</small>
          </transition>
        </h1>
        <div class=" ">
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
        <input class="form-field" @keyup.enter="addTask" v-model="newTask"  placeholder="New item">
        <span @click="addTask"><i class="fa fa-plus"></i><b>NEW</b></span>
      </div>



      <transition-group name="fade" tag="ul" style="padding: 0">
        <template v-for="(task, index) in tasks">
          <ListItem
            @dragenter="dragEnter(index,task.id)"
            @dragstart="dragStart(index)"
            @dragover="dragOver($event)"
            @dragend="dragEnd(index)"
            @remove="removeTask(index)"
            @complete="completeTask(task)"
            :task="task"
            :key="'item' + index"
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
      newTask: '',
      draggableList : '',
      check : '',
      dragStartIndex : 0,
      lastDragEnterIndex : 0,
      lastDragEnterId : 0,
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
    // add new task to list
    addTask() {
      // check if have item
      if (this.newTask) {
        // define order number to new item
        let order = this.tasks.length ? this.tasks[this.tasks.length - 1]['order'] + 1 : 1
        // send request to insert
        this.$store.$axios.get('todos/insert',{
          params: {
            title: this.newTask,
            order: order
          }
        }).then((data) => {
          // adding in Store if everything is okay
          if (data.data.status === 1) {
            this.$store.commit('todos/add', {
              title: this.newTask,
              status : false,
              order : order,
              id : data.data.id,
            })
            // add in current local array
            this.tasks.push({
              id : data.data.id,
              title  : this.newTask,
              order : order,
              status : false
            });
            this.newTask = '';
          }
        })

      }
    },
    // changing task status
    completeTask(task) {
      // send request to update status
      this.$store.$axios.get('todos/update',{
        params: {
          id : task.id,
          status : !task.status,
          title : task.title,
          order : task.order,
        }
      }).then((data) => {
        // checking status
        if (data.data.status === 1) {
          task.status = ! task.status;
          //updating store
          this.$store.commit('todos/update', {
            task
          })
        }
      })
    },
    // remove current task by index
    removeTask(index) {
      this.$store.$axios.get('todos/delete', {
        params: {
          // define id for this item with this index
          ides: JSON.stringify([this.tasks[index].id])
        }
      }).then((data) => {
        if (data.data.status) {
          // remove item for local tasks
          this.tasks.splice(index, 1);
          // set in store new list
          this.$store.commit('todos/setList', this.tasks)
        }
      })
    },
    // remove all completed task
    clearCompleted() {
      let ides = [];
      // find completed tasks ides
      this.tasks.filter(x => {
        if (x.status)
          ides.push(x.id)
      })
      // removing if we have completed tasks
      if (ides.length > 0) {
        this.$store.$axios.get('todos/delete', {
          params: {
            ides: JSON.stringify(ides)
          }
        }).then((data) => {
          if (data.data.status) {
            // clearing tasks from local tasks
            this.tasks = this.tasks.filter(this.inProgress);
            // set list in store
            this.$store.commit('todos/setList', this.tasks)
          }
        })
      }
    },
    // clear all tasks
    clearAll() {
      let ides = [];
      // find all ides
      this.tasks.filter(x => {
          ides.push(x.id)
      })
      if (ides.length > 0) {
        this.$store.$axios.get('todos/delete', {
          params: {
            ides: JSON.stringify(ides)
          }
        }).then((data) => {
          if (data.data.status) {
            this.tasks = [];
            this.$store.commit('todos/setList', this.tasks)
          }
        })
      }
    },
    // check if task in progress {'status' : false}
    inProgress(task) {
      return !this.isCompleted(task);
    },
    // check if task in completed {'status' : true}
    isCompleted(task) {
      return task.status;
    },
    // define drag index
    dragStart(index) {
      this.dragStartIndex =  index
    },
    // define index of last contacted item when dragging
    dragEnter(index) {
      this.lastDragEnterIndex = index
    },
    dragOver(e) {
      e.preventDefault(); // dragDrop is not executed otherwise
    },

    dragEnd(item) {
      if(typeof this.lastDragEnterIndex === 'number') {
        // define default order
        let currentOrder = this.tasks[this.lastDragEnterIndex]['order'] + 1
        // define last contacted item oder
        let prevItemOrder = this.tasks[this.lastDragEnterIndex]['order']
        // check if our item was upper of last contacted item
        if (this.lastDragEnterIndex > item) {
          // check if we have item after them
          if (this.tasks[this.lastDragEnterIndex + 1]) {
            // define average order number
            currentOrder = (prevItemOrder + this.tasks[this.lastDragEnterIndex + 1]['order']) / 2
          }
        }
        // check if our item was under of last contacted item
        if (this.lastDragEnterIndex < item){
          // check if last contacted item is not firs item
          if (this.lastDragEnterIndex !== 0) {
            // define average order number
            currentOrder = (prevItemOrder + this.tasks[this.lastDragEnterIndex - 1]['order']) / 2
          }
        }
        // check if last contacted item was first item
        if (this.lastDragEnterIndex === 0) {
          currentOrder =  this.tasks[this.lastDragEnterIndex]['order'] -1
        }
        // send request to update
        this.$store.$axios.get('todos/update',{
          params: {
            id: this.tasks[item]['id'],
            title: this.tasks[item]['title'],
            status: this.tasks[item]['status'],
            order: currentOrder
          }
        }).then((data) => {
          // adding on Store if everything is okay
          if (data.data.status) {
            // updating local data
            this.tasks[item]['order'] = currentOrder
            this.tasks.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0))
            this.$store.commit('todos/setList', this.tasks)
            this.lastDragEnterIndex = null
          }
        })
      }
    },
  },
}
</script>
