export default async function handler(req, res) {
    const { offset = 0, limit = 100 } = req.query;
    const API_URL = "https://pokeapi.co/api/v2";

    try {
        const response = await fetch(`${API_URL}/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        res.status(200).json(data);
    }
    catch (error) {
        console.error("목록 불러오기 실패:", error.message);
        res.status(500).json({ error: "포켓몬 목록 로드 실패" });
    }
}