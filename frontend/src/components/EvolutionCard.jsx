import { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function EvolutionCard({ name, onLoadFail }) {
    const [pokemon, setPokemon] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!name) return;

        async function fetchPokemon() {
            try {
                const res = await axios.get(`/api/pokemon`, {
                    params: { query: name }
                });
                const data = res.data;

                const speciesId = data.species.url.split("/").filter(Boolean).pop();
                const resSpecies = await axios.get(`/api/pokemon-species`, {
                    params: { query: speciesId }
                });
                const species = resSpecies.data;

                const koreanName = species.names.find(n => n.language.name === "ko")?.name || name;

                setPokemon({
                    id: data.id,
                    name,
                    koreanName,
                    image: data.image,
                    types: data.types.map(t => t.type.name),
                });
            } catch (err) {
                console.error("진화 카드 포켓몬 로딩 실패:", err);
                if (onLoadFail) onLoadFail(name);
            }
        }

        fetchPokemon();
    }, [name, onLoadFail]);

    if (!pokemon) return null;

    return (
        <PokemonCard
            pokemon={pokemon}
            showFavorite={true}
            onClick={() => navigate(`/pokemon/${pokemon.name}`)}
        />
    );
}

export default EvolutionCard;
