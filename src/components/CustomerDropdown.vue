<template>
	<div class="avatar-dropdown" ref="root">
		<!-- Enhanced Avatar Button -->
		<button
			@click="toggle"
			class="avatar-button group"
			:title="localName || 'Profile'"
			aria-haspopup="true"
			:aria-expanded="open.toString()">
			
			<!-- Avatar Container with Glow Effect -->
			<div class="avatar-container">
				<div class="avatar-glow"></div>
				
				<!-- Main Avatar -->
				<div class="avatar-main">
					<img
						v-if="avatarUrl"
						:src="avatarUrl"
						alt="Profile"
						class="avatar-image" />
					<div
						v-else
						class="avatar-fallback">
						<span class="avatar-initials">{{ initials }}</span>
						<div class="avatar-pattern"></div>
					</div>
				</div>
				
				<!-- Status Indicators -->
				<div class="status-indicators">
					<!-- Online Status -->
					<div class="status-dot online-dot" title="Online">
						<div class="status-pulse"></div>
					</div>
					
					<!-- Notification Badge (optional) -->
					<div v-if="hasNotifications" class="notification-badge" title="3 new notifications">
						<span>3</span>
					</div>
				</div>
			</div>
		</button>

		<!-- Enhanced Dropdown Panel -->
		<transition name="dropdown-fade">
			<div v-if="open" class="dropdown-panel">
				<div class="dropdown-backdrop"></div>
				<div class="dropdown-content">
					
					<!-- Loading State -->
					<div v-if="loading" class="dropdown-loading">
						<div class="loading-spinner">
							<div class="spinner-ring"></div>
						</div>
						<p class="loading-text">Loading profile...</p>
					</div>

					<!-- Error State -->
					<div v-else-if="error" class="dropdown-error">
						<div class="error-icon">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="15" y1="9" x2="9" y2="15"></line>
								<line x1="9" y1="9" x2="15" y2="15"></line>
							</svg>
						</div>
						<p class="error-text">{{ error }}</p>
						<button @click="fetchProfile" class="retry-button">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
								<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
							</svg>
							Retry
						</button>
					</div>

					<!-- Profile Content -->
					<div v-else-if="profile" class="profile-content">
						
						<!-- Profile Header -->
						<div class="profile-header">
							<div class="profile-avatar-large">
								<img
									v-if="avatarUrl"
									:src="avatarUrl"
									alt="Profile"
									class="profile-image-large" />
								<div
									v-else
									class="profile-fallback-large">
									<span class="profile-initials-large">{{ initials }}</span>
									<div class="profile-pattern-large"></div>
								</div>
								<div class="profile-status-large">
									<div class="status-ring"></div>
									<div class="status-core"></div>
								</div>
							</div>
							
							<div class="profile-info">
								<h3 class="profile-name">
									{{ profile.name || profile.full_name || localName || "User" }}
								</h3>
								<p class="profile-email">{{ profile.email || "No email" }}</p>
								<div class="profile-role-badge">
									<div class="role-indicator"></div>
									<span>{{ formatRole(profile.role) }}</span>
								</div>
							</div>
						</div>

						<!-- Profile Details Grid -->
						<div class="profile-details">
							<div class="detail-card">
								<div class="detail-icon phone-icon">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
									</svg>
								</div>
								<div class="detail-content">
									<div class="detail-label">Phone</div>
									<div class="detail-value">{{ profile.phone || "Not provided" }}</div>
								</div>
							</div>

							<div class="detail-card">
								<div class="detail-icon location-icon">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
										<circle cx="12" cy="10" r="3"></circle>
									</svg>
								</div>
								<div class="detail-content">
									<div class="detail-label">Location</div>
									<div class="detail-value">{{ formatAddress(profile) }}</div>
								</div>
							</div>

							<div class="detail-card">
								<div class="detail-icon country-icon">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="10"></circle>
										<path d="M8 12h8"></path>
										<path d="M12 8v8"></path>
									</svg>
								</div>
								<div class="detail-content">
									<div class="detail-label">Country</div>
									<div class="detail-value">{{ profile.country || profile.country_name || "Not specified" }}</div>
								</div>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="action-buttons">
							<button @click="goToProfilePage" class="action-btn primary-btn">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
									<circle cx="12" cy="7" r="4"></circle>
								</svg>
								<span>Edit Profile</span>
							</button>

							<button @click="goToSettings" class="action-btn secondary-btn">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="12" cy="12" r="3"></circle>
									<path d="M12 1v6"></path>
									<path d="M12 17v6"></path>
									<path d="m4.22 4.22 1.42 1.42"></path>
									<path d="m18.36 18.36 1.42 1.42"></path>
									<path d="M1 12h6"></path>
									<path d="M17 12h6"></path>
									<path d="m4.22 19.78 1.42-1.42"></path>
									<path d="m18.36 5.64 1.42-1.42"></path>
								</svg>
								<span>Settings</span>
							</button>
						</div>

						<!-- Logout Section -->
						<div class="logout-section">
							<button @click="logout" class="logout-btn">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
									<polyline points="16,17 21,12 16,7"></polyline>
									<line x1="21" y1="12" x2="9" y2="12"></line>
								</svg>
								<span>Sign Out</span>
							</button>
						</div>

						<!-- Debug Panel (Collapsible) -->
						<details class="debug-section">
							<summary class="debug-toggle">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
									<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
									<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
									<line x1="2" y1="2" x2="22" y2="22"></line>
								</svg>
								Debug Data
							</summary>
							<div class="debug-content">
								<pre class="debug-json">{{ JSON.stringify(profile, null, 2) }}</pre>
							</div>
						</details>
					</div>

					<!-- Empty State -->
					<div v-else class="empty-state">
						<div class="empty-icon">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</div>
						<p class="empty-text">No profile data available</p>
						<button @click="fetchProfile" class="empty-retry">Try Again</button>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "@/api/axios";
