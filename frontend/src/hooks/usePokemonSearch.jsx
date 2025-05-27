import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { koNameMap } from "../lib/koNameMap";

const PAGE_SIZE = 20;
const MAX_VALID_ID = 1010;

export default function usePokemonSearch() {
    const [search, setSearch] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const koreanSearchEngNamesRef = useRef([]);
    const isLoadingMoreRef = useRef(false);

    const fetchPokemons = async (reset = false) => {
        if (isLoadingMoreRef.current) return;
        isLoadingMoreRef.current = true;
        setIsSearching(true);

        const trimmed = search.trim();
        const offset = reset ? 0 : page * PAGE_SIZE;
        const isDexNum = /^\d+$/.test(trimmed);

        try {
            // 1. 번호 검색 + 타입 없음
            if (isDexNum && selectedTypes.length === 0) {
                try {
                    const detailRes = await axios.get('/api/pokemon', { params: { query: trimmed } });
                    const detail = detailRes.data;

                    if (detail.id > MAX_VALID_ID) throw new Error("Invalid ID");

                    const speciesRes = await axios.get('/api/pokemon-species', { params: { query: detail.id } });
                    const koNameEntry = speciesRes.data.names.find(n => n.language.name === "ko");
                    if (!koNameEntry) throw new Error("No Korean name");

                    const filtered = [{
                        id: detail.id,
                        koreanName: koNameEntry.name,
                        name: detail.name,
                        types: detail.types.map(t => t.type.name),
                        image: detail.image,
                    }];

                    setSearchResult(filtered);
                    setHasMore(false);
                    setPage(1);
                } catch (err) {
                    console.error("번호 검색 실패:", err);
                    setSearchResult([]);
                    setHasMore(false);
                }
            }
            // 2. 검색없음 + 타입없음 : 전체 목록
            else if (trimmed === "" && selectedTypes.length === 0) {
                const response = await axios.get('/api/index', { params: { offset, limit: PAGE_SIZE } });
                const allPokemon = response.data.results;

                const koreanPokemon = await Promise.all(
                    allPokemon.map(async (p) => {
                        try {
                            const id = p.url.split("/").filter(Boolean).pop();
                            const detailRes = await axios.get('/api/pokemon', { params: { query: id } });
                            const detail = detailRes.data;

                            if (detail.id > MAX_VALID_ID) return null;

                            const speciesRes = await axios.get(`/api/pokemon-species`, { params: { query: detail.id } });
                            const koNameEntry = speciesRes.data.names.find(n => n.language.name === "ko");
                            if (!koNameEntry) return null;

                            return {
                                id: detail.id,
                                koreanName: koNameEntry.name,
                                name: detail.name,
                                types: detail.types.map(t => t.type.name),
                                image: detail.image,
                            };
                        } catch {
                            return null;
                        }
                    })
                );

                const filtered = koreanPokemon.filter(Boolean);
                setSearchResult(reset ? filtered : [...searchResult, ...filtered]);
                setHasMore(filtered.length === PAGE_SIZE);
                setPage(reset ? 1 : page + 1);
            }
            // 3. 검색없음 + 타입선택 있음 : 타입 교집합 필터
            else if (trimmed === "" && selectedTypes.length > 0) {
                const typeResponses = await Promise.all(
                    selectedTypes.map(type =>
                        axios.get('/api/type', { params: { query: type } })
                    )
                );

                const idSets = typeResponses.map(res =>
                    new Set(res.data.pokemon.map(p =>
                        parseInt(p.pokemon.url.split("/").filter(Boolean).pop())
                    ))
                );

                const commonIds = [...idSets.reduce((a, b) => {
                    return new Set([...a].filter(x => b.has(x)));
                })];

                commonIds.sort((a, b) => a - b);

                const targetIds = commonIds.slice(offset, offset + PAGE_SIZE);

                const pokemonList = await Promise.all(
                    targetIds.map(async (id) => {
                        try {
                            const detailRes = await axios.get('/api/pokemon', { params: { query: id } });
                            const detail = detailRes.data;

                            if (detail.id > MAX_VALID_ID) return null;

                            const speciesRes = await axios.get(`/api/pokemon-species`, { params: { query: id } });
                            const koNameEntry = speciesRes.data.names.find(n => n.language.name === "ko");
                            if (!koNameEntry) return null;

                            return {
                                id: detail.id,
                                koreanName: koNameEntry.name,
                                name: detail.name,
                                types: detail.types.map(t => t.type.name),
                                image: detail.image,
                            };
                        } catch {
                            return null;
                        }
                    })
                );

                const filtered = pokemonList.filter(Boolean);
                setSearchResult(reset ? filtered : [...searchResult, ...filtered]);
                setHasMore(offset + PAGE_SIZE < commonIds.length);
                setPage(reset ? 1 : page + 1);
            }
            // 4. 한글 검색 + (선택적 타입 필터)
            else {
                if (reset) {
                    // koNameMap에서 한글 검색어 포함하는 영어 이름 목록 생성 (중복 제거)
                    const matchedEngNames = Object.entries(koNameMap)
                        .filter(([koName]) => koName.includes(trimmed))
                        .map(([_, engName]) => engName);

                    koreanSearchEngNamesRef.current = [...new Set(matchedEngNames)];
                }

                const sliceEngNames = koreanSearchEngNamesRef.current.slice(offset, offset + PAGE_SIZE);

                const detailedPokemons = await Promise.all(sliceEngNames.map(async (name) => {
                    try {
                        const res = await axios.get('/api/pokemon', { params: { query: name } });
                        const detail = res.data;

                        const speciesRes = await axios.get('/api/pokemon-species', { params: { query: detail.id } });
                        const koNameEntry = speciesRes.data.names.find(n => n.language.name === "ko");
                        if (!koNameEntry) return null;

                        const pokemonData = {
                            id: detail.id,
                            koreanName: koNameEntry.name,
                            name: detail.name,
                            types: detail.types.map(t => t.type.name),
                            image: detail.image,
                        };

                        if (selectedTypes.length > 0) {
                            const hasAllTypes = selectedTypes.every(type => pokemonData.types.includes(type));
                            if (!hasAllTypes) return null;
                        }

                        return pokemonData;
                    } catch {
                        return null;
                    }
                }));

                const filtered = detailedPokemons.filter(Boolean);

                setSearchResult(reset ? filtered : [...searchResult, ...filtered]);
                setHasMore(offset + PAGE_SIZE < koreanSearchEngNamesRef.current.length);
                setPage(reset ? 1 : page + 1);
            }
        } catch (err) {
            console.error("포켓몬 로딩 실패:", err);
        }

        setIsSearching(false);
        isLoadingMoreRef.current = false;
    };

    const handleSearch = () => {
        setPage(0);
        setSearchResult([]);
        setHasMore(true);
        fetchPokemons(true);
    };

    const handleLoadMore = () => {
        if (hasMore && !isSearching) {
            fetchPokemons();
        }
    };

    useEffect(() => {
        handleSearch(); // 초기 로드
    }, []);

    return {
        search,
        setSearch,
        selectedTypes,
        setSelectedTypes,
        searchResult,
        isSearching,
        hasMore,
        handleSearch,
        handleLoadMore,
    };
}
