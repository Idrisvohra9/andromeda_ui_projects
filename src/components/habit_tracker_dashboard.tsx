"use client";

import React, { useState, useEffect } from "react";

import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  FaPlus,
  FaBriefcase,
  FaDumbbell,
  FaBook,
  FaBrain,
  FaTrophy,
  FaTimes,
  FaChartLine,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaFire,
  FaBullseye,
  FaFilter,
  FaCalendar,
  FaLightbulb,
  FaCheck,
  FaLock,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomScrollbarStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Roboto+Flex:opsz,wght@8..144,100..1000&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');

    .font-roboto {
      font-family: 'Roboto';
    }
    /* Custom Scrollbar Styles - Main Page (matching habit timeline) */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(46, 58, 89, 0.3);
      border-radius: 8px;
      margin: 8px;
      border: 1px solid rgba(74, 86, 111, 0.2);
    }

    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #20B2AA 0%, #2E3A59 50%, #4A566F 100%);
      border-radius: 8px;
      border: 1px solid rgba(200, 191, 199, 0.3);
      box-shadow: 0 2px 6px rgba(32, 178, 170, 0.4);
      transition: all 0.2s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #1FDA9A 0%, #3E4A69 50%, #5A667F 100%);
      box-shadow: 0 3px 10px rgba(32, 178, 170, 0.6);
      transform: scale(1.02);
    }

    ::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #18C296 0%, #1E2A49 50%, #3A465F 100%);
      box-shadow: 0 1px 4px rgba(32, 178, 170, 0.8);
    }

    ::-webkit-scrollbar-corner {
      background: rgba(46, 58, 89, 0.3);
    }

    /* Firefox Scrollbar */
    * {
      scrollbar-width: thin;
      scrollbar-color: #20B2AA rgba(46, 58, 89, 0.3);
    }

    /* Custom scrollbar for habit timeline */
    .custom-scrollbar::-webkit-scrollbar {
      width: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(46, 58, 89, 0.3);
      border-radius: 8px;
      margin: 8px;
      border: 1px solid rgba(74, 86, 111, 0.2);
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #20B2AA 0%, #2E3A59 50%, #4A566F 100%);
      border-radius: 8px;
      border: 1px solid rgba(200, 191, 199, 0.3);
      box-shadow: 0 2px 6px rgba(32, 178, 170, 0.4);
      transition: all 0.2s ease;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #1FDA9A 0%, #3E4A69 50%, #5A667F 100%);
      box-shadow: 0 3px 10px rgba(32, 178, 170, 0.6);
      transform: scale(1.02);
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #18C296 0%, #1E2A49 50%, #3A465F 100%);
      box-shadow: 0 1px 4px rgba(32, 178, 170, 0.8);
    }

    /* Smooth scrolling for all elements */
    html {
      scroll-behavior: smooth;
    }

    /* Custom scrollbar for modal content */
    .modal-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .modal-scrollbar::-webkit-scrollbar-track {
      background: rgba(46, 58, 89, 0.1);
      border-radius: 4px;
    }

    .modal-scrollbar::-webkit-scrollbar-thumb {
      background: #20B2AA;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(32, 178, 170, 0.3);
    }

    .modal-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #1FDA9A;
      box-shadow: 0 2px 6px rgba(32, 178, 170, 0.5);
    }

    /* Pulse animation for highlighted habits */
    @keyframes pulse-highlight {
      0% { box-shadow: 0 0 0 0 rgba(32, 178, 170, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(32, 178, 170, 0); }
      100% { box-shadow: 0 0 0 0 rgba(32, 178, 170, 0); }
    }

    .habit-highlight {
      animation: pulse-highlight 1.5s ease-out infinite;
    }

    /* Chart interaction styles */
    .recharts-dot {
      cursor: pointer !important;
      pointer-events: all !important;
      z-index: 10 !important;
    }

    .recharts-dot:hover {
      filter: drop-shadow(0 0 6px rgba(32, 178, 170, 0.4)) !important;
    }

    .recharts-active-dot {
      cursor: pointer !important;
      pointer-events: all !important;
      z-index: 15 !important;
    }

    /* Ensure chart elements don't interfere with dot interactions */
    .recharts-line {
      pointer-events: none !important;
    }

    .recharts-line-curve {
      pointer-events: none !important;
    }
  `}</style>
);

const ClientTimestamp: React.FC<{ timestamp: string }> = ({ timestamp }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span style={{ color: "#4A566F" }}>Loading...</span>;
  }

  return (
    <span style={{ color: "#4A566F" }}>
      {new Date(timestamp).toLocaleString()}
    </span>
  );
};

export const HabitType = {
  Work: "Work",
  Exercise: "Exercise",
  Reading: "Reading",
  Meditation: "Meditation",
} as const;
type HabitType = (typeof HabitType)[keyof typeof HabitType];
interface Habit {
  id: string;
  type: HabitType;
  timestamp: string;
  notes: string;
}
interface ProductivityPoint {
  date: string;
  score: number;
  triggeringHabitId?: string;
  dayIndex?: number;
  actualDate?: string; // Add actual date for better filtering
}
interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: React.ElementType;
  color: string;
}

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  totalHabits: number;
  longestStreak: number;
  currentStreak: number;
  favoriteHabitType: HabitType;
  avatar: string;
}

// Chart event types - used for handling user interactions with the productivity chart
interface ChartEventData {
  activePayload?: Array<{
    payload: ProductivityPoint;
  }>;
  chartX?: number;
  chartY?: number;
  activeLabel?: string;
}

// Tooltip component props for the chart hover tooltips
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ProductivityPoint;
    value: number;
  }>;
  label?: string;
}

const getInitialHabits = (): Habit[] => [
  {
    id: "h1",
    type: HabitType.Work,
    timestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
    notes: "Completed project proposal.",
  },
  {
    id: "h2",
    type: HabitType.Exercise,
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: "30-min run.",
  },
  {
    id: "h3",
    type: HabitType.Reading,
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    notes: "Read 2 chapters.",
  },
  {
    id: "h4",
    type: HabitType.Work,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: "Client meeting.",
  },
  {
    id: "h5",
    type: HabitType.Meditation,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: "10-min mindfulness.",
  },
  {
    id: "h6",
    type: HabitType.Work,
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    notes: "Coded new feature.",
  },
];

const getInitialProductivity = (): ProductivityPoint[] => {
  const now = new Date();
  return [
    { 
      date: "Day 1", 
      score: 60, 
      triggeringHabitId: "h1", 
      dayIndex: 1,
      actualDate: new Date(now.getTime() - 86400000 * 6).toISOString().split('T')[0]
    },
    { 
      date: "Day 2", 
      score: 75, 
      triggeringHabitId: "h2", 
      dayIndex: 2,
      actualDate: new Date(now.getTime() - 86400000 * 5).toISOString().split('T')[0]
    },
    { 
      date: "Day 3", 
      score: 70, 
      triggeringHabitId: "h3", 
      dayIndex: 3,
      actualDate: new Date(now.getTime() - 86400000 * 4).toISOString().split('T')[0]
    },
    { 
      date: "Day 4", 
      score: 85, 
      triggeringHabitId: "h4", 
      dayIndex: 4,
      actualDate: new Date(now.getTime() - 86400000 * 3).toISOString().split('T')[0]
    },
    { 
      date: "Day 5", 
      score: 80, 
      triggeringHabitId: "h5", 
      dayIndex: 5,
      actualDate: new Date(now.getTime() - 86400000 * 2).toISOString().split('T')[0]
    },
    { 
      date: "Day 6", 
      score: 95, 
      triggeringHabitId: "h6", 
      dayIndex: 6,
      actualDate: new Date(now.getTime() - 86400000 * 1).toISOString().split('T')[0]
    },
    { 
      date: "Day 7", 
      score: 90, 
      dayIndex: 7,
      actualDate: new Date().toISOString().split('T')[0]
    },
  ];
};

const getInitialAchievements = (): Achievement[] => [
  {
    id: "a1",
    name: "First Timer",
    description: "Complete your very first habit entry",
    unlocked: true,
    icon: FaTrophy,
    color: "#FF8C00",
  },
  {
    id: "a2",
    name: "Finish Tutorial",
    description: "Complete the onboarding process",
    unlocked: true,
    icon: FaBriefcase,
    color: "#20B2AA",
  },
  {
    id: "a3",
    name: "Unlock New Job",
    description: "Start tracking work-related habits",
    unlocked: false,
    icon: FaBook,
    color: "#DC143C",
  },
  {
    id: "a4",
    name: "Hello Again",
    description: "Log in for 3 consecutive days",
    unlocked: true,
    icon: FaDumbbell,
    color: "#32CD32",
  },
  {
    id: "a5",
    name: "Good Audience",
    description: "Share your progress with friends",
    unlocked: true,
    icon: FaBrain,
    color: "#B22222",
  },
  {
    id: "a6",
    name: "Good Audience",
    description: "Build a supportive community",
    unlocked: true,
    icon: FaTrophy,
    color: "#CD5C5C",
  },
  {
    id: "a7",
    name: "Facebook Fan",
    description: "Connect your social media account",
    unlocked: false,
    icon: FaChartLine,
    color: "#9932CC",
  },
  {
    id: "a8",
    name: "Facebook Fan",
    description: "Share achievements on social media",
    unlocked: false,
    icon: FaBrain,
    color: "#8A2BE2"
  },
  {
    id: "a9",
    name: "Hourly Worksheet",
    description: "Complete time tracking for a full day",
    unlocked: true,
    icon: FaBook,
    color: "#40E0D0",
  },
  {
    id: "a10",
    name: "All-In-One",
    description: "Use all available habit categories",
    unlocked: true,
    icon: FaTrophy,
    color: "#228B22",
  },
  {
    id: "a11",
    name: "Above Your Step",
    description: "Exceed your daily step goal",
    unlocked: true,
    icon: FaDumbbell,
    color: "#FF8C00",
  },
  {
    id: "a12",
    name: "Best Friend",
    description: "Maintain longest habit streak",
    unlocked: false,
    icon: FaTrophy,
    color: "#FF69B4",
  },
];

const getInitialUserProfile = (): UserProfile => ({
  name: "Habit Tracker User",
  email: "user@habitdash.com",
  joinDate: new Date(Date.now() - 86400000 * 30).toISOString(),
  totalHabits: 0,
  longestStreak: 0,
  currentStreak: 0,
  favoriteHabitType: HabitType.Work,
  avatar: "user", // Changed from emoji to string for icon reference
});

const habitIcons: Record<HabitType, React.ElementType> = {
  [HabitType.Work]: FaBriefcase,
  [HabitType.Exercise]: FaDumbbell,
  [HabitType.Reading]: FaBook,
  [HabitType.Meditation]: FaBrain,
};

const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = "", style = {} }) => (
  <div
    className={`backdrop-blur-xl border rounded-2xl shadow-2xl ${className}`}
    style={{
      backgroundColor: "rgba(46, 58, 89, 0.4)",
      borderColor: "rgba(200, 191, 199, 0.1)",
      boxShadow: "0 25px 50px -12px rgba(30, 42, 59, 0.5)",
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Custom tooltip component for the productivity chart
 * Displays detailed information when hovering over chart data points
 * Shows productivity score, day label, and interaction hints
 */
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  // Only render tooltip when there's active data and payload exists
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="p-4 backdrop-blur-md border rounded-lg shadow-xl"
        style={{
          backgroundColor: "rgba(30, 42, 59, 0.95)",
          borderColor: "rgba(74, 86, 111, 0.5)",
          color: "#C8BFC7",
        }}
      >
        {/* Day label */}
        <p
          className="label text-sm font-semibold mb-2"
          style={{ color: "#C8BFC7" }}
        >
          {`${label}`}
        </p>
        {/* Productivity score with vibrant accent color */}
        <p
          className="intro font-bold text-lg mb-1"
          style={{ color: "#20B2AA" }}
        >
          {`Productivity: ${payload[0].value}%`}
        </p>
        {/* Show actual date if available */}
        {data.actualDate && (
          <p className="text-xs mb-1" style={{ color: "#4A566F" }}>
            Date: {new Date(data.actualDate).toLocaleDateString()}
          </p>
        )}
        {/* Show click hint only if there's a triggering habit */}
        {data.triggeringHabitId && (
          <p className="text-xs" style={{ color: "#4A566F" }}>
            Click to view habits for this day
          </p>
        )}
        {/* Interaction instructions */}
        <div className="mt-2 pt-2 border-t border-gray-600">
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: "#4A566F" }}
          >
            <FaLightbulb className="text-xs" />
            Tip: Click the data point to filter habits
          </p>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Achievement card component with interactive hover effects
 * Displays individual achievement badges with unlock status
 * Features glassmorphism design with animated interactions
 */
const AchievementCard: React.FC<{ achievement: Achievement }> = ({
  achievement,
}) => {
  // Safety check for malformed achievement data
  if (!achievement || !achievement.icon || !achievement.color) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-white text-sm"
        style={{
          minHeight: "200px",
          backgroundColor: "rgba(46, 58, 89, 0.8)",
          borderRadius: "12px",
          color: "#C8BFC7",
        }}
      >
        Loading Achievement...
      </div>
    );
  }

  const Icon = achievement.icon;

  return (
    <motion.div
      // Interactive animations for engaging user experience
      whileHover={{
        scale: 1.05,
        y: -5,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full h-full flex flex-col items-center justify-center"
    >
      {/* Badge Container */}
      <div className="relative">
        {/* Main Badge Circle */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center relative border-4 shadow-2xl"
          style={{
            backgroundColor: achievement.unlocked
              ? achievement.color
              : "#666666",
            borderColor: achievement.unlocked
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(200, 200, 200, 0.5)",
            boxShadow: achievement.unlocked
              ? `0 8px 25px ${achievement.color}40, inset 0 2px 4px rgba(255, 255, 255, 0.3)`
              : "0 8px 25px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
            opacity: achievement.unlocked ? 1 : 0.6,
          }}
        >
          {/* Inner Circle */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: achievement.unlocked
                ? "rgba(255, 255, 255, 0.9)"
                : "rgba(200, 200, 200, 0.6)",
              borderColor: achievement.unlocked
                ? "rgba(255, 255, 255, 0.6)"
                : "rgba(150, 150, 150, 0.4)",
              boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Icon
              className="text-2xl"
              style={{
                color: achievement.unlocked ? achievement.color : "#999999",
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
              }}
            />
          </div>

          {/* Status Indicator */}
          <div className="absolute -top-1 -right-1">
            {achievement.unlocked ? (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  borderColor: "white",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.6)",
                }}
              >
                <FaCheck />
              </div>
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2"
                style={{
                  backgroundColor: "#757575",
                  color: "white",
                  borderColor: "white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                }}
              >
                <FaLock />
              </div>
            )}
          </div>
        </div>

        {/* Ribbon */}
        <div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs font-bold text-white text-center rounded-full border-2"
          style={{
            backgroundColor: achievement.unlocked
              ? achievement.color
              : "#666666",
            borderColor: "rgba(255, 255, 255, 0.8)",
            boxShadow: achievement.unlocked
              ? `0 4px 12px ${achievement.color}60`
              : "0 4px 12px rgba(0, 0, 0, 0.3)",
            minWidth: "80px",
            opacity: achievement.unlocked ? 1 : 0.7,
          }}
        >
          {achievement.unlocked ? "EARNED" : "LOCKED"}
        </div>
      </div>

      {/* Achievement Details */}
      <div className="text-center mt-6 px-2">
        <h4
          className="text-sm font-bold mb-1"
          style={{
            color: "#C8BFC7",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)",
          }}
        >
          {achievement.name}
        </h4>
        <p
          className="text-xs leading-tight"
          style={{
            color: "#C8BFC7",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
            opacity: 0.9,
          }}
        >
          {achievement.description}
        </p>
      </div>

      {/* Glow effect for unlocked achievements */}
      {achievement.unlocked && (
        <div
          className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${achievement.color}40 0%, transparent 70%)`,
            filter: "blur(10px)",
          }}
        />
      )}
    </motion.div>
  );
};

