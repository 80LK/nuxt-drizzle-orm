<template>
  <div>
    <h1>Projects</h1>

    <div v-if="loading">Loading...</div>

    <div v-else>
      <div :class="$style.container">
        <Project v-for="project of projects" :project="project" :key="project.id" />
      </div>

      <div :class="$style.footer">
        <button>Add project</button>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import type { default as ProjectDB } from './server/drizzle/projects';

const loading = ref(true);
const projects = ref([] as (typeof ProjectDB.$inferSelect)[]);

onMounted(async () => {
  const data = await $fetch('/api/project');
  projects.value = data.items;
  loading.value = false;
})
</script>

<style>
html {
  background-color: #111;
  color: #ccc;
}

body {
  margin: 1em;
}
</style>


<style lang="css" module>
.container {
  display: flex;
  gap: 1em;
}

.footer {
  margin-top: 0.5em;
}
</style>
