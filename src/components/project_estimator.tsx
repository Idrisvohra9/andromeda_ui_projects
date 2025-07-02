import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  FiDownload,
  FiMoon,
  FiSun,
  FiDollarSign,
  FiMaximize,
  FiMinimize,
  FiChevronDown,
} from "react-icons/fi";
import { CiCalculator2 } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
// Import required language definitions
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-go";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-typescript";

// Google Fonts import for Poppins and Outfit
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');`;

// Understanding the building blocks of our estimator
// These types and constants define what languages we support and what features we can estimate
type Language = "TypeScript" | "Python" | "Java" | "Go" | "Ruby";

// Data for languages and features
const LANGUAGES = [
  { name: "TypeScript", baseMultiplier: 1 },
  { name: "Python", baseMultiplier: 0.9 },
  { name: "Java", baseMultiplier: 1.15 },
  { name: "Go", baseMultiplier: 0.95 },
  { name: "Ruby", baseMultiplier: 1.05 },
];

const FEATURES = [
  { key: "apiIntegration", label: "API Integration", baseHours: 12 },
  { key: "uiDesign", label: "UI Design", baseHours: 10 },
  { key: "auth", label: "Authentication", baseHours: 8 },
  { key: "deployment", label: "Deployment Pipeline", baseHours: 6 },
  { key: "testing", label: "Automated Testing", baseHours: 6 },
  { key: "realtime", label: "Realtime Features", baseHours: 10 },
];

const COMPLEXITY_LEVELS = [
  { label: "Low", value: 0.8 },
  { label: "Medium", value: 1 },
  { label: "High", value: 1.3 },
];

const METHODOLOGIES = [
  {
    name: "Waterfall",
    description: "Traditional sequential development.",
    multiplier: 1,
  },
  {
    name: "Agile (Scrum)",
    description: "Iterative, with time for planning/retros.",
    multiplier: 1.15,
  },
  {
    name: "Kanban",
    description: "Continuous flow, less meetings.",
    multiplier: 0.95,
  },
  {
    name: "XP (Extreme Programming)",
    description: "Frequent releases, pair programming.",
    multiplier: 1.2,
  },
];

type FeatureKey = (typeof FEATURES)[number]["key"];

const defaultComplexity = FEATURES.reduce(
  (acc, f) => ({ ...acc, [f.key]: 1 }),
  {} as Record<FeatureKey, number>
);

const defaultFeatures = FEATURES.reduce(
  (acc, f) => ({ ...acc, [f.key]: true }),
  {} as Record<FeatureKey, boolean>
);

interface Estimates {
  simple: number;
  threePoint: {
    optimistic: number;
    mostLikely: number;
    pessimistic: number;
  };
  pert: {
    estimate: number;
    stdDev: number;
  };
}

interface MethodologyEstimate {
  name: string;
  description: string;
  multiplier: number;
  hours: number;
  cost: number;
}

// Custom components that make our interface interactive and user-friendly
// The Section component handles the smooth collapsible animations

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
  collapsible?: boolean;
}

