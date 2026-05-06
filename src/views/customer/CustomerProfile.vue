<template>
	<div class="profile-page min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
		<!-- Animated background elements -->
		<div class="fixed inset-0 overflow-hidden pointer-events-none">
			<div class="floating-shape shape-1"></div>
			<div class="floating-shape shape-2"></div>
			<div class="floating-shape shape-3"></div>
		</div>

		<div class="relative z-10 px-4 py-8 max-w-4xl mx-auto">
			<!-- Enhanced Header Card -->
			<div class="header-card bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative group">
				<!-- Gradient overlay -->
				<div class="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/5 to-cyan-600/10"></div>

				<!-- Animated header background -->
				<div class="header-bg relative overflow-hidden">
					<div class="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600"></div>
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
					<div class="relative h-32 flex items-end">
						<div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
					</div>
				</div>

				<div class="header-content relative -mt-12 p-6 md:p-8">
					<div class="flex flex-col md:flex-row items-start md:items-center gap-6">
						<!-- Enhanced Avatar -->
						<div class="avatar-container relative group">
							<div class="avatar-glow"></div>
							<div class="avatar-wrap relative">
								<img
									v-if="hasAvatar"
									class="avatar-img"
									:src="displayAvatar"
									alt="Profile avatar"
									@error="avatarLoadError = true" />
								<div v-else class="avatar-fallback">
									<span class="avatar-text">{{ initials }}</span>
									<div class="avatar-rings">
										<div class="ring ring-1"></div>
										<div class="ring ring-2"></div>
									</div>
								</div>
								<!-- Online indicator -->
								<div class="online-indicator"></div>
							</div>
						</div>

						<!-- Enhanced Profile Info -->
						<div class="flex-1 min-w-0">
							<div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
								<div class="profile-info">
									<h1 class="profile-name">
										{{ profile?.name || profile?.full_name || "â€”" }}
									</h1>
									<div class="profile-email">
										{{ profile?.email || "â€”" }}
									</div>
									<div class="profile-role">
										<div class="role-badge">
											<div class="role-icon"></div>
											{{ profile?.role || "customer" }}
										</div>
									</div>
								</div>

								<!-- Enhanced Edit Button -->
								<button
									class="edit-button"
									@click="toggleEdit"
									:class="{ 'edit-button-active': editing }">
									<div class="edit-icon">
										<svg
											v-if="!editing"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
										<svg
											v-else
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<path d="m9 18 6-6-6-6"></path>
										</svg>
									</div>
									<span>{{ editing ? 'Cancel' : 'Edit Profile' }}</span>
								</button>

								<!-- Orders Button -->
								<button class="orders-button" @click="goToOrders">
									<div class="edit-icon">
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"></path>
										</svg>
									</div>
									<span>View Orders</span>
								</button>
							</div>

							<!-- Meta Information Grid -->
							<div class="meta-grid mt-6">
								<div class="meta-card">
									<div class="meta-icon phone-icon">
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
										</svg>
									</div>
									<div>
										<div class="meta-label">Phone</div>
										<div class="meta-value">
											{{ profile?.phone || "Not provided" }}
										</div>
									</div>
								</div>

								<div class="meta-card">
									<div class="meta-icon location-icon">
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
											<circle cx="12" cy="10" r="3"></circle>
										</svg>
									</div>
									<div>
										<div class="meta-label">Location</div>
										<div class="meta-value">{{ formatLocation() }}</div>
									</div>
								</div>

								<div class="meta-card">
									<div class="meta-icon country-icon">
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<circle cx="12" cy="12" r="10"></circle>
											<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
											<path d="M2 12h20"></path>
										</svg>
									</div>
									<div>
										<div class="meta-label">Country</div>
										<div class="meta-value">
											{{ profile?.country || profile?.country_name || "Not specified" }}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Enhanced Edit Form -->
			<transition name="slide-fade">
				<div v-if="editing" class="edit-panel mt-8">
					<div class="edit-card bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
						<div class="edit-header mb-8">
							<h2 class="edit-title">Edit Profile</h2>
							<p class="edit-subtitle">Update your personal information</p>
						</div>

						<form @submit.prevent="saveProfile" novalidate>
							<div class="form-grid">
								<div class="form-group full-width">
									<label class="form-label">
										<span class="label-text">Profile Picture</span>
									</label>
									<div class="input-wrapper">
										<input
											type="file"
											accept="image/*"
											@change="onAvatarSelected"
											class="form-input"
											placeholder="Select image" />
										<div class="input-focus-ring"></div>
									</div>
									<div v-if="avatarPreviewUrl" class="mt-3">
										<img :src="avatarPreviewUrl" alt="Avatar preview" class="w-20 h-20 rounded-xl object-cover border border-slate-200" />
									</div>
								</div>

								<div class="form-group">
									<label class="form-label">
										<span class="label-text">Full Name</span>
										<span class="label-required">*</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.name"
											type="text"
											class="form-input"
											:class="{ 'input-error': formErrors.name }"
											placeholder="Enter your full name" />
										<div class="input-focus-ring"></div>
									</div>
									<transition name="error-fade">
										<div v-if="formErrors.name" class="field-error">
											{{ formErrors.name }}
										</div>
									</transition>
								</div>

								<div class="form-group">
									<label class="form-label">
										<span class="label-text">Email Address</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.email"
											type="email"
											readonly
											class="form-input input-readonly"
											placeholder="Email address" />
										<div class="readonly-overlay">
											<svg
												width="16"
												height="16"
												:src="displayAvatar"
												fill="none"
												stroke="currentColor"
												stroke-width="2">
												<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
												<circle cx="12" cy="16" r="1"></circle>
												<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
											</svg>
										</div>
									</div>
								</div>

								<div class="form-group">
									<label class="form-label">
										<span class="label-text">Phone Number</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.phone"
											type="tel"
											class="form-input"
											:class="{ 'input-error': formErrors.phone }"
											placeholder="+1 (555) 123-4567" />
										<div class="input-focus-ring"></div>
									</div>
									<transition name="error-fade">
										<div v-if="formErrors.phone" class="field-error">
											{{ formErrors.phone }}
										</div>
									</transition>
								</div>

								<div class="form-group">
									<label class="form-label">
										<span class="label-text">Country</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.country"
											type="text"
											class="form-input"
											:class="{ 'input-error': formErrors.country }"
											placeholder="United States" />
										<div class="input-focus-ring"></div>
									</div>
									<transition name="error-fade">
										<div v-if="formErrors.country" class="field-error">
											{{ formErrors.country }}
										</div>
									</transition>
								</div>

								<div class="form-group full-width">
									<label class="form-label">
										<span class="label-text">Street Address</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.address"
											type="text"
											class="form-input"
											:class="{ 'input-error': formErrors.address }"
											placeholder="123 Main Street, Apt 4B" />
										<div class="input-focus-ring"></div>
									</div>
									<transition name="error-fade">
										<div v-if="formErrors.address" class="field-error">
											{{ formErrors.address }}
										</div>
									</transition>
								</div>

								<div class="form-group">
									<label class="form-label">
										<span class="label-text">City</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.city"
											type="text"
											class="form-input"
											:class="{ 'input-error': formErrors.city }"
											placeholder="New York" />
										<div class="input-focus-ring"></div>
									</div>
									<transition name="error-fade">
										<div v-if="formErrors.city" class="field-error">
											{{ formErrors.city }}
										</div>
									</transition>
								</div>

								<div class="form-group">
									<label class="form-label">
										<span class="label-text">State</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.state"
											type="text"
											class="form-input"
											:class="{ 'input-error': formErrors.state }"
											placeholder="California" />
										<div class="input-focus-ring"></div>
									</div>
									<transition name="error-fade">
										<div v-if="formErrors.state" class="field-error">
											{{ formErrors.state }}
										</div>
									</transition>
								</div>

								<div class="form-group">
									<label class="form-label">
										<span class="label-text">Postal Code</span>
									</label>
									<div class="input-wrapper">
										<input
											v-model="form.postal_code"
											type="text"
											class="form-input"
											:class="{ 'input-error': formErrors.postal_code }"
											placeholder="10001" />
										<div class="input-focus-ring"></div>
									</div>
									<transition name="error-fade">
										<div v-if="formErrors.postal_code" class="field-error">
											{{ formErrors.postal_code }}
										</div>
									</transition>
								</div>
							</div>

							<!-- Enhanced Action Buttons -->
							<div class="form-actions mt-8">
								<button type="submit" :disabled="saving" class="btn-primary">
									<div class="btn-content">
										<div v-if="saving" class="btn-spinner"></div>
										<svg
											v-else
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
											<polyline points="17,21 17,13 7,13 7,21"></polyline>
											<polyline points="7,3 7,8 15,8"></polyline>
										</svg>
										<span>{{ saving ? "Saving..." : "Save Changes" }}</span>
									</div>
								</button>

								<button
									type="button"
									class="btn-secondary"
									@click="cancelEdit"
									:disabled="saving">
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2">
										<path d="m18 6-6 6 6 6"></path>
										<path d="m6 6 6 6-6 6"></path>
									</svg>
									<span>Cancel</span>
								</button>

								<transition name="success-fade">
									<div v-if="successMessage" class="success-badge">
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2">
											<polyline points="20,6 9,17 4,12"></polyline>
										</svg>
										{{ successMessage }}
									</div>
								</transition>
							</div>

							<!-- Error Message -->
							<transition name="error-fade">
								<div v-if="serverMessage" class="server-error mt-6">
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="15" y1="9" x2="9" y2="15"></line>
										<line x1="9" y1="9" x2="15" y2="15"></line>
									</svg>
									{{ serverMessage }}
								</div>
							</transition>
						</form>
					</div>
				</div>
			</transition>

			<!-- Loading State -->
			<div v-if="loading" class="loading-card mt-8">
				<div class="loading-content">
					<div class="loading-spinner"></div>
					<p>Loading profile...</p>
				</div>
			</div>

			<!-- Debug Panel (Enhanced) -->
			<div v-if="profile && !loading" class="debug-panel mt-8">
				<details class="debug-details">
					<summary class="debug-summary">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2">
							<polyline points="6,9 12,15 18,9"></polyline>
						</svg>
						Debug Information
					</summary>
					<div class="debug-content">
						<pre class="debug-json">{{ JSON.stringify(profile, null, 2) }}</pre>
					</div>
				</details>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/api/axios";
import { useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth"; // Added missing import

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore(); // Moved inside setup function

const profile = ref(null);
const profileSource = ref(null);
const editing = ref(false);
const loading = ref(false);
const saving = ref(false);
const serverMessage = ref(null);
const successMessage = ref(null);

const form = reactive({
	name: "",
	email: "",
	phone: "",
	address: "",
	city: "",
	state: "",
	postal_code: "",
	country: "",
});

const formErrors = reactive({
	name: null,
	phone: null,
	address: null,
	city: null,
	state: null,
	postal_code: null,
	country: null,
});

function clearErrors() {
	for (const k in formErrors) formErrors[k] = null;
	serverMessage.value = null;
	successMessage.value = null;
}

const avatarLoadError = ref(false);
const avatarFile = ref(null);
const avatarPreviewUrl = ref("");

function normalizeAvatarUrl(path) {
if (!path) return "";
const base = axios?.defaults?.baseURL || "";
let origin = "http://13.60.78.97";
try { if (base) origin = new URL(base, "http://localhost").origin; } catch { }
if (/^https?:\/\//i.test(path)) {
return path.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, origin);
}
if (path.startsWith("blob:") || path.startsWith("data:")) return path;
if (path.startsWith("/")) return `${origin}${path}`;
return `${origin}/${String(path).replace(/^\/+/, "")}`;
}

