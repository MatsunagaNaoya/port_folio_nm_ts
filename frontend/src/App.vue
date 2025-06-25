<script setup lang="ts">
// ルーター利用のため特にimport不要
</script>

<template>
	<nav style="margin-bottom: 2em">
		<router-link to="/main" style="margin-right: 1em">メイン</router-link>
		<router-link to="/belt" style="margin-right: 1em">ベルト</router-link>
		<router-link to="/dish">調理</router-link>
	</nav>
	<router-view />
</template>

<style scoped>
nav {
	background: #f5f5f5;
	padding: 1em;
	border-radius: 8px;
}
router-link {
	text-decoration: none;
	color: #333;
	font-weight: bold;
}
router-link.router-link-exact-active {
	color: #42b983;
}
</style>