// Smooth, animated collapsible sections that keep the interface organized
// Uses framer-motion for professional-grade animations that feel responsive
const Section: React.FC<SectionProps> = React.memo(
  ({ title, children, isDarkMode = false, collapsible = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = useCallback(() => {
      setIsCollapsed((prev) => !prev);
    }, []);

    return (
      <div className="mb-8">
        <div
          className={`flex items-center justify-between border-b-2 border-[#FCA311] pb-2 mb-4 ${
            collapsible ? "cursor-pointer" : ""
          }`}
          onClick={collapsible ? toggleCollapse : undefined}
        >
          <h2
            className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-[#14213D]"
            }`}
          >
            {title}
          </h2>
          {collapsible && (
            <motion.button
              className={`flex items-center gap-1 text-sm px-2 py-1 rounded cursor-pointer`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown className="w-4 h-4" />
              </motion.div>
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </motion.button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              style={{ overflow: "hidden" }}
            >
              <div className="pt-2">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

// Creating realistic code samples that clients can understand
// This helps demonstrate the technical approach for each project language

// Transform project requirements into language-specific code samples
// This gives clients a concrete preview of what their project might look like
const generatePseudocode = (
  features: Record<FeatureKey, boolean>,
  language: string
): string => {
  // Get only the features the client has selected for their project
  const enabledFeatureList = FEATURES.filter((f) => features[f.key]).map(
    (f) => f.label
  );

  // Each programming language has its own syntax patterns and conventions
  const languageSyntax = {
    TypeScript: {
      comment: "//",
      variable: "let",
      function: "function",
      array: "[]",
      object: "{}",
      loop: "for (const item of items)",
      method: "method",
      return: "return",
      export: "export",
    },
    Python: {
      comment: "#",
      variable: "",
      function: "def",
      array: "[]",
      object: "{}",
      loop: "for item in items:",
      method: "def",
      return: "return",
      export: "export",
    },
    Java: {
      comment: "//",
      variable: "String",
      function: "public static void",
      array: "[]",
      object: "{}",
      loop: "for (String item : items)",
      method: "public",
      return: "return",
      export: "public",
    },
    Go: {
      comment: "//",
      variable: "var",
      function: "func",
      array: "[]",
      object: "{}",
      loop: "for _, item := range items",
      method: "func",
      return: "return",
      export: "export",
    },
    Ruby: {
      comment: "#",
      variable: "",
      function: "def",
      array: "[]",
      object: "{}",
      loop: "items.each do |item|",
      method: "def",
      return: "return",
      export: "export",
    },
  };

  // Fall back to TypeScript syntax if we don't recognize the language
  const syntax =
    languageSyntax[language as keyof typeof languageSyntax] ||
    languageSyntax["TypeScript"];

  // Generate language-specific code samples that feel authentic
  if (language === "Python") {
    const pseudoLines = [
      `${syntax.comment} Project Estimation Pseudocode`,
      `def calculate_project_estimate():`,
      `    language = "${language}"`,
      `    features = [${enabledFeatureList.map((f) => `"${f}"`).join(", ")}]`,
      `    total_base = 0`,
      `    estimates = []`,
      ``,
      `    for feature in features:`,
      `        base_hours = get_base_hours(feature)`,
      `        complexity = get_complexity(feature)`,
      `        total_base += base_hours * complexity`,
      ``,
      `    lang_multiplier = get_lang_multiplier(language)`,
      `    base_total = total_base * lang_multiplier`,
      ``,
      `    methodologies = ["Waterfall", "Agile", "Kanban", "XP"]`,
      `    for methodology in methodologies:`,
      `        multiplier = get_methodology_multiplier(methodology)`,
      `        estimate = base_total * multiplier`,
      `        estimates.append({"methodology": methodology, "hours": estimate})`,
      ``,
      `    return estimates`,
      ``,
      `if __name__ == "__main__":`,
      `    result = calculate_project_estimate()`,
      `    print(f"Estimated hours: {result}")`,
    ];
    return pseudoLines.join("\n");
  } else if (language === "TypeScript") {
    const pseudoLines = [
      `${syntax.comment} Project Estimation Pseudocode`,
      `interface Estimate {`,
      `    methodology: string;`,
      `    hours: number;`,
      `}`,
      ``,
      `function calculateProjectEstimate(): Estimate[] {`,
      `    const language: string = "${language}";`,
      `    const features: string[] = [${enabledFeatureList
        .map((f) => `"${f}"`)
        .join(", ")}];`,
      `    let totalBase = 0;`,
      `    let estimates: Estimate[] = [];`,
      ``,
      `    for (const feature of features) {`,
      `        let baseHours = getBaseHours(feature);`,
      `        let complexity = getComplexity(feature);`,
      `        totalBase += baseHours * complexity;`,
      `    }`,
      ``,
      `    const langMultiplier = getLangMultiplier(language);`,
      `    const baseTotal = totalBase * langMultiplier;`,
      ``,
      `    const methodologies = ["Waterfall", "Agile", "Kanban", "XP"];`,
      `    for (const methodology of methodologies) {`,
      `        const multiplier = getMethodologyMultiplier(methodology);`,
      `        const estimate = baseTotal * multiplier;`,
      `        estimates.push({ methodology, hours: estimate });`,
      `    }`,
      ``,
      `    return estimates;`,
      `}`,
      ``,
      `const result = calculateProjectEstimate();`,
      `console.log("Estimated hours:", result);`,
    ];
    return pseudoLines.join("\n");
  } else if (language === "Java") {
    const pseudoLines = [
      `${syntax.comment} Project Estimation Pseudocode`,
      `public class ProjectEstimator {`,
      `    public static void main(String[] args) {`,
      `        String language = "${language}";`,
      `        String[] features = {${enabledFeatureList
        .map((f) => `"${f}"`)
        .join(", ")}};`,
      `        int totalBase = 0;`,
      ``,
      `        for (String feature : features) {`,
      `            int baseHours = getBaseHours(feature);`,
      `            int complexity = getComplexity(feature);`,
      `            totalBase += baseHours * complexity;`,
      `        }`,
      ``,
      `        double langMultiplier = getLangMultiplier(language);`,
      `        double baseTotal = totalBase * langMultiplier;`,
      ``,
      `        String[] methodologies = {"Waterfall", "Agile", "Kanban", "XP"};`,
      `        for (String methodology : methodologies) {`,
      `            double multiplier = getMethodologyMultiplier(methodology);`,
      `            double estimate = baseTotal * multiplier;`,
      `            System.out.println("Methodology: " + methodology + ", Estimated Hours: " + estimate);`,
      `        }`,
      `    }`,
      `}`,
    ];
    return pseudoLines.join("\n");
  } else if (language === "Go") {
    const pseudoLines = [
      `${syntax.comment} Project Estimation Pseudocode`,
      `package main`,
      ``,
      `import "fmt"`,
      ``,
      `func calculateProjectEstimate() {`,
      `    language := "${language}"`,
      `    features := []string{${enabledFeatureList
        .map((f) => `"${f}"`)
        .join(", ")}}`,
      `    totalBase := 0`,
      ``,
      `    for _, feature := range features {`,
      `        baseHours := getBaseHours(feature)`,
      `        complexity := getComplexity(feature)`,
      `        totalBase += baseHours * complexity`,
      `    }`,
      ``,
      `    langMultiplier := getLangMultiplier(language)`,
      `    baseTotal := float64(totalBase) * langMultiplier`,
      ``,
      `    methodologies := []string{"Waterfall", "Agile", "Kanban", "XP"}`,
      `    for _, methodology := range methodologies {`,
      `        multiplier := getMethodologyMultiplier(methodology)`,
      `        estimate := baseTotal * multiplier`,
      `        fmt.Printf("Methodology: %s, Estimated Hours: %.2f\\n", methodology, estimate)`,
      `    }`,
      `}`,
      ``,
      `func main() {`,
      `    calculateProjectEstimate()`,
      `}`,
    ];
    return pseudoLines.join("\n");
  } else if (language === "Ruby") {
    const pseudoLines = [
      `${syntax.comment} Project Estimation Pseudocode`,
      `def calculate_project_estimate`,
      `  language = "${language}"`,
      `  features = [${enabledFeatureList.map((f) => `"${f}"`).join(", ")}]`,
      `  total_base = 0`,
      ``,
      `  features.each do |feature|`,
      `    base_hours = get_base_hours(feature)`,
      `    complexity = get_complexity(feature)`,
      `    total_base += base_hours * complexity`,
      `  end`,
      ``,
      `  lang_multiplier = get_lang_multiplier(language)`,
      `  base_total = total_base * lang_multiplier`,
      ``,
      `  methodologies = ["Waterfall", "Agile", "Kanban", "XP"]`,
      `  estimates = []`,
      ``,
      `  methodologies.each do |methodology|`,
      `    multiplier = get_methodology_multiplier(methodology)`,
      `    estimate = base_total * multiplier`,
      `    estimates << { methodology: methodology, hours: estimate }`,
      `  end`,
      ``,
      `  estimates`,
      `end`,
      ``,
      `puts "Estimated hours: #{calculate_project_estimate}"`,
    ];
    return pseudoLines.join("\n");
  } else {
    // Fallback to original format for other languages
    const pseudoLines = [
      `${syntax.comment} Project Estimation Pseudocode`,
      `${syntax.variable ? syntax.variable + " " : ""}language = "${language}"`,
      `${
        syntax.variable ? syntax.variable + " " : ""
      }features = [${enabledFeatureList.map((f) => `"${f}"`).join(", ")}]`,
      `${syntax.loop.replace("items", "features")}:`,
      `    ${
        syntax.variable ? syntax.variable + " " : ""
      }baseHours = getBaseHours(feature)`,
      `    ${
        syntax.variable ? syntax.variable + " " : ""
      }complexity = getComplexity(feature)`,
      `    add(baseHours * complexity) to totalBase`,
      `${
        syntax.variable ? syntax.variable + " " : ""
      }langMultiplier = getLangMultiplier(language)`,
      `${
        syntax.variable ? syntax.variable + " " : ""
      }baseTotal = totalBase * langMultiplier`,
      "",
      `${syntax.loop.replace("items", "methodologies")}:`,
      `    ${
        syntax.variable ? syntax.variable + " " : ""
      }multiplier = getMethodologyMultiplier(methodology)`,
      `    ${
        syntax.variable ? syntax.variable + " " : ""
      }estimate = baseTotal * multiplier`,
      `    ${syntax.export} estimate`,
    ];
    return pseudoLines.join("\n");
  }
};


// The main calculator interface where users configure their projects
// Includes the split-pane layout with controls on left, results on right
interface CalculatorPageProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  features: Record<FeatureKey, boolean>;
  complexity: Record<FeatureKey, number>;
  estimates: Estimates;
  pseudocode: string;
  handleExport: () => void;
  handleFeatureToggle: (featureKey: FeatureKey) => void;
  handleComplexityChange: (featureKey: FeatureKey, value: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  paneWidth: number;
  handleMouseDown: (e: React.MouseEvent) => void;
  methodologyEstimates: MethodologyEstimate[];
  baseHours: number;
  getLanguageClass: (language: string) => string;
  highlightPseudocode: (code: string, language: string) => string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  maximize: boolean;
  setMaximize: (maximize: boolean) => void;
  costRange: {
    min: number;
    max: number;
    average: number;
  };
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({
  language,
  setLanguage,
  features,
  complexity,
  pseudocode,
  handleExport,
  handleFeatureToggle,
  handleComplexityChange,
  containerRef,
  isDragging,
  paneWidth,
  handleMouseDown,
  methodologyEstimates,
  baseHours,
  getLanguageClass,
  highlightPseudocode,
  isDarkMode,
  toggleTheme,
  hourlyRate,
  setHourlyRate,
  costRange,
  maximize,
  setMaximize,
}) => {
  // Smart theme styling that adapts to light/dark mode preferences
  // Memoized to avoid regenerating CSS classes on every render
  const themeClasses = useMemo(
    () => ({
      // Main container classes
      container: isDarkMode
        ? "bg-gray-900 text-white min-h-screen font-sans flex flex-col"
        : "bg-white text-black min-h-screen font-sans flex flex-col",
      // Header classes
      header: isDarkMode
        ? "bg-gray-800 text-white p-4 shadow-md flex justify-between items-center"
        : "bg-[#14213D] text-white p-4 shadow-md flex justify-between items-center",
      // Left pane classes
      leftPane: isDarkMode
        ? "p-6 overflow-y-auto bg-gray-800 border-r border-gray-700 md:w-1/3 max-h-screen"
        : "p-6 overflow-y-auto bg-gray-50 border-r border-[#E5E5E5] md:w-1/3 max-h-screen",
      // Right pane classes
      rightPane: isDarkMode
        ? "flex-1 p-6 overflow-y-auto bg-gray-900 max-h-screen"
        : "flex-1 p-6 overflow-y-auto max-h-screen",
      // Input classes
      select: isDarkMode
        ? "mt-1 block w-full pl-4 pr-10 py-2 text-base bg-gray-700 border-2 border-gray-600 rounded-lg shadow-sm hover:border-[#FCA311] focus:outline-none focus:ring-2 focus:ring-[#FCA311] focus:border-[#FCA311] transition-all duration-200 cursor-pointer font-medium text-white"
        : "mt-1 block w-full pl-4 pr-10 py-2 text-base bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:border-[#FCA311] focus:outline-none focus:ring-2 focus:ring-[#FCA311] focus:border-[#FCA311] transition-all duration-200 cursor-pointer font-medium text-[#14213D]",
      // Label classes
      label: isDarkMode
        ? "block text-sm font-medium text-gray-300 mb-1"
        : "block text-sm font-medium text-gray-700 mb-1",
      // Feature label classes
      featureLabel: isDarkMode ? "text-gray-300" : "text-gray-700",
      // Complexity label classes
      complexityLabel: isDarkMode
        ? "text-base text-white"
        : "text-base text-black",
      // Estimate card classes
      estimateCard: isDarkMode
        ? "bg-gray-800 p-4 rounded-lg border border-gray-700"
        : "bg-gray-50 p-4 rounded-lg border border-[#E5E5E5]",
      // Estimate card title classes
      estimateTitle: isDarkMode
        ? "font-bold text-white mb-2"
        : "font-bold text-[#14213D] mb-2",
      // Estimate card description classes
      estimateDescription: isDarkMode
        ? "text-xs text-gray-400 mb-2"
        : "text-xs text-gray-500 mb-2",
      // Base hours badge classes
      baseHoursBadge: isDarkMode
        ? "text-xs font-mono px-2 py-1 rounded bg-gray-700 text-gray-300"
        : "text-xs font-mono px-2 py-1 rounded bg-[#E5E5E5] text-[#14213D]",
      // Pseudocode container classes
      pseudocodeContainer: isDarkMode
        ? "rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-scroll bg-gray-800"
        : "rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-scroll bg-[#F8F8F8] border border-[#E5E5E5]",
      // Divider classes
      divider: isDarkMode
        ? "hidden md:block w-2 bg-gray-700 hover:bg-[#FCA311] cursor-col-resize transition-colors"
        : "hidden md:block w-2 bg-[#E5E5E5] hover:bg-[#FCA311] cursor-col-resize transition-colors",
      // Footer classes
      footer: isDarkMode
        ? "bg-gray-800 text-white text-center py-3 text-sm"
        : "bg-[#14213D] text-white text-center py-3 text-sm",
    }),
    [isDarkMode]
  );

  return (
    <div
      className={themeClasses.container}
      style={{ fontFamily: "Poppins, Outfit" }}
    >
      <header className={themeClasses.header}>
        <div className="flex items-center space-x-3">
          <CiCalculator2
            className="h-8 w-8 text-[#FCA311]"
            aria-label="Project Estimator Logo"
          />
          <h1 className="text-2xl font-bold">Freelancer's Project Estimator</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="bg-transparent cursor-pointer border border-white text-white font-bold py-2 px-4 rounded-md hover:bg-white hover:text-[#14213D] transition-colors flex items-center"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? (
              <FiMoon className="h-5 w-5" />
            ) : (
              <FiSun className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleExport}
            aria-label="Export project estimate as JSON"
            className="bg-[#FCA311] cursor-pointer text-[#14213D] font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors flex items-center"
          >
            <FiDownload className="h-5 w-5 mr-2" />
            Export JSON
          </button>
          <button
            onClick={() => {
              setMaximize(!maximize);
              if (!maximize) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="bg-transparent cursor-pointer border border-white text-white font-bold py-2 px-4 rounded-md hover:bg-white hover:text-[#14213D] transition-colors flex items-center"
            aria-label={"Full screen mode"}
          >
            {maximize ? (
              <FiMinimize className="h-5 w-5" />
            ) : (
              <FiMaximize className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        ref={containerRef}
        className="flex flex-col md:flex-row flex-1"
        style={{ cursor: isDragging ? "col-resize" : "default" }}
      >
        {/* Left Pane: Controls */}
        <div
          className={themeClasses.leftPane}
          style={{ width: `clamp(300px, ${paneWidth}%, calc(100% - 400px))` }}
        >
          <Section title="Project Configuration" isDarkMode={isDarkMode}>
            <div className="mb-4">
              <label htmlFor="language-select" className={themeClasses.label}>
                Primary Language/Framework
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className={themeClasses.select}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.name} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hourly Rate Input */}
            <div className="mb-4">
              <label htmlFor="hourly-rate" className={themeClasses.label}>
                <FiDollarSign className="inline-block w-4 h-4 mr-1" />
                Hourly Rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="hourly-rate"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(parseFloat(e.target.value) || 0)
                  }
                  className={`pl-8 ${themeClasses.select}`}
                  placeholder="75"
                />
              </div>
              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Range: $1 - $1,000 per hour
              </p>
            </div>
          </Section>

          <Section
            title="Feature Selection"
            isDarkMode={isDarkMode}
            collapsible
          >
            <fieldset className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {FEATURES.map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center cursor-pointer justify-between w-full py-2"
                  >
                    <span className={themeClasses.featureLabel}>
                      {feature.label}
                    </span>
                    <div className="relative">
                      <input
                        id={feature.key}
                        type="checkbox"
                        className="sr-only"
                        checked={features[feature.key]}
                        onChange={() => handleFeatureToggle(feature.key)}
                      />
                      <div
                        className={`block w-14 h-8 rounded-full transition ${
                          features[feature.key]
                            ? "bg-[#FCA311]"
                            : isDarkMode
                            ? "bg-gray-600"
                            : "bg-[#E5E5E5]"
                        }`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          features[feature.key] ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
          </Section>

          <Section
            title="Feature Complexity"
            isDarkMode={isDarkMode}
            collapsible
          >
            <div className="flex flex-col gap-3">
              {FEATURES.filter((f) => features[f.key]).map((feature) => (
                <div key={feature.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={themeClasses.complexityLabel}>
                      {feature.label}
                    </span>
                    <span
                      className="px-2 text-xs rounded-full font-bold"
                      style={{
                        background: isDarkMode ? "#374151" : "#E5E5E5",
                        color: isDarkMode ? "#F3F4F6" : "#14213D",
                      }}
                    >
                      {COMPLEXITY_LEVELS.find(
                        (lvl) =>
                          Math.abs(lvl.value - complexity[feature.key]) < 0.001
                      )?.label || `x${complexity[feature.key].toFixed(2)}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.3}
                    step={0.01}
                    value={complexity[feature.key]}
                    onChange={(e) =>
                      handleComplexityChange(feature.key, e.target.value)
                    }
                    className="w-full accent-[#FCA311] slider-thumb"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span style={{ color: isDarkMode ? "#9CA3AF" : "#888" }}>
                      Low
                    </span>
                    <span style={{ color: isDarkMode ? "#9CA3AF" : "#888" }}>
                      High
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Draggable Divider - visible on medium screens and up */}
        <div className={themeClasses.divider} onMouseDown={handleMouseDown} />

        {/* Right Pane: Output */}
        <div className={themeClasses.rightPane}>
          <Section title="Time & Cost Estimates" isDarkMode={isDarkMode}>
            {/* Cost Summary Banner */}
            <div
              className={`mb-6 p-4 rounded-lg border-2 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-[#E5E5E5]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-[#14213D]"
                  }`}>
                    Project Cost Range
                  </h4>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Based on ${hourlyRate}/hour rate
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-[#14213D]"
                  }`}>
                    ${costRange.min.toLocaleString()} - $
                    {costRange.max.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Average: ${costRange.average.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {methodologyEstimates.map((m) => (
                <div key={m.name} className={themeClasses.estimateCard}>
                  <h3 className={themeClasses.estimateTitle}>{m.name}</h3>
                  <p className={themeClasses.estimateDescription}>
                    {m.description}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-light">
                        {m.hours} <span className="text-sm">hours</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#FCA311]">
                        ${m.cost.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        ${hourlyRate}/hr
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={themeClasses.baseHoursBadge}>
                Base: {baseHours.toFixed(1)} hrs
              </span>
              <span
                className={`text-xs font-mono px-2 py-1 rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-[#FCA311]"
                    : "bg-[#E5E5E5] text-[#14213D]"
                }`}
              >
                Base Cost: ${(baseHours * hourlyRate).toLocaleString()}
              </span>
            </div>
          </Section>

          <Section
            title="Generated Pseudocode"
            isDarkMode={isDarkMode}
            collapsible
          >
            <pre
              className={themeClasses.pseudocodeContainer}
              style={{
                boxShadow: isDarkMode
                  ? "0 2px 8px 0 rgba(0,0,0,0.3)"
                  : "0 2px 8px 0 rgba(0,0,0,0.06)",
                lineHeight: "1.7",
              }}
            >
              <code
                className={`language-${getLanguageClass(language)}`}
                dangerouslySetInnerHTML={{
                  __html: highlightPseudocode(pseudocode, language),
                }}
              />
            </pre>
          </Section>
        </div>
      </main>
      <footer className={themeClasses.footer}>
        {new Date().getFullYear()} Freelancer's Project Estimator.
      </footer>
    </div>
  );
};

// The heart of our application - manages all state and orchestrates the user experience

const ProjectEstimatorApp: React.FC = () => {
  const [language, setLanguage] = useState<Language>("TypeScript");
  const [features, setFeatures] = useState(defaultFeatures);
  const [complexity, setComplexity] = useState(defaultComplexity);
  const [estimates, setEstimates] = useState<Estimates>({
    simple: 0,
    threePoint: { optimistic: 0, mostLikely: 0, pessimistic: 0 },
    pert: { estimate: 0, stdDev: 0 },
  });
  const [pseudocode, setPseudocode] = useState("");

  // Theme state management
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hourly rate state for cost calculations
  const [hourlyRate, setHourlyRate] = useState<number>(75); // Default rate: $75/hour

  // Handling the resizable split between input controls and results display
  const [paneWidth, setPaneWidth] = useState(40); // Initial width of left pane in %
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maximize, setMaximize] = useState(false);
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth =
          ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newWidth > 32 && newWidth < 80) {
          // Set min/max pane width
          setPaneWidth(newWidth);
        }
      }
    },
    [isDragging]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // The math behind the magic - calculating time estimates and generating code samples
  // Memoized helper functions to avoid recreation on each render
  const memoizedGetLanguageClass = useCallback((language: string): string => {
    const languageMap: Record<string, string> = {
      TypeScript: "typescript",
      Python: "python",
      Java: "java",
      Go: "go",
      Ruby: "ruby",
    };
    return languageMap[language] || "typescript";
  }, []);

  const memoizedHighlightPseudocode = useCallback(
    (code: string, language: string): string => {
      const langClass = memoizedGetLanguageClass(language);
      return Prism.highlight(
        code,
        Prism.languages[langClass] || Prism.languages.typescript,
        langClass
      );
    },
    [memoizedGetLanguageClass]
  );

  // Memoize expensive calculations to avoid unnecessary re-computations
  const calculationData = useMemo(() => {
    const selectedLang = LANGUAGES.find((l) => l.name === language)!;
    let totalBaseHours = 0;
    const includedFeatures = FEATURES.filter((f) => features[f.key]);

    includedFeatures.forEach((f) => {
      totalBaseHours += f.baseHours * complexity[f.key];
    });

    const baseHours = totalBaseHours * selectedLang.baseMultiplier;

    // Transform raw hours into methodology-specific estimates with real costs
    // Each methodology has different overhead (meetings, documentation, process)
    const methodologyEstimates: MethodologyEstimate[] = METHODOLOGIES.map(
      (m) => ({
        ...m,
        hours: +(baseHours * m.multiplier).toFixed(1),
        cost: +(baseHours * m.multiplier * hourlyRate).toFixed(2),
      })
    );

    // Figure out the cost range to show clients realistic budget expectations
    const costs = methodologyEstimates.map((m) => m.cost);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

    return {
      selectedLang,
      totalBaseHours,
      includedFeatures,
      baseHours,
      methodologyEstimates,
      costRange: {
        min: +minCost.toFixed(2),
        max: +maxCost.toFixed(2),
        average: +avgCost.toFixed(2),
      },
    };
  }, [language, features, complexity, hourlyRate]);

  // Memoize estimates calculation
  const calculatedEstimates = useMemo(() => {
    const { methodologyEstimates } = calculationData;

    // Use the average of methodology estimates as the simple estimate
    const avgHours =
      methodologyEstimates.reduce((sum, m) => sum + m.hours, 0) /
      methodologyEstimates.length;

    // Calculate three-point estimates
    const optimistic = avgHours * 0.75;
    const pessimistic = avgHours * 1.5;
    const mostLikely = avgHours;
    const pertEstimate = (optimistic + 4 * mostLikely + pessimistic) / 6;
    const pertStdDev = (pessimistic - optimistic) / 6;

    return {
      simple: avgHours,
      threePoint: { optimistic, mostLikely, pessimistic },
      pert: { estimate: pertEstimate, stdDev: pertStdDev },
    };
  }, [calculationData]);

  // Memoize pseudocode generation
  const generatedPseudocode = useMemo(() => {
    return generatePseudocode(features, language);
  }, [features, language]);

  // Update state when calculations change
  useEffect(() => {
    setEstimates(calculatedEstimates);
    setPseudocode(generatedPseudocode);
  }, [calculatedEstimates, generatedPseudocode]);

  // Performance-optimized event handlers that prevent unnecessary component re-renders
  // Theme toggle handler to switch between light and dark modes
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleFeatureToggle = useCallback((featureKey: FeatureKey) => {
    setFeatures((prev) => ({ ...prev, [featureKey]: !prev[featureKey] }));
  }, []);

  const handleComplexityChange = useCallback(
    (featureKey: FeatureKey, value: string) => {
      setComplexity((prev) => ({ ...prev, [featureKey]: parseFloat(value) }));
    },
    []
  );

  // Handler for hourly rate changes with validation
  const handleHourlyRateChange = useCallback((rate: number) => {
    // Validate rate is positive and reasonable (between $1 and $1000 per hour)
    if (rate >= 1 && rate <= 1000) {
      setHourlyRate(rate);
    }
  }, []);

  const handleExport = useCallback(() => {
    const { baseHours, includedFeatures, methodologyEstimates, costRange } =
      calculationData;

    const exportData = {
      projectName: "Project Estimate",
      settings: {
        language,
        hourlyRate,
        features: includedFeatures.map((f) => ({
          key: f.key,
          label: f.label,
          complexity: complexity[f.key],
          baseHours: f.baseHours,
        })),
        baseHours: +baseHours.toFixed(1),
        baseCost: +(baseHours * hourlyRate).toFixed(2),
      },
      estimates: {
        methodologies: methodologyEstimates.map((m) => ({
          name: m.name,
          description: m.description,
          multiplier: m.multiplier,
          estimateHours: m.hours,
          estimateCost: m.cost,
        })),
        baseHours: +baseHours.toFixed(1),
        costRange,
      },
      generatedPseudocode: generatedPseudocode,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-estimate-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [calculationData, language, complexity, generatedPseudocode, hourlyRate]);


  return (
    <>
      <style>{fontImport}</style>
        <CalculatorPage
          language={language}
          setLanguage={setLanguage}
          features={features}
          complexity={complexity}
          estimates={estimates}
          pseudocode={pseudocode}
          handleExport={handleExport}
          handleFeatureToggle={handleFeatureToggle}
          handleComplexityChange={handleComplexityChange}
          containerRef={containerRef}
          isDragging={isDragging}
          paneWidth={paneWidth}
          handleMouseDown={handleMouseDown}
          methodologyEstimates={calculationData.methodologyEstimates}
          baseHours={calculationData.baseHours}
          getLanguageClass={memoizedGetLanguageClass}
          highlightPseudocode={memoizedHighlightPseudocode}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          hourlyRate={hourlyRate}
          setHourlyRate={handleHourlyRateChange}
          costRange={calculationData.costRange}
          maximize={maximize}
          setMaximize={setMaximize}
        />
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #14213D;
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }

        .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #14213D;
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
        pre code {
            text-shadow: none !important;
        }
        body{
            overflow-y: hidden;
            overflow-x: hidden;
        }
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-thumb {
            background: #FCA311;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-track {
            background: ${isDarkMode ? "#374151" : "#F8F8F8"};
        }
      `}</style>
    </>
  );
};

export default ProjectEstimatorApp;
