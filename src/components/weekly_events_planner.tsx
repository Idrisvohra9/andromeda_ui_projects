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
  IoCalendarOutline,
  IoPersonOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoChevronBack,
  IoChevronForward,
  IoArrowForward,
  IoTrash,
  IoWarning,
} from "react-icons/io5";
import { RxDragHandleDots2 } from "react-icons/rx";
import { clsx } from "clsx";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  isPast,
  parseISO,
} from "date-fns";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

// --- TYPE DEFINITIONS ---
type Event = {
  id: string;
  title: string;
  description: string;
  day: string; // ISO date string (e.g., "2025-01-20")
  color: string; // Tailwind CSS background color class
  completed: boolean;
};

// DnD Item Types
const ItemTypes = {
  EVENT: "event",
  TRASH: "trash",
};

// Detect if we're on a touch device
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// --- INITIAL DATA ---
const eventCompleteSound = new Audio("/sounds/event-complete.mp3");
const eventIncompleteSound = new Audio("/sounds/error.mp3");
const eventAddedSound = new Audio("/sounds/pop.mp3");

// Initialize with empty events array
const getInitialEvents = (): Event[] => {
  return [];
};

// --- SUB-COMPONENTS ---

// Event card component with react-dnd drag functionality
interface EventCardProps {
  event: Event;
  onToggleComplete: (eventId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onToggleComplete,
  onDragStart,
  onDragEnd,
}) => {
  // Check if event is overdue (past due date and not completed)
  const eventDate = parseISO(event.day);
  const isEventOverdue =
    isPast(eventDate) && !isToday(eventDate) && !event.completed;

  // react-dnd drag hook
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: ItemTypes.EVENT,
      item: () => {
        onDragStart?.();
        return { id: event.id, event };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        onDragEnd?.();
      },
    }),
    [event, onDragStart, onDragEnd]
  );

  // Handle checkbox toggle
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering drag events
    onToggleComplete(event.id);
  };

  return (
    <div
      ref={dragPreview as unknown as React.RefObject<HTMLDivElement>}
      className={clsx(
        "group p-3 mb-2 rounded-xl text-white shadow-lg relative transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm touch-manipulation",
        event.color,
        event.completed && "opacity-60",
        "border border-white/10 hover:border-white/20",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-center">
        <div
          ref={drag as unknown as React.RefObject<HTMLDivElement>}
          className="touch-none flex-shrink-0 cursor-grab active:cursor-grabbing"
        >
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
          {isEventOverdue && (
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

// Day column component with react-dnd drop functionality
interface DayColumnProps {
  day: Date;
  events: Event[];
  onDayClick: (day: Date) => void;
  onMoveEvent: (eventId: string, targetDay: string) => void;
  onToggleComplete: (eventId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const DayColumn: React.FC<DayColumnProps> = ({
  day,
  events,
  onDayClick,
  onMoveEvent,
  onToggleComplete,
  onDragStart,
  onDragEnd,
}) => {
  const dayString = format(day, "yyyy-MM-dd");
  const dayFormat = format(day, "EEE"); // e.g., "Mon"
  const dateFormat = format(day, "d"); // e.g., "5"

  // react-dnd drop hook
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      drop: (item: { id: string; event: Event }) => {
        if (item.event.day !== dayString) {
          onMoveEvent(item.id, dayString);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [dayString, onMoveEvent]
  );

  const isDragOver = isOver && canDrop;

  return (
    <motion.div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      onClick={() => onDayClick(day)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={clsx(
        "flex-1 min-h-[200px] md:min-h-0 p-3 md:p-4 rounded-2xl border transition-all duration-300 ease-in-out cursor-pointer select-none",
        "backdrop-blur-lg shadow-lg hover:shadow-xl", // Enhanced glassmorphism
        isDragOver
          ? "border-opacity-100 shadow-xl scale-105"
          : "hover:bg-opacity-80",
        isToday(day)
          ? "border-2 bg-opacity-20"
          : "border-white/10 hover:border-white/20",
        // Mobile-friendly touch target
        "touch-manipulation"
      )}
      style={{
        backgroundColor: isDragOver ? "#374151" : "#1F2937",
        borderColor: isToday(day) ? "#FCA311" : "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start mb-4 md:mb-2">
        <div className="flex items-baseline space-x-2 flex-col">
          <p className="font-bold text-lg" style={{ color: "#FCA311" }}>
            {dayFormat}
          </p>
          <p
            className={clsx(
              "text-2xl font-light",
              isToday(day) ? "text-white" : "text-gray-400"
            )}
          >
            {dateFormat}
          </p>
        </div>
        <div className="md:hidden h-full min-h-[120px] w-full ml-4">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onToggleComplete={onToggleComplete}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
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
              onToggleComplete={onToggleComplete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
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
  onMoveEventToNextWeek: (eventId: string) => void;
}

const AgendaModal: React.FC<AgendaModalProps> = ({
  isOpen,
  onClose,
  day,
  events,
  onToggleComplete,
  onMoveEventToNextWeek,
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
            className="relative w-full max-w-lg rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl p-6 text-white"
            style={{ backgroundColor: "#1F2937" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <IoClose size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-3xl font-bold" style={{ color: "#FCA311" }}>
                {format(day, "EEEE")}
              </h2>
              <p className="text-xl text-gray-300">
                {format(day, "MMMM d, yyyy")}
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {events.length > 0 ? (
                events.map((event) => {
                  const eventDate = parseISO(event.day);
                  const isEventOverdue =
                    isPast(eventDate) &&
                    !isToday(eventDate) &&
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
                        {isEventOverdue && (
                          <div className="flex items-center">
                            <IoTime size={16} className="mr-1 text-red-400" />{" "}
                            Overdue
                          </div>
                        )}
                        <motion.button
                          onClick={() => {
                            onMoveEventToNextWeek(event.id);
                            // Show a brief success message
                            console.log(
                              `Event "${event.title}" moved to next week`
                            );
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center text-xs hover:text-white transition-colors px-3 py-1.5 rounded-md border border-white/20"
                          style={{
                            backgroundColor: "#374151",
                            color: "#FCA311",
                          }}
                          title="Move this event to the same day next week"
                        >
                          <IoArrowForward size={12} className="mr-1" />
                          Move to next week
                        </motion.button>
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
  currentWeekStart: Date;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
  selectedDate,
  currentWeekStart,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDay, setSelectedDay] = useState(selectedDate || "");
  const [selectedColor, setSelectedColor] = useState("bg-cyan-500");

  // Available color options for events
  const colorOptions = useMemo(
    () => [
      { value: "bg-cyan-500", label: "Cyan", bg: "bg-cyan-500" },
      { value: "bg-blue-500", label: "Blue", bg: "bg-blue-500" },
      { value: "bg-purple-500", label: "Purple", bg: "bg-purple-500" },
      { value: "bg-pink-500", label: "Pink", bg: "bg-pink-500" },
      { value: "bg-yellow-400", label: "Yellow", bg: "bg-yellow-400" },
      { value: "bg-green-500", label: "Green", bg: "bg-green-500" },
      { value: "bg-red-500", label: "Red", bg: "bg-red-500" },
      { value: "bg-indigo-500", label: "Indigo", bg: "bg-indigo-500" },
    ],
    []
  );

  // Generate week dates for date selector
  const weekDates = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentWeekStart]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSelectedDay(selectedDate || format(new Date(), "yyyy-MM-dd"));
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
    eventAddedSound.play().catch((error) => {
      console.warn("Failed to play sound:", error);
    });
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl p-6 text-white"
            style={{ backgroundColor: "#1F2937" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <IoClose size={24} />
            </button>

            <div className="mb-6">
              <h2
                className="text-2xl font-bold flex items-center"
                style={{ color: "#FCA311" }}
              >
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
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={
                    {
                      backgroundColor: "#374151",
                      "--tw-ring-color": "#FCA311",
                    } as React.CSSProperties
                  }
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
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={
                    {
                      backgroundColor: "#374151",
                      "--tw-ring-color": "#FCA311",
                    } as React.CSSProperties
                  }
                />
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {weekDates.map((date) => {
                    const dateString = format(date, "yyyy-MM-dd");
                    const isSelected = selectedDay === dateString;
                    const isTodayDate = isToday(date);

                    return (
                      <button
                        key={dateString}
                        type="button"
                        onClick={() => setSelectedDay(dateString)}
                        className={clsx(
                          "p-2 rounded-lg text-xs font-medium transition-all duration-200",
                          isSelected
                            ? "text-white shadow-lg"
                            : "text-gray-300 hover:bg-opacity-80",
                          isTodayDate && !isSelected && "border"
                        )}
                        style={{
                          backgroundColor: isSelected ? "#FCA311" : "#374151",
                          borderColor:
                            isTodayDate && !isSelected
                              ? "#FCA311"
                              : "transparent",
                        }}
                      >
                        <div className="text-center">
                          <div className="text-xs">{format(date, "EEE")}</div>
                          <div className="font-bold">{format(date, "d")}</div>
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
                  className="flex-1 px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-opacity-80 transition-colors"
                  style={{ backgroundColor: "#374151" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: "#FCA311" }}
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

// Login Modal component for authentication
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      onLogin(email.trim(), password.trim());
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl p-6 text-white"
            style={{ backgroundColor: "#1F2937" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <IoClose size={24} />
            </button>

            <div className="mb-6">
              <h2
                className="text-2xl font-bold flex items-center"
                style={{ color: "#FCA311" }}
              >
                <IoPersonOutline className="mr-2" />
                Welcome Back
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                Sign in to access your weekly planner
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <IoMailOutline
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={
                      {
                        backgroundColor: "#374151",
                        "--tw-ring-color": "#FCA311",
                      } as React.CSSProperties
                    }
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <IoLockClosedOutline
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="w-full pl-10 pr-12 py-2 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={
                      {
                        backgroundColor: "#374151",
                        "--tw-ring-color": "#FCA311",
                      } as React.CSSProperties
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-2"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ color: "#FCA311" }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-opacity-80 transition-colors"
                  style={{ backgroundColor: "#374151" }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!email.trim() || !password.trim() || isLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  style={{ backgroundColor: "#FCA311" }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-400 pt-4 border-t border-white/10">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                  style={{ color: "#FCA311" }}
                >
                  Create one here
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Bottom Navigation Bar Component
interface BottomNavBarProps {
  isLoggedIn: boolean;
  userEmail: string;
  onLoginClick: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  isLoggedIn,
  userEmail,
  onLoginClick,
}) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md border-t border-gray-700"
    >
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <IoCalendarOutline className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Weekly Planner</p>
              <p className="text-gray-400 text-xs">
                {isLoggedIn ? userEmail : "Guest User"}
              </p>
            </div>
          </div>
          {!isLoggedIn && (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Trash Area component for deleting events
interface TrashAreaProps {
  isVisible: boolean;
  trashedEvents: Event[];
  onDropEvent: (event: Event) => void;
  onDeleteTrash: () => void;
  onRemoveFromTrash: (eventId: string) => void;
}

const TrashArea: React.FC<TrashAreaProps> = ({
  isVisible,
  trashedEvents,
  onDropEvent,
  onDeleteTrash,
  onRemoveFromTrash,
}) => {
  // react-dnd drop hook for trash area
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      drop: (item: { id: string; event: Event }) => {
        onDropEvent(item.event);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDropEvent]
  );

  const isDragOver = isOver && canDrop;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed bottom-12 md:bottom-12 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div
        ref={drop as unknown as React.RefObject<HTMLDivElement>}
        className={clsx(
          "min-w-80 max-w-md p-4 rounded-2xl border transition-all duration-300 ease-in-out backdrop-blur-lg shadow-2xl",
          isDragOver
            ? "border-red-400 shadow-red-400/25 scale-105"
            : "border-white/20",
          trashedEvents.length > 0 ? "bg-red-900/30" : "bg-gray-800/80"
        )}
        style={{
          backgroundColor: isDragOver
            ? "rgba(239, 68, 17, 0.2)"
            : trashedEvents.length > 0
            ? "rgba(153, 27, 27, 0.3)"
            : "rgba(31, 41, 55, 0.8)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                trashedEvents.length > 0 ? "bg-red-500" : "bg-gray-600"
              )}
            >
              <IoTrash size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {isDragOver ? "Drop to Delete" : "Trash"}
              </h3>
              <p className="text-xs text-gray-400">
                {trashedEvents.length > 0
                  ? `${trashedEvents.length} event${
                      trashedEvents.length > 1 ? "s" : ""
                    } ready to delete`
                  : "Drag events here to delete them"}
              </p>
            </div>
          </div>

          {trashedEvents.length > 0 && (
            <motion.button
              onClick={onDeleteTrash}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-lg"
            >
              Delete All
            </motion.button>
          )}
        </div>

        {/* Show trashed events */}
        {trashedEvents.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {trashedEvents.map((event) => (
              <div
                key={event.id}
                className={clsx(
                  "p-2 rounded-lg text-white text-sm opacity-70 flex items-center justify-between",
                  event.color
                )}
              >
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-white/80 truncate">
                      {event.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveFromTrash(event.id)}
                  className="ml-2 p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                >
                  <IoClose size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isDragOver && (
          <div className="text-center py-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-red-400 text-lg font-semibold"
            >
              Release to delete event
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventCount: number;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventCount,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl p-6 text-white"
            style={{ backgroundColor: "#1F2937" }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <IoWarning size={32} className="text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Delete Events?
              </h2>
              <p className="text-gray-300">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-red-400">
                  {eventCount} event{eventCount > 1 ? "s" : ""}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                style={{ backgroundColor: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// --- MAIN COMPONENT ---

const WeeklyPlannerContent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [trashedEvents, setTrashedEvents] = useState<Event[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Sound effects function
  const playSound = (sound: string) => {
    try {
      const audio = new Audio(`/sounds/${sound}`);
      audio.play();
    } catch (error) {
      console.log("Sound playback failed:", error);
    }
  };

  useEffect(() => {
    // Set initial data only once on client-side mount
    setEvents(getInitialEvents());
  }, []);

  // Update week dates when currentWeekStart changes
  useEffect(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 }); // Monday
    const dates = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    setWeekDates(dates);
  }, [currentWeekStart]);

  // Initialize currentWeekStart to current week
  useEffect(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentWeekStart(start);
  }, []);

  // Memoized computation of events grouped by day for performance
  const eventsByDay = useMemo(() => {
    return weekDates.reduce<Record<string, Event[]>>((acc, day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      acc[dayKey] = events.filter((event) =>
        isSameDay(parseISO(event.day), day)
      );
      return acc;
    }, {});
  }, [events, weekDates]);

  // Memoized move event handler for drag and drop
  const handleMoveEvent = useCallback((eventId: string, targetDay: string) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.id === eventId ? { ...event, day: targetDay } : event
      );
      return updatedEvents;
    });
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
  const handleToggleComplete = useCallback(
    (eventId: string) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, completed: !event.completed }
            : event
        )
      );
      // Play sound effect when marking as complete
      const completedEvent = events.find((event) => event.id === eventId);
      if (completedEvent && !completedEvent.completed) {
        eventCompleteSound.play().catch((error) => {
          console.warn("Failed to play sound:", error);
        });
      } else {
        eventIncompleteSound.play().catch((error) => {
          console.warn("Failed to play sound:", error);
        });
      }
    },
    [events]
  );

  // Memoized selected day events for modal display
  const selectedDayEvents = useMemo(
    () =>
      selectedDay ? eventsByDay[format(selectedDay, "yyyy-MM-dd")] ?? [] : [],
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

  // Memoized handler for user login
  const handleLogin = useCallback((email: string, password: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    console.log("User logged in with email:", email);
    // Here you can handle the actual login logic, e.g., API call
    // Password validation would happen here in a real app
    console.log(
      "Password received (not logged for security):",
      password ? "***" : ""
    );
  }, []);

  // Memoized handler for opening login modal
  const handleLoginClick = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  // Memoized handler for navigating to previous week
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  }, []);

  // Memoized handler for navigating to next week
  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  }, []);

  // Memoized handler for moving event to next week
  const handleMoveEventToNextWeek = useCallback((eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              day: format(addDays(parseISO(event.day), 7), "yyyy-MM-dd"),
            }
          : event
      )
    );
  }, []);

  // Memoized handler for going to current week
  const handleGoToCurrentWeek = useCallback(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentWeekStart(start);
  }, []);

  // Check if we're viewing the current week
  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const actualCurrentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const viewingWeekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return (
      format(actualCurrentWeekStart, "yyyy-MM-dd") ===
      format(viewingWeekStart, "yyyy-MM-dd")
    );
  }, [currentWeekStart]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            handlePreviousWeek();
            break;
          case "ArrowRight":
            event.preventDefault();
            handleNextWeek();
            break;
          case "h":
            event.preventDefault();
            handleGoToCurrentWeek();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePreviousWeek, handleNextWeek, handleGoToCurrentWeek]);

  // Handle dropping events in trash
  const handleTrashDrop = useCallback((event: Event) => {
    setTrashedEvents((prev) => [...prev, event]);
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    setIsDragging(false);
    playSound("pop.mp3");
  }, []);

  // Handle removing events from trash
  const handleRemoveFromTrash = useCallback((eventId: string) => {
    setTrashedEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  // Handle permanent deletion of all trashed events
  const handlePermanentDelete = useCallback(() => {
    setTrashedEvents([]);
    setIsDeleteConfirmOpen(false);
    playSound("event-complete.mp3");
  }, []);

  // Handle drag start to show trash area
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag end to hide trash area
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
                * {
                    font-family: 'Rubik';
                }
                button {
                  cursor: pointer;
                }
                
                /* Enhanced drag and drop styles */
                .react-dnd-dragging {
                  opacity: 0.5 !important;
                  transform: scale(0.95) !important;
                }
                
                .react-dnd-drop-target {
                  transition: all 0.2s ease-in-out;
                }
                
                .react-dnd-can-drop {
                  background: rgba(252, 163, 17, 0.1) !important;
                  border: 2px dashed rgba(252, 163, 17, 0.6) !important;
                  transform: scale(1.02) !important;
                }
                
                /* Mobile enhancements */
                @media (max-width: 768px) {
                  .touch-manipulation {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    -khtml-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    touch-action: manipulation;
                  }
                  
                  /* Enhanced touch targets for mobile drag */
                  .react-dnd-drag-handle {
                    padding: 8px;
                    margin: -8px;
                  }
                }
            `}</style>
      <div
        className="min-h-screen w-full bg-gray-900 text-white p-4 md:p-8 pb-24 md:pb-28"
        style={{ backgroundColor: "#111827" }}
      >
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 mb-4">
            Weekly Planner
          </h1>

          {/* Week Navigation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.button
              onClick={handlePreviousWeek}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
              style={{ backgroundColor: "#374151" }}
            >
              <IoChevronBack size={20} className="text-white" />
            </motion.button>

            <div className="flex flex-col items-center">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">
                {format(weekDates[0] || new Date(), "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>
                  {format(weekDates[0] || new Date(), "MMM d")} -{" "}
                  {format(weekDates[6] || new Date(), "MMM d")}
                </span>
                {isCurrentWeek && (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: "#FCA311", color: "white" }}
                  >
                    This Week
                  </span>
                )}
                {!isCurrentWeek && (
                  <motion.button
                    onClick={handleGoToCurrentWeek}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-colors border border-white/20"
                    style={{ backgroundColor: "#374151", color: "#FCA311" }}
                  >
                    Go to current week
                  </motion.button>
                )}
              </div>
            </div>

            <motion.button
              onClick={handleNextWeek}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
              style={{ backgroundColor: "#374151" }}
            >
              <IoChevronForward size={20} className="text-white" />
            </motion.button>
          </div>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            {events.length === 0
              ? "Your weekly planner is empty. Click the + button to add your first event!"
              : "Drag and drop events to reschedule them effortlessly. Click any day to view detailed agenda."}
          </p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 md:hidden">
            On mobile: Touch and drag to move events between days
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full border-2"
                style={{ backgroundColor: "#FCA311", borderColor: "#FCA311" }}
              ></div>
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

          {/* Keyboard shortcuts hint */}
          <div className="hidden md:block text-xs text-gray-500 mt-4">
            <span className="mr-4">Ctrl/Cmd + ← → Navigate weeks</span>
            <span>Ctrl/Cmd + H: Go to current week</span>
          </div>
        </header>

        <main className="flex flex-col md:flex-row gap-2 md:gap-4 max-w-7xl mx-auto">
          {weekDates.map((day) => {
            const dayString = format(day, "yyyy-MM-dd");
            return (
              <DayColumn
                key={day.toString()}
                day={day}
                events={eventsByDay[dayString] ?? []}
                onDayClick={handleDayClick}
                onMoveEvent={handleMoveEvent}
                onToggleComplete={handleToggleComplete}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
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
              "0 0 0 0 rgba(252, 163, 17, 0.4)",
              "0 0 0 10px rgba(252, 163, 17, 0)",
              "0 0 0 0 rgba(252, 163, 17, 0)",
            ],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white z-30 transition-all duration-300 touch-manipulation cursor-pointer"
          style={{ backgroundColor: "#FCA311" }}
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
          onMoveEventToNextWeek={handleMoveEventToNextWeek}
        />

        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onAddEvent={handleAddEvent}
          currentWeekStart={currentWeekStart}
          selectedDate={
            selectedDay ? format(selectedDay, "yyyy-MM-dd") : undefined
          }
        />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />

        <TrashArea
          isVisible={isDragging || trashedEvents.length > 0}
          trashedEvents={trashedEvents}
          onDropEvent={handleTrashDrop}
          onDeleteTrash={() => setIsDeleteConfirmOpen(true)}
          onRemoveFromTrash={handleRemoveFromTrash}
        />

        <DeleteConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handlePermanentDelete}
          eventCount={trashedEvents.length}
        />

        <BottomNavBar
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onLoginClick={handleLoginClick}
        />

        <footer className="text-center mt-12 text-gray-400 text-sm">
          <p className="mb-2">
            Built with React, TypeScript, Tailwind CSS, Framer Motion & React
            DnD
          </p>
        </footer>
      </div>
    </>
  );
};

// Main component with DnD Provider
const WeeklyPlannerPage = () => {
  // Choose backend based on device type
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  // Backend options for touch devices
  const backendOptions = isTouchDevice()
    ? {
        enableMouseEvents: true,
        delayTouchStart: 200, // Delay before drag starts (ms)
        delayMouseStart: 0,
        touchSlop: 5, // Minimum distance to start drag
      }
    : {};

  return (
    <DndProvider backend={backend} options={backendOptions}>
      <WeeklyPlannerContent />
    </DndProvider>
  );
};

export default WeeklyPlannerPage;
