import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";

const statNameMap = {
    hp: "HP",
    attack: "공격",
    defense: "방어",
    speed: "스피드",
    "special-defense": "특수방어",
    "special-attack": "특수공격",
};

const statOrderKo = ["HP", "공격", "방어", "스피드", "특수방어", "특수공격"];

export default function StatRadarChart({ data }) {
    const translatedData = data.map((d) => ({
        statName: statNameMap[d.statName] || d.statName,
        value: d.value,
    }));

    const orderedData = statOrderKo.map((name) =>
        translatedData.find((d) => d.statName === name) || { statName: name, value: 0 }
    );

    return (
        <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={65}
            width={400}
            height={220}
            data={orderedData}
        >
            <PolarGrid radialLines={true} polarLines={false} />
            <PolarAngleAxis
                dataKey="statName"
                tick={({ payload, x, y, textAnchor, cx, cy }) => {
                    const stat = orderedData.find((d) => d.statName === payload.value);
                    const dx = x - cx;
                    const dy = y - cy;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const offset = 15;
                    const newX = x + (dx / length) * offset;
                    const newY = y + (dy / length) * offset;

                    return (
                        <g transform={`translate(${newX},${newY})`}>
                            <text
                                textAnchor={textAnchor}
                                fill="#facc15"
                                fontWeight="bold"
                                fontSize="15"
                            >
                                {payload.value}
                            </text>
                            <text
                                dy={18}
                                textAnchor={textAnchor}
                                fill="#999"
                                fontSize="14"
                            >
                                {stat?.value}
                            </text>
                        </g>
                    );
                }}
            />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar
                name="능력치"
                dataKey="value"
                stroke="#facc15"
                fill="#fde68a"
                fillOpacity={0.4}
            />
        </RadarChart>

    );
}
