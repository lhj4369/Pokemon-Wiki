import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import usePokemonSearch from "../hooks/usePokemonSearch";
import PokemonCard from "../components/PokemonCard";
import logo from "../assets/Logo.png";
import PokemonSearchBar from "../components/PokemonSearchBar";
import RecentlyViewedSlide from "../components/RecentlyViewedSlide";
import FavoriteSidebar from "../components/FavoriteSidebar";

const HomePage = () => {
    const navigate = useNavigate();
    const loader = useRef(null);

    const {
        search,
        setSearch,
        selectedTypes,
        setSelectedTypes,
        searchResult,
        isSearching,
        hasMore,
        handleSearch,
        handleLoadMore
    } = usePokemonSearch();

    const onTypeToggle = (type) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY + 100 >= document.body.offsetHeight &&
                hasMore &&
                !isSearching
            ) {
                handleLoadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore, isSearching, handleLoadMore]);

    const handleClick = (id) => {
        navigate(`/pokemon/${id}`);
    };

    return (
        <div className="relative font-kor">
            <RecentlyViewedSlide />
            <FavoriteSidebar />
            {/* 메인 콘텐츠 (가운데 정렬) */}
            <div className="flex justify-center">
                <div className="w-full px-4 lg:px-60"> {/* 여백 확보를 위해 왼쪽 padding 추가 */}
                    <h1 className="text-center mt-12 mb-8">
                        <a href="/" className="inline-block hover:opacity-80 transition-all duration-200">
                            <img
                                src={logo}
                                alt="Pokemon Wiki Logo"
                                className="mx-auto h-24 object-contain"
                            />
                        </a>
                    </h1>

                    <PokemonSearchBar
                        search={search}
                        setSearch={setSearch}
                        selectedTypes={selectedTypes}
                        setSelectedTypes={setSelectedTypes}
                        onTypeToggle={onTypeToggle}
                        onSearch={handleSearch}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
                        {searchResult.map((pokemon) => (
                            <PokemonCard
                                key={pokemon.id}
                                pokemon={pokemon}
                                showFavorite={true}
                                onClick={() => handleClick(pokemon.id)}
                            />
                        ))}
                    </div>

                    {isSearching && (
                        <p className="text-center my-6 text-pink-500 font-bold text-lg animate-bounce">
                            로딩 중... 🌀
                        </p>
                    )}
                    <div ref={loader} className="h-10" />
                </div>
            </div>
        </div>
    );
};
export default HomePage;
