"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/firebase/AuthContext";
import { createGPAService, GPAProfile, GPASemester } from "@/firebase/gpaService";
import { useMessage } from "@/components/common/MessageProvider";

export const useGpaData = () => {
	const { currentUser } = useAuth();
	const { showMessage } = useMessage();

	// ===== STATE MANAGEMENT =====
	const [profiles, setProfiles] = useState<GPAProfile[]>([]);
	const [activeProfile, setActiveProfile] = useState<string | number | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [sharedProfiles, setSharedProfiles] = useState<unknown[]>([]);
	const [sharedWithMeProfiles, setSharedWithMeProfiles] = useState<GPAProfile[]>([]);
	const [mySharedProfiles, setMySharedProfiles] = useState<unknown[]>([]);

	const activeListeners = useRef<Record<string, () => void>>({}); // Track active subscriptions
	const isInitializingRef = useRef(false);
	const hasInitializedRef = useRef(false);

	// ===== SERVICE CREATION =====
	const gpaService = useMemo(() => {
		return currentUser ? createGPAService(currentUser.uid) : null;
	}, [currentUser]);

	// ===== COMPUTED VALUES =====
	const sortedProfiles = useMemo(() => {
		return [...profiles].sort((a, b) => {
			if (a.isDefault && !b.isDefault) return -1;
			if (!a.isDefault && b.isDefault) return 1;
			return (a.name || "").localeCompare(b.name || "");
		});
	}, [profiles]);

	const allProfiles = useMemo(() => {
		const combined = [...sortedProfiles, ...sharedWithMeProfiles];
		return combined.sort((a, b) => {
			// Own profiles first, then shared profiles
			if (!a.isShared && b.isShared) return -1;
			if (a.isShared && !b.isShared) return 1;

			// Within same category, sort by default then name
			if (a.isDefault && !b.isDefault) return -1;
			if (!a.isDefault && b.isDefault) return 1;
			return (a.name || "").localeCompare(b.name || "");
		});
	}, [sortedProfiles, sharedWithMeProfiles]);

	const currentProfile = allProfiles.find((p) => p.id === activeProfile) || allProfiles[0];
	const semesters = useMemo(() => currentProfile?.semesters || [], [currentProfile]);
	const isReadOnlyProfile = !!(currentProfile?.isShared && currentProfile?.permission === "read");

	// ===== UTILITY FUNCTIONS =====
	const generateProfileName = useCallback(() => {
		const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
		return `${userName} (Default)`;
	}, [currentUser]);

	// ===== CORE ACTIONS =====
	const saveProfile = useCallback(
		async (profileData: GPAProfile) => {
			if (!gpaService || !profileData) return;

			try {
				setSaving(true);

				// Use collaborative save if the profile is shared with edit permissions
				if (profileData.isShared && profileData.permission === "edit") {
					await gpaService.saveProfileWithCollaboration(profileData);
				} else {
					await gpaService.saveProfile(profileData);
				}
			} catch (error) {
				console.error("Error saving profile:", error);
				showMessage("Error saving data. Please try again.", "error");
			} finally {
				setSaving(false);
			}
		},
		[gpaService, showMessage]
	);

	const updateActiveProfile = useCallback((profileId: string | number) => {
		setActiveProfile(profileId);
		localStorage.setItem("activeGpaProfile", profileId.toString());
	}, []);

	const createProfile = useCallback(
		async (name: string) => {
			try {
				const newProfile: GPAProfile = {
					id: Date.now(),
					name: name,
					semesters: [
						{
							id: Date.now().toString(),
							name: "Semester 1",
							subjects: [],
						},
					],
					isDefault: false,
				};

				if (gpaService) {
					await gpaService.saveProfile(newProfile);

					// Switch to the new profile
					updateActiveProfile(newProfile.id);

					showMessage("Profile created successfully!", "success");
				}
			} catch (error) {
				console.error("Error creating profile:", error);
				showMessage("Error creating profile. Please try again.", "error");
			}
		},
		[gpaService, updateActiveProfile, showMessage]
	);

	const deleteProfile = useCallback(
		async (profileId: string | number) => {
			if (profiles.length <= 1) {
				showMessage("Cannot delete the last profile", "warning");
				return;
			}

			const profileToDelete = profiles.find((p) => p.id === profileId);
			if (!profileToDelete) {
				showMessage("Profile not found", "error");
				return;
			}

			if (profileToDelete.isDefault) {
				showMessage("Cannot delete the default profile", "warning");
				return;
			}

			try {
				if (gpaService) {
					await gpaService.deleteProfile(profileId);

					if (activeProfile === profileId) {
						const remainingProfiles = sortedProfiles.filter((profile) => profile.id !== profileId);
						updateActiveProfile(remainingProfiles[0].id);
					}

					showMessage("Profile deleted successfully", "success");
				}
			} catch (error) {
				console.error("Error deleting profile:", error);
				showMessage("Error deleting profile. Please try again.", "error");
			}
		},
		[profiles, sortedProfiles, activeProfile, updateActiveProfile, gpaService, showMessage]
	);

	// ===== SHARED ACTIONS =====
	const shareProfileWithUser = useCallback(
		async (profileToShare: GPAProfile, emailOrAction: string, permission: "read" | "edit" | "unshare", action: string = "share") => {
			if (!gpaService || !profileToShare) return;

			try {
				if (permission === "unshare") {
					const result = await gpaService.unshareProfileWithUser(emailOrAction);
					if (result.success) {
						showMessage("Profile unshared successfully", "success");
						const mySharedResult = await gpaService.getMySharedProfiles();
						if (mySharedResult.success) {
							setMySharedProfiles(mySharedResult.sharedProfiles);
						}
					} else {
						showMessage(result.error || "Error unsharing profile", "error");
					}
					return;
				}

				if (action === "updatePermission") {
					const result = await gpaService.updateSharePermission(emailOrAction, permission as "read" | "edit");
					if (result.success) {
						showMessage(
							`Permission updated to ${permission === "read" ? "Read Only" : "Edit Access"}`,
							"success"
						);
						const mySharedResult = await gpaService.getMySharedProfiles();
						if (mySharedResult.success) {
							setMySharedProfiles(mySharedResult.sharedProfiles);
						}
					} else {
						showMessage(result.error || "Error updating permission", "error");
						throw new Error(result.error);
					}
					return;
				}

				const result = await gpaService.shareProfileWithUser(profileToShare.id, emailOrAction, permission as "read" | "edit");

				if (result.success) {
					showMessage(`Profile shared with ${emailOrAction} (${permission} access)`, "success");

					const mySharedResult = await gpaService.getMySharedProfiles();
					if (mySharedResult.success) {
						setMySharedProfiles(mySharedResult.sharedProfiles);
					}
				} else {
					showMessage(result.error || "Error sharing profile", "error");
					throw new Error(result.error);
				}
			} catch (error) {
				console.error("Error in share operation:", error);
				showMessage("Error sharing profile. Please try again.", "error");
				throw error;
			}
		},
		[gpaService, showMessage]
	);

	const unshareProfile = useCallback(
		async (shareId: string) => {
			if (!gpaService) return;

			try {
				const result = await gpaService.unshareProfile(shareId);
				if (result.success) {
					showMessage("Profile unshared successfully", "success");
				} else {
					showMessage(result.error || "Error unsharing profile", "error");
				}
			} catch (error) {
				console.error("Error unsharing profile:", error);
				showMessage("Error unsharing profile. Please try again.", "error");
			}
		},
		[gpaService, showMessage]
	);

	const copySharedProfile = useCallback(
		async (shareId: string, profileName: string) => {
			if (!gpaService) return;

			try {
				const result = await gpaService.copySharedProfileToMyAccount(shareId, `Copy of ${profileName}`);

				if (result.success && result.profile) {
					showMessage("Profile copied to your account successfully!", "success");
					updateActiveProfile(result.profile.id);
				} else {
					showMessage(result.error || "Error copying profile", "error");
				}
			} catch (error) {
				console.error("Error copying shared profile:", error);
				showMessage("Error copying profile. Please try again.", "error");
			}
		},
		[gpaService, showMessage, updateActiveProfile]
	);

	const verifyUMS = useCallback(
		async (
			profileId: string | number,
			umsData: { semesters: GPASemester[]; studentInfo: unknown; allTermIds: unknown; fetchedAt?: string }
		) => {
			if (!gpaService || !umsData || !currentUser) return;

			try {
				setSaving(true);

				const currentProfileData = profiles.find((profile) => profile.id === profileId);
				if (!currentProfileData) {
					showMessage("Profile not found", "error");
					return;
				}

				const updatedProfile: GPAProfile = {
					...currentProfileData,
					name: currentProfileData.name,
					semesters: umsData.semesters,
					studentInfo: umsData.studentInfo,
					allTermIds: umsData.allTermIds,
					umsVerified: true,
					lastUMSSync: umsData.fetchedAt || new Date().toISOString(),
				};

				await saveProfile(updatedProfile);

				if (umsData.allTermIds) {
					const existingTermIds = JSON.parse(localStorage.getItem("umsTermIds") || "{}");
					const updatedTermIds = {
						...existingTermIds,
						[currentUser.uid]: {
							...umsData.allTermIds,
							lastUpdated: new Date().toISOString(),
							profileId: profileId,
						},
					};
					localStorage.setItem("umsTermIds", JSON.stringify(updatedTermIds));
				}

				showMessage("Profile successfully updated with UMS data!", "success");

				const updatedProfiles = profiles.map((profile) =>
					profile.id === profileId ? updatedProfile : profile
				);
				localStorage.setItem("gpaProfiles", JSON.stringify(updatedProfiles));
				setProfiles(updatedProfiles);
			} catch (error) {
				console.error("Error updating profile with UMS data:", error);
				showMessage("Error updating profile with UMS data. Please try again.", "error");
			} finally {
				setSaving(false);
			}
		},
		[gpaService, profiles, saveProfile, showMessage, currentUser]
	);

	// ===== DATA UPDATE ACTIONS =====
	const updateSemesters = useCallback(
		async (newSemesters: GPASemester[]) => {
			const currentProfileData = allProfiles.find((profile) => profile.id === activeProfile);

			if (currentProfileData) {
				const updatedProfile: GPAProfile = { ...currentProfileData, semesters: newSemesters };
				await saveProfile(updatedProfile);

				if (profiles.some((p) => p.id === activeProfile)) {
					const updatedProfiles = profiles.map((profile) =>
						profile.id === activeProfile ? updatedProfile : profile
					);
					localStorage.setItem("gpaProfiles", JSON.stringify(updatedProfiles));
					setProfiles(updatedProfiles);
				} else if (sharedWithMeProfiles.some((p) => p.id === activeProfile)) {
					setSharedWithMeProfiles((prev) =>
						prev.map((profile) =>
							profile.id === activeProfile ? { ...profile, semesters: newSemesters } : profile
						)
					);
				}
			}
		},
		[allProfiles, profiles, sharedWithMeProfiles, activeProfile, saveProfile]
	);

	// ===== INITIALIZATION & LISTENERS =====
	useEffect(() => {
		if (!gpaService || !currentUser || hasInitializedRef.current) return;

		if (isInitializingRef.current) return;

		setLoading(true);
		isInitializingRef.current = true;

		let profilesUnsubscribe: (() => void) | null = null;
		let sharedProfilesUnsubscribe: (() => void) | null = null;
		let cleanupCollaborativeListeners: (() => void) | null = null;

		const loadShares = async () => {
			try {
				const [sharedWithMeResult, mySharedResult] = await Promise.all([
					gpaService.getSharedWithMeProfiles(),
					gpaService.getMySharedProfiles(),
				]);

				if (sharedWithMeResult.success) {
					setSharedWithMeProfiles(sharedWithMeResult.sharedProfiles);
				}

				if (mySharedResult.success) {
					setMySharedProfiles(mySharedResult.sharedProfiles);
				}
			} catch (error) {
				console.error("Error loading shared profiles:", error);
			}
		};

		const initializeData = async () => {
			try {
				await gpaService.migrateFromLocalStorage();

				loadShares();

				const cleanupRealtime = setupRealtimeListeners();

				return cleanupRealtime;
			} catch (error) {
				console.error("Initialization error:", error);
				showMessage("Error loading your data. Please try again.", "error");
				setLoading(false);
			} finally {
				isInitializingRef.current = false;
				hasInitializedRef.current = true;
			}
		};

		const setupRealtimeListeners = () => {
			profilesUnsubscribe = gpaService.onProfilesChange(async (result) => {
				if (result.success) {
					const currentProfiles = result.profiles;

					if (currentProfiles.length === 0) {
						const defaultProfile: GPAProfile = {
							id: `default_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
							name: generateProfileName(),
							semesters: [
								{
									id: Date.now().toString(),
									name: "Semester 1",
									subjects: [],
								},
							],
							isDefault: true,
							createdAt: new Date(),
						};
						await gpaService.saveProfile(defaultProfile);
						return;
					}

					const cleanProfiles = currentProfiles
						.filter((profile, index, arr) => {
							return arr.findIndex((p) => p.name === profile.name) === index;
						})
						.map((profile) => {
							const profileWithId = { ...profile, id: profile.id.toString() };
							if (!profileWithId.semesters || profileWithId.semesters.length === 0) {
								profileWithId.semesters = [
									{
										id: Date.now().toString(),
										name: "Semester 1",
										subjects: [],
									},
								];
							}
							return profileWithId;
						});

					setProfiles(cleanProfiles);

					setActiveProfile((prev) => {
						const savedActiveProfile = localStorage.getItem("activeGpaProfile");

						if (savedActiveProfile && cleanProfiles.find((p) => p.id === savedActiveProfile)) {
							return savedActiveProfile;
						}

						if (prev && cleanProfiles.find((p) => p.id === prev)) {
							return prev;
						}

						if (!prev && cleanProfiles.length > 0) {
							const firstProfile = cleanProfiles[0];
							localStorage.setItem("activeGpaProfile", firstProfile.id.toString());
							return firstProfile.id;
						}

						return prev;
					});

					localStorage.setItem("gpaProfiles", JSON.stringify(cleanProfiles));
				} else if (result.error) {
					console.error("Error loading profiles:", result.error);
					showMessage("Error loading profiles. Please refresh.", "error");
				}
				setLoading(false);
			});

			sharedProfilesUnsubscribe = gpaService.onSharedProfilesChange((result) => {
				if (result.success) {
					setSharedProfiles(result.sharedProfiles);
				}
			});

			const incomingSharesUnsubscribe = gpaService.onIncomingSharesChange((result) => {
				if (result.success) {
					gpaService.getSharedWithMeProfiles().then((res) => {
						if (res.success) setSharedWithMeProfiles(res.sharedProfiles);
					});
				}
			});

			return () => {
				incomingSharesUnsubscribe?.();
			};
		};

		const savedActiveProfile = localStorage.getItem("activeGpaProfile");
		if (savedActiveProfile) {
			Promise.resolve().then(() => {
				setActiveProfile(savedActiveProfile);
			});
		}

		initializeData().then((cleanup) => {
			cleanupCollaborativeListeners = cleanup || null;
		});

		return () => {
			profilesUnsubscribe?.();
			sharedProfilesUnsubscribe?.();
			cleanupCollaborativeListeners?.();
		};
	}, [currentUser, gpaService, showMessage, generateProfileName]);

	// Collaborative Listeners Effect
	useEffect(() => {
		if (!currentUser || !gpaService) return;

		sharedWithMeProfiles.forEach((profile) => {
			if (profile.permission === "edit" && !activeListeners.current[profile.id]) {
				const ownerId = profile.ownerUserId || profile.userId || "";

				const unsubscribe = gpaService.onCollaborativeProfileChange(profile.id, ownerId, (result) => {
					if (result.success && result.profile) {
						const updatedProfile = result.profile;
						setSharedWithMeProfiles((prev) => {
							const index = prev.findIndex((p) => p.id === profile.id);
							if (index === -1) return prev;

							const oldProfile = prev[index];
							const updatedLastModifiedObj = updatedProfile.lastModified as { toMillis?: () => number } | null | undefined;
							const oldLastModifiedObj = oldProfile.lastModified as { toMillis?: () => number } | null | undefined;

							const newTime = updatedLastModifiedObj?.toMillis
								? updatedLastModifiedObj.toMillis()
								: updatedProfile.lastModified;
							const oldTime = oldLastModifiedObj?.toMillis
								? oldLastModifiedObj.toMillis()
								: oldProfile.lastModified;

							if (newTime && oldTime && newTime === oldTime) {
								return prev;
							}

							const newProfiles = [...prev];
							newProfiles[index] = {
								...updatedProfile,
								isShared: true,
								permission: "edit",
								ownerUserId: ownerId,
							};
							return newProfiles;
						});
					}
				});
				activeListeners.current[profile.id] = unsubscribe;
			}
		});

		const currentIds = new Set(sharedWithMeProfiles.map((p) => p.id));
		Object.keys(activeListeners.current).forEach((id) => {
			if (!currentIds.has(id)) {
				if (typeof activeListeners.current[id] === "function") {
					activeListeners.current[id]();
				}
				delete activeListeners.current[id];
			}
		});
	}, [sharedWithMeProfiles, currentUser, gpaService]);

	// Cleanup all listeners on unmount
	useEffect(() => {
		return () => {
			Object.values(activeListeners.current).forEach((unsub) => {
				if (typeof unsub === "function") unsub();
			});
			activeListeners.current = {};
		};
	}, []);

	useEffect(() => {
		const savedActiveProfile = localStorage.getItem("activeGpaProfile");
		if (savedActiveProfile && sharedWithMeProfiles.find((p) => p.id === savedActiveProfile)) {
			Promise.resolve().then(() => {
				setActiveProfile(savedActiveProfile);
			});
		}
	}, [sharedWithMeProfiles]);

	return {
		profiles,
		activeProfile,
		loading,
		saving,
		sharedProfiles,
		sharedWithMeProfiles,
		mySharedProfiles,
		allProfiles,
		currentProfile,
		semesters,
		isReadOnlyProfile,

		updateActiveProfile,
		createProfile,
		deleteProfile,
		updateSemesters,
		shareProfileWithUser,
		unshareProfile,
		copySharedProfile,
		verifyUMS,
	};
};
