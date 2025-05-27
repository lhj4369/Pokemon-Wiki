import { toast } from "react-toastify";

const FAVORITES_KEY = "favorite_pokemon_list";
let subscribers = [];
let favorites = getStoredFavorites();

function getStoredFavorites() {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    notify();
}

function notify() {
    subscribers.forEach((cb) => cb([...favorites]));
}

export function getFavorites() {
    return [...favorites];
}

export function isFavorite(id) {
    return favorites.some((p) => p.id === id);
}

export function toggleFavorite(pokemon) {
    const exists = favorites.some((p) => p.id === pokemon.id);

    if (exists) {
        favorites = favorites.filter((p) => p.id !== pokemon.id);
    } else {
        if (favorites.length >= 6) {
            toast.error("즐겨찾기는 최대 6개까지만 추가할 수 있습니다.", {
                autoClose: 1000,
                className: "font-kor text-pink-500 font-bold text-center",
            });
            return;
        }

        favorites.unshift(pokemon);
    }

    saveFavorites();
}

export function subscribe(callback) {
    subscribers.push(callback);
    callback([...favorites]);
    return () => {
        subscribers = subscribers.filter((cb) => cb !== callback);
    };
}