import { useAuthStore } from '@/stores/auth'
import { resolveUrl } from '@/utils/imageUrl'

const open = ref(false);
const loading = ref(false);
const error = ref(null);
const profile = ref(null);
const root = ref(null);
const router = useRouter();
const profileSource = ref(null);
const authStore = useAuthStore()

// Mock notification state (you can replace with real data)
const hasNotifications = ref(true);


const localName = computed(() => {
	const u = authStore.currentUser || authStore.user || null
	return u?.name || u?.full_name || u?.company_name || null
});

const avatarUrl = computed(() => {
	if (profile.value?.avatar) return resolveUrl(profile.value.avatar);
	const u = authStore.currentUser || authStore.user || null
	if (u?.avatar) return resolveUrl(u.avatar);
	return null;
});

const initials = computed(() => {
	const name = profile.value?.name || localName.value || "U";
	return name
		.split(" ")
		.map((n) => n[0]?.toUpperCase())
		.slice(0, 2)
		.join("");
});

async function tryEndpointsSequential(list) {
	for (const ep of list) {
		try {
			const res = await axios.get(ep);
			const payload = res?.data?.data ?? res?.data ?? res;
			return { payload, endpoint: ep };
		} catch (err) {
			continue;
		}
	}
	throw new Error("All endpoints failed");
}

async function fetchProfile() {
	loading.value = true;
	error.value = null;
	profile.value = null;
	profileSource.value = null;

	const stored = authStore.currentUser || authStore.user || null
	const role = stored?.role?.toString?.()?.toLowerCase?.() || null;

	const customerEndpoints = ["/customer/profile", "/customer/me"];
	const sellerEndpoints = ["/seller/profile", "/seller/me", "/seller"];

	const tryList =
		role === "seller"
			? [...sellerEndpoints, ...customerEndpoints]
			: [...customerEndpoints, ...sellerEndpoints];

	try {
		const { payload, endpoint } = await tryEndpointsSequential(tryList);
		profile.value = payload;
		profileSource.value = endpoint.startsWith("/seller") ? "seller" : "customer";
	} catch (err) {
		error.value =
			err?.response?.data?.message ||
			err?.message ||
			"Unable to load profile data";
		console.error("fetch profile error", err);
	} finally {
		loading.value = false;
	}
}

