import { typeList, typeKoMap, typeColorMap } from "../lib/typeMap";

const PokemonSearchBar = ({ search, setSearch, onSearch, onKeyDown, selectedTypes, onTypeToggle }) => {
    return (
        <div className="flex flex-col items-center space-y-6 my-6 w-full">
            {/* 검색창과 버튼을 나란히 배치 */}
            <div className="flex w-3/4 max-w-2xl space-x-2">
                <input
                    type="text"
                    placeholder="포켓몬 이름(한국어) 또는 도감번호 입력"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={onSearch}
                    className="px-6 py-2 rounded-r-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                    검색
                </button>
            </div>

            {/* 타입 체크박스 형태 뱃지 */}
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                {typeList.map((type) => {
                    const isSelected = selectedTypes.includes(type);
                    const baseStyle = isSelected
                        ? typeColorMap[typeKoMap[type]] || "bg-gray-400 text-white"
                        : "bg-gray-100 text-gray-800";

                    return (
                        <button
                            key={type}
                            onClick={() => onTypeToggle(type)}
                            className={`px-4 py-1 rounded-full text-sm font-bold transition ${baseStyle}`}
                        >
                            {typeKoMap[type] || type}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PokemonSearchBar;
