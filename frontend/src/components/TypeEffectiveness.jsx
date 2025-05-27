import { typeKoMap } from '../lib/typeMap';
import TypeBadge from './TypeBadge';

export default function TypeEffectiveness({ relations }) {
    if (!relations) return null;

    const renderBadges = (arr) =>
        arr.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2 mt-1">
                {arr.map((t) => {
                    const koName = typeKoMap[t.name] || t.name;
                    return <TypeBadge key={t.name} types={[koName]} />;
                })}
            </div>
        ) : (
            <span className="text-gray-500 block text-center">없음</span>
        );

    return (
        <div className="space-y-3">
            <div>
                <p className="font-bold">2배 피해:</p>
                {renderBadges(relations.double_damage_from)}
            </div>
            <div>
                <p className="font-bold">0.5배 피해:</p>
                {renderBadges(relations.half_damage_from)}
            </div>
            <div>
                <p className="font-bold">무효:</p>
                {renderBadges(relations.no_damage_from)}
            </div>
        </div>
    );
}
