import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { ChangeEvent, DragEvent, FC } from "react";

type AppointmentType = "In-Person" | "Telehealth";

type AppointmentSlot = {
  time: string;
  type: AppointmentType;
};

type Physician = {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  yearsExperience: number;
  education: string;
  certifications: string[];
  languages: string[];
  nextAvailable: string;
  availability: {
    [date: string]: AppointmentSlot[];
  };
};

type PatientData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
};

type InsuranceStatus = "idle" | "verifying" | "verified" | "denied";

// --- ENHANCED SVG ICONS (Self-Contained) ---

const StarIcon: FC<{ className?: string; filled?: boolean }> = ({
  className,
  filled = false,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const CalendarIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ShieldCheckIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const ClockIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const BellIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const StatusDotIcon: FC<{ className?: string; filled?: boolean }> = ({ 
  className, 
  filled = false 
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="8" fill="currentColor" />
  </svg>
);

const StatusCircleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <circle cx="12" cy="12" r="8" />
  </svg>
);

// --- SVG ICONS (Self-Contained) ---

const VideoCameraIcon: FC<{ className?: string; title?: string }> = ({
  className,
  title,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {title && <title>{title}</title>}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18V6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"
    />
  </svg>
);

const BuildingOfficeIcon: FC<{ className?: string; title?: string }> = ({
  className,
  title,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 48 48"
    stroke="currentColor"
  >
    {title && <title>{title}</title>}
    {/* Arrow pointing right */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M6 24h20m0 0l-8-8m8 8l-8 8"
    />
    {/* Person icon */}
    <circle
      cx="36"
      cy="20"
      r="4"
      stroke="currentColor"
      strokeWidth={3}
      fill="none"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M32 32c0-2.208 1.792-4 4-4s4 1.792 4 4v4h-8v-4z"
    />
  </svg>
);

const UploadIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const CheckCircleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// --- MOCK DATA ---

const generateTimeSlots = (
  startTime: number,
  endTime: number
): AppointmentSlot[] => {
  const slots: AppointmentSlot[] = [];
  for (let hour = startTime; hour < endTime; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`;
      const type: AppointmentType =
        (hour + minute / 60) % 2 === 0 ? "In-Person" : "Telehealth";
      slots.push({ time, type });
    }
  }
  return slots;
};

const MOCK_PHYSICIANS: Physician[] = [
  {
    id: 1,
    name: "Dr. Evelyn Reed",
    specialty: "Cardiology",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 4.9,
    yearsExperience: 15,
    education: "Harvard Medical School",
    certifications: [
      "Board Certified Cardiologist",
      "Heart Failure Specialist",
    ],
    languages: ["English", "Spanish"],
    nextAvailable: "Today",
    availability: {
      "2024-08-01": generateTimeSlots(9, 17),
      "2024-08-02": generateTimeSlots(9, 12),
    },
  },
  {
    id: 2,
    name: "Dr. Marcus Chen",
    specialty: "Dermatology",
    avatar: "https://i.pravatar.cc/150?img=2",
    rating: 4.8,
    yearsExperience: 12,
    education: "Johns Hopkins University",
    certifications: ["Board Certified Dermatologist", "Mohs Surgery"],
    languages: ["English", "Mandarin"],
    nextAvailable: "Tomorrow",
    availability: {
      "2024-08-01": generateTimeSlots(10, 18),
      "2024-08-02": generateTimeSlots(10, 18),
      "2024-08-03": generateTimeSlots(9, 13),
    },
  },
  {
    id: 3,
    name: "Dr. Sofia Ramirez",
    specialty: "Pediatrics",
    avatar: "https://i.pravatar.cc/150?img=3",
    rating: 4.9,
    yearsExperience: 18,
    education: "Stanford Medical School",
    certifications: [
      "Board Certified Pediatrician",
      "Pediatric Emergency Medicine",
    ],
    languages: ["English", "Spanish", "Portuguese"],
    nextAvailable: "Today",
    availability: {
      "2024-08-01": generateTimeSlots(8, 16),
      "2024-08-04": generateTimeSlots(13, 17),
    },
  },
  {
    id: 4,
    name: "Dr. Ben Carter",
    specialty: "Neurology",
    avatar: "https://i.pravatar.cc/150?img=4",
    rating: 4.7,
    yearsExperience: 20,
    education: "Mayo Clinic Medical School",
    certifications: ["Board Certified Neurologist", "Epilepsy Specialist"],
    languages: ["English"],
    nextAvailable: "Aug 2",
    availability: {
      "2024-08-02": generateTimeSlots(9, 17),
      "2024-08-05": generateTimeSlots(9, 17),
    },
  },
  {
    id: 5,
    name: "Dr. Olivia Martinez",
    specialty: "Cardiology",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 4.8,
    yearsExperience: 14,
    education: "UCLA Medical School",
    certifications: [
      "Board Certified Cardiologist",
      "Interventional Cardiology",
    ],
    languages: ["English", "Spanish"],
    nextAvailable: "Aug 3",
    availability: {
      "2024-08-03": generateTimeSlots(10, 15),
      "2024-08-04": generateTimeSlots(10, 15),
    },
  },
  {
    id: 6,
    name: "Dr. Liam Johnson",
    specialty: "Orthopedics",
    avatar: "https://i.pravatar.cc/150?img=6",
    rating: 4.9,
    yearsExperience: 16,
    education: "University of Pennsylvania",
    certifications: ["Board Certified Orthopedic Surgeon", "Sports Medicine"],
    languages: ["English"],
    nextAvailable: "Today",
    availability: {
      "2024-08-01": generateTimeSlots(9, 17),
      "2024-08-02": generateTimeSlots(9, 17),
      "2024-08-03": generateTimeSlots(9, 12),
    },
  },
  {
    id: 7,
    name: "Dr. Ava Wilson",
    specialty: "Psychiatry",
    avatar: "https://i.pravatar.cc/150?img=7",
    rating: 4.9,
    yearsExperience: 13,
    education: "Columbia University",
    certifications: ["Board Certified Psychiatrist", "Addiction Medicine"],
    languages: ["English", "French"],
    nextAvailable: "Today",
    availability: {
      "2024-08-01": generateTimeSlots(10, 16),
      "2024-08-02": generateTimeSlots(10, 16),
      "2024-08-03": generateTimeSlots(10, 16),
    },
  },
  {
    id: 8,
    name: "Dr. Noah Brown",
    specialty: "Gynecology",
    avatar: "https://i.pravatar.cc/150?img=8",
    rating: 4.8,
    yearsExperience: 11,
    education: "Yale Medical School",
    certifications: [
      "Board Certified Obstetrician-Gynecologist",
      "Maternal-Fetal Medicine",
    ],
    languages: ["English"],
    nextAvailable: "Today",
    availability: {
      "2024-08-01": generateTimeSlots(9, 17),
      "2024-08-02": generateTimeSlots(9, 17),
      "2024-08-03": generateTimeSlots(9, 12),
    },
  },
  {
    id: 9,
    name: "Dr. Emma Wilson",
    specialty: "Pediatrics",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 4.9,
    yearsExperience: 17,
    education: "Duke University Medical School",
    certifications: ["Board Certified Pediatrician", "Pediatric Cardiology"],
    languages: ["English", "German"],
    nextAvailable: "Today",
    availability: {
      "2024-08-01": generateTimeSlots(9, 17),
      "2024-08-02": generateTimeSlots(9, 17),
      "2024-08-03": generateTimeSlots(9, 12),
    },
  },
  {
    id: 10,
    name: "Dr. James Smith",
    specialty: "Radiology",
    avatar: "https://i.pravatar.cc/150?img=10",
    rating: 4.7,
    yearsExperience: 19,
    education: "University of Chicago",
    certifications: ["Board Certified Radiologist", "Interventional Radiology"],
    languages: ["English"],
    nextAvailable: "Today",
    availability: {
      "2024-08-01": generateTimeSlots(9, 17),
      "2024-08-02": generateTimeSlots(9, 17),
      "2024-08-03": generateTimeSlots(9, 12),
    },
  },
];

const specialties = [
  "All",
  ...Array.from(new Set(MOCK_PHYSICIANS.map((p) => p.specialty))),
];

// --- MAIN APPOINTMENT BOOKING COMPONENT ---

const MedicalAppointmentSystem: FC = () => {
  // State management
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("2024-08-01"); // Default to a valid date
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(
    null
  );
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [insuranceStatus, setInsuranceStatus] =
    useState<InsuranceStatus>("idle");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    "name" | "rating" | "experience" | "nextAvailable"
  >("rating");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Derived state and memoized calculations
  const filteredPhysicians = useMemo(() => {
    let physicians =
      selectedSpecialty === "All"
        ? MOCK_PHYSICIANS
        : MOCK_PHYSICIANS.filter((p) => p.specialty === selectedSpecialty);

    // Apply search filter
    if (searchQuery.trim()) {
      physicians = physicians.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.education.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    return physicians.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.yearsExperience - a.yearsExperience;
        case "nextAvailable": {
          const availabilityOrder = { Today: 0, Tomorrow: 1 };
          const aOrder =
            availabilityOrder[
              a.nextAvailable as keyof typeof availabilityOrder
            ] ?? 999;
          const bOrder =
            availabilityOrder[
              b.nextAvailable as keyof typeof availabilityOrder
            ] ?? 999;
          return aOrder - bOrder;
        }
        default:
          return 0;
      }
    });
  }, [selectedSpecialty, searchQuery, sortBy]);

  const availableDatesForSelectedPhysician = useMemo(() => {
    return selectedPhysician ? Object.keys(selectedPhysician.availability) : [];
  }, [selectedPhysician]);

  const availableSlots = useMemo(() => {
    if (!selectedPhysician || !selectedDate) return [];
    return selectedPhysician.availability[selectedDate] || [];
  }, [selectedPhysician, selectedDate]);

  const isFormComplete = useMemo(() => {
    return (
      Object.values(patientData).every((value) => value.trim() !== "") &&
      insuranceStatus === "verified"
    );
  }, [patientData, insuranceStatus]);

  // Handlers
  const handlePhysicianSelect = (physician: Physician) => {
    setSelectedPhysician(physician);
    setSelectedSlot(null);
    // Auto-select the first available date for the newly selected physician
    const firstAvailableDate = Object.keys(physician.availability)[0];
    if (firstAvailableDate) {
      setSelectedDate(firstAvailableDate);
    } else {
      setSelectedDate("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover") {
      setIsDragOver(true);
    } else if (e.type === "dragleave") {
      setIsDragOver(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete || !selectedPhysician || !selectedSlot) {
      alert(
        "Please complete all fields, select a physician, and choose a time slot."
      );
      return;
    }
    console.log("Booking Submitted:", {
      physician: selectedPhysician.name,
      date: selectedDate,
      slot: selectedSlot,
      patient: patientData,
      prescription: uploadedFile?.name,
    });
    setIsBookingConfirmed(true);
  };

  const resetBooking = () => {
    setSelectedSpecialty("All");
    setSelectedPhysician(null);
    setSelectedDate("2024-08-01");
    setSelectedSlot(null);
    setPatientData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
    });
    setUploadedFile(null);
    setInsuranceStatus("idle");
    setIsBookingConfirmed(false);
  };

  // Effect for simulating insurance verification
  useEffect(() => {
    if (patientData.insuranceProvider && patientData.insurancePolicyNumber) {
      setInsuranceStatus("verifying");
      const timer = setTimeout(() => {
        // Simulate API call result
        if (patientData.insurancePolicyNumber.length > 5) {
          setInsuranceStatus("verified");
        } else {
          setInsuranceStatus("denied");
        }
      }, 1500); // 1.5 second delay for simulation
      return () => clearTimeout(timer);
    } else {
      setInsuranceStatus("idle");
    }
  }, [patientData.insuranceProvider, patientData.insurancePolicyNumber]);

  if (isBookingConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] p-8 font-outfit">
        <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-2xl w-full border border-[#00b4d8]">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircleIcon className="w-16 h-16 text-green-500" />
            </div>
            <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Appointment Confirmed!
          </h2>

          <div className="bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] p-6 rounded-xl mb-6 border border-[#00b4d8]">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <img
                src={selectedPhysician?.avatar}
                alt={selectedPhysician?.name}
                className="w-16 h-16 rounded-xl"
              />
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedPhysician?.name}
                </h3>
                <p className="text-[#0077b6] font-semibold">
                  {selectedPhysician?.specialty}
                </p>
                <div className="flex items-center mt-1">
                  <StarIcon className="w-4 h-4 text-yellow-500 mr-1" filled />
                  <span className="text-sm font-bold text-gray-700">
                    {selectedPhysician?.rating} rating
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Date</p>
                <p className="font-bold text-gray-800">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Time</p>
                <p className="font-bold text-gray-800">{selectedSlot?.time}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Type</p>
                <div className="flex items-center">
                  {selectedSlot?.type === "Telehealth" ? (
                    <VideoCameraIcon className="w-4 h-4 text-[#0077b6] mr-2" />
                  ) : (
                    <BuildingOfficeIcon className="w-4 h-4 text-[#0077b6] mr-2" />
                  )}
                  <span className="font-bold text-[#0077b6]">
                    {selectedSlot?.type}
                  </span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Patient</p>
                <p className="font-bold text-gray-800">
                  {patientData.firstName} {patientData.lastName}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">
                Confirmation email sent to {patientData.email}
              </span>
            </div>

            <div className="flex items-center justify-center text-[#0077b6] bg-[#caf0f8] p-3 rounded-lg border border-[#00b4d8]">
              <BellIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">
                Reminder notifications enabled
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetBooking}
              className="px-8 py-4 bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white font-bold rounded-xl shadow-lg hover:from-[#0077b6] hover:to-[#00b4d8] focus:outline-none focus:ring-4 focus:ring-[#00b4d8] transition-all duration-200 transform hover:scale-105"
            >
              Book Another Appointment
            </button>

            <button
              onClick={() => window.print()}
              className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-[#90e0ef] hover:bg-[#caf0f8] focus:outline-none focus:ring-4 focus:ring-[#00b4d8] transition-all duration-200"
            >
              Print Confirmation
            </button>
          </div>

          {/* Trust Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-center space-x-8 text-xs text-gray-500">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-1" />
                HIPAA Secure
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Accredited
              </div>
              <div className="flex items-center">
                <StatusDotIcon className="w-3 h-3 text-[#00b4d8] mr-1" filled />
                24/7 Support
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Questions? Call (555) 123-HEALTH or email
              support@andromedahealth.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-serif p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Professional Header with Trust Indicators */}
        <header className="mb-8 bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] p-8 rounded-2xl border border-[#00b4d8]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center mb-4">
                <div className="bg-[#03045e] p-3 rounded-xl mr-4">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Andromeda Health Center
                  </h1>
                  <p className="text-lg text-gray-600">
                    Premier Healthcare • Est. 1985 • 50,000+ Patients Served
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  HIPAA Compliant
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Joint Commission Accredited
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Top 100 Hospitals Award
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="lg:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search physicians, specialties, or schools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#90e0ef] rounded-xl shadow-sm focus:border-[#0077b6] focus:ring-2 focus:ring-[#00b4d8] transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* --- LEFT & MIDDLE SECTIONS: Physician and Time Selection --- */}
          <div className="lg:col-span-2 xl:col-span-3 grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Section 1: Enhanced Physician Directory */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#90e0ef]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  Select Your Physician
                </h2>

                {/* Sort Dropdown */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-600">
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 bg-white border border-[#90e0ef] rounded-lg text-sm focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="experience">Most Experienced</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="nextAvailable">Next Available</option>
                  </select>
                </div>
              </div>

              {/* Specialty Filter */}
              <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-thin scrollbar-thumb-[#00b4d8] scrollbar-track-[#caf0f8]">
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 ${
                      selectedSpecialty === spec
                        ? "bg-[#03045e] text-white border-[#03045e] shadow-lg"
                        : "bg-white text-[#0077b6] border-[#90e0ef] hover:bg-[#caf0f8] hover:border-[#00b4d8]"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {/* Enhanced Physician List */}
              <div className="space-y-4 max-h-screen overflow-y-auto pr-2 pt-1">
                {filteredPhysicians.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No physicians found</p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  filteredPhysicians.map((physician) => (
                    <div
                      key={physician.id}
                      onClick={() => handlePhysicianSelect(physician)}
                      className={`group relative p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                        selectedPhysician?.id === physician.id
                          ? "bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] border-[#0077b6] shadow-lg transform scale-[1.02]"
                          : "bg-white border-[#90e0ef] hover:bg-[#caf0f8] hover:border-[#00b4d8] hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <img
                            src={physician.avatar}
                            alt={physician.name}
                            className="w-20 h-20 rounded-xl object-cover ring-4 ring-white shadow-lg"
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                            {physician.nextAvailable === "Today" ? (
                              <StatusDotIcon className="w-4 h-4 text-green-500" filled />
                            ) : (
                              <StatusCircleIcon className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#03045e] transition-colors">
                                {physician.name}
                              </h3>
                              <p className="text-[#0077b6] font-semibold">
                                {physician.specialty}
                              </p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                              <StarIcon
                                className="w-4 h-4 text-yellow-500"
                                filled
                              />
                              <span className="text-sm font-bold text-gray-800">
                                {physician.rating}
                              </span>
                            </div>
                          </div>

                          {/* Professional Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {physician.yearsExperience} years experience
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                              Next: {physician.nextAvailable}
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Education:</strong> {physician.education}
                          </div>

                          {/* Languages */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {physician.languages.map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>

                          {/* Certifications */}
                          <div className="text-xs text-gray-500">
                            <strong>Certifications:</strong>{" "}
                            {physician.certifications.join(", ")}
                          </div>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedPhysician?.id === physician.id && (
                        <div className="absolute top-4 right-4">
                          <CheckCircleIcon className="w-6 h-6 text-[#0077b6]" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 2: Enhanced Time Grid */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#90e0ef]">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                Choose Your Appointment Time
              </h2>
              {selectedPhysician ? (
                <>
                  {/* Physician Summary */}
                  <div className="bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] p-4 rounded-xl mb-6 border border-[#00b4d8]">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedPhysician.avatar}
                        alt={selectedPhysician.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {selectedPhysician.name}
                        </h3>
                        <p className="text-[#0077b6] text-sm">
                          {selectedPhysician.specialty}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
                        <StarIcon className="w-4 h-4 text-yellow-500" filled />
                        <span className="text-sm font-bold">
                          {selectedPhysician.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <label
                      htmlFor="date-select"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Select Date:
                    </label>
                    <select
                      id="date-select"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      className="w-full p-3 border-2 border-[#90e0ef] rounded-xl shadow-sm focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6] bg-white"
                    >
                      {availableDatesForSelectedPhysician.map((date) => (
                        <option key={date} value={date}>
                          {new Date(date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Appointment Type Legend */}
                  <div className="flex items-center justify-center space-x-6 mb-6 p-4 bg-[#caf0f8] rounded-xl">
                    <div className="flex items-center space-x-2">
                      <VideoCameraIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Telehealth
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        In-Person
                      </span>
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-screen overflow-y-auto pr-2 pt-1">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
                        <button
                          key={`${slot.time}-${index}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`group p-4 rounded-xl text-sm font-semibold flex flex-col items-center justify-center transition-all duration-200 border-2 min-h-[80px] ${
                            selectedSlot?.time === slot.time &&
                            selectedSlot?.type === slot.type
                              ? "bg-[#03045e] text-white border-[#03045e] shadow-lg scale-105"
                              : slot.type === "Telehealth"
                              ? "bg-[#caf0f8] text-[#03045e] border-[#90e0ef] hover:bg-[#90e0ef] hover:border-[#00b4d8]"
                              : "bg-[#caf0f8] text-[#03045e] border-[#90e0ef] hover:bg-[#90e0ef] hover:border-[#00b4d8]"
                          }`}
                        >
                          <span className="text-lg font-bold mb-2">
                            {slot.time}
                          </span>
                          <div className="flex items-center space-x-1">
                            {slot.type === "Telehealth" ? (
                              <VideoCameraIcon
                                className={`w-5 h-5 ${
                                  selectedSlot?.time === slot.time &&
                                  selectedSlot?.type === slot.type
                                    ? "text-white"
                                    : "text-[#0077b6]"
                                }`}
                                title="Telehealth"
                              />
                            ) : (
                              <BuildingOfficeIcon
                                className={`w-5 h-5 ${
                                  selectedSlot?.time === slot.time &&
                                  selectedSlot?.type === slot.type
                                    ? "text-white"
                                    : "text-[#0077b6]"
                                }`}
                                title="In-Person"
                              />
                            )}
                            <span className="text-xs opacity-75">
                              {slot.type}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">No available slots</p>
                        <p className="text-sm">
                          Please select a different date
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <BellIcon className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-xl mb-2">Select a Physician</p>
                  <p className="text-center">
                    Choose a physician from the directory to view their
                    available appointment times
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT SECTION: Enhanced Patient Form --- */}
          <div className="lg:col-span-1 xl:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-[#90e0ef]">
            <div className="flex items-center space-x-3 mb-6 border-b pb-4">
              <div className="bg-[#03045e] p-2 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Patient Information
                </h2>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`space-y-6 ${
                !selectedPhysician || !selectedSlot
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              {/* Appointment Summary */}
              <div className="bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] p-4 rounded-xl border border-[#00b4d8]">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-[#0077b6]" />
                  Appointment Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Physician:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedPhysician?.name || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedDate
                        ? new Date(
                            selectedDate + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedSlot?.time || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span
                      className={`font-semibold ${
                        selectedSlot?.type === "Telehealth"
                          ? "text-[#0077b6]"
                          : "text-[#0077b6]"
                      }`}
                    >
                      {selectedSlot?.type || "Not selected"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-[#03045e] rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={patientData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={patientData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <InputField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={patientData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={patientData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={patientData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-[#03045e] rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  Insurance Information
                </h3>
                <div className="space-y-4">
                  <InputField
                    label="Insurance Provider"
                    name="insuranceProvider"
                    value={patientData.insuranceProvider}
                    onChange={handleInputChange}
                    placeholder="Health Insurance Co."
                    type="text"
                    required
                  />
                  <InputField
                    label="Policy Number"
                    name="insurancePolicyNumber"
                    value={patientData.insurancePolicyNumber}
                    onChange={handleInputChange}
                    placeholder="123456789"
                    type="text"
                    required
                  />

                  {/* Insurance Status Indicator */}
                  <div className="min-h-[2rem] flex items-center">
                    {insuranceStatus === "verifying" && (
                      <div className="flex items-center text-[#0077b6] animate-pulse">
                        <div className="animate-spin w-4 h-4 border-2 border-[#0077b6] border-t-transparent rounded-full mr-2"></div>
                        <span className="text-sm font-medium">
                          Verifying coverage...
                        </span>
                      </div>
                    )}
                    {insuranceStatus === "verified" && (
                      <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">
                          Coverage verified
                        </span>
                      </div>
                    )}
                    {insuranceStatus === "denied" && (
                      <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <XCircleIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">
                          Coverage could not be verified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 bg-[#90e0ef] rounded-full mr-2 flex items-center justify-center">
                    <span className="text-[#03045e] text-xs font-bold">3</span>
                  </div>
                  Documents (Optional)
                </h3>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragEvents}
                  onDragLeave={handleDragEvents}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? "border-[#0077b6] bg-[#90e0ef] scale-105"
                      : "border-[#90e0ef] bg-[#caf0f8] hover:bg-[#90e0ef]"
                  }`}
                >
                  <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600 font-semibold flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        File uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        Upload prescription or medical records
                      </p>
                      <p className="text-xs text-gray-500">
                        Drag & drop files here, or click to browse
                      </p>
                      <p className="text-xs text-gray-400">
                        Supports: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setUploadedFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  !isFormComplete || !selectedPhysician || !selectedSlot
                }
                className="w-full bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white font-bold py-4 px-6 rounded-xl hover:from-[#0077b6] hover:to-[#00b4d8] disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {isFormComplete && selectedPhysician && selectedSlot
                  ? "Confirm Appointment"
                  : "Complete Required Fields"}
              </button>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-4 h-4 mr-1" />
                    Secure
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    HIPAA
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#00b4d8] rounded-full mr-1"></div>
                    SSL Encrypted
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

const InputField: FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-white border-2 border-[#90e0ef] rounded-xl shadow-sm focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6] transition-all duration-200 placeholder-gray-400"
    />
  </div>
);

export default MedicalAppointmentSystem;
