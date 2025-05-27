import { typeKoMap } from "../lib/typeMap";
import { useNavigate } from "react-router-dom";
import TypeBadge from "./TypeBadge";
import { isFavorite, toggleFavorite, subscribe } from "../stores/favorites";
import { useState, useEffect } from "react";
import { Star, StarOff } from "lucide-react";

function PokemonCard({ pokemon, showFavorite = false }) {
    const { id, koreanName, name, image, types } = pokemon;
    const formattedId = `No.${String(id).padStart(4, "0")}`;
    const navigate = useNavigate();
    const [favorite, setFavorite] = useState(false);

    const handleClick = () => {
        navigate(`/pokemon/${name}`);
    };

    const typeNames = types.map((t) =>
        typeof t === "string"
            ? typeKoMap[t] || t
            : typeKoMap[t.type.name] || t.type.name
    );

    useEffect(() => {
        setFavorite(isFavorite(id));

        // ✅ 즐겨찾기 상태 실시간 반영
        const unsubscribe = subscribe((list) => {
            setFavorite(list.some((p) => p.id === id));
        });

        return unsubscribe;
    }, [id]);

    // ✅ 즐겨찾기 토글
    const handleToggleFavorite = (e) => {
        e.stopPropagation(); // 카드 클릭 방지
        toggleFavorite(pokemon);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative bg-white rounded-3xl p-4 shadow-md hover:shadow-xl cursor-pointer transition-all duration-200 transform hover:scale-105"
        >
            {/* 즐겨찾기 아이콘 (hover 시에만 보임) */}
            {showFavorite && (
                <button
                    onClick={handleToggleFavorite}
                    className="absolute top-2 right-2 text-yellow-400 z-10 hidden group-hover:block"
                    title="즐겨찾기"
                >
                    {favorite ? (
                        <Star fill="currentColor" strokeWidth={1.5} />
                    ) : (
                        <StarOff strokeWidth={1.5} />
                    )}
                </button>
            )}

            <p className="text-xs text-gray-400 text-center mb-1">{formattedId}</p>
            <p className="text-center text-xl font-semibold mb-2">
                {koreanName || name}
            </p>
            <img
                src={image}
                alt={koreanName}
                className="w-24 h-24 mx-auto drop-shadow-md"
            />
            <div className="text-center mt-3 flex justify-center flex-wrap gap-2">
                <TypeBadge types={typeNames} />
            </div>
        </div>
    );
}

export default PokemonCard;