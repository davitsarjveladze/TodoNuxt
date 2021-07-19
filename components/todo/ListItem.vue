<template >
  <li class="list-group"
      :id="'task' + task.id"
      style="margin-bottom: 4px"
      draggable="true"
      @dragenter="$emit('dragenter')"
      @dragleave="$emit('dragleave')"
      @dragend="$emit('dragend')"
  >
    <span  class="drag-button fas fa-arrows-alt"


    >
<!--      <i class="fas fa-arrows-alt"></i>-->
    </span>
    <div :class="this.task.status ? 'completed' : ''"
         class="list-item"
         @click.self="$emit('complete')"
    > {{ task.title }}
    </div>
    <span class="remove-button" @click="$emit('remove')">
      <i class="fa fa-times"></i>
    </span>
  </li>
</template>

<script>
export default {
  name: "ListItem",
  props: ['task'],
}
</script>

