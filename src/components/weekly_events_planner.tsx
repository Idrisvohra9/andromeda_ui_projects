"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoClose,
  IoTime,
  IoCheckmarkCircle,
  IoCheckbox,
  IoCheckboxOutline,
  IoAdd,
  IoCalendar,
} from "react-icons/io5";
import { RxDragHandleDots2 } from "react-icons/rx";
import { clsx } from "clsx";

// --- DATE UTILITY FUNCTIONS ---

// Formats a date according to the specified format string
const formatDate = (date: Date, format: string): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  switch (format) {
    case "yyyy-MM-dd":
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    case "EEE":
      return daysShort[dayOfWeek];
    case "d":
      return String(day);
    case "EEEE":
      return days[dayOfWeek];
    case "MMMM d, yyyy":
      return `${months[month]} ${day}, ${year}`;
    default:
      return date.toISOString();
  }
};

// Returns the start of the week for a given date (Monday by default)
const getStartOfWeek = (date: Date, weekStartsOn: number = 1): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Adds a specified number of days to a date
const addDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

// Checks if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Checks if a date is today
const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// Checks if a date is in the past (before today)
const isPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

// --- TYPE DEFINITIONS ---
type Event = {
  id: string;
  title: string;
  description: string;
  day: string; // ISO date string (e.g., "2025-01-20")
  color: string; // Tailwind CSS background color class
  completed: boolean;
};

// --- INITIAL DATA ---

// Generates initial sample events for the current week
const getInitialEvents = (): Event[] => {
  const today = new Date();
  const startOfThisWeek = getStartOfWeek(today, 1); // Monday

  return [
    {
      id: "1",
      title: "Team Sync",
      description: "Weekly team synchronization meeting.",
      day: formatDate(addDays(startOfThisWeek, 0), "yyyy-MM-dd"),
      color: "bg-cyan-500",
      completed: false,
    },
    {
      id: "2",
      title: "Design Review",
      description: "Review the new dashboard design mockups.",
      day: formatDate(addDays(startOfThisWeek, 0), "yyyy-MM-dd"),
      color: "bg-purple-500",
      completed: true,
    },
    {
      id: "3",
      title: "Deploy to Staging",
      description: "Deploy the latest feature branch to the staging server.",
      day: formatDate(addDays(startOfThisWeek, 1), "yyyy-MM-dd"),
      color: "bg-pink-500",
      completed: false,
    },
    {
      id: "4",
      title: "Client Call",
      description: "Follow-up call with Project Unicorn client.",
      day: formatDate(addDays(startOfThisWeek, 2), "yyyy-MM-dd"),
      color: "bg-yellow-400",
      completed: false,
    },
    {
      id: "5",
      title: "Write Report",
      description: "Finalize and submit the Q3 performance report.",
      day: formatDate(addDays(startOfThisWeek, 3), "yyyy-MM-dd"),
      color: "bg-green-500",
      completed: false,
    },
    {
      id: "6",
      title: "User Testing",
      description:
        "Conduct user testing session for the new mobile app feature.",
      day: formatDate(addDays(startOfThisWeek, 4), "yyyy-MM-dd"),
      color: "bg-purple-500",
      completed: false,
    },
    {
      id: "7",
      title: "Code Refactor",
      description: "Refactor the authentication module.",
      day: formatDate(addDays(startOfThisWeek, 0), "yyyy-MM-dd"),
      color: "bg-pink-500",
      completed: false,
    },
    {
      id: "8",
      title: "Submit Expenses",
      description: "Last day to submit monthly expenses.",
      day: formatDate(addDays(startOfThisWeek, -2), "yyyy-MM-dd"),
      color: "bg-yellow-400",
      completed: false,
    }, // Overdue task
    {
      id: "9",
      title: "Plan Next Sprint",
      description: "Team meeting to plan tasks for the upcoming sprint.",
      day: formatDate(addDays(startOfThisWeek, 4), "yyyy-MM-dd"),
      color: "bg-cyan-500",
      completed: false,
    },
  ];
};

// --- SUB-COMPONENTS ---

// Event card component with drag functionality and visual indicators
interface EventCardProps {
  event: Event;
  onDragStart: (event: Event) => void;
  onToggleComplete: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onDragStart,
  onToggleComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [longPressTimer, setLongPressTimer] = useState<number | null>(
    null
  );

  // Check if task is overdue (past due date and not completed)
  const isTaskOverdue =
    isPast(new Date(event.day)) &&
    !isToday(new Date(event.day)) &&
    !event.completed;

