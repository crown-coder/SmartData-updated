import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import AlertBox from './AlertBox';

const FormField = ({ label, name, value, onChange, placeholder, error, type = 'text', required = true, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 rounded-lg border text-gray-600 text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
            required={required}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const CameraModal = ({ onCapture, onCancel, videoRef, canvasRef }) => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded-xl max-w-md w-full">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center mt-4 space-x-4">
                <button
                    type="button"
                    onClick={onCapture}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Capture
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

const KycModal = ({ onSuccess, onClose, cardTypeId }) => {
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    const [fieldRequirements, setFieldRequirements] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [selfieImage, setSelfieImage] = useState(null);
    const [selfiePreview, setSelfiePreview] = useState('');
    const [frontIdImage, setFrontIdImage] = useState(null);
    const [frontIdPreview, setFrontIdPreview] = useState('');
    const [backIdImage, setBackIdImage] = useState(null);
    const [backIdPreview, setBackIdPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraType, setCameraType] = useState('selfie');
    const xsrfToken = Cookies.get('XSRF-TOKEN');

    // Debug cardTypeId value
    useEffect(() => {
        console.log("Current cardTypeId:", cardTypeId);
    }, [cardTypeId]);

    // Fetch field requirements for the card type
    useEffect(() => {
        let isMounted = true;

        const fetchFieldRequirements = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/card-types/${cardTypeId}/fields`, {
                    headers: {
                        'X-XSRF-TOKEN': xsrfToken,
                    },
                    withCredentials: true,
                });

                if (isMounted) {
                    setFieldRequirements(response.data.data);

                    // Initialize form data only if empty
                    if (Object.keys(formData).length === 0) {
                        const initialData = {};
                        const requirements = response.data.data.required_fields;

                        Object.keys(requirements).forEach(field => {
                            if (!['selfie_image', 'front_card', 'back_card', 'passport_image'].includes(field)) {
                                initialData[field] = '';
                            }
                        });

                        // Set default ID type if required
                        if (requirements.id_type && requirements.id_type.includes('required')) {
                            if (requirements.id_type.includes('bvn')) {
                                initialData.id_type = 'bvn';
                            } else if (requirements.id_type.includes('nin')) {
                                initialData.id_type = 'nin';
                            } else if (requirements.id_type.includes('passport')) {
                                initialData.id_type = 'passport';
                            }
                        }

                        setFormData(initialData);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching field requirements:", error);
                    setAlert({
                        show: true,
                        message: "Failed to load form requirements. Please try again.",
                        type: "error"
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (cardTypeId) {
            fetchFieldRequirements();
        }

        return () => {
            isMounted = false;
        };
    }, [cardTypeId]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'selfie') {
                    setSelfiePreview(reader.result);
                    setSelfieImage(file);
                    if (errors.selfie) setErrors(prev => ({ ...prev, selfie: '' }));
                } else if (type === 'frontId') {
                    setFrontIdPreview(reader.result);
                    setFrontIdImage(file);
                    if (errors.frontId) setErrors(prev => ({ ...prev, frontId: '' }));
                } else if (type === 'backId') {
                    setBackIdPreview(reader.result);
                    setBackIdImage(file);
                    if (errors.backId) setErrors(prev => ({ ...prev, backId: '' }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async (type) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
            setCameraType(type);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setAlert({
                show: true,
                message: "Could not access camera. Please upload an image instead.",
                type: "error"
            });
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        canvas.toBlob((blob) => {
            if (!blob) return;

            const file = new File([blob], `${cameraType}.jpg`, { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onloadend = () => {
                if (cameraType === 'selfie') {
                    setSelfieImage(file);
                    setSelfiePreview(reader.result);
                    if (errors.selfie) setErrors(prev => ({ ...prev, selfie: '' }));
                } else if (cameraType === 'frontId') {
                    setFrontIdImage(file);
                    setFrontIdPreview(reader.result);
                    if (errors.frontId) setErrors(prev => ({ ...prev, frontId: '' }));
                } else if (cameraType === 'backId') {
                    setBackIdImage(file);
                    setBackIdPreview(reader.result);
                    if (errors.backId) setErrors(prev => ({ ...prev, backId: '' }));
                }
            };
            reader.readAsDataURL(canvas.toDataURL('image/jpeg'));
            stopCamera();
        }, 'image/jpeg', 0.9);
    };

    const validateForm = () => {
        const newErrors = {};

        // 1. Validate cardTypeId from props
        if (!cardTypeId) {
            newErrors.card_type_id = "Card type selection is required";
            return newErrors; // Early return since other validations depend on this
        }

        // 2. Validate other fields only if we have requirements
        if (!fieldRequirements) {
            newErrors.form = "Form requirements not loaded";
            return newErrors;
        }

        const requirements = fieldRequirements.required_fields;

        // 3. Validate all other fields
        Object.entries(requirements).forEach(([field, requirement]) => {
            if (requirement.includes('required')) {
                // File fields
                if (field === 'selfie_image' && !selfieImage) {
                    newErrors.selfie = 'Selfie image is required';
                }
                else if (field === 'front_card' && !frontIdImage) {
                    newErrors.frontId = 'Front of ID is required';
                }
                else if (field === 'back_card' && !backIdImage) {
                    newErrors.backId = 'Back of ID is required';
                }
                // Other fields
                else if (!['selfie_image', 'front_card', 'back_card'].includes(field)) {
                    if (!formData[field]) {
                        newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
                    }
                }
            }
        });

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🚀 Form submission started");

        // Debug 1: Check if function is being called
        console.log("✅ Submit handler is executing");

        // Debug 2: Verify cardTypeId exists
        console.log("🔍 Current cardTypeId:", cardTypeId);
        if (!cardTypeId) {
            console.error("❌ Missing cardTypeId - validation will fail");
            setErrors({ card_type_id: "Card type is required" });
            return;
        }

        // Debug 3: Validate form
        const formErrors = validateForm();
        console.log("📋 Validation errors:", formErrors);

        if (Object.keys(formErrors).length > 0) {
            console.error("⛔ Validation failed - preventing submission");
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        console.log("🔄 Preparing FormData for submission");

        try {
            const formDataToSend = new FormData();

            // Debug 4: FormData Construction Start
            console.group("📦 FormData Construction");

            // 1. Add card_type_id
            formDataToSend.append('card_type_id', cardTypeId);
            console.log("➕ Added card_type_id:", cardTypeId);

            // 2. Add all form fields
            console.group("📝 Form Fields:");
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    formDataToSend.append(key, value);
                    console.log(`↳ ${key}:`, value);
                }
            });
            console.groupEnd();

            // 3. Add files
            console.group("🖼️ File Attachments:");
            if (selfieImage) {
                formDataToSend.append('selfie_image', selfieImage);
                console.log("↳ Selfie image added:", selfieImage.name);
            }
            if (frontIdImage) {
                formDataToSend.append('front_card', frontIdImage);
                console.log("↳ Front ID image added:", frontIdImage.name);
            }
            if (backIdImage) {
                formDataToSend.append('back_card', backIdImage);
                console.log("↳ Back ID image added:", backIdImage.name);
            }
            console.groupEnd();

            console.groupEnd(); // End FormData Construction

            // Debug 5: Final FormData snapshot before API call
            console.group("🔍 Final FormData Snapshot:");
            for (let [key, value] of formDataToSend.entries()) {
                if (value instanceof File) {
                    console.log(`${key}:`, value.name, `(File, size: ${value.size} bytes)`);
                } else {
                    console.log(`${key}:`, value);
                }
            }
            console.groupEnd();

            // Optional: Log simulated JSON version
            const simulatedJson = {};
            formDataToSend.forEach((value, key) => {
                simulatedJson[key] = value instanceof File ? `[File: ${value.name}]` : value;
            });
            console.log("🧾 Simulated JSON Payload:", JSON.stringify(simulatedJson, null, 2));

            // Debug 6: API call prep
            console.log("📡 Preparing API request to /api/virtual-cards/create-holder");
            console.log("🔑 XSRF Token:", xsrfToken ? "Exists" : "Missing!");

            const apiStartTime = performance.now();
            console.time("⏱️ API Call Duration");

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/virtual-cards/create-holder`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-XSRF-TOKEN': xsrfToken,
                    },
                    withCredentials: true,
                    timeout: 10000
                }
            );

            console.timeEnd("⏱️ API Call Duration");
            const apiDuration = performance.now() - apiStartTime;
            console.log(`⚡ API call completed in ${apiDuration.toFixed(2)}ms`);

            console.log("📨 API response:", response);

            setAlert({
                show: true,
                message: "KYC verification successful!",
                type: "success"
            });

            onSuccess(response.data);

        } catch (error) {
            console.error("💥 Submission error:", error);

            let errorMessage = "Submission failed. Please try again.";
            if (error.response) {
                console.error("🔧 Server response:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {
                console.error("🌐 No response received - request details:", error.request);
                errorMessage = "No response from server. Check your connection.";
            } else {
                console.error("⚙️ Request setup error:", error.message);
            }

            setAlert({
                show: true,
                message: errorMessage,
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
            console.log("🏁 Submission process completed");
        }
    };


    const renderDynamicFields = () => {
        if (!fieldRequirements) return null;

        const requirements = fieldRequirements.required_fields;
        const fields = [];

        // Display card_type_id error if exists
        if (errors.card_type_id) {
            fields.push(
                <div key="card_type_error" className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                    {errors.card_type_id}
                </div>
            );
        }

        // Standard fields that might be required
        const possibleFields = [
            { name: 'first_name', label: 'First Name', type: 'text' },
            { name: 'last_name', label: 'Last Name', type: 'text' },
            { name: 'address', label: 'Address', type: 'text' },
            { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
            { name: 'city', label: 'City', type: 'text' },
            { name: 'state', label: 'State', type: 'text' },
            { name: 'country', label: 'Country', type: 'text' },
            { name: 'postal_code', label: 'Postal Code', type: 'text' },
            { name: 'house_no', label: 'House Number', type: 'text' },
            { name: 'issue_date', label: 'Issue Date', type: 'date' },
            { name: 'expiry_date', label: 'Expiry Date', type: 'date' }
        ];

        possibleFields.forEach(field => {
            if (requirements[field.name]?.includes('required')) {
                fields.push(
                    <FormField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={`Enter your ${field.label}`}
                        error={errors[field.name]}
                        type={field.type}
                        required={true}
                    />
                );
            }
        });

        if (requirements.id_type && requirements.id_type.includes('required')) {
            const options = [];
            if (requirements.id_type.includes('bvn')) options.push('bvn');
            if (requirements.id_type.includes('nin')) options.push('nin');
            if (requirements.id_type.includes('passport')) options.push('passport');

            if (options.length > 0) {
                fields.push(
                    <div key="id_type">
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                        <select
                            name="id_type"
                            value={formData.id_type || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2.5 rounded-lg border text-gray-600 text-sm ${errors.id_type ? 'border-red-500' : 'border-gray-300'}`}
                            required={requirements.id_type.includes('required')}
                        >
                            {options.length > 1 && <option value="">Select ID Type</option>}
                            {options.map(option => (
                                <option key={option} value={option}>
                                    {option.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        {errors.id_type && (
                            <p className="mt-1 text-xs text-red-500">{errors.id_type}</p>
                        )}
                    </div>
                );
            }
        }

        if (requirements.bank_id_number || requirements.bvn_number) {
            const fieldName = requirements.bank_id_number ? 'bank_id_number' : 'bvn_number';
            fields.push(
                <div key={fieldName}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {fieldName === 'bank_id_number' ? 'Bank ID Number' : 'BVN Number'}
                    </label>
                    <input
                        type="text"
                        name={fieldName}
                        value={formData[fieldName] || ''}
                        onChange={handleChange}
                        placeholder="Enter 11-digit number"
                        className={`w-full p-3 rounded-lg border text-gray-600 text-sm ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}`}
                        inputMode="numeric"
                        maxLength="11"
                        required={requirements[fieldName]?.includes('required')}
                    />
                    {errors[fieldName] ? (
                        <p className="mt-1 text-xs text-red-500">{errors[fieldName]}</p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">Please enter your 11-digit {fieldName === 'bank_id_number' ? 'Bank ID' : 'BVN'}</p>
                    )}
                </div>
            );
        }

        if (requirements.nin_number && (requirements.id_type?.includes('nin') || formData.id_type === 'nin')) {
            fields.push(
                <FormField
                    key="nin_number"
                    label="NIN Number"
                    name="nin_number"
                    value={formData.nin_number || ''}
                    onChange={handleChange}
                    placeholder="Enter your NIN"
                    error={errors.nin_number}
                    required={requirements.nin_number.includes('required')}
                />
            );
        }

        if (requirements.passport_number && (requirements.id_type?.includes('passport') || formData.id_type === 'passport')) {
            fields.push(
                <FormField
                    key="passport_number"
                    label="Passport Number"
                    name="passport_number"
                    value={formData.passport_number || ''}
                    onChange={handleChange}
                    placeholder="Enter your passport number"
                    error={errors.passport_number}
                    required={requirements.passport_number.includes('required')}
                />
            );
        }

        if (requirements.front_card && (requirements.id_type?.includes('nin') || formData.id_type === 'nin')) {
            fields.push(
                <div key="frontId">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Front of ID</label>
                    {frontIdPreview ? (
                        <div className="mb-2">
                            <img
                                src={frontIdPreview}
                                alt="Front ID preview"
                                className="h-32 w-full object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setFrontIdPreview('');
                                    setFrontIdImage(null);
                                }}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                                Change Image
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => startCamera('frontId')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                >
                                    Take Photo
                                </button>
                                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'frontId')}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {errors.frontId && (
                                <p className="mt-1 text-xs text-red-500">{errors.frontId}</p>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (requirements.back_card && (requirements.id_type?.includes('nin') || formData.id_type === 'nin')) {
            fields.push(
                <div key="backId">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Back of ID</label>
                    {backIdPreview ? (
                        <div className="mb-2">
                            <img
                                src={backIdPreview}
                                alt="Back ID preview"
                                className="h-32 w-full object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setBackIdPreview('');
                                    setBackIdImage(null);
                                }}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                                Change Image
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => startCamera('backId')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                >
                                    Take Photo
                                </button>
                                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'backId')}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {errors.backId && (
                                <p className="mt-1 text-xs text-red-500">{errors.backId}</p>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (requirements.passport_image && (requirements.id_type?.includes('passport') || formData.id_type === 'passport')) {
            fields.push(
                <div key="passportImage">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Image</label>
                    {frontIdPreview ? (
                        <div className="mb-2">
                            <img
                                src={frontIdPreview}
                                alt="Passport preview"
                                className="h-32 w-full object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setFrontIdPreview('');
                                    setFrontIdImage(null);
                                }}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                                Change Image
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => startCamera('frontId')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                >
                                    Take Photo
                                </button>
                                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'frontId')}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {errors.frontId && (
                                <p className="mt-1 text-xs text-red-500">{errors.frontId}</p>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        fields.push(
            <div key="selfie">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selfie Image</label>
                {selfiePreview ? (
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <img
                                src={selfiePreview}
                                alt="Selfie preview"
                                className="h-24 w-24 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setSelfiePreview('');
                                    setSelfieImage(null);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                X
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => startCamera('selfie')}
                                className="px-4 py-2 bg-[#4CACF0] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                                Take Photo
                            </button>
                            <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'selfie')}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {errors.selfie && (
                            <p className="mt-1 text-xs text-red-500">{errors.selfie}</p>
                        )}
                    </div>
                )}
            </div>
        );

        return fields;
    };

    if (loading) {
        return (
            <div className="w-full p-6 bg-white rounded-xl shadow-sm mt-2 flex justify-center items-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3 text-gray-600">Loading form requirements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-white rounded-xl shadow-sm mt-2">
            {alert.show && (
                <AlertBox
                    message={alert.message}
                    isVisible={alert.show}
                    onDismiss={() => setAlert({ ...alert, show: false })}
                    type={alert.type}
                />
            )}

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-800">Complete KYC Verification</h1>
                        <p className="text-gray-500">
                            Please provide the required information to verify your identity.
                        </p>
                    </header>

                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                        <h3 className="font-medium text-blue-700 mb-3">Why is KYC required?</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            {[
                                "Compliance with financial regulations",
                                "Enhanced security for your account",
                                "Access to all card features"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {renderDynamicFields()}

                        {showCamera && (
                            <CameraModal
                                onCapture={captureImage}
                                onCancel={stopCamera}
                                videoRef={videoRef}
                                canvasRef={canvasRef}
                            />
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${isSubmitting
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-[#4CACF0] hover:bg-[#3A9BDE] shadow-sm'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Submit KYC'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default KycModal;