const AchievementCarousel: React.FC<{ achievements: Achievement[] }> = ({
  achievements,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleCount = isMobile ? 2 : 4;
  const maxIndex = Math.max(0, achievements.length - visibleCount);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleAchievements = achievements.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  if (!achievements || achievements.length === 0) {
    return (
      <div className="relative w-full px-4">
        <div className="relative h-64 mx-8">
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#C8BFC7" }}>No achievements available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full px-2 sm:px-4">
      {/* Carousel Container */}
      <div className="relative h-64 mx-2 sm:mx-4 lg:mx-8">
        <div
          className={`grid gap-3 sm:gap-4 h-full ${
            isMobile ? "grid-cols-2" : "grid-cols-4"
          }`}
        >
          {visibleAchievements.map((achievement, index) => (
            <motion.div
              key={`${achievement.id}-${currentIndex}`}
              className="h-full"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <motion.button
          onClick={goToPrevious}
          className="absolute -left-1 sm:left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-2xl z-30 cursor-pointer"
          style={{
            backgroundColor: "#20B2AA",
            color: "#C8BFC7",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaChevronLeft size={isMobile ? 12 : 16} />
        </motion.button>
      )}

      {currentIndex < maxIndex && (
        <motion.button
          onClick={goToNext}
          className="absolute -right-1 sm:right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-2xl z-30 cursor-pointer"
          style={{
            backgroundColor: "#20B2AA",
            color: "#C8BFC7",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaChevronRight size={isMobile ? 12 : 16} />
        </motion.button>
      )}

      {/* Pagination Dots */}
      {maxIndex > 0 && (
        <div className="flex justify-center mt-6 gap-3">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: currentIndex === index ? "#20B2AA" : "#4A566F",
                boxShadow:
                  currentIndex === index
                    ? "0 0 12px rgba(32, 178, 170, 0.8)"
                    : "none",
              }}
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Modal component for logging new habits
 * Features:
 * - Animated entrance/exit with framer-motion
 * - Custom dropdown for habit type selection
 * - Form validation and submission
 * - Glassmorphism design with backdrop blur
 * - Click-outside-to-close functionality
 */
const LogHabitModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLog: (habit: Omit<Habit, "id" | "timestamp">) => void;
}> = ({ isOpen, onClose, onLog }) => {
  // Local state for form inputs
  const [habitType, setHabitType] = useState<HabitType>(HabitType.Work);
  const [notes, setNotes] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount or modal close
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        // Close dropdown if click is outside the dropdown container
        if (!target.closest(".dropdown-container")) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Form submission handler with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onLog({ type: habitType, notes });
      setNotes(""); // Clear form
      onClose(); // Close modal
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <GlassCard className="p-6 sm:p-8 modal-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "#C8BFC7" }}>
                  Quick Log a New Habit
                </h2>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="transition-colors cursor-pointer"
                  style={{ color: "#4A566F" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#C8BFC7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#4A566F")
                  }
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="space-y-6 modal-scrollbar"
              >
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#C8BFC7" }}
                  >
                    Habit Type
                  </label>
                  <div className="relative dropdown-container">
                    {" "}
                    <motion.button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full border rounded-lg p-3 flex items-center justify-between focus:ring-2 focus:outline-none transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: "rgba(46, 58, 89, 0.5)",
                        borderColor: isDropdownOpen ? "#20B2AA" : "#4A566F",
                        color: "#C8BFC7",
                      }}
                      whileHover={{
                        borderColor: "#20B2AA",
                        backgroundColor: "rgba(46, 58, 89, 0.7)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {React.createElement(habitIcons[habitType], {
                          className: "text-lg",
                          style: { color: "#20B2AA" },
                        })}
                        <span>{habitType}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronLeft
                          className="rotate-90"
                          style={{ color: "#4A566F" }}
                        />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-2xl z-50 overflow-hidden"
                          style={{
                            backgroundColor: "rgba(46, 58, 89, 0.95)",
                            borderColor: "#20B2AA",
                            boxShadow:
                              "0 25px 50px -12px rgba(30, 42, 59, 0.8)",
                          }}
                        >
                          {Object.values(HabitType).map((type) => {
                            const Icon = habitIcons[type];
                            const isSelected = type === habitType;

                            return (
                              <motion.button
                                key={type}
                                type="button"
                                onClick={() => {
                                  setHabitType(type);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full p-3 flex items-center gap-3 transition-all duration-200 text-left cursor-pointer"
                                style={{
                                  backgroundColor: isSelected
                                    ? "rgba(32, 178, 170, 0.3)"
                                    : "transparent",
                                  color: isSelected ? "#20B2AA" : "#C8BFC7",
                                  borderBottom:
                                    "1px solid rgba(74, 86, 111, 0.2)",
                                }}
                                whileHover={{
                                  backgroundColor: "rgba(32, 178, 170, 0.2)",
                                  color: "#20B2AA",
                                }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Icon
                                  className="text-lg"
                                  style={{
                                    color: isSelected ? "#20B2AA" : "#4A566F",
                                    transition: "color 0.2s ease",
                                  }}
                                />
                                <span className="font-medium">{type}</span>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-auto"
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: "#20B2AA" }}
                                    />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#C8BFC7" }}
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., 'Finished the main feature...'"
                    rows={3}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:outline-none transition"
                    style={{
                      backgroundColor: "rgba(46, 58, 89, 0.5)",
                      borderColor: "#4A566F",
                      color: "#C8BFC7",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#20B2AA")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#4A566F")
                    }
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full font-bold py-3 rounded-lg shadow-lg cursor-pointer"
                  style={{
                    backgroundColor: "#20B2AA",
                    color: "#090302",
                    boxShadow: "0 4px 14px 0 rgba(32, 178, 170, 0.3)",
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    boxShadow: "0 10px 20px -5px rgba(32, 178, 170, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  Log Habit
                </motion.button>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  habits: Habit[];
}> = ({ isOpen, onClose, profile, habits }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const totalHabits = habits.length;
  const habitTypeCount = habits.reduce((acc, habit) => {
    acc[habit.type] = (acc[habit.type] || 0) + 1;
    return acc;
  }, {} as Record<HabitType, number>);

  const favoriteHabitType =
    (Object.entries(habitTypeCount).reduce((a, b) =>
      habitTypeCount[a[0] as HabitType] > habitTypeCount[b[0] as HabitType]
        ? a
        : b
    )?.[0] as HabitType) || HabitType.Work;

  const currentStreak = Math.min(7, Math.floor(totalHabits / 3));
  const longestStreak = Math.max(currentStreak, Math.floor(totalHabits / 2));

  const updatedProfile = {
    ...profile,
    totalHabits,
    currentStreak,
    longestStreak,
    favoriteHabitType,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <GlassCard className="p-6 sm:p-8 modal-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <FaUser className="text-2xl" style={{ color: "#20B2AA" }} />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#C8BFC7" }}
                  >
                    Profile
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="transition-colors cursor-pointer"
                  style={{ color: "#4A566F" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#C8BFC7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#4A566F")
                  }
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Profile Header */}
                <div className="text-center">
                  <div
                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
                    style={{ backgroundColor: "#20B2AA", color: "#C8BFC7" }}
                  >
                    <FaUser className="text-3xl" />
                  </div>

                  <div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: "#C8BFC7" }}
                    >
                      {updatedProfile.name}
                    </h3>
                    <p className="text-sm" style={{ color: "#4A566F" }}>
                      {updatedProfile.email}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <motion.div
                    className="text-center p-4 rounded-lg cursor-pointer transition-all duration-300"
                    style={{ backgroundColor: "#2E3A59" }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#4A566F",
                      boxShadow: "0 8px 25px rgba(46, 58, 89, 0.3)",
                      y: -2,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <FaChartLine
                        className="text-2xl"
                        style={{ color: "#20B2AA" }}
                      />
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#C8BFC7" }}
                    >
                      {updatedProfile.totalHabits}
                    </p>
                    <p className="text-xs" style={{ color: "#4A566F" }}>
                      Total Habits
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 rounded-lg cursor-pointer transition-all duration-300"
                    style={{ backgroundColor: "#2E3A59" }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#4A566F",
                      boxShadow: "0 8px 25px rgba(46, 58, 89, 0.3)",
                      y: -2,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <FaFire
                        className="text-2xl"
                        style={{ color: "#FF6B35" }}
                      />
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#C8BFC7" }}
                    >
                      {updatedProfile.currentStreak}
                    </p>
                    <p className="text-xs" style={{ color: "#4A566F" }}>
                      Current Streak
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 rounded-lg cursor-pointer transition-all duration-300"
                    style={{ backgroundColor: "#2E3A59" }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#4A566F",
                      boxShadow: "0 8px 25px rgba(255, 215, 0, 0.3)",
                      y: -2,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <FaTrophy
                        className="text-2xl"
                        style={{ color: "#FFD700" }}
                      />
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#C8BFC7" }}
                    >
                      {updatedProfile.longestStreak}
                    </p>
                    <p className="text-xs" style={{ color: "#4A566F" }}>
                      Longest Streak
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 rounded-lg cursor-pointer transition-all duration-300"
                    style={{ backgroundColor: "#2E3A59" }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#4A566F",
                      boxShadow: "0 8px 25px rgba(46, 58, 89, 0.3)",
                      y: -2,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {React.createElement(
                        habitIcons[updatedProfile.favoriteHabitType],
                        {
                          className: "text-2xl",
                          style: { color: "#20B2AA" },
                        }
                      )}
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#C8BFC7" }}
                    >
                      {updatedProfile.favoriteHabitType}
                    </p>
                    <p className="text-xs" style={{ color: "#4A566F" }}>
                      Favorite Type
                    </p>
                  </motion.div>
                </div>

                {/* Habit Breakdown */}
                <div className="space-y-4">
                  <h3
                    className="text-lg font-semibold flex items-center gap-2"
                    style={{ color: "#C8BFC7" }}
                  >
                    <FaChartLine style={{ color: "#20B2AA" }} />
                    Habit Breakdown
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(habitTypeCount).map(([type, count]) => {
                      const Icon = habitIcons[type as HabitType];
                      const percentage =
                        totalHabits > 0 ? (count / totalHabits) * 100 : 0;

                      return (
                        <motion.div
                          key={type}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300"
                          style={{ backgroundColor: "rgba(46, 58, 89, 0.2)" }}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "rgba(46, 58, 89, 0.4)",
                            boxShadow: "0 4px 15px rgba(46, 58, 89, 0.2)",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon
                            className="text-lg"
                            style={{ color: "#20B2AA" }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span
                                className="font-medium"
                                style={{ color: "#C8BFC7" }}
                              >
                                {type}
                              </span>
                              <span
                                className="text-sm"
                                style={{ color: "#4A566F" }}
                              >
                                {count} habits
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <motion.div
                                className="h-2 rounded-full"
                                style={{ backgroundColor: "#20B2AA" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#C8BFC7" }}
                          >
                            {percentage.toFixed(0)}%
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Member Since */}
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "#2E3A59" }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaCalendarAlt style={{ color: "#20B2AA" }} />
                    <span className="font-medium" style={{ color: "#C8BFC7" }}>
                      Member Since
                    </span>
                  </div>
                  <p style={{ color: "#4A566F" }}>
                    <ClientTimestamp timestamp={updatedProfile.joinDate} />
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar: React.FC<{
  onOpenProfile: () => void;
}> = ({ onOpenProfile }) => (
  <motion.nav
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="w-full p-2 sm:p-4"
  >
    <GlassCard className="flex justify-between items-center p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <FaChartLine
          className="text-xl sm:text-2xl"
          style={{ color: "#20B2AA" }}
        />
        <span
          className="text-lg sm:text-xl font-bold"
          style={{ color: "#C8BFC7" }}
        >
          HabitDash
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <motion.button
          onClick={onOpenProfile}
          className="p-1.5 sm:p-2 rounded-full text-2xl sm:text-3xl cursor-pointer transition-all duration-300"
          style={{ color: "#C8BFC7", backgroundColor: "#4A566F" }}
          whileHover={{
            scale: 1.1,
            backgroundColor: "#20B2AA",
            boxShadow: "0 4px 20px rgba(46, 58, 89, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <FaUser />
        </motion.button>
      </div>
    </GlassCard>
  </motion.nav>
);

const Footer = () => (
  <motion.footer
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
    className="w-full p-4 mt-12 text-center text-sm"
    style={{ color: "#4A566F" }}
  >
    <p className="mt-1">Designed for peak performance and personal growth.</p>
  </motion.footer>
);

const BackgroundElements: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Geometric Shapes */}
      {Array.from({ length: 12 }, (_, i) => {
        const shapes = ["circle", "square", "triangle", "hexagon"];
        const shape = shapes[i % shapes.length];
        const size = 40 + (i % 3) * 20;
        const left = (i * 8.33) % 100;
        const top = (i * 7.5) % 100;

        return (
          <motion.div
            key={i}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1, 0.8],
              rotate: [0, 360],
            }}
            transition={{
              duration: 15 + (i % 5) * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 0.5,
            }}
            whileHover={{
              scale: 1.2,
              opacity: 0.6,
              boxShadow:
                shape === "circle"
                  ? "0 0 30px rgba(46, 58, 89, 0.6)"
                  : "0 0 25px rgba(46, 58, 89, 0.6)",
              transition: { duration: 0.3 },
            }}
          >
            {/* Circle Shape */}
            {shape === "circle" && (
              <div
                className="w-full h-full rounded-full border-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(46, 58, 89, 0.1) 0%, rgba(46, 58, 89, 0.1) 100%)",
                  borderColor: "rgba(46, 58, 89, 0.2)",
                  backdropFilter: "blur(2px)",
                }}
              />
            )}

            {/* Square Shape */}
            {shape === "square" && (
              <div
                className="w-full h-full border-2 rotate-45"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(46, 58, 89, 0.1) 0%, rgba(138, 126, 114, 0.1) 100%)",
                  borderColor: "rgba(46, 58, 89, 0.2)",
                  backdropFilter: "blur(2px)",
                }}
              />
            )}

            {/* Triangle Shape */}
            {shape === "triangle" && (
              <div
                className="w-full h-full"
                style={{
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  background:
                    "linear-gradient(135deg, rgba(138, 126, 114, 0.1) 0%, rgba(46, 58, 89, 0.1) 100%)",
                  border: "2px solid rgba(138, 126, 114, 0.2)",
                  backdropFilter: "blur(2px)",
                }}
              />
            )}

            {/* Hexagon Shape */}
            {shape === "hexagon" && (
              <div
                className="w-full h-full"
                style={{
                  clipPath:
                    "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
                  background:
                    "linear-gradient(135deg, rgba(200, 191, 199, 0.05) 0%, rgba(46, 58, 89, 0.1) 100%)",
                  border: "2px solid rgba(200, 191, 199, 0.1)",
                  backdropFilter: "blur(2px)",
                }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Floating Orbs */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full pointer-events-auto cursor-pointer"
          style={{
            width: `${20 + (i % 2) * 15}px`,
            height: `${20 + (i % 2) * 15}px`,
            left: `${(i * 12.5) % 100}%`,
            top: `${(i * 11) % 100}%`,
            background: `radial-gradient(circle, rgba(46, 58, 89, 0.2) 0%, rgba(46, 58, 89, 0.05) 70%, transparent 100%)`,
            boxShadow: "0 0 20px rgba(46, 58, 89, 0.1)",
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8 + (i % 3) * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
          whileHover={{
            scale: 1.5,
            opacity: 0.8,
            boxShadow: "0 0 40px rgba(46, 58, 89, 0.4)",
            transition: { duration: 0.3 },
          }}
        />
      ))}

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(46, 58, 89, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46, 58, 89, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Animated Lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute"
          style={{
            width: "200px",
            height: "2px",
            left: `${(i * 16) % 100}%`,
            top: `${(i * 15) % 100}%`,
            background: `linear-gradient(90deg, transparent 0%, rgba(46, 58, 89, 0.2) 50%, transparent 100%)`,
            transformOrigin: "center",
          }}
          animate={{
            rotate: [0, 360],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 20 + (i % 3) * 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: i * 2,
          }}
        />
      ))}

      {/* Corner Accent Elements */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 pointer-events-auto cursor-pointer"
        style={{
          borderColor: "rgba(46, 58, 89, 0.1)",
          background:
            "radial-gradient(circle, rgba(46, 58, 89, 0.05) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.2,
          borderColor: "rgba(46, 58, 89, 0.4)",
          boxShadow: "0 0 50px rgba(46, 58, 89, 0.3)",
          transition: { duration: 0.3 },
        }}
      />

      <motion.div
        className="absolute bottom-10 right-10 w-24 h-24 pointer-events-auto cursor-pointer"
        style={{
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          background:
            "linear-gradient(135deg, rgba(46, 58, 89, 0.1) 0%, rgba(138, 126, 114, 0.1) 100%)",
          border: "2px solid rgba(46, 58, 89, 0.1)",
        }}
        animate={{
          rotate: [0, 360],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        whileHover={{
          scale: 1.3,
          boxShadow: "0 0 40px rgba(46, 58, 89, 0.4)",
          transition: { duration: 0.3 },
        }}
      />

      {/* Subtle Radial Gradients */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(46, 58, 89, 0.03) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(46, 58, 89, 0.03) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
};

const LoadingScreen: React.FC = () => {
  const particlePositions = Array.from({ length: 20 }, (_, i) => ({
    left: (i * 5.3 + 7.2) % 100,
    top: (i * 4.7 + 12.8) % 100,
    duration: 3 + (i % 3),
    delay: (i * 0.3) % 2,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#090302" }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particlePositions.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(45deg, #20B2AA, #2E3A59)`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full text-center">
        <GlassCard className="p-8 sm:p-12 max-w-md mx-auto">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{
                background:
                  "linear-gradient(135deg, #20B2AA 0%, #2E3A59 50%, #4A566F 100%)",
                boxShadow: "0 0 30px rgba(46, 58, 89, 0.5)",
              }}
            >
              <FaChartLine
                className="text-3xl sm:text-4xl"
                style={{ color: "#C8BFC7" }}
              />
            </div>
          </motion.div>

          {/* App Name with Typewriter Effect */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ color: "#C8BFC7" }}
          >
            HabitDash
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm sm:text-base mb-8"
            style={{ color: "#4A566F" }}
          >
            Building better habits, one day at a time
          </motion.p>

          {/* Animated Progress Circles */}
          <div className="flex justify-center space-x-4 mb-8">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "#20B2AA" }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>

          {/* Loading Bar */}
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "#2E3A59" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #20B2AA 0%, #2E3A59 50%, #4A566F 100%)",
                boxShadow: "0 0 10px rgba(46, 58, 89, 0.5)",
              }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-xs sm:text-sm mt-4"
            style={{ color: "#4A566F" }}
          >
            Loading your habit journey...
          </motion.p>
        </GlassCard>
      </div>

      {/* Rotating Rings */}
      <div className="flex items-center justify-center pointer-events-none absolute inset-0">
        <motion.div
          className="w-96 h-96 border-2 rounded-full"
          style={{ borderColor: "rgba(46, 58, 89, 0.1)" }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-80 h-80 border-2 rounded-full"
          style={{ borderColor: "rgba(46, 58, 89, 0.1)" }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-64 h-64 border-2 rounded-full"
          style={{ borderColor: "rgba(138, 126, 114, 0.1)" }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
};

const HabitTrackerDashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityPoint[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [highlightedHabitId, setHighlightedHabitId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialUserProfile());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  /**
   * Enhanced localStorage persistence with better error handling
   * Loads data on mount and initializes with defaults if needed
   */
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Load habits with fallback to initial data
        const storedHabits = localStorage.getItem("habitdash_habits_v2");
        if (storedHabits) {
          const parsedHabits = JSON.parse(storedHabits);
          if (Array.isArray(parsedHabits) && parsedHabits.length > 0) {
            setHabits(parsedHabits);
            console.log(`✅ Loaded ${parsedHabits.length} habits from localStorage`);
          } else {
            console.log("📝 No valid habits in storage, using initial data");
            setHabits(getInitialHabits());
          }
        } else {
          console.log("📝 No habits in storage, using initial data");
          setHabits(getInitialHabits());
        }

        // Load productivity data
        const storedProductivity = localStorage.getItem("habitdash_productivity_v2");
        if (storedProductivity) {
          const parsedProductivity = JSON.parse(storedProductivity);
          if (Array.isArray(parsedProductivity) && parsedProductivity.length > 0) {
            setProductivityData(parsedProductivity);
            console.log(`✅ Loaded ${parsedProductivity.length} productivity points from localStorage`);
          } else {
            console.log("📊 No valid productivity data in storage, using initial data");
            setProductivityData(getInitialProductivity());
          }
        } else {
          console.log("📊 No productivity data in storage, using initial data");
          setProductivityData(getInitialProductivity());
        }

        // Load achievements with validation
        const storedAchievements = localStorage.getItem("habitdash_achievements_v2");
        if (storedAchievements) {
          const parsedAchievements = JSON.parse(storedAchievements);
          if (Array.isArray(parsedAchievements) && parsedAchievements.length > 0) {
            // Validate achievement structure
            const validAchievements = parsedAchievements.filter(
              (achievement: Achievement) =>
                achievement &&
                achievement.id &&
                achievement.name &&
                achievement.icon &&
                achievement.color
            );
            
            if (validAchievements.length === parsedAchievements.length) {
              setAchievements(validAchievements);
              console.log(`🏆 Loaded ${validAchievements.length} achievements from localStorage`);
            } else {
              console.log("🏆 Some achievements corrupted, using initial data");
              setAchievements(getInitialAchievements());
            }
          } else {
            console.log("🏆 No valid achievements in storage, using initial data");
            setAchievements(getInitialAchievements());
          }
        } else {
          console.log("🏆 No achievements in storage, using initial data");
          setAchievements(getInitialAchievements());
        }

        // Load user profile
        const storedProfile = localStorage.getItem("habitdash_profile_v2");
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile && parsedProfile.name) {
            setUserProfile(parsedProfile);
            console.log("👤 Loaded user profile from localStorage");
          } else {
            console.log("👤 Invalid profile in storage, using initial data");
            setUserProfile(getInitialUserProfile());
          }
        } else {
          console.log("👤 No profile in storage, using initial data");
          setUserProfile(getInitialUserProfile());
        }

      } catch (error) {
        console.error("❌ Failed to load data from localStorage:", error);
        // Fallback to initial data on any error
        setHabits(getInitialHabits());
        setProductivityData(getInitialProductivity());
        setAchievements(getInitialAchievements());
        setUserProfile(getInitialUserProfile());
      }
    };

    loadStoredData();
  }, []);

  /**
   * Save data to localStorage whenever state changes
   * Uses debounced approach to avoid excessive writes
   */
  useEffect(() => {
    const saveData = () => {
      try {
        if (habits.length > 0) {
          localStorage.setItem("habitdash_habits_v2", JSON.stringify(habits));
        }
        if (productivityData.length > 0) {
          localStorage.setItem("habitdash_productivity_v2", JSON.stringify(productivityData));
        }
        if (achievements.length > 0) {
          localStorage.setItem("habitdash_achievements_v2", JSON.stringify(achievements));
        }
        localStorage.setItem("habitdash_profile_v2", JSON.stringify(userProfile));
      } catch (error) {
        console.error("❌ Failed to save data to localStorage:", error);
      }
    };

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [habits, productivityData, achievements, userProfile]);

  /**
   * Loading screen timer
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenProfile = () => setIsProfileOpen(true);
  const handleCloseProfile = () => setIsProfileOpen(false);

  /**
   * Enhanced habit filtering with better date matching
   * Supports multiple strategies for finding habits by day
   */
  const filterHabitsByDay = (dayLabel: string) => {
    const productivityPoint = productivityData.find(
      (point) => point.date === dayLabel
    );

    if (!productivityPoint) {
      console.log(`❌ No productivity point found for ${dayLabel}`);
      return [];
    }

    // Strategy 1: Direct habit ID match (most reliable)
    if (productivityPoint.triggeringHabitId) {
      const directMatch = habits.find(
        (h) => h.id === productivityPoint.triggeringHabitId
      );
      if (directMatch) {
        console.log(`✅ Direct match found for ${dayLabel}: ${directMatch.id}`);
        return [directMatch];
      }
    }

    // Strategy 2: Date-based filtering using day index
    const dayIndex = productivityPoint.dayIndex || 
                    Number.parseInt(dayLabel.replace("Day ", ""));
    
    if (dayIndex && dayIndex <= habits.length) {
      // Get habit by reverse chronological order (newest first)
      const habitIndex = habits.length - dayIndex;
      if (habitIndex >= 0 && habitIndex < habits.length) {
        const habitByIndex = habits[habitIndex];
        console.log(`✅ Index-based match found for ${dayLabel}: ${habitByIndex.id}`);
        return [habitByIndex];
      }
    }

    // Strategy 3: Pattern-based matching (fallback)
    const expectedHabitId = `h${dayIndex}`;
    const patternMatch = habits.find((h) => h.id === expectedHabitId);
    if (patternMatch) {
      console.log(`✅ Pattern match found for ${dayLabel}: ${patternMatch.id}`);
      return [patternMatch];
    }

    // Strategy 4: Time-based filtering (last resort)
    const daysAgo = Math.max(0, habits.length - dayIndex + 1);
    const targetDate = new Date(Date.now() - daysAgo * 86400000);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const habitsForDay = habits.filter((habit) => {
      const habitDate = new Date(habit.timestamp);
      return habitDate >= dayStart && habitDate <= dayEnd;
    });

    console.log(`📅 Time-based filtering for ${dayLabel}: ${habitsForDay.length} habits found`);
    return habitsForDay;
  };

  /**
   * Enhanced chart click handler with better user feedback
   */
  const handleChartClick = (data: ChartEventData) => {
    console.log("📊 Chart clicked with data:", data);

    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload;
      const dayLabel = clickedData.date;

      console.log(`🎯 Clicked on ${dayLabel}`);

      // Toggle filter if clicking the same day
      if (selectedDay === dayLabel) {
        console.log("🔄 Clearing filter - same day clicked");
        clearDayFilter();
        return;
      }

      // Apply new filter
      setSelectedDay(dayLabel);
      const habitsForDay = filterHabitsByDay(dayLabel);
      setFilteredHabits(habitsForDay);

      // Highlight specific habit if available
      const habitId = clickedData.triggeringHabitId;
      if (habitId && habitsForDay.some((h) => h.id === habitId)) {
        setHighlightedHabitId(habitId);

        // Smooth scroll to highlighted habit
        setTimeout(() => {
          const habitElement = document.getElementById(`habit-${habitId}`);
          if (habitElement) {
            habitElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 300);

        // Auto-remove highlighting after 3 seconds
        setTimeout(() => setHighlightedHabitId(null), 3000);
      }

      console.log(`✅ Filter applied: ${habitsForDay.length} habits found for ${dayLabel}`);
    } else {
      console.log("❌ Chart click data is missing or invalid:", data);
    }
  };

  /**
   * Clear all day-based filters
   */
  const clearDayFilter = () => {
    setSelectedDay(null);
    setFilteredHabits([]);
    setHighlightedHabitId(null);
  };

  /**
   * Enhanced habit logging with automatic productivity generation
   */
  const handleLogHabit = (newHabitData: Omit<Habit, "id" | "timestamp">) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `h${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Add to habits list (prepend for chronological order)
    setHabits((prev) => [newHabit, ...prev]);

    // Clear any active filters to show the new habit
    clearDayFilter();

    // Generate corresponding productivity data point
    const lastDataPoint = productivityData[productivityData.length - 1];
    const baseScore = lastDataPoint ? lastDataPoint.score : 70;
    
    // Calculate new score with habit type bonuses
    const habitTypeBonus = {
      [HabitType.Work]: 5,
      [HabitType.Exercise]: 8,
      [HabitType.Reading]: 6,
      [HabitType.Meditation]: 7,
    };

    const bonus = habitTypeBonus[newHabitData.type] || 5;
    const randomVariation = Math.random() * 6 - 3; // -3 to +3
    const newScore = Math.min(100, Math.max(0, baseScore + bonus + randomVariation));

    const newProductivityPoint: ProductivityPoint = {
      date: `Day ${productivityData.length + 1}`,
      score: Math.round(newScore),
      triggeringHabitId: newHabit.id,
      dayIndex: productivityData.length + 1,
    };

    setProductivityData((prev) => [...prev, newProductivityPoint]);

    // Check for achievement unlocks
    checkAchievementUnlocks();

    console.log(`✅ New habit logged: ${newHabit.type} - ${newHabit.notes}`);
  };

  /**
   * Achievement system - check for unlocks based on habit data
   */
  const checkAchievementUnlocks = () => {
    setAchievements((prevAchievements) => {
      const updatedAchievements = [...prevAchievements];
      let hasUnlocks = false;

      // Check various achievement conditions
      const totalHabits = habits.length + 1; // Include the new habit

      updatedAchievements.forEach((achievement) => {
        if (!achievement.unlocked) {
          let shouldUnlock = false;

          switch (achievement.id) {
            case "a1": // First Timer
              shouldUnlock = totalHabits >= 1;
              break;
            case "a3": // Unlock New Job
              shouldUnlock = totalHabits >= 5;
              break;
            case "a7": // Facebook Fan
              shouldUnlock = totalHabits >= 10;
              break;
            case "a8": // Facebook Fan (duplicate)
              shouldUnlock = totalHabits >= 15;
              break;
            case "a12": // Best Friend
              shouldUnlock = totalHabits >= 20;
              break;
            default:
              break;
          }

          if (shouldUnlock) {
            achievement.unlocked = true;
            hasUnlocks = true;
            console.log(`🏆 Achievement unlocked: ${achievement.name}`);
          }
        }
      });

      return hasUnlocks ? updatedAchievements : prevAchievements;
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <main
        className="min-h-screen relative"
        style={{ backgroundColor: "#090302", fontFamily: "Ubuntu, sans-serif" }}
      >
        <CustomScrollbarStyles />
        <BackgroundElements />
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingScreen />
          </motion.div>
        </AnimatePresence>
      </main>
    );
  }

  return (
    <AnimatePresence>
      <motion.main
        className="min-h-screen flex flex-col relative"
        style={{ backgroundColor: "#090302", fontFamily: "Ubuntu, sans-serif" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <CustomScrollbarStyles />
        <BackgroundElements />
        
        {/* Navigation */}
        <div className="relative z-10">
          <Navbar onOpenProfile={handleOpenProfile} />
        </div>

        {/* Main Content */}
        <div className="flex-grow p-4 sm:p-6 lg:p-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 h-auto lg:h-[70vh]"
          >
            {/* Habit Timeline */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 h-full"
            >
              <GlassCard className="h-full flex flex-col p-3 sm:p-4">
                <div className="flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0 px-1 sm:px-2">
                  <h2
                    className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                    style={{ color: "#C8BFC7" }}
                  >
                    <FaCalendar
                      className="text-lg"
                      style={{ color: "#20B2AA" }}
                    />
                    Habit Timeline
                    {selectedDay && (
                      <span
                        className="text-sm sm:text-base font-normal ml-2 px-2 py-1 rounded-full"
                        style={{
                          color: "#20B2AA",
                          backgroundColor: "rgba(46, 58, 89, 0.2)",
                          border: "1px solid rgba(46, 58, 89, 0.3)",
                        }}
                      >
                        {selectedDay}
                      </span>
                    )}
                  </h2>
                </div>

                {/* Filter Status Indicator */}
                {selectedDay && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-2 rounded-lg flex items-center gap-2"
                    style={{
                      backgroundColor: "rgba(46, 58, 89, 0.1)",
                      border: "1px solid rgba(46, 58, 89, 0.2)",
                    }}
                  >
                    <FaFilter
                      className="text-sm"
                      style={{ color: "#20B2AA" }}
                    />
                    <span className="text-xs" style={{ color: "#C8BFC7" }}>
                      Showing {filteredHabits.length} habit
                      {filteredHabits.length !== 1 ? "s" : ""} for {selectedDay}
                    </span>
                    <motion.button
                      onClick={clearDayFilter}
                      className="ml-auto text-xs px-2 py-1 rounded cursor-pointer"
                      style={{
                        backgroundColor: "rgba(32, 178, 170, 0.2)",
                        color: "#20B2AA",
                        border: "1px solid rgba(32, 178, 170, 0.3)",
                      }}
                      whileHover={{
                        backgroundColor: "rgba(32, 178, 170, 0.3)",
                        scale: 1.05,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear Filter
                    </motion.button>
                  </motion.div>
                )}

                {/* Habit List */}
                <Reorder.Group
                  axis="y"
                  values={selectedDay ? filteredHabits : habits}
                  onReorder={selectedDay ? () => {} : setHabits}
                  className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 space-y-2 sm:space-y-3 custom-scrollbar max-h-[300px] lg:max-h-[calc(70vh-120px)] min-h-[250px] lg:min-h-0"
                >
                  {(selectedDay ? filteredHabits : habits).length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center h-32 text-center px-4"
                    >
                      <div
                        className="p-6 rounded-lg"
                        style={{ backgroundColor: "#2E3A59" }}
                      >
                        <FaCalendarAlt
                          className="text-3xl mb-3 mx-auto"
                          style={{ color: "#4A566F" }}
                        />
                        <p
                          className="text-lg font-semibold mb-2"
                          style={{ color: "#C8BFC7" }}
                        >
                          {selectedDay 
                            ? `No habits logged for ${selectedDay}`
                            : "No habits logged yet"
                          }
                        </p>
                        <p className="text-sm" style={{ color: "#4A566F" }}>
                          {selectedDay
                            ? "Try selecting a different day or add some habits!"
                            : "Click the + button to log your first habit!"
                          }
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    (selectedDay ? filteredHabits : habits).map(
                      (habit, index) => {
                        const Icon = habitIcons[habit.type];
                        const isFirst = index === 0;
                        const isLast =
                          index ===
                          (selectedDay ? filteredHabits : habits).length - 1;
                        const isHighlighted = highlightedHabitId === habit.id;

                        return (
                          <Reorder.Item
                            key={habit.id}
                            value={habit}
                            className={
                              selectedDay
                                ? "cursor-default"
                                : "cursor-grab active:cursor-grabbing"
                            }
                          >
                            <motion.div
                              id={`habit-${habit.id}`}
                              className={`p-3 mx-1 rounded-xl border transition-all duration-500 ${
                                isFirst ? "mt-1" : ""
                              } ${isLast ? "mb-1" : ""} ${
                                isHighlighted ? "habit-highlight" : ""
                              }`}
                              style={{
                                backgroundColor: isHighlighted
                                  ? "rgba(46, 58, 89, 0.4)"
                                  : "rgba(138, 126, 114, 0.2)",
                                borderColor: isHighlighted
                                  ? "#20B2AA"
                                  : "transparent",
                                transform: isHighlighted
                                  ? "scale(1.02)"
                                  : "scale(1)",
                                boxShadow: isHighlighted
                                  ? "0 8px 25px rgba(46, 58, 89, 0.4)"
                                  : "none",
                              }}
                              whileHover={
                                !selectedDay
                                  ? {
                                      scale: 1.02,
                                      borderColor: "rgba(46, 58, 89, 0.5)",
                                    }
                                  : {}
                              }
                              layout
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className="p-2.5 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: isHighlighted
                                      ? "rgba(46, 58, 89, 0.3)"
                                      : "#4A566F",
                                  }}
                                >
                                  <Icon
                                    className="text-xl"
                                    style={{
                                      color: isHighlighted
                                        ? "#20B2AA"
                                        : "#C8BFC7",
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <p
                                    className="font-semibold"
                                    style={{ color: "#C8BFC7" }}
                                  >
                                    {habit.type}
                                  </p>
                                  <p
                                    className="text-sm"
                                    style={{ color: "#C8BFC7" }}
                                  >
                                    {habit.notes}
                                  </p>
                                  <p className="text-xs mt-1">
                                    <ClientTimestamp
                                      timestamp={habit.timestamp}
                                    />
                                  </p>
                                </div>
                                {isHighlighted && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="flex-shrink-0"
                                  >
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: "#20B2AA" }}
                                    >
                                      <FaBullseye
                                        className="text-xs"
                                        style={{ color: "#C8BFC7" }}
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          </Reorder.Item>
                        );
                      }
                    )
                  )}
                </Reorder.Group>
              </GlassCard>
            </motion.div>

            {/* Productivity Chart */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 h-full mt-6 lg:mt-0"
            >
              <GlassCard className="h-full p-3 sm:p-4 lg:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
                  <div>
                    <h2
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: "#C8BFC7" }}
                    >
                      Productivity Score Trends
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#4A566F" }}>
                      {selectedDay
                        ? `Filtered view for ${selectedDay} - Click the same day again to clear filter`
                        : "Click any data point to filter habits by day"}
                    </p>
                  </div>
                  {selectedDay && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs sm:text-sm px-3 py-2 rounded-full flex items-center gap-2"
                      style={{
                        backgroundColor: "rgba(46, 58, 89, 0.2)",
                        color: "#20B2AA",
                        border: "1px solid rgba(46, 58, 89, 0.3)",
                      }}
                    >
                      <FaBullseye size={12} />
                      {selectedDay} Active
                    </motion.div>
                  )}
                </div>
                <div
                  className="flex-1 h-[300px] lg:h-auto chart-container"
                  style={{
                    minHeight: "300px",
                    maxHeight: "calc(70vh - 120px)",
                    cursor: "pointer",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={productivityData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                      onClick={handleChartClick}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(138, 126, 114, 0.3)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#4A566F"
                        tick={{ fill: "#4A566F", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#4A566F"
                        tick={{ fill: "#4A566F", fontSize: 12 }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                          stroke: "rgba(46, 58, 89, 0.5)",
                          strokeWidth: 2,
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#C8BFC7" }} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#20B2AA"
                        strokeWidth={3}
                        style={{ pointerEvents: "none" }}
                        dot={(props) => {
                          const { cx, cy, payload, index } = props;
                          const isSelected = selectedDay === payload?.date;
                          const hasHabits = payload?.triggeringHabitId;

                          return (
                            <g
                              key={`dot-group-${index}-${
                                payload?.date || "unknown"
                              }`}
                            >
                              {/* Invisible larger hit area */}
                              <circle
                                cx={cx}
                                cy={cy}
                                r={12}
                                fill="transparent"
                                style={{
                                  cursor: "pointer",
                                  pointerEvents: "all",
                                  zIndex: 15,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Dot clicked:", payload);
                                  if (payload && payload.date) {
                                    handleChartClick({
                                      activePayload: [{ payload }],
                                    });
                                  }
                                }}
                              />
                              {/* Visible dot */}
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isSelected ? 8 : hasHabits ? 6 : 4}
                                fill={
                                  isSelected
                                    ? "#C8BFC7"
                                    : hasHabits
                                    ? "#20B2AA"
                                    : "#4A566F"
                                }
                                stroke={isSelected ? "#20B2AA" : "#C8BFC7"}
                                strokeWidth={isSelected ? 2 : 1}
                                style={{
                                  filter: isSelected
                                    ? "drop-shadow(0 0 6px rgba(46, 58, 89, 0.6))"
                                    : "none",
                                  pointerEvents: "none",
                                  zIndex: 10,
                                }}
                              />
                            </g>
                          );
                        }}
                        activeDot={{
                          r: 8,
                          stroke: "#C8BFC7",
                          strokeWidth: 2,
                          fill: "#20B2AA",
                          filter: "drop-shadow(0 0 6px rgba(46, 58, 89, 0.4))",
                          style: {
                            cursor: "pointer",
                            pointerEvents: "all",
                            zIndex: 15,
                          },
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Achievement Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 sm:mt-12"
          >
            {/* Achievement Section Header */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
              >
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#20B2AA" }}
                >
                  <FaTrophy
                    className="text-sm sm:text-lg"
                    style={{ color: "#C8BFC7" }}
                  />
                </div>
                <h3
                  className="text-xl sm:text-2xl lg:text-3xl font-bold"
                  style={{ color: "#C8BFC7" }}
                >
                  Achievement Badges
                </h3>
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#20B2AA" }}
                >
                  <FaTrophy
                    className="text-sm sm:text-lg"
                    style={{ color: "#C8BFC7" }}
                  />
                </div>
              </motion.div>
              <p
                className="text-xs sm:text-sm px-4 sm:px-0"
                style={{ color: "#4A566F" }}
              >
                Unlock badges by completing various habit milestones
              </p>
            </div>

            {/* Achievement Carousel */}
            <div className="w-full max-w-6xl mx-auto custom-scrollbar">
              <AchievementCarousel achievements={achievements} />
            </div>
          </motion.div>

          {/* Floating Action Button */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl z-50 cursor-pointer"
            style={{
              backgroundColor: "#20B2AA",
              color: "#090302",
              boxShadow: "0 25px 50px -12px rgba(46, 58, 89, 0.4)",
            }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <FaPlus className="text-lg sm:text-xl" />
          </motion.button>

          {/* Modals */}
          <LogHabitModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onLog={handleLogHabit}
          />

          <ProfileModal
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            profile={userProfile}
            habits={habits}
          />
        </div>

        {/* Footer */}
        <Footer />
      </motion.main>
    </AnimatePresence>
  );
};

export default HabitTrackerDashboard;
