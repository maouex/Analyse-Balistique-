import { o as __toESM, t as require_jsx_runtime } from "./jsx-runtime-VIt8p9fg.js";
import { t as require_react } from "./react-DGAaxoNG.js";
//#region src/components/munitions/ImpactOverlay.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var COLORS = [
	"#4dabf7",
	"#2ecc71",
	"#f0a030",
	"#e05252"
];
function ImpactOverlay({ munitions }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [activeIds, setActiveIds] = (0, import_react.useState)(() => new Set(munitions.map((m) => m.id)));
	const withAnalysis = munitions.filter((m) => m.savedAnalysis && m.savedAnalysis.impacts.length > 0);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const size = canvas.width;
		const cx = size / 2;
		const cy = size / 2;
		ctx.clearRect(0, 0, size, size);
		ctx.fillStyle = "var(--bg)";
		ctx.fillRect(0, 0, size, size);
		const allPointsCm = [];
		let maxDist = 0;
		for (const m of withAnalysis) {
			if (!activeIds.has(m.id)) {
				allPointsCm.push([]);
				continue;
			}
			const sa = m.savedAnalysis;
			const center = sa.center;
			const pxPerCm = sa.scale.pixelsPerCm;
			if (!center || !pxPerCm) {
				allPointsCm.push([]);
				continue;
			}
			const pts = sa.impacts.map((imp) => ({
				x: (imp.x - center.x) / pxPerCm,
				y: (imp.y - center.y) / pxPerCm
			}));
			for (const p of pts) {
				const d = Math.sqrt(p.x * p.x + p.y * p.y);
				if (d > maxDist) maxDist = d;
			}
			allPointsCm.push(pts);
		}
		if (maxDist === 0) maxDist = 50;
		const drawR = (size - 80) / 2;
		const scale = drawR / (maxDist * 1.2);
		const gridRadii = [
			25,
			50,
			75,
			100
		].filter((r) => r <= maxDist * 1.3);
		ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#2b2f3d";
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 4]);
		for (const r of gridRadii) {
			ctx.beginPath();
			ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
			ctx.stroke();
			ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#606474";
			ctx.font = "10px Inter, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(`${r}cm`, cx + r * scale + 1, cy - 4);
		}
		ctx.setLineDash([]);
		ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#2b2f3d";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(cx - drawR, cy);
		ctx.lineTo(cx + drawR, cy);
		ctx.moveTo(cx, cy - drawR);
		ctx.lineTo(cx, cy + drawR);
		ctx.stroke();
		ctx.fillStyle = "#ffffff";
		ctx.beginPath();
		ctx.arc(cx, cy, 3, 0, Math.PI * 2);
		ctx.fill();
		withAnalysis.forEach((m, mi) => {
			if (!activeIds.has(m.id)) return;
			const pts = allPointsCm[mi];
			if (!pts || pts.length === 0) return;
			const color = COLORS[mi % COLORS.length];
			const meanX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
			const meanY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
			const smx = cx + meanX * scale;
			const smy = cy + meanY * scale;
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(smx - 6, smy);
			ctx.lineTo(smx + 6, smy);
			ctx.moveTo(smx, smy - 6);
			ctx.lineTo(smx, smy + 6);
			ctx.stroke();
			for (const p of pts) {
				const sx = cx + p.x * scale;
				const sy = cy + p.y * scale;
				ctx.fillStyle = color;
				ctx.globalAlpha = .7;
				ctx.beginPath();
				ctx.arc(sx, sy, 4, 0, Math.PI * 2);
				ctx.fill();
				ctx.globalAlpha = 1;
				ctx.strokeStyle = color;
				ctx.lineWidth = 1;
				ctx.stroke();
			}
		});
	}, [withAnalysis, activeIds]);
	const toggleMunition = (id) => {
		setActiveIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	if (withAnalysis.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			padding: 24,
			textAlign: "center",
			color: "var(--muted)",
			fontSize: 13
		},
		children: "Aucune munition avec analyse sauvegardée. Sauvegardez une analyse depuis la page d'analyse pour superposer les gerbes."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: 16
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			width: 420,
			height: 420,
			style: {
				width: 420,
				height: 420,
				borderRadius: "var(--radius)",
				border: "1px solid var(--border)",
				background: "var(--bg)"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "flex",
				gap: 8,
				flexWrap: "wrap",
				justifyContent: "center"
			},
			children: withAnalysis.map((m, i) => {
				const active = activeIds.has(m.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `btn btn-sm ${active ? "" : ""}`,
					onClick: () => toggleMunition(m.id),
					style: {
						opacity: active ? 1 : .4,
						borderColor: COLORS[i % COLORS.length],
						gap: 6
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
							width: 10,
							height: 10,
							borderRadius: "50%",
							background: active ? COLORS[i % COLORS.length] : "transparent",
							border: `2px solid ${COLORS[i % COLORS.length]}`
						} }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { fontSize: 11 },
							children: m.nom || "Sans nom"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: 10,
								color: "var(--muted)"
							},
							children: [
								"(",
								m.savedAnalysis.impacts.length,
								")"
							]
						})
					]
				}, m.id);
			})
		})]
	});
}
//#endregion
export { ImpactOverlay };