const displayAvatar = computed(() => avatarPreviewUrl.value || normalizeAvatarUrl(profile.value?.avatar) || "");
const hasAvatar = computed(() => !!displayAvatar.value && !avatarLoadError.value);

function onAvatarSelected(event) {
	const file = event?.target?.files?.[0] || null;
	avatarFile.value = file;
	if (avatarPreviewUrl.value) {
		URL.revokeObjectURL(avatarPreviewUrl.value);
	}
	avatarPreviewUrl.value = file ? URL.createObjectURL(file) : "";
	avatarLoadError.value = false;
}

function mapServerErrors(err) {
	clearErrors();
	const data = err?.response?.data;
	if (data?.errors && typeof data.errors === "object") {
		for (const key in data.errors) {
			if (key in formErrors) formErrors[key] = data.errors[key].join(" ");
			else {
				serverMessage.value = data.errors[key].join(" ");
			}
		}
	} else {
		serverMessage.value = data?.message || err.message || "Update failed";
	}
}

function formatLocation() {
	const parts = [profile.value?.city, profile.value?.state, profile.value?.address].filter(Boolean);
	
	if (parts.length === 0) return "Location not provided";
	if (parts.length === 1) return parts[0];
	return parts.join(", ");
}

function goToOrders() {
	router.push('/customer/orders');
}

