import CategoryIcon from "@/components/ui/CategoryIcon";

// Brand-aligned palette: shades of deep green + warm neutrals
const PALETTES = [
  { bg: "#0A2912", accent: "#145224", light: "#b3e5c1" },  // primary-800 (darkest)
  { bg: "#145224", accent: "#1a7a3a", light: "#d9f2e0" },  // primary-600 (brand)
  { bg: "#0E3919", accent: "#145224", light: "#7ed39a" },  // primary-700
  { bg: "#1a7a3a", accent: "#4abb70", light: "#b3e5c1" },  // primary-500
  { bg: "#0A2912", accent: "#4abb70", light: "#d9f2e0" },  // dark + light green mix
  { bg: "#145224", accent: "#7ed39a", light: "#f0faf3" },  // brand + soft
  { bg: "#0E3919", accent: "#1a7a3a", light: "#b3e5c1" },  // muted green
  { bg: "#145224", accent: "#0A2912", light: "#7ed39a" },  // inverted
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
    return (
      <div className={`w-full h-full min-h-[160px] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 ${className}`}>
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23000'/%3E%3C/svg%3E\")",
        }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            {categoryIcon ? (
              <CategoryIcon icon={categoryIcon} className="w-7 h-7 text-gray-400" />
            ) : (
              <span className="text-xl font-black text-gray-300">{initials}</span>
            )}
          </div>
          {categoryIcon && (
            <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">{initials}</span>
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
