import React, { useEffect, useRef } from "react";
import BaseModal from "../modal/BaseModal";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const UpdateSubjectModal = ({ isOpen, onClose, onUpdate, subject, setSubject, isReadOnly, onInfoClick }) => {
	const subjectNameInputRef = useRef(null);

	// Auto-focus Subject Name input when modal opens
	useEffect(() => {
		if (isOpen && subjectNameInputRef.current) {
			setTimeout(() => {
				subjectNameInputRef.current?.focus();
				subjectNameInputRef.current?.select();
			}, 100);
		}
	}, [isOpen]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setSubject((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onUpdate(e);
	};

	return (
		<BaseModal
			isOpen={isOpen}
			onClose={onClose}
			title="Update Subject"
			maxWidth="600px"
			className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white transition-colors duration-300"
			overlayClassName="backdrop-blur-sm"
		>
			<div className="p-6">
				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 gap-6">
						<div className="flex flex-col">
							<label
								htmlFor="modal-subjectName"
								className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
							>
								Subject Name
							</label>
							<input
								id="modal-subjectName"
								type="text"
								name="subjectName"
								ref={subjectNameInputRef}
								placeholder={isReadOnly ? "Read-only profile" : 'e.g. "Mathematics"'}
								value={subject.subjectName}
								onChange={handleInputChange}
								disabled={isReadOnly}
								required
								className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 text-sm transition-all duration-300 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-white/5"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label
									htmlFor="modal-grade"
									className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
								>
									Grade
									<button
										type="button"
										onClick={(e) => onInfoClick("grade", e)}
										className="bg-none border-none text-gray-400 dark:text-white/50 cursor-pointer text-xs p-1 rounded transition-all duration-300 inline-flex items-center justify-center hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
									>
										<InformationCircleIcon className="w-4 h-4" />
									</button>
								</label>
								<select
									id="modal-grade"
									name="grade"
									value={subject.grade}
									onChange={handleInputChange}
									disabled={isReadOnly}
									required
									className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 text-sm transition-all duration-300 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
								>
									<option value="" className="text-gray-900 dark:text-black dark:bg-white">
										Select Grade
									</option>
									<option value="10" className="text-gray-900 dark:text-black dark:bg-white">
										O (10)
									</option>
									<option value="9" className="text-gray-900 dark:text-black dark:bg-white">
										A+ (9)
									</option>
									<option value="8" className="text-gray-900 dark:text-black dark:bg-white">
										A (8)
									</option>
									<option value="7" className="text-gray-900 dark:text-black dark:bg-white">
										B+ (7)
									</option>
									<option value="6" className="text-gray-900 dark:text-black dark:bg-white">
										B (6)
									</option>
									<option value="5" className="text-gray-900 dark:text-black dark:bg-white">
										C (5)
									</option>
									<option value="4" className="text-gray-900 dark:text-black dark:bg-white">
										D (4)
									</option>
									<option value="0" className="text-gray-900 dark:text-black dark:bg-white">
										E - Reappear (0)
									</option>
									<option value="0" className="text-gray-900 dark:text-black dark:bg-white">
										F - Fail (0)
									</option>
									<option value="0" className="text-gray-900 dark:text-black dark:bg-white">
										G - Backlog (0)
									</option>
								</select>
							</div>

							<div className="flex flex-col">
								<label
									htmlFor="modal-credit"
									className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
								>
									Credits
									<button
										type="button"
										onClick={(e) => onInfoClick("ch", e)}
										className="bg-none border-none text-gray-400 dark:text-white/50 cursor-pointer text-xs p-1 rounded transition-all duration-300 inline-flex items-center justify-center hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
									>
										<InformationCircleIcon className="w-4 h-4" />
									</button>
								</label>
								<input
									id="modal-credit"
									type="number"
									name="credit"
									placeholder={isReadOnly ? "Read-only profile" : "Credits"}
									min="0"
									step="0.5"
									value={subject.credit}
									onChange={handleInputChange}
									disabled={isReadOnly}
									required
									className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 text-sm transition-all duration-300 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-white/5"
								/>
							</div>
						</div>

						<div className="flex justify-end pt-4">
							<button
								type="submit"
								disabled={isReadOnly}
								className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Update Subject
							</button>
						</div>
					</div>
				</form>
			</div>
		</BaseModal>
	);
};

export default UpdateSubjectModal;
