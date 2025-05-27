export default async function handler(req, res) {
    const { query } = req.query;
    const API_URL = "https://pokeapi.co/api/v2";

    if (!query) {
        return res.status(400).json({ error: "query 파라미터가 필요합니다." });
    }

    try {
        const response = await fetch(`${API_URL}/pokemon-species/${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 필요한 정보만 추려내기
        const filtered = {
            id: data.id,
            names: data.names,
            evolution_chain: data.evolution_chain
        };

        res.status(200).json(filtered);
    } catch (error) {
        console.error("포켓몬 정보 불러오기 실패:", error.message);
        res.status(500).json({ error: "포켓몬 로드 실패" });
    }
}