  // Utility function to prevent scroll during drag operations
  const preventScroll = useCallback((e: TouchEvent | WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle drag start event with data transfer setup
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", event.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(event);
  };

  // Handle drag end event to reset visual state
  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove("opacity-50");
    }
  };

  // Handle drag start visual feedback
  const handleDragStartVisual = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.add("opacity-50");
    }
  };

  // Enhanced touch handling for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });

    // Clear any existing timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }

    // Add long press detection
    const timer = setTimeout(() => {
      setIsDragging(true);
      onDragStart(event);

      // Add visual feedback and trigger mobile drag start
      const target = e.currentTarget as HTMLElement;
      if (target) {
        target.classList.add("opacity-75", "scale-105", "z-50");
      }

      document.dispatchEvent(new CustomEvent("mobile-drag-start"));

      // Disable scrolling during drag
      document.body.style.overflow = "hidden";
      // Add dragging class to body for additional CSS rules
      document.body.classList.add("dragging");

      // Prevent default scroll behavior on document with non-passive listeners
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("wheel", preventScroll, { passive: false });
    }, 800); // 800ms long press

    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !touchStart) return;

    // Enhanced scroll prevention - block all scroll attempts
    try {
    //   e.preventDefault();
      e.stopPropagation();
    } catch {
      // Silently handle passive event listener errors
      console.warn("Could not prevent default on touch move");
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (isDragging) {
      // Find drop target
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );
      const dropZone = elementBelow?.closest("[data-drop-zone]");

      if (dropZone) {
        const dayString = dropZone.getAttribute("data-drop-zone");
        if (dayString && dayString !== event.day) {
          // Trigger drop
          const dropEvent = new CustomEvent("mobile-drop", {
            detail: { eventId: event.id, targetDay: dayString },
          });
          document.dispatchEvent(dropEvent);
        }
      }
    }

    // Reset states
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setTouchStart(null);

    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove("opacity-75", "scale-105", "z-50");
    }

    // Restore scroll behavior
    document.body.classList.remove("dragging");
    document.body.style.overflow = "";

    // Remove scroll prevention event listeners
    document.removeEventListener("touchmove", preventScroll);
    document.removeEventListener("wheel", preventScroll);

    // Trigger mobile drag end
    document.dispatchEvent(new CustomEvent("mobile-drag-end"));
  };

  // Handle checkbox toggle
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering drag events
    onToggleComplete(event.id);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <div
      draggable
      onDragStart={(e: React.DragEvent) => {
        handleDragStart(e);
        handleDragStartVisual(e);
      }}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={clsx(
        "group p-3 mb-2 rounded-xl text-white shadow-lg cursor-grab active:cursor-grabbing relative transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm touch-manipulation",
        event.color,
        event.completed && "opacity-60",
        "border border-white/10 hover:border-white/20",
        isDragging && "fixed pointer-events-none z-50"
      )}
      style={
        isDragging
          ? {
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
              zIndex: 9999,
            }
          : undefined
      }
    >
      <div className="flex items-center">
        <div className="touch-none flex-shrink-0">
          <RxDragHandleDots2
            size={20}
            className="text-white/50 group-hover:text-white/80 transition-colors"
          />
        </div>
        <div className="flex-grow ml-2">
          <p
            className={clsx(
              "font-semibold text-sm",
              event.completed && "line-through"
            )}
          >
            {event.title}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center space-x-2">
          {/* Checkbox for completion toggle */}
          <button
            onClick={handleToggleComplete}
            className="text-white/70 hover:text-white transition-colors p-1"
            title={event.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {event.completed ? (
              <IoCheckbox size={18} className="text-green-300" />
            ) : (
              <IoCheckboxOutline size={18} className="hover:text-green-300" />
            )}
          </button>
          {isTaskOverdue && (
            <div
              className="w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"
              title="Overdue"
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

// Day column component with drag and drop functionality
interface DayColumnProps {
  day: Date;
  events: Event[];
  onDayClick: (day: Date) => void;
  onDrop: (dayString: string) => void;
  isDragOver: boolean;
  onDragOver: (dayString: string | null) => void;
  onDragStart: (event: Event) => void;
  onToggleComplete: (eventId: string) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({
  day,
  events,
  onDayClick,
  onDrop,
  isDragOver,
  onDragOver,
  onDragStart,
  onToggleComplete,
}) => {
  const dayString = formatDate(day, "yyyy-MM-dd");
  const dayFormat = "EEE"; // e.g., "Mon"
  const dateFormat = "d"; // e.g., "5"

  // Handle desktop drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(dayString);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger drag leave if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onDragOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(dayString);
    onDragOver(null);
  };

  // Handle mobile drop events
  useEffect(() => {
    const handleMobileDrop = (e: CustomEvent) => {
      const { targetDay } = e.detail;
      if (targetDay === dayString) {
        onDrop(targetDay);
      }
    };

    // Add visual feedback for mobile drag
    const handleMobileDragStart = () => {
      document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
        zone.classList.add("mobile-drag-active");
      });

      // Additional global scroll lock for better UX on mobile
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        );
      }
    };

    const handleMobileDragEnd = () => {
      document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
        zone.classList.remove("mobile-drag-active");
      });

      // Restore normal viewport behavior
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0"
        );
      }
    };

    document.addEventListener("mobile-drop", handleMobileDrop as EventListener);
    document.addEventListener("mobile-drag-start", handleMobileDragStart);
    document.addEventListener("mobile-drag-end", handleMobileDragEnd);

    return () => {
      document.removeEventListener(
        "mobile-drop",
        handleMobileDrop as EventListener
      );
      document.removeEventListener("mobile-drag-start", handleMobileDragStart);
      document.removeEventListener("mobile-drag-end", handleMobileDragEnd);
    };
  }, [dayString, onDrop]);

  return (
    <motion.div
      data-drop-zone={dayString}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onDayClick(day)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={clsx(
        "flex-1 min-h-[200px] md:min-h-0 p-3 md:p-4 rounded-2xl border transition-all duration-300 ease-in-out cursor-pointer select-none",
        "bg-white/5 backdrop-blur-lg shadow-lg hover:shadow-xl", // Enhanced glassmorphism
        isDragOver
          ? "bg-white/20 border-purple-400 shadow-purple-400/25 scale-105"
          : "hover:bg-white/10",
        isToday(day)
          ? "border-purple-400 border-2 bg-purple-400/10"
          : "border-white/10 hover:border-white/20",
        // Mobile-friendly touch target
        "touch-manipulation"
      )}
    >
      <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start mb-4 md:mb-2">
        <div className="flex items-baseline space-x-2 md:flex-col md:space-x-0 md:items-start">
          <p className="font-bold text-lg text-purple-300">
            {formatDate(day, dayFormat)}
          </p>
          <p
            className={clsx(
              "text-2xl font-light",
              isToday(day) ? "text-white" : "text-gray-400"
            )}
          >
            {formatDate(day, dateFormat)}
          </p>
        </div>
        <div className="md:hidden h-full min-h-[120px] w-full ml-4">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDragStart={onDragStart}
                onToggleComplete={onToggleComplete}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm mt-4">
              No events
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:block h-full min-h-[200px]">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDragStart={onDragStart}
              onToggleComplete={onToggleComplete}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No events
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: Date | null;
  events: Event[];
  onToggleComplete: (eventId: string) => void;
}

