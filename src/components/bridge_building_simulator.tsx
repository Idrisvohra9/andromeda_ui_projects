import React, { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoChevronBack,
  IoChevronForward,
  IoChevronUp,
  IoChevronDown,
  IoPlay,
  IoStop,
  IoTrash,
  IoInformationCircle,
  IoClose,
  IoWarning,
} from "react-icons/io5";

interface Joint {
  id: string;
  x: number;
  y: number;
  isFixed?: boolean;
  body?: Matter.Body;
}

interface Beam {
  id: string;
  jointA: string;
  jointB: string;
  constraint?: Matter.Constraint;
  collisionBody?: Matter.Body;
  stress: number;
  maxStress: number;
  broken: boolean;
  // ADD THESE MISSING PROPERTIES:
  signedStrain: number;
  originalLength: number;
  currentLength: number;
  breakAnimation?: {
    particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }>;
    startTime: number;
  };
}

interface MaterialType {
  name: string;
  color: string;
  strength: number;
  cost: number;
  maxLength: number;
}

const materials: MaterialType[] = [
  { name: "Steel", color: "#606060", strength: 1000, cost: 10, maxLength: 300 },
  { name: "Wood", color: "#8B4513", strength: 500, cost: 5, maxLength: 250 },
  { name: "Cable", color: "#2C3E50", strength: 800, cost: 8, maxLength: 400 },
];

// SVG Components for Assets
const SteelIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="8" width="20" height="8" fill="#606060" rx="1" />
    <rect x="4" y="10" width="16" height="1" fill="#808080" />
    <rect x="4" y="13" width="16" height="1" fill="#404040" />
    <circle cx="6" cy="12" r="1" fill="#808080" />
    <circle cx="18" cy="12" r="1" fill="#808080" />
  </svg>
);

const WoodIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="8" width="20" height="8" fill="#8B4513" rx="2" />
    <path d="M2 12 Q12 10 22 12" stroke="#A0522D" strokeWidth="1" fill="none" />
    <path d="M2 14 Q12 12 22 14" stroke="#654321" strokeWidth="1" fill="none" />
    <rect x="3" y="9" width="1" height="6" fill="#654321" />
    <rect x="20" y="9" width="1" height="6" fill="#654321" />
  </svg>
);

const CableIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M2 12 Q7 8 12 12 T22 12"
      stroke="#2C3E50"
      strokeWidth="3"
      fill="none"
    />
    <path
      d="M2 12 Q7 16 12 12 T22 12"
      stroke="#34495E"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="2" cy="12" r="2" fill="#2C3E50" />
    <circle cx="22" cy="12" r="2" fill="#2C3E50" />
  </svg>
);

// Vehicle SVG Components
const BikeIcon: React.FC = () => (
  <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
    {/* Wheels */}
    <circle
      cx="10"
      cy="22"
      r="7"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle
      cx="50"
      cy="22"
      r="7"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle cx="10" cy="22" r="4" fill="#34495E" />
    <circle cx="50" cy="22" r="4" fill="#34495E" />

    {/* Frame */}
    <path
      d="M10 22 L25 10 L35 10 L50 22"
      stroke="#E74C3C"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M25 10 L25 22 L35 22"
      stroke="#E74C3C"
      strokeWidth="2"
      fill="none"
    />

    {/* Handlebars */}
    <path d="M25 10 L25 6 L28 6 M22 6 L25 6" stroke="#34495E" strokeWidth="2" />

    {/* Seat */}
    <rect x="32" y="8" width="6" height="2" fill="#8B4513" rx="1" />

    {/* Pedals */}
    <circle cx="25" cy="20" r="1" fill="#F39C12" />
  </svg>
);

const MotorcycleIcon: React.FC = () => (
  <svg width="70" height="35" viewBox="0 0 70 35" fill="none">
    {/* Wheels */}
    <circle
      cx="12"
      cy="26"
      r="8"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle
      cx="58"
      cy="26"
      r="8"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle cx="12" cy="26" r="5" fill="#34495E" />
    <circle cx="58" cy="26" r="5" fill="#34495E" />

    {/* Body */}
    <rect x="20" y="20" width="30" height="8" fill="#E74C3C" rx="2" />

    {/* Seat */}
    <rect x="25" y="16" width="15" height="4" fill="#8B4513" rx="2" />

    {/* Handlebars */}
    <path
      d="M20 20 L18 12 L22 12"
      stroke="#34495E"
      strokeWidth="2"
      fill="none"
    />

    {/* Windshield */}
    <path
      d="M22 12 L30 8 L35 12"
      stroke="#3498DB"
      strokeWidth="2"
      fill="rgba(52, 152, 219, 0.3)"
    />

    {/* Exhaust */}
    <rect x="45" y="22" width="8" height="2" fill="#95A5A6" rx="1" />
  </svg>
);

const CarIcon: React.FC = () => (
  <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
    {/* Wheels */}
    <circle
      cx="15"
      cy="30"
      r="8"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle
      cx="65"
      cy="30"
      r="8"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle cx="15" cy="30" r="5" fill="#34495E" />
    <circle cx="65" cy="30" r="5" fill="#34495E" />

    {/* Body */}
    <rect x="8" y="18" width="64" height="12" fill="#3498DB" rx="2" />

    {/* Roof */}
    <path d="M20 18 L25 8 L55 8 L60 18" fill="#2980B9" />

    {/* Windows */}
    <rect x="22" y="10" width="36" height="8" fill="#85C1E9" rx="1" />

    {/* Headlights */}
    <circle cx="72" cy="22" r="2" fill="#F4D03F" />

    {/* Taillights */}
    <circle cx="8" cy="22" r="2" fill="#E74C3C" />

    {/* Door lines */}
    <line x1="40" y1="18" x2="40" y2="30" stroke="#2980B9" strokeWidth="1" />
  </svg>
);

const VanIcon: React.FC = () => (
  <svg width="90" height="45" viewBox="0 0 90 45" fill="none">
    {/* Wheels */}
    <circle
      cx="18"
      cy="35"
      r="9"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle
      cx="72"
      cy="35"
      r="9"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle cx="18" cy="35" r="6" fill="#34495E" />
    <circle cx="72" cy="35" r="6" fill="#34495E" />

    {/* Body */}
    <rect x="10" y="15" width="70" height="20" fill="#E67E22" rx="2" />

    {/* Roof */}
    <rect x="10" y="8" width="70" height="7" fill="#D35400" rx="2" />

    {/* Windows */}
    <rect x="12" y="10" width="15" height="5" fill="#85C1E9" rx="1" />
    <rect x="30" y="10" width="15" height="5" fill="#85C1E9" rx="1" />
    <rect x="48" y="10" width="15" height="5" fill="#85C1E9" rx="1" />
    <rect x="66" y="10" width="12" height="5" fill="#85C1E9" rx="1" />

    {/* Headlights */}
    <circle cx="80" cy="25" r="2" fill="#F4D03F" />

    {/* Taillights */}
    <circle cx="10" cy="25" r="2" fill="#E74C3C" />

    {/* Door lines */}
    <line x1="27" y1="15" x2="27" y2="35" stroke="#D35400" strokeWidth="1" />
    <line x1="45" y1="15" x2="45" y2="35" stroke="#D35400" strokeWidth="1" />
    <line x1="63" y1="15" x2="63" y2="35" stroke="#D35400" strokeWidth="1" />
  </svg>
);

