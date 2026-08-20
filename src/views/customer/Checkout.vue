<template>
	<q-page class="max-w-3xl mx-auto p-6">
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-2xl font-bold mb-4">Checkout</h2>

			<q-form @submit.prevent="submit">
				<q-input
					v-model="form.shipping_address"
					label="Shipping Address"
					filled
					lazy-rules
					:rules="[(v) => !!v || 'Shipping address is required']"
					class="mb-4" />

				<q-option-group
					v-model="form.payment_method"
					inline
					type="radio"
					:options="[
						{ label: 'Cash on Delivery', value: 'cod' },
						{ label: 'Card', value: 'card' },
					]"
					class="mb-4" />

				<div class="flex items-center gap-3">
					<q-btn
						label="Place Order"
						type="submit"
						color="primary"
						:loading="loading" />
					<q-btn flat label="Clear" color="secondary" @click.prevent="reset" />
				</div>
			</q-form>

			<div v-if="result" class="mt-6 p-4 border rounded bg-gray-50">
				<div class="font-semibold">API Response</div>
				<div class="mt-2">
					<pre class="text-sm">{{ result }}</pre>
				</div>
			</div>

			<div v-if="error" class="mt-4 text-negative">
				{{ error }}
			</div>
		</div>
	</q-page>
</template>

<script setup>
	import { ref, onMounted } from "vue";
	import { useQuasar } from "quasar";
	import checkoutService from "@/services/checkout";
	import { useCartStore } from "@/stores/cart";
	import { useAuthStore } from '@/stores/auth'

	const $q = useQuasar();
	const cartStore = useCartStore();

	const loading = ref(false);
	const result = ref(null);
	const error = ref("");

	const form = ref({
		name: "",
		phone: "",
		address: "",
		city: "",
		postal_code: "",
		country: "",
		shipping_address: "",
		payment_method: "cod",
	});

	// Try to prefill shipping address from stored user profile
	onMounted(() => {
			try {
				const authStore = useAuthStore()
				const stored = authStore.currentUser || authStore.user || null
				if (stored) {
					form.value.name = stored.name || stored.full_name || "";
					form.value.phone = stored.phone || "";
					form.value.address =
						stored.address || stored.address_line || stored.street || "";
					form.value.city = stored.city || "";
					form.value.postal_code = stored.postal_code || stored.zip || "";
					form.value.country = stored.country || stored.country_name || "";
					form.value.shipping_address = form.value.address || "";
				}
			} catch (e) {
				// ignore
			}

		// If logged in, try to fetch latest profile
		try {
			try {
				const authStore = useAuthStore()
				const token = authStore.token || null
				if (token) {
					import("@/api/axios").then(async (m) => {
						try {
							const res = await m.default.get("/customer/profile");
							const data = res?.data?.data ?? res?.data ?? null;
							if (data) {
								form.value.name = data.name ?? data.full_name ?? form.value.name;
								form.value.phone = data.phone ?? form.value.phone;
								form.value.address = data.address ?? form.value.address;
								form.value.city = data.city ?? form.value.city;
								form.value.postal_code =
									data.postal_code ?? data.zip ?? form.value.postal_code;
								form.value.country =
									data.country ?? data.country_name ?? form.value.country;
								form.value.shipping_address =
									form.value.address || form.value.shipping_address;
							}
						} catch (err) {
							// ignore fetch errors
						}
					});
				}
			} catch (e) {}
		} catch (e) {}
	});

	const reset = () => {
		form.value = { shipping_address: "", payment_method: "cod" };
		result.value = null;
		error.value = "";
	};

	const submit = async () => {
		error.value = "";
		result.value = null;
		// Better UX: require an address line
		if (!form.value.address) {
			error.value = "Shipping address is required.";
			$q.notify({
				type: "negative",
				message: "Please enter a shipping address before placing the order.",
			});
			return;
		}

		// build shipping_address array from editable profile fields
		const addrParts = [];
		if (form.value.address) addrParts.push(form.value.address);
		if (form.value.city) addrParts.push(form.value.city);
		if (form.value.postal_code) addrParts.push(form.value.postal_code);
		if (form.value.country) addrParts.push(form.value.country);
		if (form.value.phone) addrParts.push(`Phone: ${form.value.phone}`);

		form.value.shipping_address = addrParts.join(", ");
		loading.value = true;
		try {
			// API expects shipping_address as an array (validation returns 422 if not)
			const payload = {
				shipping_address: addrParts,
				payment_method: form.value.payment_method,
			};
			const res = await checkoutService.placeOrder(payload);
			// show structured response
			result.value = res;
			if (res && res.success) {
				$q.notify({ type: "positive", message: res.message || "Order placed" });
				// clear cart store
				cartStore.clearCart();
			} else {
				$q.notify({
					type: "negative",
					message: res.message || "Failed to place order",
				});
			}
		} catch (e) {
			console.error("checkout submit error", e);
			// server may return { message, errors: { field: [...] } }
			const serverMsg =
				e?.message ||
				(e?.errors ? Object.values(e.errors).flat().join(" ") : null);
			error.value = serverMsg || JSON.stringify(e);
			$q.notify({ type: "negative", message: error.value });
		} finally {
			loading.value = false;
		}
	};
</script>

<style scoped>
	pre {
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
