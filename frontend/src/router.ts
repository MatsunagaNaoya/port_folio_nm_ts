import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MainView from './components/MainView.vue';
import BeltList from './components/BeltList.vue';
import CookingView from './components/CookingView.vue';

const routes: RouteRecordRaw[] = [
	{ path: '/main', name: 'Main', component: MainView },
	{ path: '/belt', name: 'Belt', component: BeltList },
	{ path: '/dish', name: 'Dish', component: CookingView },
	{ path: '/:pathMatch(.*)*', redirect: '/main' }, // 未定義パスはメインへ
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
