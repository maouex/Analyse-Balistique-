import { t as require_jsx_runtime } from "./jsx-runtime-VIt8p9fg.js";
//#region src/components/munitions/RadarChart.tsx
var import_jsx_runtime = require_jsx_runtime();
var AXES = [
	{
		key: "score",
		label: "Score",
		max: 100,
		getValue: (m) => m.snap?.score ?? 0
	},
	{
		key: "nbImpacts",
		label: "Impacts",
		max: 100,
		getValue: (m) => m.snap?.nbImpacts ?? 0
	},
	{
		key: "pct50",
		label: "%∅50cm",
		max: 100,
		getValue: (m) => parseFloat(m.snap?.pct50cm ?? "0")
	},
	{
		key: "pct100",
		label: "%∅100cm",
		max: 100,
		getValue: (m) => parseFloat(m.snap?.pct100cm ?? "0")
	},
	{
		key: "r90inv",
		label: "Précision",
		max: 100,
		getValue: (m) => m.snap?.r90 ? Math.max(0, 100 - m.snap.r90 * 2) : 0
	},
	{
		key: "dispInv",
		label: "Régularité",
		max: 100,
		getValue: (m) => m.snap?.dispMoy ? Math.max(0, 100 - m.snap.dispMoy * 2) : 0
	}
];
var COLORS = [
	"#4dabf7",
	"#2ecc71",
	"#f0a030",
	"#e05252"
];
function RadarChart({ munitions }) {
	const size = 360;
	const cx = size / 2;
	const cy = size / 2;
	const maxR = size / 2 - 50;
	const n = AXES.length;
	const angleStep = Math.PI * 2 / n;
	const startAngle = -Math.PI / 2;
	const getPoint = (axisIdx, value) => {
		const angle = startAngle + axisIdx * angleStep;
		const r = value / 100 * maxR;
		return {
			x: cx + r * Math.cos(angle),
			y: cy + r * Math.sin(angle)
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: 16
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			viewBox: `0 0 ${size} ${size}`,
			children: [
				[
					20,
					40,
					60,
					80,
					100
				].map((pct) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx,
						cy,
						r: pct / 100 * maxR,
						fill: "none",
						stroke: "var(--border)",
						strokeWidth: 1,
						opacity: .5
					}, pct);
				}),
				AXES.map((axis, i) => {
					const angle = startAngle + i * angleStep;
					const x2 = cx + maxR * Math.cos(angle);
					const y2 = cy + maxR * Math.sin(angle);
					const lx = cx + (maxR + 22) * Math.cos(angle);
					const ly = cy + (maxR + 22) * Math.sin(angle);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: cx,
						y1: cy,
						x2,
						y2,
						stroke: "var(--border)",
						strokeWidth: 1,
						opacity: .5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: lx,
						y: ly,
						textAnchor: "middle",
						dominantBaseline: "middle",
						fill: "var(--muted)",
						fontSize: 10,
						fontWeight: 600,
						children: axis.label
					})] }, axis.key);
				}),
				munitions.map((m, mi) => {
					if (!m.snap) return null;
					const points = AXES.map((axis, i) => {
						return getPoint(i, Math.min(100, Math.max(0, axis.getValue(m))));
					});
					const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
					const color = COLORS[mi % COLORS.length];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: pathD,
						fill: color,
						fillOpacity: .1,
						stroke: color,
						strokeWidth: 2,
						strokeOpacity: .8
					}), points.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: p.x,
						cy: p.y,
						r: 3,
						fill: color
					}, i))] }, m.id);
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "flex",
				gap: 16,
				flexWrap: "wrap",
				justifyContent: "center"
			},
			children: munitions.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 6
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
					width: 12,
					height: 12,
					borderRadius: 3,
					background: COLORS[i % COLORS.length]
				} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 12,
						fontWeight: 600
					},
					children: m.nom || "Sans nom"
				})]
			}, m.id))
		})]
	});
}
//#endregion
export { RadarChart };