async function fetchProfile() {
	loading.value = true;
	serverMessage.value = null;

	const stored = authStore.currentUser || authStore.user || null;
	const role = stored?.role?.toString?.().toLowerCase?.() || null;

	const customerEndpoints = ["/customer/profile"];
	const sellerEndpoints = ["/seller/profile"];
	const tryList =
		role === "seller" || role === "manager"
			? [...sellerEndpoints, ...customerEndpoints]
			: [...customerEndpoints, ...sellerEndpoints];

	let lastErr = null;
	for (const ep of tryList) {
		try {
			const res = await axios.get(ep);
			const payload = res?.data?.data ?? res?.data ?? res;
			profile.value = payload;
			profileSource.value = ep.startsWith("/seller") ? "seller" : "customer";

			// populate form
			form.name = payload.name ?? payload.full_name ?? "";
			form.email = payload.email ?? "";
			form.phone = payload.phone ?? "";
			form.address = payload.address ?? "";
			form.city = payload.city ?? "";
			form.state = payload.state ?? "";
			form.postal_code = payload.postal_code ?? payload.zip ?? "";
			form.country = payload.country ?? payload.country_name ?? "";
			lastErr = null;
			break;
		} catch (err) {
			lastErr = err;
		}
	}

	if (lastErr && !profile.value) {
		serverMessage.value =
			lastErr?.response?.data?.message ??
			lastErr.message ??
			"Failed to load profile";
		console.error("fetch profile error", lastErr);
	}

	loading.value = false;
}

function toggleEdit() {
	editing.value = !editing.value;
	clearErrors();
	successMessage.value = null;

	if (editing.value && profile.value) {
		form.name = profile.value.name ?? profile.value.full_name ?? "";
		form.email = profile.value.email ?? "";
		form.phone = profile.value.phone ?? "";
		form.address = profile.value.address ?? "";
		form.city = profile.value.city ?? "";
		form.state = profile.value.state ?? "";
		form.postal_code = profile.value.postal_code ?? profile.value.zip ?? "";
		form.country = profile.value.country ?? profile.value.country_name ?? "";
	}
}

function cancelEdit() {
	editing.value = false;
	clearErrors();

	if (profile.value) {
		form.name = profile.value.name ?? profile.value.full_name ?? "";
		form.email = profile.value.email ?? "";
		form.phone = profile.value.phone ?? "";
		form.address = profile.value.address ?? "";
		form.city = profile.value.city ?? "";
		form.state = profile.value.state ?? "";
		form.postal_code = profile.value.postal_code ?? profile.value.zip ?? "";
		form.country = profile.value.country ?? profile.value.country_name ?? "";
	}
}