const AgendaModal: React.FC<AgendaModalProps> = ({
  isOpen,
  onClose,
  day,
  events,
  onToggleComplete,
}) => {
  if (!day) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-gray-900/50 backdrop-blur-xl shadow-2xl p-6 text-white"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <IoClose size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-purple-300">
                {formatDate(day, "EEEE")}
              </h2>
              <p className="text-xl text-gray-300">
                {formatDate(day, "MMMM d, yyyy")}
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {events.length > 0 ? (
                events.map((event) => {
                  const isTaskOverdue =
                    isPast(new Date(event.day)) &&
                    !isToday(new Date(event.day)) &&
                    !event.completed;
                  return (
                    <div
                      key={event.id}
                      className={clsx(
                        "p-4 rounded-lg relative",
                        event.color,
                        event.completed && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3
                            className={clsx(
                              "font-bold text-lg",
                              event.completed && "line-through"
                            )}
                          >
                            {event.title}
                          </h3>
                          <p className="text-sm text-white/80 mt-1">
                            {event.description}
                          </p>
                        </div>
                        {/* Checkbox for completion toggle */}
                        <button
                          onClick={() => onToggleComplete(event.id)}
                          className="text-white/70 hover:text-white transition-colors p-1 ml-3"
                          title={
                            event.completed
                              ? "Mark as incomplete"
                              : "Mark as complete"
                          }
                        >
                          {event.completed ? (
                            <IoCheckbox size={20} className="text-green-300" />
                          ) : (
                            <IoCheckboxOutline
                              size={20}
                              className="hover:text-green-300"
                            />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-white/70">
                        {event.completed && (
                          <div className="flex items-center">
                            <IoCheckmarkCircle
                              size={16}
                              className="mr-1 text-green-300"
                            />{" "}
                            Completed
                          </div>
                        )}
                        {isTaskOverdue && (
                          <div className="flex items-center">
                            <IoTime size={16} className="mr-1 text-red-400" />{" "}
                            Overdue
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400">
                  No events scheduled for this day.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add Event Modal component for creating new events
interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<Event, "id">) => void;
  selectedDate?: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
  selectedDate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDay, setSelectedDay] = useState(selectedDate || "");
  const [selectedColor, setSelectedColor] = useState("bg-cyan-500");

  // Available color options for events
  const colorOptions = useMemo(
    () => [
      { value: "bg-cyan-500", label: "Cyan", bg: "bg-cyan-500" },
      { value: "bg-purple-500", label: "Purple", bg: "bg-purple-500" },
      { value: "bg-pink-500", label: "Pink", bg: "bg-pink-500" },
      { value: "bg-yellow-400", label: "Yellow", bg: "bg-yellow-400" },
      { value: "bg-green-500", label: "Green", bg: "bg-green-500" },
      { value: "bg-blue-500", label: "Blue", bg: "bg-blue-500" },
      { value: "bg-red-500", label: "Red", bg: "bg-red-500" },
      { value: "bg-indigo-500", label: "Indigo", bg: "bg-indigo-500" },
    ],
    []
  );

  // Generate week dates for date selector
  const weekDates = useMemo(() => {
    const today = new Date();
    const start = getStartOfWeek(today, 1);
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSelectedDay(selectedDate || formatDate(new Date(), "yyyy-MM-dd"));
      setSelectedColor("bg-cyan-500");
    }
  }, [isOpen, selectedDate]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent: Omit<Event, "id"> = {
      title: title.trim(),
      description: description.trim(),
      day: selectedDay,
      color: selectedColor,
      completed: false,
    };

    onAddEvent(newEvent);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-
          blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/20 bg-gray-900/50 backdrop-blur-xl shadow-2xl p-6 text-white"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <IoClose size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-purple-300 flex items-center">
                <IoCalendar className="mr-2" />
                Add New Event
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                Create a new event for your weekly planner
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter event description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                />
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {weekDates.map((date) => {
                    const dateString = formatDate(date, "yyyy-MM-dd");
                    const isSelected = selectedDay === dateString;
                    const isToday =
                      formatDate(new Date(), "yyyy-MM-dd") === dateString;

                    return (
                      <button
                        key={dateString}
                        type="button"
                        onClick={() => setSelectedDay(dateString)}
                        className={clsx(
                          "p-2 rounded-lg text-xs font-medium transition-all duration-200",
                          isSelected
                            ? "bg-purple-500 text-white shadow-lg"
                            : "bg-white/10 text-gray-300 hover:bg-white/20",
                          isToday && !isSelected && "border border-purple-400"
                        )}
                      >
                        <div className="text-center">
                          <div className="text-xs">
                            {formatDate(date, "EEE")}
                          </div>
                          <div className="font-bold">
                            {formatDate(date, "d")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={clsx(
                        "p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center",
                        color.bg,
                        selectedColor === color.value
                          ? "ring-2 ring-white shadow-lg scale-105"
                          : "hover:scale-105"
                      )}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- MAIN COMPONENT ---

const WeeklyPlannerPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  useEffect(() => {
    // Set initial data only once on client-side mount
    setEvents(getInitialEvents());

    const today = new Date();
    const start = getStartOfWeek(today, 1); // Monday
    const dates = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    setWeekDates(dates);
  }, []);

  // Memoized computation of events grouped by day for performance
  const eventsByDay = useMemo(() => {
    return weekDates.reduce<Record<string, Event[]>>((acc, day) => {
      const dayKey = formatDate(day, "yyyy-MM-dd");
      acc[dayKey] = events.filter((event) =>
        isSameDay(new Date(event.day), day)
      );
      return acc;
    }, {});
  }, [events, weekDates]);

  // Memoized drag start handler to prevent unnecessary re-renders
  const handleDragStart = useCallback((event: Event) => {
    setDraggedEvent(event);
  }, []);

  // Memoized drop handler for event rescheduling
  const handleDrop = useCallback(
    (targetDay: string) => {
      if (!draggedEvent) return;

      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.id === draggedEvent.id ? { ...event, day: targetDay } : event
        );
        return updatedEvents;
      });

      setDraggedEvent(null);
    },
    [draggedEvent]
  );

  // Memoized drag over handler for visual feedback
  const handleDragOver = useCallback((dayString: string | null) => {
    setDragOverDay(dayString);
  }, []);

  // Memoized day click handler for modal opening
  const handleDayClick = useCallback((day: Date) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  }, []);

  // Memoized modal close handler
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing selectedDay to allow for exit animation
    setTimeout(() => setSelectedDay(null), 300);
  }, []);

  // Memoized toggle complete handler for events
  const handleToggleComplete = useCallback((eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, completed: !event.completed } : event
      )
    );
  }, []);

  // Memoized selected day events for modal display
  const selectedDayEvents = useMemo(
    () =>
      selectedDay
        ? eventsByDay[formatDate(selectedDay, "yyyy-MM-dd")] ?? []
        : [],
    [selectedDay, eventsByDay]
  );

  // Memoized handler for adding new events
  const handleAddEvent = useCallback((newEvent: Omit<Event, "id">) => {
    setEvents((prevEvents) => [
      ...prevEvents,
      {
        ...newEvent,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      },
    ]);
  }, []);

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
                * {
                    font-family: 'Rubik';
                }
                
                /* Mobile drag enhancements */
                @media (max-width: 768px) {
                  .mobile-drag-active {
                    border: 2px dashed rgba(168, 85, 247, 0.6) !important;
                    background: rgba(168, 85, 247, 0.1) !important;
                    transform: scale(1.02) !important;
                  }
                  
                  /* Enhanced scroll prevention during drag */
                  .dragging {
                    overflow: hidden !important;
                    position: fixed !important;
                    width: 100% !important;
                    height: 100% !important;
                    -webkit-overflow-scrolling: touch !important;
                  }
                  
                  .dragging * {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    -webkit-touch-callout: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                  }
                  
                  /* Prevent scroll behavior on the main container during drag */
                  .dragging .min-h-screen {
                    overflow: hidden !important;
                    position: relative !important;
                  }
                  
                  /* Enhance touch targets */
                  .touch-manipulation {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    -khtml-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    touch-action: manipulation;
                  }
                  
                  /* Prevent momentum scrolling during drag */
                  .dragging * {
                    -webkit-overflow-scrolling: auto !important;
                  }
                  
                  /* Prevent rubber band scrolling on iOS */
                  .dragging html, .dragging body {
                    position: fixed !important;
                    overflow: hidden !important;
                    -webkit-overflow-scrolling: touch !important;
                    height: 100% !important;
                    width: 100% !important;
                  }
                  
                  /* Disable pull-to-refresh during drag */
                  .dragging {
                    overscroll-behavior: none !important;
                    -webkit-overscroll-behavior: none !important;
                  }
                }
            `}</style>
      <div className="min-h-screen w-full bg-gray-900 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-4">
            Weekly Planner
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Drag and drop tasks to reschedule them effortlessly. Click any day
            to view detailed agenda.
          </p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 md:hidden">
            On mobile: Long press and drag to move tasks between days
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full border-2 border-purple-300"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Overdue</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoCheckmarkCircle size={14} className="text-green-400" />
              <span>Completed</span>
            </div>
          </div>
        </header>

        <main className="flex flex-col md:flex-row gap-2 md:gap-4 max-w-7xl mx-auto">
          {weekDates.map((day) => {
            const dayString = formatDate(day, "yyyy-MM-dd");
            return (
              <DayColumn
                key={day.toString()}
                day={day}
                events={eventsByDay[dayString] ?? []}
                onDayClick={handleDayClick}
                onDrop={handleDrop}
                isDragOver={dragOverDay === dayString}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                onToggleComplete={handleToggleComplete}
              />
            );
          })}
        </main>

        {/* Floating Add Button */}
        <motion.button
          onClick={() => setIsAddEventModalOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(168, 85, 247, 0.4)",
              "0 0 0 10px rgba(168, 85, 247, 0)",
              "0 0 0 0 rgba(168, 85, 247, 0)",
            ],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white z-30 transition-all duration-300 touch-manipulation cursor-pointer"
          title="Add New Event"
        >
          <IoAdd size={28} />
        </motion.button>

        <AgendaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          day={selectedDay}
          events={selectedDayEvents}
          onToggleComplete={handleToggleComplete}
        />

        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onAddEvent={handleAddEvent}
          selectedDate={
            selectedDay ? formatDate(selectedDay, "yyyy-MM-dd") : undefined
          }
        />

        <footer className="text-center mt-12 text-gray-400 text-sm">
          <p className="mb-2">
            Built with React, TypeScript, Tailwind CSS & Framer Motion
          </p>
        </footer>
      </div>
    </>
  );
};

export default WeeklyPlannerPage;
