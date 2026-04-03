<script lang="ts" setup>
import type notes from '~/server/drizzle/notes';

const { note } = defineProps<{ note: typeof notes.$inferSelect }>();
</script>

<template>
	<div :class="$style.note">
		<div :class="$style.title">{{ note.title }}</div>
		<div :class="$style.content">{{ note.text }}</div>
	</div>
</template>

<style lang="css" module>
.note:not(:last-child) {
	border-bottom: 1px solid #ccc;
}

.title {
	font-size: 1.3em;
}
</style>
