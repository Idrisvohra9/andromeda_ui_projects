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
};

// Detect if we're on a touch device
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// --- INITIAL DATA ---
const taskCompleteSound = new Audio("/sounds/task-complete.mp3");
const taskIncompleteSound = new Audio("/sounds/error.mp3");
const taskAddedSound = new Audio("/sounds/pop.mp3");
// Generates initial sample events for the current week
const getInitialEvents = (): Event[] => {
  const today = new Date();
  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  return [
    {
      id: "1",
      title: "Team Sync",
      description: "Weekly team synchronization meeting.",
      day: format(addDays(startOfThisWeek, 0), "yyyy-MM-dd"),
      color: "bg-cyan-500",
      completed: false,
    },
    {
      id: "2",
      title: "Design Review",
      description: "Review the new dashboard design mockups.",
      day: format(addDays(startOfThisWeek, 0), "yyyy-MM-dd"),
      color: "bg-purple-500",
      completed: true,
    },
    {
      id: "3",
      title: "Deploy to Staging",
      description: "Deploy the latest feature branch to the staging server.",
      day: format(addDays(startOfThisWeek, 1), "yyyy-MM-dd"),
      color: "bg-pink-500",
      completed: false,
    },
    {
      id: "4",
      title: "Client Call",
      description: "Follow-up call with Project Unicorn client.",
      day: format(addDays(startOfThisWeek, 2), "yyyy-MM-dd"),
      color: "bg-yellow-400",
      completed: false,
    },
    {
      id: "5",
      title: "Write Report",
      description: "Finalize and submit the Q3 performance report.",
      day: format(addDays(startOfThisWeek, 3), "yyyy-MM-dd"),
      color: "bg-green-500",
      completed: false,
    },
    {
      id: "6",
      title: "User Testing",
      description:
        "Conduct user testing session for the new mobile app feature.",
      day: format(addDays(startOfThisWeek, 4), "yyyy-MM-dd"),
      color: "bg-purple-500",
      completed: false,
    },
    {
      id: "7",
      title: "Code Refactor",
      description: "Refactor the authentication module.",
      day: format(addDays(startOfThisWeek, 0), "yyyy-MM-dd"),
      color: "bg-pink-500",
      completed: false,
    },
    {
      id: "8",
      title: "Submit Expenses",
      description: "Last day to submit monthly expenses.",
      day: format(addDays(startOfThisWeek, -2), "yyyy-MM-dd"),
      color: "bg-yellow-400",
      completed: false,
    }, // Overdue task
    {
      id: "9",
      title: "Plan Next Sprint",
      description: "Team meeting to plan tasks for the upcoming sprint.",
      day: format(addDays(startOfThisWeek, 4), "yyyy-MM-dd"),
      color: "bg-cyan-500",
      completed: false,
    },
  ];
};

// --- SUB-COMPONENTS ---

// Event card component with react-dnd drag functionality
interface EventCardProps {
  event: Event;
  onToggleComplete: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onToggleComplete }) => {
  // Check if task is overdue (past due date and not completed)
  const eventDate = parseISO(event.day);
  const isTaskOverdue =
    isPast(eventDate) && !isToday(eventDate) && !event.completed;

  // react-dnd drag hook
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: ItemTypes.EVENT,
      item: { id: event.id, event },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [event]
  );

  // Handle checkbox toggle
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering drag events
    onToggleComplete(event.id);
  };

  return (
    <div
      ref={dragPreview}
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
          ref={drag}
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

// Day column component with react-dnd drop functionality
interface DayColumnProps {
  day: Date;
  events: Event[];
  onDayClick: (day: Date) => void;
  onMoveEvent: (eventId: string, targetDay: string) => void;
  onToggleComplete: (eventId: string) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({
  day,
  events,
  onDayClick,
  onMoveEvent,
  onToggleComplete,
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
      ref={drop as any}
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
        <div className="flex items-baseline space-x-2 flex-col">
          <p className="font-bold text-lg text-purple-300">{dayFormat}</p>
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
                  const isTaskOverdue =
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
    const start = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

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
                            ? "bg-purple-500 text-white shadow-lg"
                            : "bg-white/10 text-gray-300 hover:bg-white/20",
                          isTodayDate &&
                            !isSelected &&
                            "border border-purple-400"
                        )}
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

const WeeklyPlannerContent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  useEffect(() => {
    // Set initial data only once on client-side mount
    setEvents(getInitialEvents());

    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const dates = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    setWeekDates(dates);
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
        taskCompleteSound.play().catch((error) => {
          console.warn("Failed to play sound:", error);
        });
      } else {
        taskIncompleteSound.play().catch((error) => {
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
                  background: rgba(168, 85, 247, 0.1) !important;
                  border: 2px dashed rgba(168, 85, 247, 0.6) !important;
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
            On mobile: Touch and drag to move tasks between days
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
            const dayString = format(day, "yyyy-MM-dd");
            return (
              <DayColumn
                key={day.toString()}
                day={day}
                events={eventsByDay[dayString] ?? []}
                onDayClick={handleDayClick}
                onMoveEvent={handleMoveEvent}
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
            selectedDay ? format(selectedDay, "yyyy-MM-dd") : undefined
          }
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