async function saveProfile() {
	clearErrors();
	saving.value = true;
	successMessage.value = null;

	try {
		const payload = new FormData();
		payload.append("_method", "PATCH");
		payload.append("name", form.name ?? "");
		payload.append("phone", form.phone ?? "");
		payload.append("address", form.address ?? "");
		payload.append("city", form.city ?? "");
		payload.append("state", form.state ?? "");
		payload.append("postal_code", form.postal_code ?? "");
		payload.append("country", form.country ?? "");
		if (avatarFile.value) {
			payload.append("avatar", avatarFile.value);
		}

		const patchTarget =
			profileSource.value === "seller"
				? "/seller/profile"
				: "/customer/profile";

		const res = await axios.post(patchTarget, payload, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		const updated = res?.data?.data ?? res?.data ?? res;
		profile.value = updated;
		avatarLoadError.value = false;
		if (avatarPreviewUrl.value) {
			URL.revokeObjectURL(avatarPreviewUrl.value);
		}
		avatarPreviewUrl.value = "";
		avatarFile.value = null;

		try {
			// Keep in-memory auth store in sync with updated profile
			const stored = authStore.user || null;
			if (stored) {
				const merged = { ...stored, ...updated };
				authStore.user = merged;
				window.dispatchEvent(new Event("auth-changed"));
			}
		} catch (e) {
			console.error("Auth store update error:", e);
		}

		successMessage.value = "Profile saved successfully!";
		$q.notify &&
			$q.notify({
				type: "positive",
				message: "Profile updated successfully",
				position: "top-right",
			});
		setTimeout(() => {
			editing.value = false;
			successMessage.value = null;
		}, 1500);
	} catch (err) {
		console.error("save profile error", err);
		mapServerErrors(err);
		$q.notify &&
			$q.notify({
				type: "negative",
				message: "Failed to save profile",
				position: "top-right",
			});
	} finally {
		saving.value = false;
	}
}

const initials = computed(() => {
	const n =
		profile.value?.name ?? form.name ?? profile.value?.full_name ?? "";
	if (!n) return "U";
	return n
		.split(" ")
		.map((s) => s[0]?.toUpperCase())
		.slice(0, 2)
		.join("");
});

watch(
	() => profile.value?.avatar,
	() => {
		avatarLoadError.value = false;
	}
);

onMounted(fetchProfile);

watch(
	() => route.query.edit,
	(v) => {
		if (v === "1" || v === 1) {
			if (profile.value) {
				editing.value = true;
				form.name = profile.value.name ?? profile.value.full_name ?? "";
				form.email = profile.value.email ?? "";
				form.phone = profile.value.phone ?? "";
				form.address = profile.value.address ?? "";
				form.city = profile.value.city ?? "";
				form.state = profile.value.state ?? "";
				form.postal_code =
					profile.value.postal_code ?? profile.value.zip ?? "";
				form.country =
					profile.value.country ?? profile.value.country_name ?? "";
			} else {
				fetchProfile().then(() => {
					editing.value = true;
				});
			}
		} else {
			editing.value = false;
		}
	},
	{ immediate: true }
);
</script>

<style scoped>
* {
	box-sizing: border-box;
}

.profile-page {
	font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
		sans-serif;
	min-height: 100vh;
	position: relative;
}

/* Floating Background Elements */
.floating-shape {
	position: absolute;
	border-radius: 50%;
	background: linear-gradient(
		135deg,
		rgba(139, 92, 246, 0.1),
		rgba(59, 130, 246, 0.05)
	);
	animation: float 20s ease-in-out infinite;
}

.shape-1 {
	width: 300px;
	height: 300px;
	top: 10%;
	left: -5%;
	animation-delay: 0s;
}

.shape-2 {
	width: 200px;
	height: 200px;
	top: 60%;
	right: -3%;
	animation-delay: -7s;
}

.shape-3 {
	width: 150px;
	height: 150px;
	bottom: 20%;
	left: 70%;
	animation-delay: -14s;
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0px) rotate(0deg);
	}
	25% {
		transform: translateY(-20px) rotate(5deg);
	}
	50% {
		transform: translateY(-10px) rotate(-3deg);
	}
	75% {
		transform: translateY(-30px) rotate(3deg);
	}
}

/* Shimmer Animation */
@keyframes shimmer {
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(100%);
	}
}

.animate-shimmer {
	animation: shimmer 3s ease-in-out infinite;
}

