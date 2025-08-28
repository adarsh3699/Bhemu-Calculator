import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import "../styles/gpaCalc.css";
import "react-responsive-modal/styles.css";

import { RenderModal, ProfileDrawer } from "../components/GpaCalculator";
import { LoginRecommendation, useMessage, ShareModal, ConfirmModal } from "../components/common";
import { useAuth } from "../firebase/AuthContext";
import { createGPAService } from "../firebase/gpaService";
import { InfoIcon, EditIcon, DeleteIcon, PlusIcon, CloseIcon, UserIcon } from "../assets/icons";

const GpaCalculator = () => {
	const { currentUser } = useAuth();
	const { showMessage } = useMessage();

	// ===== STATE MANAGEMENT =====
	const [profiles, setProfiles] = useState([]);
	const [activeProfile, setActiveProfile] = useState(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [sharedProfiles, setSharedProfiles] = useState([]);
	const [sharedWithMeProfiles, setSharedWithMeProfiles] = useState([]);
	const [mySharedProfiles, setMySharedProfiles] = useState([]);

	// Use ref to prevent race conditions - refs don't trigger re-renders
	const isInitializingRef = useRef(false);
	const hasInitializedRef = useRef(false);

	// Ref for Subject Name input to handle auto-focus
	const subjectNameInputRef = useRef(null);

	// Subject form state
	const [newSubject, setNewSubject] = useState({
		subjectName: "",
		grade: "",
		credit: "",
	});
	const [editIndex, setEditIndex] = useState(-1);
	const [activeSemester, setActiveSemester] = useState(null);

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState("");

	// Share modal state
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [profileToShare, setProfileToShare] = useState(null);

	// Semester delete confirmation state
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [semesterToDelete, setSemesterToDelete] = useState(null);

	// ===== SERVICES & COMPUTED VALUES =====
	const gpaService = useMemo(() => {
		return currentUser ? createGPAService(currentUser.uid) : null;
	}, [currentUser]);

	const sortedProfiles = useMemo(() => {
		return [...profiles].sort((a, b) => {
			if (a.isDefault && !b.isDefault) return -1;
			if (!a.isDefault && b.isDefault) return 1;
			return a.name.localeCompare(b.name);
		});
	}, [profiles]);

	// Combined profiles including shared profiles
	const allProfiles = useMemo(() => {
		const combined = [...sortedProfiles, ...sharedWithMeProfiles];
		return combined.sort((a, b) => {
			// Own profiles first, then shared profiles
			if (!a.isShared && b.isShared) return -1;
			if (a.isShared && !b.isShared) return 1;

			// Within same category, sort by default then name
			if (a.isDefault && !b.isDefault) return -1;
			if (!a.isDefault && b.isDefault) return 1;
			return a.name.localeCompare(b.name);
		});
	}, [sortedProfiles, sharedWithMeProfiles]);

	const currentProfile = allProfiles.find((p) => p.id === activeProfile) || allProfiles[0];
	const semesters = useMemo(() => currentProfile?.semesters || [], [currentProfile]);

	// Check if current profile is read-only
	const isReadOnlyProfile = currentProfile?.isShared && currentProfile?.permission === "read";

	// ===== UTILITY FUNCTIONS =====
	const generateProfileName = useCallback(() => {
		const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
		return `${userName} (Default)`;
	}, [currentUser]);

	const saveProfile = useCallback(
		async (profileData) => {
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

	const calculateGPA = useCallback((subjects) => {
		if (!subjects || subjects.length === 0) return "0.00";

		const totalPoints = subjects.reduce((acc, subject) => acc + subject.grade * subject.credit, 0);
		const totalCredits = subjects.reduce((acc, subject) => acc + subject.credit, 0);

		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
	}, []);

	const calculateCGPA = useCallback(() => {
		if (!semesters || semesters.length === 0) return "0.00";
		const allSubjects = semesters.flatMap((semester) => semester.subjects);
		return calculateGPA(allSubjects);
	}, [semesters, calculateGPA]);

	// ===== PROFILE MANAGEMENT =====
	const updateActiveProfile = useCallback((profileId) => {
		setActiveProfile(profileId);
		setDrawerOpen(false);
		localStorage.setItem("activeGpaProfile", profileId.toString());
	}, []);

	const createProfile = useCallback(
		async (name) => {
			try {
				const newProfile = {
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

					// Immediately switch to the new profile
					updateActiveProfile(newProfile.id);

					// Also update localStorage to ensure persistence
					localStorage.setItem("activeGpaProfile", newProfile.id.toString());

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
		async (profileId) => {
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

	// ===== ENHANCED SHARING FUNCTIONS =====
	const handleShareProfile = useCallback(
		(profileId) => {
			const profile = profiles.find((p) => p.id === profileId);
			if (profile) {
				setProfileToShare(profile);
				setIsShareModalOpen(true);
			}
		},
		[profiles]
	);

	const handleShareWithUser = useCallback(
		async (emailOrAction, permission, action = "share") => {
			if (!gpaService || !profileToShare) return;

			try {
				// Handle unshare action
				if (permission === "unshare") {
					const result = await gpaService.unshareProfileWithUser(emailOrAction);
					if (result.success) {
						showMessage("Profile unshared successfully", "success");
						// Refresh shared profiles list
						const mySharedResult = await gpaService.getMySharedProfiles();
						if (mySharedResult.success) {
							setMySharedProfiles(mySharedResult.sharedProfiles);
						}
					} else {
						showMessage(result.error || "Error unsharing profile", "error");
					}
					return;
				}

				// Handle permission update action
				if (action === "updatePermission") {
					const result = await gpaService.updateSharePermission(emailOrAction, permission);
					if (result.success) {
						showMessage(
							`Permission updated to ${permission === "read" ? "Read Only" : "Edit Access"}`,
							"success"
						);
						// Refresh shared profiles list
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

				// Handle share action
				const result = await gpaService.shareProfileWithUser(profileToShare.id, emailOrAction, permission);

				if (result.success) {
					showMessage(`Profile shared with ${emailOrAction} (${permission} access)`, "success");

					// Refresh shared profiles list
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
		[gpaService, profileToShare, showMessage]
	);

	const handleCopySharedProfile = useCallback(
		async (shareId, profileName) => {
			if (!gpaService) return;

			try {
				const result = await gpaService.copySharedProfileToMyAccount(shareId, `Copy of ${profileName}`);

				if (result.success) {
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

	// Legacy sharing functions for backward compatibility
	// shareProfile function removed as it was unused

	const unshareProfile = useCallback(
		async (shareId) => {
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

	// ===== SEMESTER MANAGEMENT =====
	const updateSemesters = useCallback(
		async (newSemesters) => {
			const currentProfileData = profiles.find((profile) => profile.id === activeProfile);
			if (currentProfileData) {
				const updatedProfile = { ...currentProfileData, semesters: newSemesters };
				await saveProfile(updatedProfile);

				const updatedProfiles = profiles.map((profile) =>
					profile.id === activeProfile ? updatedProfile : profile
				);
				localStorage.setItem("gpaProfiles", JSON.stringify(updatedProfiles));

				// Update the profiles state immediately to ensure new semester is available
				setProfiles(updatedProfiles);
			}
		},
		[profiles, activeProfile, saveProfile]
	);

	const addSemester = useCallback(async () => {
		const newSemester = {
			id: Date.now().toString(), // Convert to string for consistency
			name: `Semester ${semesters.length + 1}`,
			subjects: [],
		};
		await updateSemesters([...semesters, newSemester]);
		setActiveSemester(newSemester.id);
	}, [semesters, updateSemesters]);

	const deleteSemester = useCallback(
		(semesterId) => {
			const updatedSemesters = semesters.filter((semester) => semester.id !== semesterId);
			updateSemesters(updatedSemesters);
			if (activeSemester === semesterId) {
				setActiveSemester(
					updatedSemesters.length > 0 ? updatedSemesters[updatedSemesters.length - 1].id : null
				);
			}
		},
		[semesters, activeSemester, updateSemesters]
	);

	// Handle semester delete confirmation
	const handleDeleteSemesterClick = useCallback((semesterId, semesterName) => {
		setSemesterToDelete({ id: semesterId, name: semesterName });
		setShowDeleteConfirm(true);
	}, []);

	const handleConfirmDeleteSemester = useCallback(() => {
		if (semesterToDelete) {
			deleteSemester(semesterToDelete.id);
			setSemesterToDelete(null);
		}
		setShowDeleteConfirm(false);
	}, [semesterToDelete, deleteSemester]);

	const handleCancelDeleteSemester = useCallback(() => {
		setSemesterToDelete(null);
		setShowDeleteConfirm(false);
	}, []);

	// ===== SUBJECT MANAGEMENT =====
	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setNewSubject((prev) => ({ ...prev, [name]: value }));
	}, []);

	const addOrUpdateSubject = useCallback(
		(e) => {
			e.preventDefault();
			if (!activeSemester) return;

			const { subjectName, grade, credit } = newSubject;
			if (!subjectName || !grade || !credit) return;

			const subjectData = {
				id: editIndex === -1 ? Date.now() : editIndex,
				subjectName,
				grade: parseFloat(grade),
				credit: parseFloat(credit),
			};

			const updatedSemesters = semesters.map((semester) => {
				if (semester.id === activeSemester) {
					if (editIndex === -1) {
						return { ...semester, subjects: [...semester.subjects, subjectData] };
					} else {
						return {
							...semester,
							subjects: semester.subjects.map((subject) =>
								subject.id === editIndex ? subjectData : subject
							),
						};
					}
				}
				return semester;
			});

			updateSemesters(updatedSemesters);
			setNewSubject({ subjectName: "", grade: "", credit: "" });
			setEditIndex(-1);
		},
		[newSubject, semesters, activeSemester, editIndex, updateSemesters]
	);

	const editSubject = useCallback((semesterId, subject) => {
		setEditIndex(subject.id);
		setActiveSemester(semesterId);
		setNewSubject({
			subjectName: subject.subjectName,
			grade: subject.grade.toString(),
			credit: subject.credit.toString(),
		});
	}, []);

	const deleteSubject = useCallback(
		(semesterId, subjectId) => {
			const updatedSemesters = semesters.map((semester) => {
				if (semester.id === semesterId) {
					return {
						...semester,
						subjects: semester.subjects.filter((subject) => subject.id !== subjectId),
					};
				}
				return semester;
			});
			updateSemesters(updatedSemesters);
		},
		[semesters, updateSemesters]
	);

	// ===== UI HANDLERS =====
	const handleModalToggle = useCallback((type, event) => {
		event.stopPropagation();
		event.preventDefault();
		setModalType(type);
		setIsModalOpen(true);
	}, []);

	const handleModalClose = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const toggleDrawer = useCallback(() => {
		setDrawerOpen(!drawerOpen);
	}, [drawerOpen]);

	// ===== INITIALIZATION =====
	useEffect(() => {
		if (!gpaService || !currentUser || hasInitializedRef.current) return;

		// Check if we're already initializing
		if (isInitializingRef.current) {
			console.log("Initialization already in progress, skipping...");
			return;
		}

		setLoading(true);
		isInitializingRef.current = true; // Set flag immediately to prevent re-runs

		let profilesUnsubscribe = null;
		let sharedProfilesUnsubscribe = null;
		let cleanupCollaborativeListeners = null;

		const cleanupDuplicateProfiles = async () => {
			try {
				console.log("Checking for duplicate profiles to clean up...");
				const profilesResult = await gpaService.getProfiles();

				if (!profilesResult.success || profilesResult.profiles.length <= 1) {
					console.log("No duplicates found or cleanup not needed");
					return;
				}

				// Find profiles with same name pattern (Default profiles)
				const defaultProfiles = profilesResult.profiles.filter(
					(p) => p.name.includes("(Default)") || p.isDefault
				);

				if (defaultProfiles.length > 1) {
					console.log(`Found ${defaultProfiles.length} default profiles, cleaning up...`);

					// Keep the first one, delete the rest
					for (let i = 1; i < defaultProfiles.length; i++) {
						const profileToDelete = defaultProfiles[i];
						console.log(
							`Deleting duplicate default profile: ${profileToDelete.name} (${profileToDelete.id})`
						);
						await gpaService.deleteProfile(profileToDelete.id);
					}

					// Wait a moment for deletion to complete
					await new Promise((resolve) => setTimeout(resolve, 500));

					showMessage("Cleaned up duplicate profiles", "info");
				}
			} catch (error) {
				console.error("Error cleaning up duplicates:", error);
				// Don't throw error - allow initialization to continue
			}
		};

		const initializeData = async () => {
			try {
				// Step 1: Clean up any existing duplicate profiles first
				await cleanupDuplicateProfiles();

				// Step 2: Migrate from localStorage if needed
				const migrationResult = await gpaService.migrateFromLocalStorage();
				console.log("Migration completed:", migrationResult.success);

				// Step 3: Wait for migration to complete
				await new Promise((resolve) => setTimeout(resolve, 300));

				// Step 4: Get current profiles with retry logic
				let profilesResult;
				let retryCount = 0;
				const maxRetries = 3;

				do {
					profilesResult = await gpaService.getProfiles();
					if (profilesResult.success) break;

					retryCount++;
					console.log(`Retry ${retryCount}/${maxRetries} for getting profiles`);
					await new Promise((resolve) => setTimeout(resolve, 200));
				} while (retryCount < maxRetries);

				if (!profilesResult.success) {
					throw new Error("Failed to get profiles after multiple retries");
				}

				console.log("Current profiles in database:", profilesResult.profiles?.length || 0);

				// Step 5: Check if profiles exist and create default if needed
				if (profilesResult.profiles.length === 0) {
					console.log("No profiles found, creating SINGLE default profile");

					// Additional check: query database one more time to be absolutely sure
					const doubleCheckResult = await gpaService.getProfiles();
					if (doubleCheckResult.success && doubleCheckResult.profiles.length > 0) {
						console.log("Profiles found on double-check, skipping creation");
						return;
					}

					// Create default profile with unique timestamp
					const defaultProfile = {
						id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
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

					const saveResult = await gpaService.saveProfile(defaultProfile);
					if (saveResult.success) {
						console.log("Default profile created successfully:", defaultProfile.id);
						showMessage("Welcome! Created your first profile.", "success");
					} else {
						console.error("Failed to create default profile:", saveResult.error);
						throw new Error("Failed to create default profile");
					}
				} else {
					console.log(`Found ${profilesResult.profiles.length} existing profiles`);

					// Check for duplicates and clean them up
					const duplicateNames = profilesResult.profiles
						.map((p) => p.name)
						.filter((name, index, arr) => arr.indexOf(name) !== index);

					if (duplicateNames.length > 0) {
						console.log("Found duplicate profile names, cleaning up:", duplicateNames);

						for (const duplicateName of [...new Set(duplicateNames)]) {
							const profilesWithSameName = profilesResult.profiles.filter(
								(p) => p.name === duplicateName
							);
							// Keep the first one, delete the rest
							for (let i = 1; i < profilesWithSameName.length; i++) {
								console.log(
									`Deleting duplicate profile: ${profilesWithSameName[i].name} (${profilesWithSameName[i].id})`
								);
								await gpaService.deleteProfile(profilesWithSameName[i].id);
							}
						}
					}

					// Ensure at least one profile is marked as default
					const remainingProfiles = await gpaService.getProfiles();
					if (remainingProfiles.success && remainingProfiles.profiles.length > 0) {
						const hasDefault = remainingProfiles.profiles.some((p) => p.isDefault);
						if (!hasDefault) {
							console.log("No default profile found, marking first as default");
							const firstProfile = remainingProfiles.profiles[0];
							await gpaService.saveProfile({ ...firstProfile, isDefault: true });
						}
					}
				}

				// Step 6: Load shared profiles
				await loadSharedWithMeProfiles();
				await loadMySharedProfiles();

				// Step 7: Set up real-time listeners
				const cleanupCollaborativeListeners = setupRealtimeListeners();

				console.log("Initialization completed successfully");

				// Store cleanup function for collaborative listeners
				return cleanupCollaborativeListeners;
			} catch (error) {
				console.error("Initialization error:", error);
				showMessage("Error loading your data. Please try again.", "error");
				setLoading(false);
			} finally {
				// Reset initialization flag and mark as complete
				isInitializingRef.current = false;
				hasInitializedRef.current = true;
			}
		};

		const setupRealtimeListeners = () => {
			// Profiles listener
			profilesUnsubscribe = gpaService.onProfilesChange((result) => {
				if (result.success && result.profiles.length > 0) {
					console.log("Profiles updated:", result.profiles.length);

					// Clean profiles (remove any remaining duplicates)
					const cleanProfiles = result.profiles
						.filter((profile, index, arr) => {
							// Remove duplicates by name - keep first occurrence
							return arr.findIndex((p) => p.name === profile.name) === index;
						})
						.map((profile) => {
							// Ensure all profiles have at least one semester
							const profileWithId = { ...profile, id: profile.id.toString() };
							if (!profileWithId.semesters || profileWithId.semesters.length === 0) {
								profileWithId.semesters = [
									{
										id: Date.now().toString(),
										name: "Semester 1",
										subjects: [],
									},
								];
								// Save the updated profile to the database
								gpaService.saveProfile(profileWithId);
							}
							return profileWithId;
						});

					if (cleanProfiles.length !== result.profiles.length) {
						console.log(
							`Filtered ${result.profiles.length - cleanProfiles.length} duplicate profiles from UI`
						);
					}

					setProfiles(cleanProfiles);

					// Smart profile restoration - check localStorage and current state
					setActiveProfile((prev) => {
						const savedActiveProfile = localStorage.getItem("activeGpaProfile");

						// If there's a saved profile that exists in user's profiles, use it
						if (savedActiveProfile && cleanProfiles.find((p) => p.id === savedActiveProfile)) {
							return savedActiveProfile;
						}

						// If current active profile exists in user's profiles, keep it
						if (prev && cleanProfiles.find((p) => p.id === prev)) {
							return prev;
						}

						// Only set to first profile if no active profile exists
						if (!prev && cleanProfiles.length > 0) {
							const firstProfile = cleanProfiles[0];
							localStorage.setItem("activeGpaProfile", firstProfile.id);
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

			// Legacy shared profiles listener (for backward compatibility)
			sharedProfilesUnsubscribe = gpaService.onSharedProfilesChange((result) => {
				if (result.success) {
					setSharedProfiles(result.sharedProfiles);
				}
			});

			// Enhanced sharing listeners
			const incomingSharesUnsubscribe = gpaService.onIncomingSharesChange((result) => {
				if (result.success) {
					console.log("Incoming shares updated:", result.shares.length);
					loadSharedWithMeProfiles();
				}
			});

			// Add collaborative profile listeners for active shared profiles
			const collaborativeListeners = [];
			sharedWithMeProfiles.forEach((profile) => {
				if (profile.permission === "edit") {
					const unsubscribe = gpaService.onCollaborativeProfileChange(profile.id, (result) => {
						if (result.success) {
							// Update the specific profile in the shared profiles list
							setSharedWithMeProfiles((prev) =>
								prev.map((p) =>
									p.id === profile.id ? { ...result.profile, isShared: true, permission: "edit" } : p
								)
							);
						}
					});
					collaborativeListeners.push(unsubscribe);
				}
			});

			// Return cleanup function
			return () => {
				incomingSharesUnsubscribe?.();
				collaborativeListeners.forEach((unsubscribe) => unsubscribe?.());
			};
		};

		const loadSharedWithMeProfiles = async () => {
			try {
				const result = await gpaService.getSharedWithMeProfiles();
				if (result.success) {
					console.log("Shared with me profiles loaded:", result.sharedProfiles.length);
					setSharedWithMeProfiles(result.sharedProfiles);
				}
			} catch (error) {
				console.error("Error loading shared profiles:", error);
			}
		};

		const loadMySharedProfiles = async () => {
			try {
				const result = await gpaService.getMySharedProfiles();
				if (result.success) {
					console.log("My shared profiles loaded:", result.sharedProfiles.length);
					setMySharedProfiles(result.sharedProfiles);
				}
			} catch (error) {
				console.error("Error loading my shared profiles:", error);
			}
		};

		// Load active profile from localStorage
		const savedActiveProfile = localStorage.getItem("activeGpaProfile");
		if (savedActiveProfile) {
			setActiveProfile(savedActiveProfile);
		}

		initializeData().then((cleanup) => {
			cleanupCollaborativeListeners = cleanup;
		});

		return () => {
			profilesUnsubscribe?.();
			sharedProfilesUnsubscribe?.();
			cleanupCollaborativeListeners?.();
		};
	}, [currentUser, gpaService, showMessage, generateProfileName, sharedWithMeProfiles]);

	// Restore active profile when shared profiles are loaded
	useEffect(() => {
		const savedActiveProfile = localStorage.getItem("activeGpaProfile");
		if (savedActiveProfile && sharedWithMeProfiles.find((p) => p.id === savedActiveProfile)) {
			setActiveProfile(savedActiveProfile);
		}
	}, [sharedWithMeProfiles]);

	// Set initial active semester - always select the last semester
	useEffect(() => {
		if (semesters.length > 0) {
			const lastSemester = semesters[semesters.length - 1];
			// If no active semester or current active semester doesn't exist in current semesters
			if (!activeSemester || !semesters.find((s) => s.id === activeSemester)) {
				setActiveSemester(lastSemester.id);
			}
		}
	}, [semesters, activeSemester]);

	// Always select the last semester when profile changes
	useEffect(() => {
		if (semesters.length > 0) {
			const lastSemester = semesters[semesters.length - 1];
			setActiveSemester(lastSemester.id);
		}
	}, [currentProfile?.id, semesters]);

	// Auto-focus Subject Name input when editing a subject
	useEffect(() => {
		if (editIndex !== -1 && subjectNameInputRef.current) {
			// Use setTimeout to ensure the DOM is updated and input is rendered
			setTimeout(() => {
				subjectNameInputRef.current?.focus();
				subjectNameInputRef.current?.select(); // Also select the text for better UX
			}, 100);
		}
	}, [editIndex]);

	// ===== RENDER =====
	if (!currentUser) {
		return <LoginRecommendation feature="GPA Calculator" />;
	}

	if (loading) {
		return (
			<div className="gpa-loading">
				<div className="loading-spinner"></div>
				<p>Loading your GPA data...</p>
			</div>
		);
	}

	return (
		<div>
			<ProfileDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				profiles={allProfiles}
				currentProfile={activeProfile}
				onProfileSelect={updateActiveProfile}
				onCreateProfile={createProfile}
				onDeleteProfile={deleteProfile}
				onShareProfile={handleShareProfile}
				onUnshareProfile={unshareProfile}
				onCopySharedProfile={handleCopySharedProfile}
				sharedProfiles={sharedProfiles}
				mySharedProfiles={mySharedProfiles}
				isLoading={saving}
			/>

			<ShareModal
				isOpen={isShareModalOpen}
				onClose={() => {
					setIsShareModalOpen(false);
					setTimeout(() => {
						setProfileToShare(null);
					}, 300);
				}}
				onShareWithUser={handleShareWithUser}
				profileName={profileToShare?.name}
				currentShares={mySharedProfiles.filter((share) => share.profileId === profileToShare?.id)}
			/>

			<div id="GpaCalculator">
				{/* Header */}
				<div className="header">
					<h1>GPA Calculator</h1>
					<p className="subtitle">Calculate your semester GPA and cumulative GPA</p>
				</div>

				{/* Profile Selection */}
				<div className="profile-selection">
					<div className="profile-selector" onClick={toggleDrawer}>
						<UserIcon />
						<span className="profile-text">{currentProfile?.name}</span>
					</div>
				</div>

				{/* CGPA Display */}
				<div className="cgpa-display">
					<div className="cgpa-circle">
						<div className="cgpa-value">{calculateCGPA()}</div>
						<div className="cgpa-label">Cumulative GPA</div>
					</div>
					<div className="cgpa-stats">
						<div className="stat">
							<span className="stat-value">{semesters.length}</span>
							<span className="stat-label">Semesters</span>
						</div>
						<div className="stat">
							<span className="stat-value">
								{semesters.reduce((acc, semester) => acc + semester.subjects.length, 0)}
							</span>
							<span className="stat-label">Total Subjects</span>
						</div>
						<div className="stat">
							<span className="stat-value">
								{semesters.reduce(
									(acc, semester) =>
										acc + semester.subjects.reduce((subAcc, subject) => subAcc + subject.credit, 0),
									0
								)}
							</span>
							<span className="stat-label">Total Credits</span>
						</div>
					</div>
				</div>

				{/* Save Status */}
				{saving && (
					<div className="save-status">
						<div className="save-indicator">
							<div className="save-spinner"></div>
							<span>Saving...</span>
						</div>
					</div>
				)}

				{/* Semester Management */}
				<div className="semester-management">
					<div className="semester-header">
						<h2>{isReadOnlyProfile ? "View Semesters" : "Manage Semesters"}</h2>
						<button className="add-semester-btn" onClick={addSemester} disabled={isReadOnlyProfile}>
							<PlusIcon />
							{isReadOnlyProfile ? "Read-Only Profile" : "Add Semester"}
						</button>
					</div>

					{/* Semester Tabs */}
					{semesters.length > 0 && (
						<div className="semester-tabs">
							{semesters.map((semester) => (
								<div
									key={semester.id}
									className={`semester-tab ${activeSemester === semester.id ? "active" : ""}`}
									onClick={() => setActiveSemester(semester.id)}
								>
									<span className="semester-name">{semester.name}</span>
									<span className="semester-gpa">GPA: {calculateGPA(semester.subjects)}</span>
									<button
										className="delete-semester-btn"
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteSemesterClick(semester.id, semester.name);
										}}
										disabled={isReadOnlyProfile}
										title={isReadOnlyProfile ? "Read-only profile" : "Delete semester"}
									>
										<CloseIcon />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Subject Form */}
				{semesters.length > 0 && activeSemester && (
					<div className="subject-form-container">
						<h3>
							{isReadOnlyProfile ? "View Subjects in " : "Add Subject to "}
							{semesters.find((s) => s.id === activeSemester)?.name}
							{isReadOnlyProfile && <span className="read-only-badge">Read-Only</span>}
						</h3>
						<form className="subject-form" onSubmit={addOrUpdateSubject}>
							<div className="form-row">
								<div className="form-group">
									<label htmlFor="subjectName">Subject Name</label>
									<input
										id="subjectName"
										type="text"
										name="subjectName"
										ref={subjectNameInputRef}
										placeholder={isReadOnlyProfile ? "Read-only profile" : 'e.g. "Mathematics"'}
										value={newSubject.subjectName}
										onChange={handleInputChange}
										disabled={isReadOnlyProfile}
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="grade">
										Grade
										<InfoIcon onClick={(e) => handleModalToggle("grade", e)} />
									</label>
									<select
										id="grade"
										name="grade"
										value={newSubject.grade}
										onChange={handleInputChange}
										disabled={isReadOnlyProfile}
										required
									>
										<option value="">Select Grade</option>
										<option value="10">O (10)</option>
										<option value="9">A+ (9)</option>
										<option value="8">A (8)</option>
										<option value="7">B+ (7)</option>
										<option value="6">B (6)</option>
										<option value="5">C (5)</option>
										<option value="4">D (4)</option>
										<option value="0">E - Reappear (0)</option>
										<option value="0">F - Fail (0)</option>
										<option value="0">G - Backlog (0)</option>
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="credit">
										Credits
										<InfoIcon onClick={(e) => handleModalToggle("ch", e)} />
									</label>
									<input
										id="credit"
										type="number"
										name="credit"
										placeholder={isReadOnlyProfile ? "Read-only profile" : "Credits"}
										min="0"
										step="0.5"
										value={newSubject.credit}
										onChange={handleInputChange}
										disabled={isReadOnlyProfile}
										required
									/>
								</div>

								<div className="form-group">
									<button type="submit" className="submit-btn" disabled={isReadOnlyProfile}>
										{editIndex === -1 ? "Add Subject" : "Update"}
									</button>
								</div>
							</div>
						</form>
					</div>
				)}

				{/* Semester Content */}
				{semesters.length > 0 ? (
					<div className="semesters-container">
						{semesters.map((semester) => (
							<div
								key={semester.id}
								className={`semester-card ${activeSemester === semester.id ? "active" : ""}`}
								style={{ display: activeSemester === semester.id ? "block" : "none" }}
							>
								<div className="semester-card-header">
									<div className="semester-info">
										<h3>{semester.name}</h3>
										<div className="semester-meta">
											<span className="subject-count">{semester.subjects.length} subjects</span>
											<span className="total-credits">
												{semester.subjects.reduce((acc, subject) => acc + subject.credit, 0)}{" "}
												credits
											</span>
										</div>
									</div>
									<div className="semester-gpa-display">
										<div className="gpa-number">{calculateGPA(semester.subjects)}</div>
										<div className="gpa-label">Semester GPA</div>
									</div>
								</div>

								{semester.subjects.length > 0 ? (
									<div className="subjects-grid">
										{semester.subjects.map((subject) => (
											<div key={subject.id} className="subject-card">
												<div className="subject-header">
													<h4 className="subject-name">{subject.subjectName}</h4>
													<div className="subject-actions">
														<button
															className="edit-btn"
															onClick={() => editSubject(semester.id, subject)}
															disabled={isReadOnlyProfile}
															title={
																isReadOnlyProfile ? "Read-only profile" : "Edit subject"
															}
														>
															<EditIcon />
														</button>
														<button
															className="delete-btn"
															onClick={() => deleteSubject(semester.id, subject.id)}
															disabled={isReadOnlyProfile}
															title={
																isReadOnlyProfile
																	? "Read-only profile"
																	: "Delete subject"
															}
														>
															<DeleteIcon />
														</button>
													</div>
												</div>
												<div className="subject-details">
													<div className="detail-item">
														<span className="detail-label">Grade:</span>
														<span className="detail-value grade-value">
															{subject.grade}
														</span>
													</div>
													<div className="detail-item">
														<span className="detail-label">Credits:</span>
														<span className="detail-value">{subject.credit}</span>
													</div>
													<div className="detail-item">
														<span className="detail-label">Points:</span>
														<span className="detail-value">
															{(subject.grade * subject.credit).toFixed(2)}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="no-subjects">
										<h3>No subjects added yet</h3>
										<p>Add your first subject above!</p>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="no-semesters">
						<h3>No semesters added yet</h3>
						<p>Click "Add Semester" to get started with your GPA calculation!</p>
					</div>
				)}

				<RenderModal modalType={modalType} isModalOpen={isModalOpen} onClose={handleModalClose} />

				<ConfirmModal
					isOpen={showDeleteConfirm}
					onClose={handleCancelDeleteSemester}
					onConfirm={handleConfirmDeleteSemester}
					title="Delete Semester"
					message={
						semesterToDelete
							? `Are you sure you want to delete "${semesterToDelete.name}"? This action cannot be undone and will permanently remove all subjects in this semester.`
							: "Are you sure you want to delete this semester?"
					}
					confirmText="Delete"
					cancelText="Cancel"
					type="danger"
				/>
			</div>
		</div>
	);
};

export default GpaCalculator;
