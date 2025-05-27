const RECENT_KEY = "recently_viewed_list";
let subscribers = [];
let recentlyViewed = getStoredRecent();

function getStoredRecent() {
    const data = localStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
}

function saveRecent() {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed));
    notify();
}

function notify() {
    subscribers.forEach((cb) => cb([...recentlyViewed]));
}

export function getRecentlyViewed() {
    return [...recentlyViewed];
}

export function addRecentlyViewed(pokemon) {
    recentlyViewed = recentlyViewed.filter((p) => p.id !== pokemon.id);
    recentlyViewed.unshift(pokemon);
    if (recentlyViewed.length > 6) recentlyViewed.pop();
    saveRecent();
}

export function removeFromRecentlyViewed(id) {
    recentlyViewed = recentlyViewed.filter((p) => p.id !== id);
    saveRecent();
}

export function subscribe(callback) {
    subscribers.push(callback);
    callback([...recentlyViewed]);
    return () => {
        subscribers = subscribers.filter((cb) => cb !== callback);
    };
}