/* Header Card */
.header-card {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.header-bg {
	height: 128px;
	position: relative;
}

/* Avatar Enhancements */
.avatar-container {
	position: relative;
}

.avatar-glow {
	position: absolute;
	inset: -8px;
	background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
	border-radius: 28px;
	opacity: 0;
	transition: opacity 0.3s ease;
	z-index: -1;
}

.avatar-container:hover .avatar-glow {
	opacity: 0.3;
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%,
	100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
}

.avatar-wrap {
	width: 96px;
	height: 96px;
	position: relative;
}

.avatar-img {
	width: 96px;
	height: 96px;
	display: block;
	object-fit: cover;
	border-radius: 24px;
	border: 4px solid white;
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
	transition: all 0.3s ease;
}

.avatar-img:hover {
	transform: scale(1.05);
	box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.avatar-fallback {
	width: 96px;
	height: 96px;
	border-radius: 24px;
	background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
	border: 4px solid white;
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
	transition: all 0.3s ease;
}

.avatar-fallback:hover {
	transform: scale(1.05);
	box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.avatar-text {
	color: white;
	font-weight: 700;
	font-size: 24px;
	z-index: 2;
	position: relative;
}

.avatar-rings {
	position: absolute;
	inset: 0;
}

.ring {
	position: absolute;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.ring-1 {
	inset: 8px;
	animation-delay: 0s;
}

.ring-2 {
	inset: 16px;
	animation-delay: 0.5s;
}

@keyframes ping {
	75%,
	100% {
		transform: scale(2);
		opacity: 0;
	}
}

.online-indicator {
	position: absolute;
	bottom: 8px;
	right: 8px;
	width: 20px;
	height: 20px;
	background: #22c55e;
	border: 3px solid white;
	border-radius: 50%;
	box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
	animation: pulse-green 2s ease-in-out infinite;
}

@keyframes pulse-green {
	0%,
	100% {
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
	}
	50% {
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.6);
	}
}

/* Profile Info */
.profile-name {
	font-size: 2rem;
	font-weight: 800;
	background: linear-gradient(135deg, #1e293b, #475569);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	line-height: 1.2;
	margin-bottom: 8px;
}

.profile-email {
	color: #64748b;
	font-size: 0.875rem;
	font-weight: 500;
	margin-bottom: 12px;
}

.role-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	background: linear-gradient(
		135deg,
		rgba(139, 92, 246, 0.1),
		rgba(59, 130, 246, 0.05)
	);
	border: 1px solid rgba(139, 92, 246, 0.2);
	border-radius: 20px;
	font-size: 0.75rem;
	font-weight: 600;
	color: #7c3aed;
	text-transform: capitalize;
}

.role-icon {
	width: 8px;
	height: 8px;
	background: #7c3aed;
	border-radius: 50%;
	animation: pulse-role 2s ease-in-out infinite;
}

@keyframes pulse-role {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

/* Edit Button */
.edit-button {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 20px;
	background: linear-gradient(135deg, #ffffff, #f8fafc);
	border: 2px solid transparent;
	border-radius: 16px;
	font-weight: 600;
	color: #374151;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	position: relative;
	overflow: hidden;
}

.edit-button::before {
	content: "";
	position: absolute;
	inset: 0;
	background: linear-gradient(135deg, #8b5cf6, #3b82f6);
	opacity: 0;
	transition: opacity 0.3s ease;
	z-index: -1;
}

.edit-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	border-color: rgba(139, 92, 246, 0.3);
}

.edit-button:hover::before {
	opacity: 0.1;
}

.edit-button-active {
	background: linear-gradient(135deg, #8b5cf6, #3b82f6);
	color: white;
	border-color: transparent;
}

.edit-button-active::before {
	opacity: 1;
}

.edit-icon {
	transition: transform 0.3s ease;
}

.edit-button:hover .edit-icon {
	transform: scale(1.1);
}

/* Orders Button */
.orders-button {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 20px;
	background: linear-gradient(135deg, #e0f2fe, #bbdefb);
	border: 2px solid transparent;
	border-radius: 16px;
	font-weight: 600;
	color: #1e40af;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	position: relative;
	overflow: hidden;
	white-space: nowrap;
}

.orders-button::before {
	content: "";
	position: absolute;
	inset: 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	opacity: 0;
	transition: opacity 0.3s ease;
	z-index: -1;
}

.orders-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	border-color: rgba(59, 130, 246, 0.3);
}

.orders-button:hover::before {
	opacity: 0.1;
}

/* Meta Grid */
.meta-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 16px;
}

.meta-card {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px 20px;
	background: rgba(255, 255, 255, 0.6);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 16px;
	transition: all 0.3s ease;
}

.meta-card:hover {
	background: rgba(255, 255, 255, 0.8);
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.meta-icon {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: all 0.3s ease;
}

.phone-icon {
	background: linear-gradient(135deg, #22c55e, #16a34a);
	color: white;
}

.location-icon {
	background: linear-gradient(135deg, #f59e0b, #d97706);
	color: white;
}

.country-icon {
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: white;
}

.meta-card:hover .meta-icon {
	transform: scale(1.1);
}

.meta-label {
	font-size: 0.75rem;
	color: #6b7280;
	font-weight: 500;
	margin-bottom: 4px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.meta-value {
	font-size: 0.875rem;
	color: #1f2937;
	font-weight: 600;
	line-height: 1.3;
}

/* Edit Panel */
.edit-panel {
	animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.edit-card {
	position: relative;
	overflow: hidden;
	background: rgba(15, 23, 42, 0.86) !important;
	border-color: rgba(148, 163, 184, 0.25) !important;
}

.edit-header {
	text-align: center;
	border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	padding-bottom: 24px;
}

.edit-title {
	font-size: 1.75rem;
	font-weight: 800;
	background: linear-gradient(135deg, #f8fafc, #cbd5e1);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-bottom: 8px;
}

.edit-subtitle {
	color: #cbd5e1;
	font-size: 0.875rem;
	font-weight: 500;
}

/* Form Grid */
.form-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 24px;
}

.form-group {
	position: relative;
}

.full-width {
	grid-column: 1 / -1;
}

.form-label {
	display: block;
	margin-bottom: 8px;
	font-size: 0.875rem;
	font-weight: 600;
	color: #e2e8f0;
}

.label-required {
	color: #ef4444;
	margin-left: 2px;
}

.input-wrapper {
	position: relative;
}

.form-input {
	width: 100%;
	padding: 16px 18px;
	border: 2px solid #475569;
	border-radius: 16px;
	background: rgba(30, 41, 59, 0.9);
	font-size: 0.875rem;
	font-weight: 500;
	color: #f8fafc;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	outline: none;
	position: relative;
	z-index: 1;
}

.form-input:focus {
	border-color: #60a5fa;
	transform: translateY(-1px);
	box-shadow: 0 12px 32px rgba(96, 165, 250, 0.2);
}

.form-input::placeholder {
	color: #94a3b8;
	font-weight: 400;
}

.form-input[type="file"] {
	padding: 10px 12px;
	color: #e2e8f0;
}

.form-input[type="file"]::file-selector-button {
	background: #334155;
	color: #f8fafc;
	border: 1px solid #475569;
	border-radius: 10px;
	padding: 8px 12px;
	margin-right: 10px;
	cursor: pointer;
}

.input-readonly {
	background: rgba(30, 41, 59, 0.7);
	color: #cbd5e1;
	cursor: not-allowed;
	position: relative;
}

.readonly-overlay {
	position: absolute;
	top: 50%;
	right: 16px;
	transform: translateY(-50%);
	color: #94a3b8;
	pointer-events: none;
}

.input-focus-ring {
	position: absolute;
	inset: 0;
	border-radius: 16px;
	background: linear-gradient(135deg, #8b5cf6, #3b82f6);
	opacity: 0;
	transition: opacity 0.3s ease;
	z-index: 0;
	margin: -2px;
}

.form-input:focus + .input-focus-ring {
	opacity: 0.1;
}

.input-error {
	border-color: #ef4444 !important;
	background: #fef2f2;
}

.field-error {
	margin-top: 8px;
	color: #ef4444;
	font-size: 0.75rem;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 4px;
}

.field-error::before {
	content: "âš ";
	font-size: 0.875rem;
}

/* Action Buttons */
.form-actions {
	display: flex;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
	padding-top: 24px;
	border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-primary {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 14px 24px;
	background: linear-gradient(135deg, #8b5cf6, #3b82f6);
	color: white;
	border: none;
	border-radius: 16px;
	font-weight: 600;
	font-size: 0.875rem;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
	position: relative;
	overflow: hidden;
}

.btn-primary::before {
	content: "";
	position: absolute;
	inset: 0;
	background: linear-gradient(135deg, #7c3aed, #2563eb);
	opacity: 0;
	transition: opacity 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 12px 32px rgba(139, 92, 246, 0.4);
}

.btn-primary:hover:not(:disabled)::before {
	opacity: 1;
}

.btn-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.btn-content {
	display: flex;
	align-items: center;
	gap: 8px;
	position: relative;
	z-index: 1;
}

.btn-spinner {
	width: 16px;
	height: 16px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top: 2px solid white;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.btn-secondary {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 14px 24px;
	background: rgba(30, 41, 59, 0.8);
	color: #e2e8f0;
	border: 2px solid #475569;
	border-radius: 16px;
	font-weight: 600;
	font-size: 0.875rem;
	cursor: pointer;
	transition: all 0.3s ease;
}

.btn-secondary:hover:not(:disabled) {
	background: rgba(51, 65, 85, 0.9);
	border-color: #64748b;
	transform: translateY(-1px);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.btn-secondary:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.success-badge {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 16px;
	background: linear-gradient(135deg, #dcfce7, #bbf7d0);
	color: #166534;
	border: 1px solid #86efac;
	border-radius: 12px;
	font-size: 0.75rem;
	font-weight: 600;
	animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(20px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

.server-error {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	background: linear-gradient(135deg, #fef2f2, #fee2e2);
	color: #dc2626;
	border: 1px solid #fca5a5;
	border-radius: 12px;
	font-size: 0.875rem;
	font-weight: 500;
}

/* Loading Card */
.loading-card {
	background: white/80;
	backdrop-filter: blur(12px);
	border-radius: 24px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 48px 24px;
	color: #6b7280;
}

.loading-spinner {
	width: 40px;
	height: 40px;
	border: 3px solid #e5e7eb;
	border-top: 3px solid #8b5cf6;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

/* Debug Panel */
.debug-panel {
	margin-top: 32px;
}

.debug-details {
	background: rgba(15, 23, 42, 0.72);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(148, 163, 184, 0.25);
	border-radius: 16px;
	overflow: hidden;
	transition: all 0.3s ease;
}

.debug-summary {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 16px 20px;
	font-size: 0.875rem;
	font-weight: 600;
	color: #cbd5e1;
	cursor: pointer;
	background: rgba(30, 41, 59, 0.75);
	transition: all 0.3s ease;
}

.debug-summary:hover {
	background: rgba(51, 65, 85, 0.9);
	color: #f8fafc;
}

.debug-content {
	padding: 0 20px 20px;
}

.debug-json {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 16px;
	font-size: 0.75rem;
	color: #475569;
	white-space: pre-wrap;
	word-break: break-word;
	margin: 0;
	line-height: 1.5;
}

/* Transitions */
.slide-fade-enter-active {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
	transition: all 0.3s ease;
}

.slide-fade-enter-from {
	opacity: 0;
	transform: translateY(-20px) scale(0.95);
}

.slide-fade-leave-to {
	opacity: 0;
	transform: translateY(-10px) scale(0.98);
}

.error-fade-enter-active,
.error-fade-leave-active {
	transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}

.success-fade-enter-active,
.success-fade-leave-active {
	transition: all 0.3s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
	opacity: 0;
	transform: translateX(20px);
}

/* Responsive Design */
@media (max-width: 768px) {
	.header-content {
		flex-direction: column;
		text-align: center;
	}

	.profile-name {
		font-size: 1.5rem;
	}

	.meta-grid {
		grid-template-columns: 1fr;
	}

	.form-grid {
		grid-template-columns: 1fr;
	}

	.form-actions {
		flex-direction: column;
		align-items: stretch;
	}

	.btn-primary,
	.btn-secondary {
		justify-content: center;
	}
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
	.profile-page {
		background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
	}

	.header-card,
	.edit-card {
		background: rgba(30, 41, 59, 0.8);
		border-color: rgba(148, 163, 184, 0.1);
	}

	.profile-name {
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.profile-email {
		color: #94a3b8;
	}

	.meta-card {
		background: rgba(51, 65, 85, 0.6);
		border-color: rgba(148, 163, 184, 0.1);
	}

	.meta-value {
		color: #e2e8f0;
	}

	.form-input {
		background: rgba(51, 65, 85, 0.5);
		border-color: rgba(148, 163, 184, 0.2);
		color: #e2e8f0;
	}

	.form-input:focus {
		background: rgba(51, 65, 85, 0.8);
	}

	.debug-json {
		background: rgba(15, 23, 42, 0.8);
		border-color: rgba(148, 163, 184, 0.2);
		color: #cbd5e1;
	}
}

/* Enhanced animations and micro-interactions */
.form-input:focus {
	animation: inputFocus 0.3s ease;
}

@keyframes inputFocus {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.02);
	}
	100% {
		transform: scale(1);
	}
}

/* Glassmorphism effects */
.header-card,
.edit-card,
.meta-card {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
}

/* Smooth scrolling for better UX */
html {
	scroll-behavior: smooth;
}

/* Focus indicators for accessibility */
.edit-button:focus,
.btn-primary:focus,
.btn-secondary:focus {
	outline: 2px solid #8b5cf6;
	outline-offset: 2px;
}

.form-input:focus {
	outline: none;
	box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
}
</style>