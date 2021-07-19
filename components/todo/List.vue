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
            @dragenter="dragEnter(index)"
            @dragend="dragEnd(index)"
            @remove="removeTask(index)"
            @complete="completeTask(task,index)"
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
      lastDragEnterIndex : 0,
    }
  },
  computed: {
    incomplete() {
      return this.tasks.filter(x => !x.status).length;
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
        let order = this.tasks.length ? Math.ceil(this.tasks[this.tasks.length - 1]['order']) + 1 : 1
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
            this.newTask = '';
          }
        })

      }
    },
    // changing task status
    completeTask(task,index) {
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
          this.$store.commit('todos/update', {item : task, index : index})
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
          // set in store new list
          this.$store.commit('todos/sliceByIndex', index)
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
            // set list in store
            this.$store.commit('todos/clearCompleted')
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
            this.$store.commit('todos/clearAll')
          }
        })
      }
    },
    // define index of last contacted item when dragging
    dragEnter(index) {
      this.lastDragEnterIndex = index
    },

    dragEnd(index) {
      if(typeof this.lastDragEnterIndex === 'number') {
        // define default order
        let currentOrder = this.tasks[this.lastDragEnterIndex]['order'] + 1
        // define last contacted item oder
        let prevItemOrder = this.tasks[this.lastDragEnterIndex]['order']
        // check if our item was upper of last contacted item
        if (this.lastDragEnterIndex > index) {
          // check if we have item after them
          if (this.tasks[this.lastDragEnterIndex + 1]) {
            // define average order number
            currentOrder = (prevItemOrder + this.tasks[this.lastDragEnterIndex + 1]['order']) / 2
          }
        }
        // check if our item was under of last contacted item
        if (this.lastDragEnterIndex < index){
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
            id: this.tasks[index]['id'],
            title: this.tasks[index]['title'],
            status: this.tasks[index]['status'],
            order: currentOrder
          }
        }).then((data) => {
          // adding on Store if everything is okay
          if (data.data.status) {
            // updating local data
            this.$store.commit('todos/updateOrder', {index : index ,currentOrder : currentOrder})
            this.lastDragEnterIndex = null
          }
        })
      }
    },

  },
}
</script>