const TruckIcon: React.FC = () => (
  <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
    {/* Wheels */}
    <circle
      cx="20"
      cy="40"
      r="10"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle
      cx="80"
      cy="40"
      r="10"
      fill="#2C3E50"
      stroke="#1A252F"
      strokeWidth="1"
    />
    <circle cx="20" cy="40" r="7" fill="#34495E" />
    <circle cx="80" cy="40" r="7" fill="#34495E" />

    {/* Cab */}
    <rect x="10" y="20" width="25" height="20" fill="#E74C3C" rx="2" />
    <rect x="12" y="15" width="21" height="5" fill="#C0392B" rx="1" />

    {/* Windshield */}
    <rect x="14" y="17" width="17" height="3" fill="#85C1E9" rx="1" />

    {/* Cargo bed */}
    <rect x="35" y="15" width="55" height="25" fill="#95A5A6" rx="2" />

    {/* Cargo bed sides */}
    <rect x="35" y="15" width="3" height="25" fill="#7F8C8D" />
    <rect x="87" y="15" width="3" height="25" fill="#7F8C8D" />
    <rect x="35" y="15" width="55" height="3" fill="#7F8C8D" />

    {/* Headlights */}
    <circle cx="35" cy="30" r="2" fill="#F4D03F" />

    {/* Taillights */}
    <circle cx="90" cy="30" r="2" fill="#E74C3C" />

    {/* Grille */}
    <rect x="32" y="25" width="3" height="10" fill="#2C3E50" />
  </svg>
);

// Some audio links:
const placeJointAudio = new Audio(
  "http://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/missile.ogg"
);
const placeBeamAudio = new Audio(
  "http://codeskulptor-demos.commondatastorage.googleapis.com/pang/arrow.mp3"
);