function toggle(event) {
	event.stopPropagation();
	open.value = !open.value;
	if (open.value) {
		fetchProfile();
	}
}

function onDocClick(e) {
	if (!root.value?.contains(e.target)) {
		open.value = false;
	}
}

function logout() {
	// Use the auth store logout which will clear in-memory auth and optionally
	// clear persisted storage if enabled in the store.
	authStore.logout()
	// Notify other parts of the app and navigate home.
	window.dispatchEvent(new Event("auth-changed"));
	window.location.href = "/";
}

function goToProfilePage() {
	open.value = false;
	const dest = profileSource.value === "seller" ? "/seller/profile" : "/customer/profile";
	router.push(dest).catch(() => {});
}

function goToSettings() {
	open.value = false;
	router.push("/settings").catch(() => {});
}

function formatRole(role) {
	if (!role) return "Customer";
	return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function formatAddress(obj) {
	const parts = [];
	if (obj?.city) parts.push(obj.city);
	if (obj?.country) parts.push(obj.country);
	return parts.join(", ") || "Location not set";
}

onMounted(() => {
	document.addEventListener("click", onDocClick);
});

onBeforeUnmount(() => {
	document.removeEventListener("click", onDocClick);
});
</script>

<style scoped>
	.avatar-dropdown {
		position: relative;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	/* Avatar Button */
	.avatar-button {
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
		outline: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.avatar-button:focus-visible {
		outline: 2px solid #8b5cf6;
		outline-offset: 4px;
		border-radius: 50%;
	}

	.avatar-container {
		position: relative;
		width: 44px;
		height: 44px;
	}

	/* Avatar Glow Effect */
	.avatar-glow {
		position: absolute;
		inset: -6px;
		background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
		border-radius: 50%;
		opacity: 0;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 0;
	}

	.avatar-button:hover .avatar-glow,
	.avatar-button:focus .avatar-glow {
		opacity: 0.6;
		animation: avatar-pulse 2s ease-in-out infinite;
	}

	@keyframes avatar-pulse {
		0%, 100% { transform: scale(1); opacity: 0.6; }
		50% { transform: scale(1.1); opacity: 0.8; }
	}

	/* Main Avatar */
	.avatar-main {
		position: relative;
		width: 44px;
		height: 44px;
		z-index: 1;
	}

	.avatar-image {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid white;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.avatar-button:hover .avatar-image {
		transform: scale(1.05);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
	}

	.avatar-fallback {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
		border: 3px solid white;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.avatar-button:hover .avatar-fallback {
		transform: scale(1.05);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
	}

	.avatar-initials {
		color: white;
		font-weight: 700;
		font-size: 0.875rem;
		z-index: 2;
		position: relative;
	}

	.avatar-pattern {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
		border-radius: 50%;
	}

	/* Status Indicators */
	.status-indicators {
		position: absolute;
		bottom: -2px;
		right: -2px;
		z-index: 2;
	}

	.status-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid white;
		position: relative;
	}

	.online-dot {
		background: #22c55e;
		box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
	}

	.status-pulse {
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: #22c55e;
		animation: status-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	@keyframes status-ping {
		75%, 100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	.notification-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 18px;
		height: 18px;
		background: linear-gradient(135deg, #ef4444, #dc2626);
		color: white;
		border-radius: 50%;
		border: 2px solid white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.625rem;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
		animation: notification-bounce 2s ease-in-out infinite;
	}

	@keyframes notification-bounce {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	/* Dropdown Panel */
	.dropdown-panel {
		position: absolute;
		top: calc(100% + 12px);
		right: 0;
		z-index: 50;
		min-width: 380px;
		max-width: 400px;
	}

	.dropdown-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	.dropdown-content {
		position: relative;
		z-index: 1;
		padding: 24px;
	}

	/* Loading State */
	.dropdown-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 32px 24px;
	}

	.loading-spinner {
		position: relative;
		width: 48px;
		height: 48px;
	}

	.spinner-ring {
		width: 48px;
		height: 48px;
		border: 3px solid #e5e7eb;
		border-top: 3px solid #8b5cf6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-text {
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Error State */
	.dropdown-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 24px;
		text-align: center;
	}

	.error-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, #fef2f2, #fee2e2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ef4444;
	}

	.error-text {
		color: #ef4444;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.retry-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.retry-button:hover {
		background: #e5e7eb;
		transform: translateY(-1px);
	}

	/* Profile Content */
	.profile-content {
		animation: content-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes content-slide-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Profile Header */
	.profile-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
		padding-bottom: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	.profile-avatar-large {
		position: relative;
		width: 64px;
		height: 64px;
		flex-shrink: 0;
	}

	.profile-image-large {
		width: 64px;
		height: 64px;
		border-radius: 18px;
		object-fit: cover;
		border: 3px solid white;
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
	}

	.profile-fallback-large {
		width: 64px;
		height: 64px;
		border-radius: 18px;
		background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
		border: 3px solid white;
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.profile-initials-large {
		color: white;
		font-weight: 800;
		font-size: 1.25rem;
		z-index: 2;
	}

	.profile-pattern-large {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
		border-radius: 18px;
	}

	.profile-status-large {
		position: absolute;
		bottom: 2px;
		right: 2px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #22c55e;
		border: 3px solid white;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-ring {
		position: absolute;
		inset: -3px;
		border: 2px solid #22c55e;
		border-radius: 50%;
		animation: status-ring-pulse 2s ease-in-out infinite;
	}

	.status-core {
		width: 8px;
		height: 8px;
		background: #22c55e;
		border-radius: 50%;
	}

	@keyframes status-ring-pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.4); opacity: 0; }
	}

	/* Profile Info */
	.profile-info {
		flex: 1;
		min-width: 0;
	}

	.profile-name {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 4px;
		background: linear-gradient(135deg, #1f2937, #374151);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.profile-email {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 8px;
		font-weight: 500;
	}

	.profile-role-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 16px;
		font-size: 0.75rem;
		font-weight: 600;
		color: #7c3aed;
	}

	.role-indicator {
		width: 6px;
		height: 6px;
		background: #7c3aed;
		border-radius: 50%;
		animation: role-pulse 2s ease-in-out infinite;
	}

	@keyframes role-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Profile Details Grid */
	.profile-details {
		display: grid;
		gap: 12px;
		margin-bottom: 20px;
	}

	.detail-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.04);
		border-radius: 12px;
		transition: all 0.2s ease;
	}

	.detail-card:hover {
		background: rgba(248, 250, 252, 1);
		transform: translateX(2px);
	}

	.detail-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.3s ease;
	}

	.phone-icon {
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
	}

	.location-icon {
		background: linear-gradient(135deg, #f59e0b, #d97706);
		color: white;
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
	}

	.country-icon {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		color: white;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.detail-card:hover .detail-icon {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	.detail-content {
		flex: 1;
		min-width: 0;
	}

	.detail-label {
		font-size: 0.75rem;
		color: #9ca3af;
		font-weight: 500;
		margin-bottom: 2px;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.detail-value {
		font-size: 0.875rem;
		color: #374151;
		font-weight: 600;
		line-height: 1.3;
		word-break: break-word;
	}

	/* Action Buttons */
	.action-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: none;
		position: relative;
		overflow: hidden;
	}

	.primary-btn {
		background: linear-gradient(135deg, #8b5cf6, #3b82f6);
		color: white;
		box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
	}

	.primary-btn::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #7c3aed, #2563eb);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.primary-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 24px rgba(139, 92, 246, 0.4);
	}

	.primary-btn:hover::before {
		opacity: 1;
	}

	.primary-btn span,
	.primary-btn svg {
		position: relative;
		z-index: 1;
	}

	.secondary-btn {
		background: rgba(248, 250, 252, 0.8);
		color: #6b7280;
		border: 1px solid rgba(0, 0, 0, 0.06);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
	}

	.secondary-btn:hover {
		background: rgba(243, 244, 246, 1);
		color: #374151;
		transform: translateY(-1px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
	}

	/* Logout Section */
	.logout-section {
		padding-top: 16px;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}

	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 12px 16px;
		background: linear-gradient(135deg, #fef2f2, #fee2e2);
		color: #dc2626;
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.logout-btn:hover {
		background: linear-gradient(135deg, #fee2e2, #fecaca);
		border-color: rgba(239, 68, 68, 0.3);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
	}

	/* Debug Section */
	.debug-section {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}

	.debug-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		color: #9ca3af;
		cursor: pointer;
		padding: 8px 0;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.debug-toggle:hover {
		color: #6b7280;
	}

	.debug-content {
		margin-top: 8px;
	}

	.debug-json {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 12px;
		font-size: 0.625rem;
		color: #64748b;
		white-space: pre-wrap;
		word-break: break-word;
		max-height: 120px;
		overflow-y: auto;
		line-height: 1.4;
		margin: 0;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 24px;
		text-align: center;
	}

	.empty-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
	}

	.empty-text {
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.empty-retry {
		padding: 8px 16px;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.empty-retry:hover {
		background: #e5e7eb;
	}

	/* Dropdown Animations */
	.dropdown-fade-enter-active {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.dropdown-fade-leave-active {
		transition: all 0.2s ease;
	}

	.dropdown-fade-enter-from {
		opacity: 0;
		transform: translateY(-8px) scale(0.95);
	}

	.dropdown-fade-leave-to {
		opacity: 0;
		transform: translateY(-4px) scale(0.98);
	}

	/* Responsive Design */
	@media (max-width: 480px) {
		.dropdown-panel {
			min-width: 320px;
			right: -12px;
		}

		.dropdown-content {
			padding: 20px;
		}

		.profile-header {
			flex-direction: column;
			text-align: center;
			gap: 12px;
		}

		.action-buttons {
			grid-template-columns: 1fr;
		}

		.detail-card {
			padding: 10px 12px;
		}
	}

	/* High-DPI Display Support */
	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
		.avatar-image,
		.profile-image-large {
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
		}
	}

	/* Dark Mode Support */
	@media (prefers-color-scheme: dark) {
		.dropdown-backdrop {
			background: rgba(15, 23, 42, 0.95);
			border-color: rgba(148, 163, 184, 0.1);
		}

		.profile-name {
			background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}

		.profile-email,
		.detail-value {
			color: #cbd5e1;
		}

		.detail-label {
			color: #94a3b8;
		}

		.detail-card {
			background: rgba(51, 65, 85, 0.6);
			border-color: rgba(148, 163, 184, 0.1);
		}

		.detail-card:hover {
			background: rgba(51, 65, 85, 0.8);
		}

		.secondary-btn {
			background: rgba(51, 65, 85, 0.8);
			color: #cbd5e1;
			border-color: rgba(148, 163, 184, 0.2);
		}

		.secondary-btn:hover {
			background: rgba(71, 85, 105, 0.8);
			color: #e2e8f0;
		}

		.logout-btn {
			background: linear-gradient(135deg, rgba(127, 29, 29, 0.2), rgba(153, 27, 27, 0.1));
			color: #f87171;
			border-color: rgba(239, 68, 68, 0.3);
		}

		.logout-btn:hover {
			background: linear-gradient(135deg, rgba(127, 29, 29, 0.3), rgba(153, 27, 27, 0.2));
			border-color: rgba(239, 68, 68, 0.4);
		}

		.debug-json {
			background: rgba(15, 23, 42, 0.8);
			border-color: rgba(148, 163, 184, 0.2);
			color: #94a3b8;
		}

		.loading-text,
		.empty-text {
			color: #94a3b8;
		}

		.retry-button,
		.empty-retry {
			background: rgba(51, 65, 85, 0.8);
			color: #cbd5e1;
			border-color: rgba(148, 163, 184, 0.2);
		}

		.retry-button:hover,
		.empty-retry:hover {
			background: rgba(71, 85, 105, 0.8);
		}
	}

	/* Advanced Animations */
	.avatar-button:active {
		transform: scale(0.95);
	}

	.action-btn:active {
		transform: scale(0.98);
	}

	/* Accessibility Improvements */
	.avatar-button:focus-visible {
		outline: 2px solid #8b5cf6;
		outline-offset: 2px;
	}

	.action-btn:focus-visible,
	.logout-btn:focus-visible {
		outline: 2px solid #8b5cf6;
		outline-offset: 2px;
	}

	/* Performance Optimizations */
	.avatar-container,
	.profile-avatar-large {
		will-change: transform;
	}

	.dropdown-panel {
		will-change: opacity, transform;
	}

	/* Smooth scrolling for debug content */
	.debug-json {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	.debug-json::-webkit-scrollbar {
		width: 4px;
	}

	.debug-json::-webkit-scrollbar-track {
		background: transparent;
	}

	.debug-json::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 2px;
	}

	.debug-json::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}

	/* Enhanced micro-interactions */
	.detail-icon {
		animation: icon-float 3s ease-in-out infinite;
	}

	.phone-icon {
		animation-delay: 0s;
	}

	.location-icon {
		animation-delay: 0.5s;
	}

	.country-icon {
		animation-delay: 1s;
	}

	@keyframes icon-float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-2px); }
	}

	/* Glassmorphism Enhancement */
	.dropdown-backdrop {
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(255, 255, 255, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	/* Loading Enhancement */
	.loading-spinner::after {
		content: '';
		position: absolute;
		inset: 8px;
		border: 2px solid transparent;
		border-top: 2px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1.5s linear infinite reverse;
	}

	/* Notification Badge Animation */
	.notification-badge {
		animation: notification-glow 2s ease-in-out infinite;
	}

	@keyframes notification-glow {
		0%, 100% { 
			box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
		}
		50% { 
			box-shadow: 0 6px 16px rgba(239, 68, 68, 0.6);
		}
	}

	/* Hover States for Better Feedback */
	.profile-header:hover .profile-avatar-large {
		transform: scale(1.02);
	}

	.profile-header:hover .profile-name {
		background: linear-gradient(135deg, #8b5cf6, #3b82f6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	/* Enhanced Focus States */
	.action-btn:focus-visible {
		outline: 2px solid #8b5cf6;
		outline-offset: 2px;
		transform: translateY(-1px);
	}

	/* Subtle Text Animations */
	.profile-name,
	.profile-email {
		transition: all 0.3s ease;
	}

	/* Enhanced Border Gradients */
	.detail-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
		border-radius: 12px;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.detail-card:hover::before {
		opacity: 1;
	}

	.detail-card {
		position: relative;
	}

	/* Professional Typography */
	.profile-name {
		letter-spacing: -0.025em;
		line-height: 1.2;
	}

	.profile-email {
		letter-spacing: 0.01em;
	}

	.detail-label {
		letter-spacing: 0.05em;
	}

	/* Premium Shadow System */
	.avatar-image,
	.avatar-fallback {
		box-shadow: 
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06),
			0 0 0 1px rgba(255, 255, 255, 0.8);
	}

	.profile-image-large,
	.profile-fallback-large {
		box-shadow: 
			0 10px 20px -4px rgba(0, 0, 0, 0.15),
			0 4px 6px -2px rgba(0, 0, 0, 0.1),
			0 0 0 1px rgba(255, 255, 255, 0.9);
	}

	/* Button Press Feedback */
	.action-btn:active {
		transform: scale(0.98) translateY(0);
	}

	.logout-btn:active {
		transform: scale(0.98) translateY(0);
	}

	/* Enhanced Transitions */
	* {
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>