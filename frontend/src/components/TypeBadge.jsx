import { typeColorMap } from "../lib/typeMap";

export default function TypeBadge({ types }) {
    return (
        <div className="flex justify-center flex-wrap gap-2">
            {types.map((type) => (
                <span
                    key={type}
                    className={`rounded-full px-4 py-1 text-sm font-bold ${typeColorMap[type] || "bg-gray-300 text-gray-800"}`}
                >
                    {type}
                </span>
            ))}
        </div>
    );
}