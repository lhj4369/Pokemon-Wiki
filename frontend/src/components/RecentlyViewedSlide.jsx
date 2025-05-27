import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribe, removeFromRecentlyViewed } from "../stores/recentlyViewed";

const RecentlyViewedSlide = () => {
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = subscribe(setRecentlyViewed);
        return unsubscribe;
    }, []);

    const handleRemove = (e, id) => {
        e.stopPropagation();
        removeFromRecentlyViewed(id);
    };

    return (
        <div className="hidden lg:flex flex-col fixed top-40 left-10 w-40 max-h-[80vh] overflow-y-auto bg-white border border-yellow-300 shadow-lg rounded-xl p-3 z-10">
            <h2 className="text-center text-yellow-600 font-bold mb-2 text-sm">최근 본 포켓몬</h2>
            {recentlyViewed.map((p) => (
                <div
                    key={p.id}
                    className="relative mb-3 group cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => navigate(`/pokemon/${p.name}`)}
                >
                    <button
                        onClick={(e) => handleRemove(e, p.id)}
                        className="absolute top-0 right-0 text-red-400 hover:text-red-600 text-xs font-bold z-10"
                        title="최근 본 목록에서 삭제"
                    >
                        ✕
                    </button>
                    <img src={p.image} alt={p.koreanName} className="w-14 h-14 mx-auto drop-shadow" />
                    <p className="text-[11px] text-center mt-1 font-medium">{p.koreanName}</p>
                </div>
            ))}
            {recentlyViewed.length === 0 && (
                <p className="text-gray-400 text-center text-xs">없음</p>
            )}
        </div>
    );
};

export default RecentlyViewedSlide;
