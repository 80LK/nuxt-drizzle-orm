<script lang="ts" setup>
import ContentEditable from 'vue-contenteditable';
import type NotesDB from '~/server/drizzle/notes';
import type projects from '~/server/drizzle/projects';
import Note from './Note.vue';
import debounce from '~/shared/debounce';

const { project } = defineProps<{ project: typeof projects.$inferSelect }>();
const loading = ref(true);
const notes = ref([] as typeof NotesDB.$inferSelect[])

const update = debounce((name: string) => {
	$fetch(`/api/project/${project.id}`, {
		method: 'PATCH', body: { name }
	})
}, 300);

onMounted(async () => {
	const data = await $fetch(`/api/project/${project.id}/notes`);
	notes.value = data.items;
	loading.value = false;
})

</script>

<template>
	<div :class="$style.card">
		<div :class="$style.title">
			<ContentEditable tag="div" v-model="project.name" @update:model-value="update" />
		</div>


		<div :class="$style.content">
			<div v-if="loading">Loading...</div>

			<div v-else>
				<Note v-for="note of notes" :note="note" :key="note.id" />
			</div>

			<button>Add note</button> &nbsp;
			<button>Remove project</button>
		</div>

	</div>
</template>

<style lang="css" module>
.card {
	border: 1px solid #ccc;
	border-radius: 1em;
}

.title {
	padding: 0.5em;
	border-bottom: 1px solid #ccc;
	font-size: 1.5em;
}

.content {
	padding: .5em;
}
</style>