const BridgeBuilder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine>(null);
  const renderRef = useRef<Matter.Render>(null);
  const runnerRef = useRef<Matter.Runner>(null);
  const mouseRef = useRef<Matter.Mouse>(null);

  const [joints, setJoints] = useState<Joint[]>([]);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [selectedJoint, setSelectedJoint] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(
    materials[0]
  );
  const [loadWeight, setLoadWeight] = useState(20); // Minimum load weight to simulate
  const [score, setScore] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [draggedJoint, setDraggedJoint] = useState<Joint | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [materialsCollapsed, setMaterialsCollapsed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "warning">("error");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [vehicle, setVehicle] = useState<Matter.Body | null>(null);
  const [vehicleStarted, setVehicleStarted] = useState(false);
  const [simulationStartTime, setSimulationStartTime] = useState<number>(0);
  const [bridgeSuccess, setBridgeSuccess] = useState<boolean | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if user has seen tutorial before
    const hasSeenTutorial = localStorage.getItem(
      "bridgeBuilder_hasSeenTutorial"
    );
    return !hasSeenTutorial;
  });
  const [tutorialStep, setTutorialStep] = useState(0);
  const showGrid = true; // Always show grid for better visibility

  const worldWidth = 1200;
  const worldHeight = 600;
  const groundY = worldHeight - 50;

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Bridge Builder!",
      content:
        "Learn to build strong bridges that can support vehicles. Watch the tension (blue) and compression (red) forces in real-time!",
      target: null,
      position: "center",
    },
    {
      title: "Add Your First Joint",
      content:
        "Click anywhere on the canvas to place a joint. Joints are connection points for your bridge beams.",
      target: "canvas",
      position: "top",
    },
    {
      title: "Select Materials",
      content:
        "Choose different materials for your beams. Each material has different strength, cost, and length limits.",
      target: "materials",
      position: "right",
    },
    {
      title: "Connect Joints",
      content:
        "Click on a joint to select it, then click another joint to create a beam between them.",
      target: "canvas",
      position: "top",
    },
    {
      title: "Test Your Bridge",
      content:
        "Use the load slider to test different vehicle weights, then click 'Start Simulation' to see if your bridge holds!",
      target: "controls",
      position: "top",
    },
    {
      title: "Monitor Forces",
      content:
        "Blue beams are in tension (being stretched), red beams are in compression (being squeezed). Watch the intensity!",
      target: "stats",
      position: "left",
    },
  ];

  // Tutorial helper functions
  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem("bridgeBuilder_hasSeenTutorial", "true");
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("bridgeBuilder_hasSeenTutorial", "true");
  };

  // Dialog helper function
  const showDialogMessage = useCallback(
    (type: "error" | "warning", title: string, message: string) => {
      setDialogType(type);
      setDialogTitle(title);
      setDialogMessage(message);
      setShowDialog(true);
    },
    [setDialogType, setDialogTitle, setDialogMessage, setShowDialog]
  );

  // Check if there's a connection path between two joints
  const checkBridgeConnection = (
    startJointId: string,
    endJointId: string
  ): boolean => {
    const visited = new Set<string>();
    const queue = [startJointId];

    while (queue.length > 0) {
      const currentJointId = queue.shift()!;

      if (currentJointId === endJointId) {
        return true;
      }

      if (visited.has(currentJointId)) {
        continue;
      }

      visited.add(currentJointId);

      // Find all connected joints through beams
      const connectedJoints = beams
        .filter(
          (beam) =>
            !beam.broken &&
            (beam.jointA === currentJointId || beam.jointB === currentJointId)
        )
        .map((beam) =>
          beam.jointA === currentJointId ? beam.jointB : beam.jointA
        )
        .filter((jointId) => !visited.has(jointId));

      queue.push(...connectedJoints);
    }

    return false;
  };

  // Get vehicle type and properties based on load weight
  const getVehicleInfo = useCallback((weight: number) => {
    if (weight <= 30) {
      return {
        type: "bike",
        icon: BikeIcon,
        width: 60,
        height: 30,
        mass: weight / 10,
        color: "#E74C3C",
      };
    } else if (weight <= 45) {
      return {
        type: "motorcycle",
        icon: MotorcycleIcon,
        width: 70,
        height: 35,
        mass: weight / 8,
        color: "#E67E22",
      };
    } else if (weight <= 65) {
      return {
        type: "car",
        icon: CarIcon,
        width: 80,
        height: 40,
        mass: weight / 6,
        color: "#3498DB",
      };
    } else if (weight <= 85) {
      return {
        type: "van",
        icon: VanIcon,
        width: 90,
        height: 45,
        mass: weight / 5,
        color: "#E67E22",
      };
    } else {
      return {
        type: "truck",
        icon: TruckIcon,
        width: 100,
        height: 50,
        mass: weight / 4,
        color: "#95A5A6",
      };
    }
  }, []);

  // Initialize Matter.js
  useEffect(() => {
    const engine = Matter.Engine.create();
    engine.gravity.y = 0.5;
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: canvasRef.current!,
      engine: engine,
      options: {
        width: worldWidth,
        height: worldHeight,
        wireframes: false,
        background: "#E8F4F8",
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // Create ground
    const ground = Matter.Bodies.rectangle(
      worldWidth / 2,
      groundY + 25,
      worldWidth,
      50,
      {
        isStatic: true,
        render: { fillStyle: "#3E4651" },
      }
    );

    // Create support pillars
    const leftSupport = Matter.Bodies.rectangle(200, groundY - 50, 100, 100, {
      isStatic: true,
      render: { fillStyle: "#5A6C7D" },
    });

    const rightSupport = Matter.Bodies.rectangle(
      worldWidth - 200,
      groundY - 50,
      100,
      100,
      {
        isStatic: true,
        render: { fillStyle: "#5A6C7D" },
      }
    );

    Matter.Composite.add(engine.world, [ground, leftSupport, rightSupport]);

    // Add fixed anchor points
    const initialJoints: Joint[] = [
      { id: "anchor-left", x: 200, y: groundY - 100, isFixed: true },
      {
        id: "anchor-right",
        x: worldWidth - 200,
        y: groundY - 100,
        isFixed: true,
      },
    ];

    setJoints(initialJoints);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    Matter.Render.run(render);

    const mouse = Matter.Mouse.create(render.canvas);
    mouseRef.current = mouse;

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [groundY, worldWidth, worldHeight]);

  // Handle mouse up for dragging
  const handleMouseUp = useCallback(() => {
    if (draggedJoint && isDragging) {
      // Update joint position
      setJoints((prevJoints) =>
        prevJoints.map((joint) =>
          joint.id === draggedJoint.id
            ? {
                ...joint,
                x: mousePosition.x - dragOffset.x,
                y: mousePosition.y - dragOffset.y,
              }
            : joint
        )
      );
    }
    setDraggedJoint(null);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [draggedJoint, isDragging, mousePosition, dragOffset]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        // Account for canvas scaling by calculating the ratio between actual and displayed size
        const scaleX = worldWidth / rect.width;
        const scaleY = worldHeight / rect.height;

        setMousePosition({
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        });
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseUp]);

  // Calculate beam stress and strain
  const calculateStress = useCallback((beam: Beam): number => {
    if (!beam.constraint || !engineRef.current) return 0;

    const constraint = beam.constraint;
    const bodyA = constraint.bodyA;
    const bodyB = constraint.bodyB;

    if (!bodyA || !bodyB) return 0;

    // Calculate current length
    const currentLength = Math.sqrt(
      Math.pow(bodyB.position.x - bodyA.position.x, 2) +
      Math.pow(bodyB.position.y - bodyA.position.y, 2)
    );

    // Calculate signed strain (positive = tension, negative = compression)
    const signedStrain = (currentLength - beam.originalLength) / beam.originalLength;
    
    // Update beam properties
    beam.currentLength = currentLength;
    beam.signedStrain = signedStrain;

    // Return stress magnitude
    return Math.abs(signedStrain) * 1000;
  }, []);

  // Update physics simulation
  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isSimulating) {
      Matter.Runner.run(runnerRef.current, engineRef.current);
    } else {
      Matter.Runner.stop(runnerRef.current);
    }
  }, [isSimulating]);

  // Update beam stresses and strains
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setBeams((prevBeams) =>
        prevBeams.map((beam) => {
          const stress = calculateStress(beam);
          const broken = stress > beam.maxStress;

          if (broken && !beam.broken && beam.constraint && engineRef.current) {
            // Break the constraint
            Matter.Composite.remove(engineRef.current.world, beam.constraint);

            // Remove collision body if it exists
            if (beam.collisionBody) {
              Matter.Composite.remove(
                engineRef.current.world,
                beam.collisionBody
              );
            }

            // Create break animation particles
            const jointA = joints.find((j) => j.id === beam.jointA);
            const jointB = joints.find((j) => j.id === beam.jointB);

            if (jointA && jointB) {
              const particles = [];
              const numParticles = 8;
              const midX = (jointA.x + jointB.x) / 2;
              const midY = (jointA.y + jointB.y) / 2;

              for (let i = 0; i < numParticles; i++) {
                particles.push({
                  x: midX + (Math.random() - 0.5) * 20,
                  y: midY + (Math.random() - 0.5) * 20,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6 - 2,
                  life: 1.0,
                });
              }

              return {
                ...beam,
                stress,
                signedStrain: beam.signedStrain,
                currentLength: beam.currentLength,
                broken: true,
                breakAnimation: {
                  particles,
                  startTime: Date.now(),
                },
              };
            }
          }

          // Update break animation if it exists
          if (beam.breakAnimation) {
            const updatedParticles = beam.breakAnimation.particles
              .map((particle) => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                vy: particle.vy + 0.2, // gravity
                life: Math.max(0, particle.life - 0.02),
              }))
              .filter((particle) => particle.life > 0);

            return {
              ...beam,
              stress,
              signedStrain: beam.signedStrain,
              currentLength: beam.currentLength,
              broken,
              breakAnimation:
                updatedParticles.length > 0
                  ? {
                      ...beam.breakAnimation,
                      particles: updatedParticles,
                    }
                  : undefined,
            };
          }

          return { ...beam, stress, signedStrain: beam.signedStrain, currentLength: beam.currentLength, broken };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating, calculateStress, joints]);

  // Add joint
  const addJoint = (x: number, y: number) => {
    if (isSimulating) return;

    const newJoint: Joint = {
      id: `joint-${Date.now()}`,
      x,
      y,
      isFixed: false,
    };
    placeJointAudio.currentTime = 0; // Reset audio
    placeJointAudio.play(); // Play sound effect
    setJoints([...joints, newJoint]);
  };

  // Add beam
  // Add beam
  const addBeam = (jointAId: string, jointBId: string) => {
    if (isSimulating) return;

    const jointA = joints.find((j) => j.id === jointAId);
    const jointB = joints.find((j) => j.id === jointBId);

    if (!jointA || !jointB) return;

    const distance = Math.sqrt(
      Math.pow(jointB.x - jointA.x, 2) + Math.pow(jointB.y - jointA.y, 2)
    );

    if (distance > selectedMaterial.maxLength) {
      showDialogMessage(
        "error",
        "Beam Too Long",
        `The beam is ${Math.round(distance)}px long, but ${
          selectedMaterial.name
        } can only span up to ${
          selectedMaterial.maxLength
        }px. Try using a different material or placing joints closer together.`
      );
      return;
    }

    const newBeam: Beam = {
      id: `beam-${Date.now()}`,
      jointA: jointAId,
      jointB: jointBId,
      stress: 0,
      maxStress: selectedMaterial.strength,
      broken: false,
      // ADD THESE INITIALIZATIONS:
      signedStrain: 0,
      originalLength: distance,
      currentLength: distance,
    };

    setBeams([...beams, newBeam]);
    placeBeamAudio.currentTime = 0;
    placeBeamAudio.play();
    updateScore();
  };

  // Start simulation
  const startSimulation = () => {
    if (!engineRef.current) return;

    // Validation checks
    const nonFixedJoints = joints.filter((j) => !j.isFixed);
    if (nonFixedJoints.length === 0) {
      showDialogMessage(
        "warning",
        "No Bridge Structure",
        "You need to place some joints to build a bridge structure. Click on the canvas to add joints, then connect them with beams."
      );
      return;
    }

    if (beams.length === 0) {
      showDialogMessage(
        "warning",
        "No Beams Connected",
        "Your joints are not connected with any beams. Click on joints to select them, then click on another joint to create a beam between them."
      );
      return;
    }

    // Check if there's a path between the anchor points
    const leftAnchor = joints.find((j) => j.id === "anchor-left");
    const rightAnchor = joints.find((j) => j.id === "anchor-right");

    if (leftAnchor && rightAnchor) {
      const hasConnection = checkBridgeConnection(
        leftAnchor.id,
        rightAnchor.id
      );
      if (!hasConnection) {
        showDialogMessage(
          "warning",
          "Bridge Not Connected",
          "Your bridge structure is not properly connected between the two anchor points. Make sure there is a continuous path of beams connecting both sides."
        );
        return;
      }
    }

    // Create physics bodies for joints
    const jointBodies = new Map<string, Matter.Body>();

    joints.forEach((joint) => {
      if (!joint.isFixed) {
        const body = Matter.Bodies.circle(joint.x, joint.y, 10, {
          mass: 1,
          render: { fillStyle: "#3498DB" },
          friction: 0.9, // High friction for vehicle grip
          frictionStatic: 1.0,
        });
        jointBodies.set(joint.id, body);
        joint.body = body;
        Matter.Composite.add(engineRef.current!.world, body);
      } else {
        const body = Matter.Bodies.circle(joint.x, joint.y, 10, {
          isStatic: true,
          render: { fillStyle: "#E74C3C" },
          friction: 0.9, // High friction for vehicle grip
          frictionStatic: 1.0,
        });
        jointBodies.set(joint.id, body);
        joint.body = body;
        Matter.Composite.add(engineRef.current!.world, body);
      }
    });

    // Create constraints for beams with collision bodies
    beams.forEach((beam) => {
      const bodyA = jointBodies.get(beam.jointA);
      const bodyB = jointBodies.get(beam.jointB);

      if (bodyA && bodyB) {
        const constraint = Matter.Constraint.create({
          bodyA,
          bodyB,
          stiffness: 0.8,
          damping: 0.1,
          render: {
            visible: false,
          },
        });
        beam.constraint = constraint;
        Matter.Composite.add(engineRef.current!.world, constraint);

        // Create invisible collision body for beam to allow vehicle interaction
        const jointA = joints.find((j) => j.id === beam.jointA);
        const jointB = joints.find((j) => j.id === beam.jointB);

        if (jointA && jointB) {
          const distance = Math.sqrt(
            Math.pow(jointB.x - jointA.x, 2) + Math.pow(jointB.y - jointA.y, 2)
          );
          const angle = Math.atan2(jointB.y - jointA.y, jointB.x - jointA.x);
          const midX = (jointA.x + jointB.x) / 2;
          const midY = (jointA.y + jointB.y) / 2;

          // Create thicker rectangular collision body for smoother vehicle interaction
          const beamCollisionBody = Matter.Bodies.rectangle(
            midX,
            midY,
            distance,
            12, // Increased thickness from 8 to 12
            {
              angle: angle,
              isStatic: false,
              render: { visible: false },
              friction: 0.8,
              frictionStatic: 0.9,
              restitution: 0.1, // Low bounce
              mass: 0.05, // Very light
            }
          );

          beam.collisionBody = beamCollisionBody;

          // Connect collision body to both joints with higher stiffness
          const constraintA = Matter.Constraint.create({
            bodyA: bodyA,
            bodyB: beamCollisionBody,
            pointB: { x: -distance / 2, y: 0 },
            stiffness: 0.95, // Increased from 0.9
            damping: 0.05, // Reduced damping
            render: { visible: false },
          });

          const constraintB = Matter.Constraint.create({
            bodyA: bodyB,
            bodyB: beamCollisionBody,
            pointB: { x: distance / 2, y: 0 },
            stiffness: 0.95, // Increased from 0.9
            damping: 0.05, // Reduced damping
            render: { visible: false },
          });

          Matter.Composite.add(engineRef.current!.world, [
            beamCollisionBody,
            constraintA,
            constraintB,
          ]);
        }
      }
    });

    // Spawn vehicle after a short delay
    setTimeout(() => {
      spawnVehicle();
    }, 1000);

    setIsSimulating(true);
    setSimulationStartTime(Date.now());
    setBridgeSuccess(null);
  };

  // Spawn vehicle function
  const spawnVehicle = () => {
    if (!engineRef.current) return;

    const vehicleInfo = getVehicleInfo(loadWeight);
    const startX = 50;
    const startY = groundY - 50; // Closer to ground level

    // Create a more stable vehicle body
    const vehicleBody = Matter.Bodies.rectangle(
      startX,
      startY,
      vehicleInfo.width * 0.8,
      vehicleInfo.height * 0.6,
      {
        density: 0.001,
        friction: 0.8,
        frictionStatic: 0.9,
        restitution: 0.3,
        render: { fillStyle: vehicleInfo.color },
      }
    );

    // Set the vehicle mass directly
    Matter.Body.setMass(vehicleBody, vehicleInfo.mass);

    // Add vehicle to world
    Matter.Composite.add(engineRef.current.world, vehicleBody);
    setVehicle(vehicleBody);
    setVehicleStarted(true);

    // Apply consistent forward force
    const forceInterval = setInterval(() => {
      if (vehicleBody && engineRef.current) {
        const forceX = vehicleInfo.mass * 0.01; // Reduced force for smoother movement
        Matter.Body.applyForce(vehicleBody, vehicleBody.position, {
          x: forceX,
          y: 0,
        });
      }
    }, 50);

    // Clear force interval when simulation stops
    setTimeout(() => clearInterval(forceInterval), 30000); // 30 second timeout
  };

  // Stop simulation
  const stopSimulation = useCallback(() => {
    if (!engineRef.current) return;

    // Remove vehicle if it exists
    if (vehicle) {
      Matter.Composite.remove(engineRef.current.world, vehicle);
      setVehicle(null);
    }

    setVehicleStarted(false);

    // Remove all dynamic bodies
    joints.forEach((joint) => {
      if (joint.body) {
        Matter.Composite.remove(engineRef.current!.world, joint.body);
        joint.body = undefined;
      }
    });

    beams.forEach((beam) => {
      if (beam.constraint) {
        Matter.Composite.remove(engineRef.current!.world, beam.constraint);
        beam.constraint = undefined;
      }
      if (beam.collisionBody) {
        Matter.Composite.remove(engineRef.current!.world, beam.collisionBody);
        beam.collisionBody = undefined;
      }
    });

    setIsSimulating(false);
    setBeams(
      beams.map((b) => ({
        ...b,
        stress: 0,
        signedStrain: 0,
        currentLength: b.originalLength,
        broken: false,
        breakAnimation: undefined,
      }))
    );
    setBridgeSuccess(null);
  }, [
    vehicle,
    joints,
    beams,
    setVehicle,
    setVehicleStarted,
    setIsSimulating,
    setBeams,
    setBridgeSuccess,
  ]);

  // Update score (for build-time calculations)
  const updateScore = useCallback(() => {
    if (isSimulating) return; // Don't update during simulation

    const materialCost = beams.length * selectedMaterial.cost;
    const efficiency = Math.max(0, 1000 - materialCost);
    const designScore = loadWeight * 5; // Preview of load capability
    setScore(Math.max(0, efficiency + designScore));
  }, [beams.length, selectedMaterial.cost, loadWeight, isSimulating, setScore]);

  // Get beam color based on signed strain
  const getBeamColor = useCallback(
    (beam: Beam): string => {
      if (beam.broken) return "#E74C3C";

      if (!isSimulating || Math.abs(beam.signedStrain) < 0.001) {
        return getNeutralColor();
      }

      // Normalize strain for color intensity (0 to 1)
      const maxStrain = 0.1; // Adjust this value to control color sensitivity
      const normalizedStrain = Math.min(
        1,
        Math.abs(beam.signedStrain) / maxStrain
      );

      if (beam.signedStrain > 0) {
        // Positive strain = tension (blue)
        return getTensionColor(normalizedStrain);
      } else {
        // Negative strain = compression (red)
        return getCompressionColor(normalizedStrain);
      }
    },
    [isSimulating]
  );

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return; // Prevent click during drag

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Account for canvas scaling by calculating the ratio between actual and displayed size
    const scaleX = worldWidth / rect.width;
    const scaleY = worldHeight / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a joint
    const clickedJoint = joints.find((joint) => {
      const dist = Math.sqrt(
        Math.pow(joint.x - x, 2) + Math.pow(joint.y - y, 2)
      );
      return dist < 20;
    });

    if (clickedJoint) {
      if (selectedJoint === clickedJoint.id) {
        setSelectedJoint(null);
      } else if (selectedJoint) {
        addBeam(selectedJoint, clickedJoint.id);
        setSelectedJoint(null);
      } else {
        setSelectedJoint(clickedJoint.id);
      }
    } else if (!isSimulating) {
      addJoint(x, y);
    }
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSimulating) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Account for canvas scaling by calculating the ratio between actual and displayed size
    const scaleX = worldWidth / rect.width;
    const scaleY = worldHeight / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a joint
    const clickedJoint = joints.find((joint) => {
      const dist = Math.sqrt(
        Math.pow(joint.x - x, 2) + Math.pow(joint.y - y, 2)
      );
      return dist < 20;
    });

    if (clickedJoint && !clickedJoint.isFixed) {
      setDraggedJoint(clickedJoint);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedJoint.x,
        y: y - clickedJoint.y,
      });
    }
  };

  // Render custom graphics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, worldWidth, worldHeight);

      // Draw grid if enabled
      if (showGrid) {
        const gridSize = 25;
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= worldWidth; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, worldHeight);
          ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= worldHeight; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(worldWidth, y);
          ctx.stroke();
        }

        // Draw major grid lines every 100px
        ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
        ctx.lineWidth = 1.5;

        for (let x = 0; x <= worldWidth; x += 100) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, worldHeight);
          ctx.stroke();
        }

        for (let y = 0; y <= worldHeight; y += 100) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(worldWidth, y);
          ctx.stroke();
        }
      }

      // Draw beams with strain-based coloring
      beams.forEach((beam) => {
        const jointA = joints.find((j) => j.id === beam.jointA);
        const jointB = joints.find((j) => j.id === beam.jointB);

        if (jointA && jointB) {
          const beamColor = getBeamColor(beam);

          // Draw beam shadow
          ctx.beginPath();
          ctx.moveTo(jointA.x + 2, jointA.y + 2);
          ctx.lineTo(jointB.x + 2, jointB.y + 2);
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          ctx.lineWidth = beam.broken ? 3 : 8;
          ctx.stroke();

          // Draw main beam with strain-based color
          ctx.beginPath();
          ctx.moveTo(jointA.x, jointA.y);
          ctx.lineTo(jointB.x, jointB.y);
          ctx.strokeStyle = beamColor;
          ctx.lineWidth = beam.broken ? 2 : 7;
          ctx.stroke();

          // Draw beam texture based on material (only if not broken and not under significant load)
          if (!beam.broken && Math.abs(beam.signedStrain) < 0.05) {
            const material = selectedMaterial;
            if (material.name === "Steel") {
              // Steel rivets
              const midX = (jointA.x + jointB.x) / 2;
              const midY = (jointA.y + jointB.y) / 2;
              ctx.fillStyle = "#808080";
              ctx.beginPath();
              ctx.arc(midX, midY, 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (material.name === "Wood") {
              // Wood grain lines
              const angle = Math.atan2(
                jointB.y - jointA.y,
                jointB.x - jointA.x
              );
              const length = Math.sqrt(
                Math.pow(jointB.x - jointA.x, 2) +
                  Math.pow(jointB.y - jointA.y, 2)
              );
              ctx.save();
              ctx.translate(jointA.x, jointA.y);
              ctx.rotate(angle);
              ctx.strokeStyle = "#654321";
              ctx.lineWidth = 1;
              for (let i = 10; i < length - 10; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, -2);
                ctx.lineTo(i + 8, 2);
                ctx.stroke();
              }
              ctx.restore();
            }
          }

          // Draw strain indicator with force direction
          if (
            isSimulating &&
            !beam.broken &&
            Math.abs(beam.signedStrain) > 0.001
          ) {
            const midX = (jointA.x + jointB.x) / 2;
            const midY = (jointA.y + jointB.y) / 2;

            // Background for text
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(midX - 25, midY - 15, 50, 20);

            // Strain value and type
            ctx.fillStyle = "#000";
            ctx.font = "bold 9px Orbitron";
            ctx.textAlign = "center";
            const strainPercent = (beam.signedStrain * 100).toFixed(1);
            const forceType = beam.signedStrain > 0 ? "T" : "C"; // T for tension, C for compression
            ctx.fillText(`${strainPercent}% ${forceType}`, midX, midY - 2);

            // Draw force arrows
            const angle = Math.atan2(jointB.y - jointA.y, jointB.x - jointA.x);
            const arrowLength = 15;
            const arrowSize = 4;

            ctx.strokeStyle = beam.signedStrain > 0 ? "#0066CC" : "#CC0000";
            ctx.lineWidth = 2;

            if (beam.signedStrain > 0) {
              // Tension arrows pointing outward
              // Arrow from center to jointA direction
              ctx.beginPath();
              ctx.moveTo(midX, midY);
              ctx.lineTo(
                midX - Math.cos(angle) * arrowLength,
                midY - Math.sin(angle) * arrowLength
              );
              ctx.stroke();

              // Arrow from center to jointB direction
              ctx.beginPath();
              ctx.moveTo(midX, midY);
              ctx.lineTo(
                midX + Math.cos(angle) * arrowLength,
                midY + Math.sin(angle) * arrowLength
              );
              ctx.stroke();

              // Arrowheads
              const drawArrowHead = (x: number, y: number, angle: number) => {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                  x - arrowSize * Math.cos(angle - Math.PI / 6),
                  y - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(x, y);
                ctx.lineTo(
                  x - arrowSize * Math.cos(angle + Math.PI / 6),
                  y - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
              };

              drawArrowHead(
                midX - Math.cos(angle) * arrowLength,
                midY - Math.sin(angle) * arrowLength,
                angle + Math.PI
              );
              drawArrowHead(
                midX + Math.cos(angle) * arrowLength,
                midY + Math.sin(angle) * arrowLength,
                angle
              );
            } else {
              // Compression arrows pointing inward
              const startA = {
                x: midX - Math.cos(angle) * arrowLength,
                y: midY - Math.sin(angle) * arrowLength,
              };
              const startB = {
                x: midX + Math.cos(angle) * arrowLength,
                y: midY + Math.sin(angle) * arrowLength,
              };

              ctx.beginPath();
              ctx.moveTo(startA.x, startA.y);
              ctx.lineTo(midX, midY);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(startB.x, startB.y);
              ctx.lineTo(midX, midY);
              ctx.stroke();

              // Arrowheads pointing toward center
              const drawArrowHead = (
                fromX: number,
                fromY: number,
                toX: number,
                toY: number
              ) => {
                const angle = Math.atan2(toY - fromY, toX - fromX);
                ctx.beginPath();
                ctx.moveTo(toX, toY);
                ctx.lineTo(
                  toX - arrowSize * Math.cos(angle - Math.PI / 6),
                  toY - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(toX, toY);
                ctx.lineTo(
                  toX - arrowSize * Math.cos(angle + Math.PI / 6),
                  toY - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
              };

              drawArrowHead(startA.x, startA.y, midX, midY);
              drawArrowHead(startB.x, startB.y, midX, midY);
            }
          }

          // Draw break animation particles
          if (beam.breakAnimation) {
            beam.breakAnimation.particles.forEach((particle) => {
              ctx.save();
              ctx.globalAlpha = particle.life;
              ctx.fillStyle = "#E74C3C";
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            });
          }
        }
      });

      // Draw joints with custom styling
      joints.forEach((joint) => {
        const isSelected = joint.id === selectedJoint;
        const isDraggedJoint = draggedJoint?.id === joint.id && isDragging;

        const jointX = isDraggedJoint
          ? mousePosition.x - dragOffset.x
          : joint.x;
        const jointY = isDraggedJoint
          ? mousePosition.y - dragOffset.y
          : joint.y;

        // Draw joint shadow
        ctx.beginPath();
        ctx.arc(jointX + 2, jointY + 2, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fill();

        // Draw main joint
        ctx.beginPath();
        ctx.arc(jointX, jointY, 10, 0, Math.PI * 2);
        ctx.fillStyle = joint.isFixed
          ? "#E74C3C"
          : isSelected
          ? "#F39C12"
          : "#3498DB";
        ctx.fill();
        ctx.strokeStyle = "#2C3E50";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw joint details
        if (joint.isFixed) {
          // Fixed joint indicator
          ctx.fillStyle = "#C0392B";
          ctx.fillRect(jointX - 4, jointY - 4, 8, 8);
          ctx.fillStyle = "#E74C3C";
          ctx.fillRect(jointX - 2, jointY - 2, 4, 4);
        } else if (isSelected) {
          // Selection indicator
          ctx.beginPath();
          ctx.arc(jointX, jointY, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#E67E22";
          ctx.fill();
        }

        // Draw dragging preview
        if (isDraggedJoint) {
          ctx.beginPath();
          ctx.arc(jointX, jointY, 12, 0, Math.PI * 2);
          ctx.strokeStyle = "#F39C12";
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw beam preview
      if (selectedJoint && !isSimulating && !isDragging) {
        const joint = joints.find((j) => j.id === selectedJoint);
        if (joint) {
          ctx.beginPath();
          ctx.moveTo(joint.x, joint.y);
          ctx.lineTo(mousePosition.x, mousePosition.y);
          ctx.strokeStyle = "#95A5A6";
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 10]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Show distance and material info
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - joint.x, 2) +
              Math.pow(mousePosition.y - joint.y, 2)
          );
          const canBuild = distance <= selectedMaterial.maxLength;

          ctx.fillStyle = canBuild ? "#27AE60" : "#E74C3C";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            `${Math.round(distance)}px - ${selectedMaterial.name}`,
            (joint.x + mousePosition.x) / 2,
            (joint.y + mousePosition.y) / 2 - 10
          );
        }
      }

      // Draw vehicle if it exists
      if (vehicle && isSimulating) {
        const vehicleInfo = getVehicleInfo(loadWeight);
        ctx.save();
        ctx.translate(vehicle.position.x, vehicle.position.y);
        ctx.rotate(vehicle.angle);

        // Draw simple vehicle representation
        ctx.fillStyle = vehicleInfo.color;
        ctx.fillRect(
          -vehicleInfo.width / 4,
          -vehicleInfo.height / 4,
          vehicleInfo.width / 2,
          vehicleInfo.height / 2
        );

        // Draw wheels
        ctx.fillStyle = "#2C3E50";
        ctx.beginPath();
        ctx.arc(
          -vehicleInfo.width / 6,
          vehicleInfo.height / 6,
          6,
          0,
          Math.PI * 2
        );
        ctx.arc(
          vehicleInfo.width / 6,
          vehicleInfo.height / 6,
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
      }
    };

    const animationId = requestAnimationFrame(function animate() {
      render();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationId);
  }, [
    joints,
    beams,
    selectedJoint,
    isSimulating,
    draggedJoint,
    mousePosition,
    isDragging,
    dragOffset,
    selectedMaterial,
    getVehicleInfo,
    loadWeight,
    showGrid,
    vehicle,
    getBeamColor,
  ]);

  // Calculate final score based on bridge performance
  const calculateFinalScore = useCallback(
    (success: boolean) => {
      const brokenBeams = beams.filter((b) => b.broken).length;
      const totalBeams = beams.length;
      const materialCost = totalBeams * selectedMaterial.cost;
      const timeBonus = Math.max(0, 10000 - (Date.now() - simulationStartTime));

      let finalScore = 0;

      if (success) {
        // Base success score
        finalScore += 5000;

        // Load weight bonus (heavier vehicles = more points)
        finalScore += loadWeight * 50;

        // Efficiency bonus (fewer beams = more points)
        const efficiency =
          totalBeams > 0 ? (totalBeams - brokenBeams) / totalBeams : 0;
        finalScore += efficiency * 2000;

        // Material cost penalty
        finalScore -= materialCost * 5;

        // Time bonus
        finalScore += timeBonus * 0.001;

        // Perfect bridge bonus (no broken beams)
        if (brokenBeams === 0) {
          finalScore += 3000;
        }
      } else {
        // Partial credit for attempting
        finalScore += 500;

        // Small bonus for surviving beams
        const survivingBeams = totalBeams - brokenBeams;
        finalScore += survivingBeams * 50;
      }

      setScore(Math.max(0, Math.round(finalScore)));
    },
    [beams, selectedMaterial.cost, simulationStartTime, loadWeight, setScore]
  );

  // Monitor vehicle progress and bridge performance
  useEffect(() => {
    if (!isSimulating || !vehicle) return;

    const checkVehicleProgress = () => {
      if (!vehicle || !engineRef.current) return;

      const vehicleX = vehicle.position.x;
      const vehicleY = vehicle.position.y;

      // Check if vehicle reached the end (success)
      if (vehicleX > worldWidth - 250 && bridgeSuccess === null) {
        setBridgeSuccess(true);
        calculateFinalScore(true);

        showDialogMessage(
          "warning",
          "Bridge Success!",
          `Congratulations! Your bridge successfully supported the ${
            getVehicleInfo(loadWeight).type
          } (${loadWeight}kg). The vehicle made it safely across!`
        );

        setTimeout(() => {
          stopSimulation();
        }, 3000);
      }

      // Check if vehicle fell (failure)
      else if (vehicleY > groundY + 100 && bridgeSuccess === null) {
        setBridgeSuccess(false);
        calculateFinalScore(false);

        showDialogMessage(
          "error",
          "Bridge Failure!",
          `Oh no! Your bridge couldn't support the ${
            getVehicleInfo(loadWeight).type
          } (${loadWeight}kg). The vehicle fell through. Try reinforcing your bridge with stronger materials or better design.`
        );

        setTimeout(() => {
          stopSimulation();
        }, 3000);
      }
    };

    const interval = setInterval(checkVehicleProgress, 500);
    return () => clearInterval(interval);
  }, [
    isSimulating,
    vehicle,
    bridgeSuccess,
    loadWeight,
    worldWidth,
    groundY,
    calculateFinalScore,
    getVehicleInfo,
    stopSimulation,
    showDialogMessage,
  ]);

  return (
    <>
      <style>
        {`
        @import url(https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap);
        body {
            font-family: "Orbitron", monospace;
        }
        `}
      </style>
      <div className="flex h-screen bg-sky-50 relative overflow-hidden">
        {/* Left Panel */}
        <div
          className={`${
            leftPanelOpen ? "w-80" : "w-12"
          } bg-sky-100 transition-all duration-300 ease-in-out relative flex-shrink-0 border-r border-slate-300`}
        >
          <button
            onClick={() => {
              if (leftPanelOpen) {
                setLeftPanelOpen(false);
              } else {
                if (rightPanelOpen) setRightPanelOpen(false);
                setLeftPanelOpen(true);
              }
            }}
            className="absolute -right-3 top-4 bg-sky-100 border border-slate-300 text-slate-600 w-6 h-6 cursor-pointer rounded-full z-20 flex items-center justify-center
                    shadow-[2px_2px_4px_rgba(148,163,184,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)] 
                    hover:shadow-[1px_1px_2px_rgba(148,163,184,0.4),-1px_-1px_2px_rgba(255,255,255,0.9)] 
                    active:shadow-[inset_1px_1px_2px_rgba(148,163,184,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                    transition-all duration-200 hover:text-blue-600"
          >
            {leftPanelOpen ? (
              <IoChevronBack size={14} />
            ) : (
              <IoChevronForward size={14} />
            )}
          </button>

          <div
            className={`h-full overflow-y-auto ${
              leftPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            } transition-opacity duration-300`}
          >
            {leftPanelOpen && (
              <div className="p-4 text-slate-900">
                <div className="mb-6" data-tutorial-target="materials">
                  <button
                    onClick={() => setMaterialsCollapsed(!materialsCollapsed)}
                    className="flex items-center justify-between w-full p-3 bg-sky-100 rounded-xl text-slate-900
                                    shadow-[4px_4px_8px_rgba(148,163,184,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)]
                                    hover:shadow-[2px_2px_4px_rgba(148,163,184,0.4),-2px_-2px_4px_rgba(255,255,255,0.9)]
                                    active:shadow-[inset_2px_2px_4px_rgba(148,163,184,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]
                                    transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      Materials
                    </h3>
                    {materialsCollapsed ? (
                      <IoChevronDown size={20} className="text-slate-600" />
                    ) : (
                      <IoChevronUp size={20} className="text-slate-600" />
                    )}
                  </button>

                  <div
                    className={`mt-3 space-y-3 overflow-hidden transition-all duration-300 ${
                      materialsCollapsed
                        ? "max-h-0 opacity-0"
                        : "max-h-96 opacity-100"
                    }`}
                  >
                    {materials.map((material) => {
                      const IconComponent =
                        material.name === "Steel"
                          ? SteelIcon
                          : material.name === "Wood"
                          ? WoodIcon
                          : CableIcon;

                      return (
                        <div
                          key={material.name}
                          onClick={() => setSelectedMaterial(material)}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                            selectedMaterial.name === material.name
                              ? "bg-blue-600 text-white transform scale-105"
                              : "bg-sky-100 text-slate-900 hover:text-blue-600"
                          }`}
                          style={{
                            boxShadow:
                              selectedMaterial.name === material.name
                                ? "inset 4px_4px_8px_rgba(29,78,216,0.3),inset_-4px_-4px_8px_rgba(59,130,246,0.3)"
                                : "4px_4px_8px_rgba(148,163,184,0.2),-4px_-4px_8px_rgba(255,255,255,0.8)",
                          }}
                        >
                          <div className="flex-shrink-0">
                            <IconComponent />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm mb-1">
                              {material.name}
                            </div>
                            <div
                              className={`text-xs ${
                                selectedMaterial.name === material.name
                                  ? "text-blue-100"
                                  : "text-slate-600"
                              }`}
                            >
                              Strength: {material.strength}
                            </div>
                            <div
                              className={`text-xs ${
                                selectedMaterial.name === material.name
                                  ? "text-blue-100"
                                  : "text-slate-600"
                              }`}
                            >
                              Cost: ${material.cost} | Max: {material.maxLength}
                              px
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="p-4 bg-sky-100 rounded-xl text-slate-900"
                  style={{
                    boxShadow:
                      "inset 4px_4px_8px_rgba(148,163,184,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <IoInformationCircle size={18} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-600">
                      Instructions
                    </h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 pl-4 mb-4">
                    <li>• Click to add joints</li>
                    <li>• Drag joints to move them</li>
                    <li>• Click joints to connect with beams</li>
                    <li>• Blue = tension, Red = compression</li>
                    <li>• Watch force arrows and percentages!</li>
                  </ul>
                  <button
                    onClick={() => {
                      setShowTutorial(true);
                      setTutorialStep(0);
                    }}
                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      boxShadow:
                        "2px_2px_4px_rgba(59,130,246,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)",
                    }}
                  >
                    Show Tutorial
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-sky-50 min-w-0">
          <div
            className="absolute top-5 left-1/2 -translate-x-1/2 bg-sky-100 p-4 rounded-2xl text-slate-900 z-10"
            style={{
              boxShadow:
                "6px_6px_12px_rgba(148,163,184,0.3),-6px_-6px_12px_rgba(255,255,255,0.8)",
            }}
          >
            <h2 className="text-center mb-2 text-lg font-bold text-blue-600">
              Bridge Builder Pro
            </h2>
            <div className="text-center text-xl font-bold text-slate-900">
              Score: {score}
            </div>
            {isSimulating && (
              <div className="text-center text-sm mt-1">
                {vehicleStarted ? (
                  <span className="text-green-600 font-semibold">
                    Vehicle Crossing...
                  </span>
                ) : (
                  <span className="text-blue-600 font-semibold">
                    Simulation Starting...
                  </span>
                )}
              </div>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={worldWidth}
            height={worldHeight}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            data-tutorial-target="canvas"
            className={`rounded-2xl bg-slate-50 ${
              selectedJoint
                ? "cursor-crosshair"
                : isDragging
                ? "cursor-move"
                : "cursor-pointer"
            }`}
            style={{
              boxShadow:
                "inset 6px_6px_12px_rgba(148,163,184,0.2),inset_-6px_-6px_12px_rgba(255,255,255,0.8)",
              maxWidth: "calc(100vw - 200px)",
              maxHeight: "calc(100vh - 200px)",
            }}
          />

          <div
            className="absolute bottom-5 flex gap-4 items-center flex-wrap justify-center"
            data-tutorial-target="controls"
          >
            <button
              onClick={isSimulating ? stopSimulation : startSimulation}
              className={`flex items-center gap-2 px-6 py-3 border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 ${
                isSimulating
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              style={{
                boxShadow:
                  "4px_4px_8px_rgba(148,163,184,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)",
              }}
            >
              {isSimulating ? (
                <>
                  <IoStop size={16} />
                  Stop Simulation
                </>
              ) : (
                <>
                  <IoPlay size={16} />
                  Start Simulation
                </>
              )}
            </button>

            <div
              className="flex items-center gap-3 bg-sky-100 px-4 py-3 rounded-xl text-slate-900"
              style={{
                boxShadow:
                  "inset 4px_4px_8px_rgba(148,163,184,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)",
              }}
            >
              <label className="text-sm font-semibold text-blue-600">
                Load:
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={loadWeight}
                onChange={(e) => setLoadWeight(Number(e.target.value))}
                disabled={isSimulating}
                className="w-24 accent-blue-500"
              />
              <span className="text-sm font-bold">{loadWeight}kg</span>

              {/* Vehicle preview */}
              <div
                className="flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-lg"
                style={{
                  boxShadow:
                    "2px_2px_4px_rgba(148,163,184,0.2),-2px_-2px_4px_rgba(255,255,255,0.8)",
                }}
              >
                <div className="scale-50 origin-left">
                  {(() => {
                    const vehicleInfo = getVehicleInfo(loadWeight);
                    const VehicleComponent = vehicleInfo.icon;
                    return <VehicleComponent />;
                  })()}
                </div>
                <span className="text-xs capitalize font-semibold text-slate-700">
                  {getVehicleInfo(loadWeight).type}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setJoints(joints.filter((j) => j.isFixed));
                setBeams([]);
                setScore(0);
                setLoadWeight(20);
                setSelectedJoint(null);
              }}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-4 py-3 border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 ${
                isSimulating
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              style={{
                boxShadow: isSimulating
                  ? "inset 2px_2px_4px_rgba(148,163,184,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)"
                  : "4px_4px_8px_rgba(148,163,184,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)",
              }}
            >
              <IoTrash size={16} />
              Clear Bridge
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div
          className={`${
            rightPanelOpen ? "w-80" : "w-12"
          } bg-sky-100 transition-all duration-300 ease-in-out relative flex-shrink-0 border-l border-slate-300`}
        >
          <button
            onClick={() => {
              if (rightPanelOpen) {
                setRightPanelOpen(false);
              } else {
                if (leftPanelOpen) setLeftPanelOpen(false);
                setRightPanelOpen(true);
              }
            }}
            className="absolute -left-3 top-4 bg-sky-100 border border-slate-300 text-slate-600 w-6 h-6 cursor-pointer rounded-full z-20 flex items-center justify-center
                    shadow-[2px_2px_4px_rgba(148,163,184,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)] 
                    hover:shadow-[1px_1px_2px_rgba(148,163,184,0.4),-1px_-1px_2px_rgba(255,255,255,0.9)] 
                    active:shadow-[inset_1px_1px_2px_rgba(148,163,184,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                    transition-all duration-200 hover:text-blue-600"
          >
            {rightPanelOpen ? (
              <IoChevronForward size={14} />
            ) : (
              <IoChevronBack size={14} />
            )}
          </button>

          <div
            className={`h-full overflow-y-auto ${
              rightPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            } transition-opacity duration-300`}
          >
            {rightPanelOpen && (
              <div className="p-4 text-slate-900" data-tutorial-target="stats">
                <h3 className="mb-4 text-lg font-semibold text-blue-600">
                  Bridge Analysis
                </h3>

                <div
                  className="mb-6 p-4 bg-sky-100 rounded-xl"
                  style={{
                    boxShadow:
                      "inset 4px_4px_8px_rgba(148,163,184,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-sky-50 rounded-lg">
                      <div className="text-xs text-slate-600">Joints</div>
                      <div className="text-lg font-bold text-blue-600">
                        {joints.length}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-sky-50 rounded-lg">
                      <div className="text-xs text-slate-600">Beams</div>
                      <div className="text-lg font-bold text-blue-600">
                        {beams.length}
                      </div>
                    </div>
                    <div className="col-span-2 text-center p-2 bg-sky-50 rounded-lg">
                      <div className="text-xs text-slate-600">Total Cost</div>
                      <div className="text-lg font-bold text-green-600">
                        ${beams.length * selectedMaterial.cost}
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mb-3 text-sm font-semibold text-blue-600">
                  Force Legend
                </h4>
                <div className="text-xs space-y-2 mb-4">
                  <div
                    className="flex items-center p-2 bg-sky-50 rounded-lg"
                    style={{
                      boxShadow:
                        "2px_2px_4px_rgba(148,163,184,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)",
                    }}
                  >
                    <span className="inline-block w-4 h-3 bg-blue-500 mr-2 rounded-sm"></span>
                    <span className="text-slate-700">Tension (Stretching)</span>
                  </div>
                  <div
                    className="flex items-center p-2 bg-sky-50 rounded-lg"
                    style={{
                      boxShadow:
                        "2px_2px_4px_rgba(148,163,184,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)",
                    }}
                  >
                    <span className="inline-block w-4 h-3 bg-red-500 mr-2 rounded-sm"></span>
                    <span className="text-slate-700">
                      Compression (Squeezing)
                    </span>
                  </div>
                  <div
                    className="flex items-center p-2 bg-sky-50 rounded-lg"
                    style={{
                      boxShadow:
                        "2px_2px_4px_rgba(148,163,184,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)",
                    }}
                  >
                    <span className="inline-block w-4 h-3 bg-gray-500 mr-2 rounded-sm"></span>
                    <span className="text-slate-700">Neutral (No Load)</span>
                  </div>
                </div>

                <div
                  className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                  style={{
                    boxShadow:
                      "2px_2px_4px_rgba(59,130,246,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)",
                  }}
                >
                  <div className="text-xs text-blue-700 font-semibold mb-1">
                    💡 Pro Tip:
                  </div>
                  <div className="text-xs text-blue-600">
                    Watch the force arrows! Outward arrows = tension, inward
                    arrows = compression. The percentage shows strain intensity.
                  </div>
                </div>

                {isSimulating && (
                  <div
                    className="mt-6 p-4 bg-red-100 rounded-xl border-l-4 border-red-500"
                    style={{
                      boxShadow:
                        "4px_4px_8px_rgba(239,68,68,0.2),-4px_-4px_8px_rgba(255,255,255,0.8)",
                    }}
                  >
                    <div className="font-bold text-red-700 text-sm mb-2">
                      Live Analysis
                    </div>
                    <div className="text-xs text-red-600 mb-1">
                      Broken Beams:{" "}
                      <span className="font-bold">
                        {beams.filter((b) => b.broken).length}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 mb-1">
                      Max Tension:{" "}
                      <span className="font-bold">
                        {Math.max(
                          0,
                          ...beams.map((b) =>
                            b.signedStrain > 0 ? b.signedStrain * 100 : 0
                          )
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="text-xs text-orange-600 mb-1">
                      Max Compression:{" "}
                      <span className="font-bold">
                        {Math.max(
                          0,
                          ...beams.map((b) =>
                            b.signedStrain < 0
                              ? Math.abs(b.signedStrain) * 100
                              : 0
                          )
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    {vehicle && (
                      <div className="text-xs text-blue-600">
                        Vehicle Position:{" "}
                        <span className="font-bold">
                          {Math.round(vehicle.position.x)}px
                        </span>
                      </div>
                    )}
                    {bridgeSuccess !== null && (
                      <div
                        className={`text-xs font-bold mt-2 ${
                          bridgeSuccess ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {bridgeSuccess ? "Bridge Success!" : "Bridge Failed!"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Animated Dialog */}
        <AnimatePresence>
          {showDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/35 flex items-center justify-center z-50"
              onClick={() => setShowDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-sky-100 rounded-2xl p-6 max-w-md mx-4 relative"
                style={{
                  boxShadow:
                    "8px_8px_16px_rgba(148,163,184,0.3),-8px_-8px_16px_rgba(255,255,255,0.8)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowDialog(false)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <IoClose size={20} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-full ${
                      dialogType === "error"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <IoWarning size={24} />
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      dialogType === "error"
                        ? "text-red-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {dialogTitle}
                  </h3>
                </div>

                <p className="text-slate-700 mb-6 leading-relaxed">
                  {dialogMessage}
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDialog(false)}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      dialogType === "error"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    }`}
                    style={{
                      boxShadow:
                        "4px_4px_8px_rgba(148,163,184,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)",
                    }}
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-sky-100 rounded-2xl p-6 max-w-lg mx-4 relative"
                style={{
                  boxShadow:
                    "12px_12px_24px_rgba(148,163,184,0.4),-12px_-12px_24px_rgba(255,255,255,0.9)",
                }}
              >
                <button
                  onClick={skipTutorial}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <IoClose size={24} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                    <IoInformationCircle size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-blue-700">
                    {tutorialSteps[tutorialStep]?.title}
                  </h3>
                </div>

                <p className="text-slate-700 mb-6 leading-relaxed text-base">
                  {tutorialSteps[tutorialStep]?.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tutorialSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === tutorialStep
                            ? "bg-blue-500 w-6"
                            : index < tutorialStep
                            ? "bg-green-400"
                            : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={skipTutorial}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      Skip Tutorial
                    </button>
                    <button
                      onClick={nextTutorialStep}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200"
                      style={{
                        boxShadow:
                          "4px_4px_8px_rgba(59,130,246,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)",
                      }}
                    >
                      {tutorialStep === tutorialSteps.length - 1
                        ? "Get Started!"
                        : "Next"}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Tutorial Pointer/Arrow */}
              {tutorialSteps[tutorialStep]?.target && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute pointer-events-none"
                  style={{
                    top:
                      tutorialSteps[tutorialStep]?.target === "canvas"
                        ? "45%"
                        : tutorialSteps[tutorialStep]?.target === "materials"
                        ? "30%"
                        : tutorialSteps[tutorialStep]?.target === "controls"
                        ? "85%"
                        : tutorialSteps[tutorialStep]?.target === "stats"
                        ? "30%"
                        : "50%",
                    left:
                      tutorialSteps[tutorialStep]?.target === "canvas"
                        ? "50%"
                        : tutorialSteps[tutorialStep]?.target === "materials"
                        ? "15%"
                        : tutorialSteps[tutorialStep]?.target === "controls"
                        ? "50%"
                        : tutorialSteps[tutorialStep]?.target === "stats"
                        ? "85%"
                        : "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-yellow-400 drop-shadow-lg"
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// Helper functions for beam coloring
const getNeutralColor = (): string => "#95A5A6"; // Gray for no load

const getTensionColor = (intensity: number): string => {
  // Blue gradient for tension
  const r = Math.round(100 - intensity * 100);
  const g = Math.round(150 - intensity * 50);
  const b = Math.round(255);
  return `rgb(${r}, ${g}, ${b})`;
};

const getCompressionColor = (intensity: number): string => {
  // Red gradient for compression
  const r = Math.round(255);
  const g = Math.round(100 - intensity * 100);
  const b = Math.round(100 - intensity * 100);
  return `rgb(${r}, ${g}, ${b})`;
};

export default BridgeBuilder;
