<template >
  <li class="list-group" style="margin-bottom: 4px"  >
    <div :class="className"
         class="list-item"
         @click.self="$emit('complete')"
    > {{ task.title }}
    </div>
    <span class="tasks__item__remove button alert pull-right"
                   @click="$emit('remove')"
    >
      <i class="fa fa-times"></i>
    </span>
  </li>
</template>

<script>
export default {
  name: "ListItem",
  props: ['task'],
  computed: {
    className() {
      if (this.task.completed) {
        return 'completed';
      }
      return ' ';
    }
  }
}
</script>

