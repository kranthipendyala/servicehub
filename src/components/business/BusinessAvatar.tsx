import CategoryIcon from "@/components/ui/CategoryIcon";

const PALETTES = [
  { bg: "#0d9488", accent: "#14b8a6", light: "#99f6e4" },  // teal
  { bg: "#2563eb", accent: "#3b82f6", light: "#bfdbfe" },  // blue
  { bg: "#7c3aed", accent: "#8b5cf6", light: "#ddd6fe" },  // violet
  { bg: "#dc2626", accent: "#ef4444", light: "#fecaca" },  // red
  { bg: "#ea580c", accent: "#f97316", light: "#fed7aa" },  // orange
  { bg: "#0891b2", accent: "#06b6d4", light: "#a5f3fc" },  // cyan
  { bg: "#4f46e5", accent: "#6366f1", light: "#c7d2fe" },  // indigo
  { bg: "#059669", accent: "#10b981", light: "#a7f3d0" },  // emerald
  { bg: "#d946ef", accent: "#e879f9", light: "#f5d0fe" },  // fuchsia
  { bg: "#0284c7", accent: "#0ea5e9", light: "#bae6fd" },  // sky
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getPalette(name: string) {
  return PALETTES[hashName(name) % PALETTES.length];
}

// Generate unique SVG pattern based on business name
function generatePattern(name: string, width: number, height: number) {
  const hash = hashName(name);
  const p = getPalette(name);
  const shapes: string[] = [];

  // Background
  shapes.push(`<rect width="${width}" height="${height}" fill="${p.bg}"/>`);

  // Gradient overlay
  shapes.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${p.accent}" stop-opacity="0.6"/><stop offset="100%" stop-color="${p.bg}" stop-opacity="0.9"/></linearGradient></defs>`);
  shapes.push(`<rect width="${width}" height="${height}" fill="url(#g)"/>`);

  // Generate geometric shapes
  const seed = hash;
  for (let i = 0; i < 6; i++) {
    const x = ((seed * (i + 3) * 17) % width);
    const y = ((seed * (i + 7) * 13) % height);
    const r = 20 + ((seed * (i + 1)) % 60);
    const opacity = 0.06 + (i % 3) * 0.03;

    if (i % 3 === 0) {
      shapes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.light}" opacity="${opacity}"/>`);
    } else if (i % 3 === 1) {
      shapes.push(`<rect x="${x}" y="${y}" width="${r * 1.5}" height="${r * 1.5}" rx="${r * 0.2}" fill="${p.light}" opacity="${opacity}" transform="rotate(${(seed * i) % 45}, ${x}, ${y})"/>`);
    } else {
      shapes.push(`<circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="none" stroke="${p.light}" stroke-width="2" opacity="${opacity * 2}"/>`);
    }
  }

  // Dotted grid pattern
  for (let x = 0; x < width; x += 30) {
    for (let y = 0; y < height; y += 30) {
      if ((x + y) % 60 === 0) {
        shapes.push(`<circle cx="${x}" cy="${y}" r="1" fill="${p.light}" opacity="0.15"/>`);
      }
    }
  }

  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${shapes.join("")}</svg>`)}`;
}

interface Props {
  name: string;
  categoryIcon?: string | null;
  size?: "sm" | "md" | "lg" | "card";
  className?: string;
}

export default function BusinessAvatar({ name, categoryIcon, size = "card", className = "" }: Props) {
  const p = getPalette(name);
  const initials = name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  if (size === "card") {
    const bgUrl = generatePattern(name, 400, 250);
    return (
      <div className={`w-full h-full min-h-[180px] relative overflow-hidden ${className}`} style={{ backgroundImage: `url("${bgUrl}")`, backgroundSize: "cover" }}>
        {/* Category icon + initials overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10">
            {categoryIcon ? (
              <CategoryIcon icon={categoryIcon} className="w-8 h-8 text-white" />
            ) : (
              <span className="text-2xl font-bold text-white">{initials}</span>
            )}
          </div>
          {categoryIcon && (
            <span className="text-sm font-bold text-white/80 tracking-wide">{initials}</span>
          )}
        </div>
      </div>
    );
  }

  // Circular avatars
  const bgUrl = generatePattern(name, 120, 120);
  const sizeClasses = { sm: "w-10 h-10", md: "w-16 h-16", lg: "w-24 h-24", card: "" };
  const textSizes = { sm: "text-xs", md: "text-lg", lg: "text-2xl", card: "" };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden relative ${className}`} style={{ backgroundImage: `url("${bgUrl}")`, backgroundSize: "cover" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        {categoryIcon ? (
          <CategoryIcon icon={categoryIcon} className={`${size === "lg" ? "w-10 h-10" : "w-5 h-5"} text-white`} />
        ) : (
          <span className={`font-bold text-white ${textSizes[size]}`}>{initials}</span>
        )}
      </div>
    </div>
  );
}
