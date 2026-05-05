<template>
	<q-page
		class="profile-root q-pa-md md:q-pa-lg bg-surface-1 min-h-screen">
		<div class="profile-shell w-full max-w-6xl">
			<!-- Hero -->
			<div
				class="hero-card relative overflow-hidden rounded-2xl p-5 md:p-7 mb-6 shadow-lg">
				<div class="flex flex-col lg:flex-row lg:items-center gap-5">
					<q-avatar
						size="84px"
						class="hero-avatar"
						:style="{
							background: `linear-gradient(135deg, hsl(${
								(profile.company_name?.charCodeAt(0) || 40) % 360
							} 78% 52%), hsl(${
								((profile.company_name?.charCodeAt(0) || 40) + 40) % 360
							} 70% 44%))`,
						}">
						<q-icon name="store" size="36px" class="text-white" />
					</q-avatar>

					<div class="flex-1 min-w-0">
						<div
							class="text-2xl md:text-3xl font-extrabold text-primary truncate">
							{{ profile.company_name || "Your Store" }}
						</div>
						<div class="text-sm text-muted mt-1 truncate">
							{{ profile.address || "Address not set" }}
							<span v-if="profile.city"> · {{ profile.city }}</span>
							<span v-if="profile.postal_code">
								· {{ profile.postal_code }}</span
							>
							<span v-if="profile.country"> · {{ profile.country }}</span>
						</div>

						<div class="flex flex-wrap items-center gap-2.5 mt-3">
							<q-badge class="shadow-xs" color="primary" align="top">
								<div class="text-sm font-medium">Seller</div>
							</q-badge>

							<q-chip
								dense
								outline
								class="text-sm"
								color="green"
								v-if="profile.is_approved"
								>Verified</q-chip
							>
							<q-chip
								dense
								outline
								class="text-sm"
								color="red"
								v-if="profile.is_blocked"
								>Blocked</q-chip
							>

						</div>

						<div class="flex flex-wrap items-center gap-2 mt-4">
								<q-btn
									flat
									dense
									icon="share"
									label="Share"
									@click="shareProfile" />
								<q-btn
									unelevated
									color="primary"
									label="Edit Profile"
									icon="edit"
									@click="openEdit" />
						</div>
					</div>

					<div class="member-since text-left lg:text-right flex flex-col lg:items-end">
						<div class="text-xs text-muted">Member since</div>
						<div class="text-sm font-semibold">
							{{
								profile.created_at
									? new Date(profile.created_at).toLocaleDateString()
									: "—"
							}}
						</div>
					</div>
				</div>

				<div class="hero-deco-1" aria-hidden="true"></div>
				<div class="hero-deco-2" aria-hidden="true"></div>
			</div>

			<!-- Grid -->
			<div class="profile-grid grid grid-cols-1 xl:grid-cols-3 gap-5">
				<!-- Left: summary -->
				<q-card class="summary-card p-4 rounded-2xl shadow border border-surface-2">
					<div class="flex flex-col items-center gap-4">
						<q-avatar
							size="112px"
							class="shadow-xl"
							:style="{
								background: `linear-gradient(135deg, hsl(${
									(profile.company_name?.charCodeAt(0) || 80) % 360
								} 78% 52%), hsl(${
									((profile.company_name?.charCodeAt(0) || 80) + 48) % 360
								} 68% 43%))`,
							}">
							<q-icon name="storefront" size="40px" class="text-white" />
						</q-avatar>

						<div class="text-center">
							<div class="text-lg font-bold truncate">
								{{ profile.company_name || "—" }}
							</div>
							<div class="text-sm text-muted mt-1">
								{{ profile.city || profile.country || "Location not set" }}
							</div>
						</div>

						<div class="w-full grid grid-cols-2 gap-3 mt-3">
							<div class="stat p-3 rounded-lg bg-surface-2 text-center">
								<div class="text-xs text-muted">Orders</div>
								<div class="text-lg font-bold">
									{{
										Number(localStorage?.getItem?.("sellerOrdersCount") || 0)
									}}
								</div>
							</div>
							<div class="stat p-3 rounded-lg bg-surface-2 text-center">
								<div class="text-xs text-muted">Revenue</div>
								<div class="text-lg font-bold">
									${{
										Number(
											localStorage?.getItem?.("sellerRevenue") || 0
										).toFixed(2)
									}}
								</div>
							</div>
						</div>

						<q-separator spaced />

						<div class="w-full flex flex-col gap-2">
							<q-btn
								unelevated
								color="primary"
								label="Add Product"
								icon="add"
								@click="$router.push('/seller/products')" />
							<q-btn
								flat
								color="primary"
								label="Manage Orders"
								icon="assignment"
								@click="$router.push('/seller/orders')" />
							<q-btn
								flat
								color="negative"
								label="Deactivate Store"
								icon="block"
								@click="confirmDeactivate" />
						</div>
					</div>
				</q-card>

				<!-- Right: details (span 2) -->
				<div class="xl:col-span-2 space-y-4">
					<q-card class="details-card p-5 md:p-6 rounded-2xl shadow border border-surface-2">
						<div class="flex items-center justify-between mb-4">
							<div>
								<div class="text-lg font-extrabold">Company Details</div>
								<div class="text-sm text-muted">
									Public information visible to customers
								</div>
							</div>

							<div class="flex items-center gap-2">
								<q-btn flat icon="refresh" dense @click="reloadProfile" />
								<q-btn
									unelevated
									color="primary"
									:loading="false"
									label="Save"
									@click="saveProfile" />
							</div>
						</div>

						<q-separator />

						<div class="q-gutter-md mt-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div class="label">Company Name</div>
									<div class="value">{{ profile.company_name || "—" }}</div>
								</div>
								<div>
									<div class="label">Phone</div>
									<div class="value">{{ profile.phone || "—" }}</div>
								</div>
							</div>

							<div class="mt-3">
								<div class="label">Address</div>
								<div class="value">{{ profile.address || "—" }}</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
								<div>
									<div class="label">City</div>
									<div class="value">{{ profile.city || "—" }}</div>
								</div>
								<div>
									<div class="label">Postal Code</div>
									<div class="value">{{ profile.postal_code || "—" }}</div>
								</div>
								<div>
									<div class="label">Country</div>
									<div class="value">{{ profile.country || "—" }}</div>
								</div>
							</div>
						</div>
					</q-card>

					<q-card class="p-4 rounded-2xl shadow border border-surface-2">
						<div class="flex items-center justify-between mb-3">
							<div class="text-md font-bold">Profile Activity</div>
							<q-btn dense flat icon="more_vert" />
						</div>

						<q-timeline dense>
							<q-timeline-entry
								icon="edit"
								color="primary"
								title="Profile updated"
								subtitle="Just now" />
							<q-timeline-entry
								icon="verified"
								color="green"
								title="Seller verified"
								subtitle="2025-03-10" />
						</q-timeline>
					</q-card>
				</div>
			</div>
		</div>

		<!-- Edit Dialog: (logic unchanged) -->
		<q-dialog
			v-model="showEdit"
			persistent
			transition-show="scale"
			transition-hide="scale">
			<q-card
				class="rounded-2xl shadow-2xl"
				style="max-width: 680px; width: 100%">
				<q-card-section class="edit-head">
					<div class="text-xl font-bold flex items-center">
						<q-icon name="edit" class="mr-2" />
						Edit Profile
					</div>
					<div class="text-sm text-white/80 mt-1">
						Update your company details below
					</div>
				</q-card-section>

				<q-card-section class="q-gutter-md p-6 bg-surface-1">
					<q-input
						v-model="edit.company_name"
						label="Company Name"
						filled
						dense
						standout="bg-white" />
					<q-input
						v-model="edit.phone"
						label="Phone"
						filled
						dense
						standout="bg-white" />
					<q-input
						v-model="edit.address"
						label="Address"
						filled
						dense
						standout="bg-white" />
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<q-input
							v-model="edit.city"
							label="City"
							filled
							dense
							standout="bg-white" />
						<q-input
							v-model="edit.postal_code"
							label="Postal Code"
							filled
							dense
							standout="bg-white" />
					</div>
					<q-input
						v-model="edit.country"
						label="Country"
						filled
						dense
						standout="bg-white" />
				</q-card-section>

				<q-card-actions align="right" class="bg-surface-1 rounded-b-2xl p-4">
					<q-btn flat label="Cancel" color="negative" v-close-popup />
					<q-btn
						unelevated
						label="Save Changes"
						color="primary"
						@click="saveProfile" />
				</q-card-actions>
			</q-card>
		</q-dialog>
	</q-page>
