<template>
	<q-layout
		view="hHh lpR fFf"
		:class="{
			'app-workspace': isInternalRoute,
			'app-customer': isCustomerRoute,
			'app-public': !isInternalRoute && !isCustomerRoute,
		}">
		<!-- Shop chrome only on legacy catalogue/customer paths — not on BMS landing or staff panels -->
		<Navbar v-if="showShopChrome" />
		<q-page-container>
			<router-view :class="{ 'body--dark': $q.dark.isActive }" />
		</q-page-container>
		<Footer v-if="showShopChrome" />
	</q-layout>
</template>

<script setup>
	import { computed } from "vue";
	import { useRoute } from "vue-router";
	import { useQuasar } from "quasar";
	import Navbar from "./components/Navbar.vue";
	import Footer from "./components/Footer.vue";

	const $q = useQuasar();
	const route = useRoute();

	// Check if current route is an admin route
	const isAdminRoute = computed(() => {
		return route.path.startsWith("/admin");
	});

	// Check if current route is an auth route (register or login)
	const isAuthRoute = computed(() => {
		return ["/registeruser", "/loginuser", "/login", "/password-recovery", "/admin/login", "/admin/password-recovery"].includes(route.path);
	});

	// Internal workspaces provide their own navigation and must not mount
	// customer-only cart/wishlist UI.
	const isInternalRoute = computed(() =>
		route.path.startsWith("/seller") ||
		route.path.startsWith("/sales") ||
		route.path.startsWith("/admin")
	);

	const isCustomerRoute = computed(() =>
		route.path.startsWith("/customer") || route.path === "/checkout"
	);

	const isBmsLanding = computed(() => route.path === "/");

	const showShopChrome = computed(() =>
		!isInternalRoute.value &&
		!isAuthRoute.value &&
		!isBmsLanding.value &&
		(route.path.startsWith("/catalogue") ||
			route.path.startsWith("/customer") ||
			route.path === "/checkout" ||
			route.path === "/contact" ||
			route.path.startsWith("/shop"))
	);
</script>

<style>
	#app {
		width: 100%;
		min-width: 0;
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.q-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.q-page-container {
		min-width: 0;
		flex: 1;
	}
</style>
