// Save this file as e.g., `app/planner/page.tsx` or `pages/planner.tsx`

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  isPast,
} from "date-fns";
import { Calendar, X, Clock, CheckCircle, GripVertical } from "lucide-react";
import { clsx } from "clsx";

// --- TYPE DEFINITIONS ---
type Event = {
  id: string;
  title: string;
  description: string;
  day: string; // ISO date string (e.g., "2023-10-27")
  color: string; // Tailwind CSS background color class
  completed: boolean;
};

// --- INITIAL DATA ---
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

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({
      id: event.id,
      data: { event },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: transition || "none",
      }
    : undefined;

  const isTaskOverdue =
    isPast(new Date(event.day)) &&
    !isToday(new Date(event.day)) &&
    !event.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group p-3 mb-2 rounded-lg text-white shadow-lg cursor-grab active:cursor-grabbing relative transition-all duration-300 ease-in-out hover:shadow-xl",
        event.color,
        event.completed && "opacity-60"
      )}
    >
      <div className="flex items-center">
        <div
          {...listeners}
          {...attributes}
          className="touch-none flex-shrink-0"
        >
          <GripVertical
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
          {isTaskOverdue && (
            <div
              className="w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"
              title="Overdue"
            ></div>
          )}
          {event.completed && (
            <CheckCircle
              size={16}
              className="text-green-300"
              title="Completed"
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface DayColumnProps {
  day: Date;
  events: Event[];
  onDayClick: (day: Date) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({ day, events, onDayClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: format(day, "yyyy-MM-dd"),
  });

  const dayFormat = "EEE"; // e.g., "Mon"
  const dateFormat = "d"; // e.g., "5"

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDayClick(day)}
      className={clsx(
        "flex-1 min-h-[200px] md:min-h-0 p-3 md:p-4 rounded-xl border border-white/10 transition-all duration-300 ease-in-out cursor-pointer",
        "bg-white/5 backdrop-blur-md", // Glassmorphism
        isOver ? "bg-white/20" : "hover:bg-white/15",
        isToday(day) ? "border-purple-400 border-2" : "border-white/10"
      )}
    >
      <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start mb-4 md:mb-2">
        <div className="flex items-baseline space-x-2 md:flex-col md:space-x-0 md:items-start">
          <p className="font-bold text-lg text-purple-300">
            {format(day, dayFormat)}
          </p>
          <p
            className={clsx(
              "text-2xl font-light",
              isToday(day) ? "text-white" : "text-gray-400"
            )}
          >
            {format(day, dateFormat)}
          </p>
        </div>
        <div className="md:hidden h-full min-h-[120px] w-full ml-4">
          {events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="text-center text-gray-500 text-sm mt-4">
              No events
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:block h-full min-h-[200px]">
        {events.length > 0 ? (
          events.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No events
          </div>
        )}
      </div>
    </div>
  );
};

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: Date | null;
  events: Event[];
}

const AgendaModal: React.FC<AgendaModalProps> = ({
  isOpen,
  onClose,
  day,
  events,
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
              <X size={24} />
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
                  const isTaskOverdue =
                    isPast(new Date(event.day)) &&
                    !isToday(new Date(event.day)) &&
                    !event.completed;
                  return (
                    <div
                      key={event.id}
                      className={clsx(
                        "p-4 rounded-lg",
                        event.color,
                        event.completed && "opacity-60"
                      )}
                    >
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
                      <div className="flex items-center space-x-4 mt-3 text-sm text-white/70">
                        {event.completed && (
                          <div className="flex items-center">
                            <CheckCircle
                              size={16}
                              className="mr-1 text-green-300"
                            />{" "}
                            Completed
                          </div>
                        )}
                        {isTaskOverdue && (
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1 text-red-400" />{" "}
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

// --- MAIN COMPONENT ---

const WeeklyPlannerPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Set initial data only once on client-side mount
    setEvents(getInitialEvents());

    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const dates = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    setWeekDates(dates);
  }, []);

  const eventsByDay = useMemo(() => {
    return weekDates.reduce<Record<string, Event[]>>((acc, day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      acc[dayKey] = events.filter((event) =>
        isSameDay(new Date(event.day), day)
      );
      return acc;
    }, {});
  }, [events, weekDates]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEvents((prevEvents) => {
        const activeEventIndex = prevEvents.findIndex(
          (e) => e.id === active.id
        );
        if (activeEventIndex === -1) return prevEvents;

        const updatedEvent = {
          ...prevEvents[activeEventIndex],
          day: String(over.id), // 'over.id' is the date string of the droppable column
        };

        const newEvents = [...prevEvents];
        newEvents[activeEventIndex] = updatedEvent;
        return newEvents;
      });
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selectedDay to allow for exit animation
    setTimeout(() => setSelectedDay(null), 300);
  };

  const selectedDayEvents = selectedDay
    ? eventsByDay[format(selectedDay, "yyyy-MM-dd")] ?? []
    : [];

  return (
    <div className="min-h-screen w-full bg-gray-900 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-4 md:p-8 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Weekly Planner
        </h1>
        <p className="text-gray-400 mt-2">
          Drag and drop tasks to reschedule. Click a day to see the agenda.
        </p>
      </header>

      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <main className="flex flex-col md:flex-row gap-2 md:gap-4">
          {weekDates.map((day) => (
            <DayColumn
              key={day.toString()}
              day={day}
              events={eventsByDay[format(day, "yyyy-MM-dd")] ?? []}
              onDayClick={handleDayClick}
            />
          ))}
        </main>
      </DndContext>

      <AgendaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        day={selectedDay}
        events={selectedDayEvents}
      />

      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Built for Next.js with TypeScript & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default WeeklyPlannerPage;