</template>

<script setup>
	import { ref, onMounted } from "vue";
	import axios from "@/api/axios";
	import { useRouter } from "vue-router";

	const router = useRouter();

	const profile = ref({
		company_name: "",
		phone: "",
		address: "",
		city: "",
		postal_code: "",
		country: "",
		is_approved: 0,
		is_blocked: 0,
		created_at: "",
		updated_at: "",
	});

	const details = {
		phone: { label: "Phone" },
		postal_code: { label: "Postal Code" },
		country: { label: "Country" },
		is_approved: {
			label: "Approved",
			type: "chip",
			colorTrue: "green",
			colorFalse: "orange",
			trueText: "Yes",
			falseText: "No",
		},
		is_blocked: {
			label: "Blocked",
			type: "chip",
			colorTrue: "red",
			colorFalse: "green",
			trueText: "Yes",
			falseText: "No",
		},
		created_at: { label: "Created At" },
		updated_at: { label: "Updated At" },
	};

	const showEdit = ref(false);
	const edit = ref({ ...profile.value });

	onMounted(async () => {
		try {
			const res = await axios.get("/seller/profile");
			if (res.data.success && res.data.data) {
				profile.value = {
					...profile.value,
					...res.data.data,
				};
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
		}
	});

	function openEdit() {
		edit.value = { ...profile.value };
		showEdit.value = true;
	}

	async function saveProfile() {
		try {
			const res = await axios.patch("/seller/profile", { ...edit.value });
			if (res.data.success && res.data.data) {
				profile.value = { ...profile.value, ...res.data.data };
				showEdit.value = false;
			} else {
				alert(res.data.message || "Profile update failed.");
			}
		} catch (error) {
			alert(error?.response?.data?.message || "Profile update failed.");
		}
	}

	function reloadProfile() {
		// keep same API logic; simply re-run onMounted fetch
		onMounted(async () => {
			try {
				const res = await axios.get("/seller/profile");
				if (res.data.success && res.data.data) {
					profile.value = { ...profile.value, ...res.data.data };
				}
			} catch (e) {}
		});
	}

	function shareProfile() {
		navigator.clipboard?.writeText(window.location.href);
		// use basic alert to avoid dependency on $q here (keeps script unchanged)
		alert("Profile URL copied");
	}

	function confirmDeactivate() {
		if (confirm("Deactivate your store? This will hide it from customers.")) {
			alert("Deactivated (demo)");
		}
	}
</script>

<style scoped>
	.profile-root {
		font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto,
			"Helvetica Neue", Arial;
	}

	.profile-shell {
		margin-left: 0;
		padding-left: 4px;
	}

	.profile-grid {
		align-items: start;
	}

	/* Hero */
	.hero-card {
		background: linear-gradient(
			90deg,
			rgba(99, 102, 241, 0.03),
			rgba(99, 102, 241, 0.02)
		);
		border-radius: 16px;
		border: 1px solid rgba(99, 102, 241, 0.1);
		padding: 22px;
	}
	.hero-avatar {
		border-radius: 14px;
		box-shadow: 0 12px 36px rgba(2, 6, 23, 0.12);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.hero-deco-1,
	.hero-deco-2 {
		position: absolute;
		border-radius: 50%;
		opacity: 0.12;
		filter: blur(18px);
		transform: translateZ(0);
		pointer-events: none;
	}
	.hero-deco-1 {
		width: 200px;
		height: 200px;
		right: -60px;
		top: -30px;
		background: radial-gradient(
			circle at 30% 30%,
			rgba(99, 102, 241, 0.28),
			transparent 40%
		);
	}
	.hero-deco-2 {
		width: 120px;
		height: 120px;
		right: 10px;
		bottom: -40px;
		background: radial-gradient(
			circle at 70% 70%,
			rgba(99, 102, 241, 0.18),
			transparent 40%
		);
	}

	/* Cards */
	.q-card {
		transition: box-shadow 0.16s ease;
	}
	.q-card:hover {
		box-shadow: 0 4px 18px rgba(0,0,0,0.08);
	}
	.summary-card,
	.details-card {
		background: #fff;
	}

	.member-since {
		min-width: 140px;
	}
	.stat {
		transition: background 0.14s ease;
	}
	.stat:hover {
		background: #e8edf2 !important;
	}

	/* Labels */
	.label {
		font-weight: 600;
		color: var(--q-color-text);
	}
	.value {
		margin-top: 6px;
		font-weight: 600;
		color: var(--q-color-primary);
	}

	/* Edit dialog header */
	.edit-head {
		background: linear-gradient(90deg, #4f46e5, #6366f1);
		color: #fff;
		padding: 18px;
		border-top-left-radius: 12px;
		border-top-right-radius: 12px;
	}

	/* Avatar pop animation — removed */

	/* Responsive tweaks */
	@media (max-width: 900px) {
		.profile-shell {
			padding-left: 0;
		}

		.hero-card {
			padding: 14px;
		}
		.hero-card .text-2xl {
			font-size: 1.5rem;
		}

		.member-since {
			min-width: auto;
		}
	}
</style>
