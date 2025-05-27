import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { typeKoMap } from '../lib/typeMap';
import TypeEffectiveness from '../components/TypeEffectiveness';
import StatRadarChart from '../components/StatRadarChart';
import TypeBadge from "../components/TypeBadge";
import EvolutionCard from '../components/EvolutionCard';
import { Link } from "react-router-dom";
import logo from '../assets/Logo.png';
import { addRecentlyViewed } from "../stores/recentlyViewed";
import RecentlyViewedSlide from '../components/RecentlyViewedSlide';
import FavoriteSidebar from '../components/FavoriteSidebar';
import axios from 'axios';

function DetailPage() {
    const { name } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [koreanName, setKoreanName] = useState('');
    const [typeRelations, setTypeRelations] = useState(null);
    const [evolutionChain, setEvolutionChain] = useState([]);
    const [error, setError] = useState(null);
    const [failedEvolutions, setFailedEvolutions] = useState([]);

    const handleEvolutionLoadFail = (failedName) => {
        setFailedEvolutions(prev => [...prev, failedName]);
    };

    const allFailed = evolutionChain.length > 0 && evolutionChain.every(name => failedEvolutions.includes(name));
    const noEvolutionInfo = evolutionChain.length <= 1 || allFailed;


    useEffect(() => {
        async function fetchData() {
            try {
                const resPokemon = await axios.get(`/api/pokemon`, {
                    params: { query: name }
                });
                const dataPokemon = resPokemon.data;
                setPokemon(dataPokemon);

                const primaryType = dataPokemon.types[0].type.name;
                const resType = await axios.get(`/api/type`, {
                    params: { query: primaryType }
                });
                setTypeRelations(resType.data.damage_relations);

                const resSpecies = await axios.get(dataPokemon.species.url);
                const koreanNameEntry = resSpecies.data.names.find(n => n.language.name === "ko");
                setKoreanName(koreanNameEntry?.name || dataPokemon.name);

                const resEvo = await axios.get(resSpecies.data.evolution_chain.url);
                const evoNames = [];
                function traverse(chain) {
                    evoNames.push(chain.species.name);
                    chain.evolves_to.forEach(next => traverse(next));
                }
                traverse(resEvo.data.chain);
                setEvolutionChain([...new Set(evoNames)]);

                addRecentlyViewed({
                    id: dataPokemon.id,
                    name: dataPokemon.name,
                    koreanName: koreanNameEntry?.name || dataPokemon.name,
                    image: dataPokemon.image,
                    types: dataPokemon.types.map(t => t.type.name),
                });
            } catch (err) {
                setError(err.message);
            }
        }
        fetchData();

    }, [name]);

    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!pokemon) return <p className="text-center my-6 text-pink-500 font-bold text-lg animate-bounce">
        로딩 중... 🌀
    </p>;

    const formattedId = `No.${pokemon.id.toString().padStart(4, "0")}`;
    const typeNames = pokemon.types.map(t => typeKoMap[t.type.name] || t.type.name);
    const statData = pokemon.stats.map(stat => ({
        statName: stat.stat.name,
        value: stat.base_stat,
    }));

    return (
        <div className="max-w-4xl mx-auto p-6 text-center rounded-lg shadow-lg font-kor">
            <RecentlyViewedSlide />
            <FavoriteSidebar />
            <h1 className="text-center mb-8">
                <Link to="/" className="inline-block hover:opacity-80 transition-all duration-200">
                    <img
                        src={logo}
                        alt="Pokemon Wiki Logo"
                        className="mx-auto h-24 object-contain"
                    />
                </Link>
            </h1>
            <p className="text-gray-500 text-xl font-bold mb-1">{formattedId}</p>
            <h2 className="text-4xl font-bold mb-3">{koreanName}</h2>

            <img
                src={pokemon.image}
                alt={koreanName}
                className="mx-auto mb-6 w-52 h-52 drop-shadow-md"
            />

            <div className="mb-6">
                <TypeBadge types={typeNames} />
            </div>

            <div className="bg-white rounded-4xl shadow-md p-8 flex flex-col md:flex-row justify-between items-start gap-6 border border-yellow-300">
                {/* 능력치 */}
                <div className="w-full md:w-1/2">
                    <h3 className="text-xl font-bold text-blue-800 mb-3">능력치</h3>
                    <StatRadarChart data={statData} />
                </div>

                {/* 타입 상성 */}
                <div className="w-full md:w-1/2 flex flex-col min-h-[250px]">
                    <h3 className="text-xl font-bold text-blue-800 mb-3">타입 상성</h3>
                    <div className="flex-grow flex items-center justify-center">
                        <TypeEffectiveness relations={typeRelations} />
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <h3 className="text-2xl font-bold text-pink-700 mb-4">진화 트리</h3>
                {noEvolutionInfo ? (
                    <p className="text-gray-600">진화 정보가 없습니다.</p>
                ) : (
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        {evolutionChain.map((pokeName, index) => (
                            <div className="flex items-center" key={pokeName}>
                                <EvolutionCard name={pokeName} onLoadFail={handleEvolutionLoadFail} />
                                {index < evolutionChain.length - 1 && <span className="text-2xl mx-2">➜</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

}

export default DetailPage;