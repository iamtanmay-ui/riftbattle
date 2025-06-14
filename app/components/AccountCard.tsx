import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface AccountCardProps {
  id: number;
  name: string;
  price: number;
  skins: string[];
  backpacks: number;
  level: number;
}

export function AccountCard({ id, name, price, skins, backpacks, level }: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Clean up skin names
  const cleanSkinName = (skin: string) => {
    // Remove any ID prefixes (e.g., "CID_", "BID_", etc.)
    const withoutPrefix = skin.replace(/^(CID_|BID_|EID_|Pickaxe_|Glider_|Wrap_)\d+_/i, '');
    
    // Split by underscores and take the last part
    const namePart = withoutPrefix.split('_').pop() || withoutPrefix;
    
    // Add spaces before capital letters and trim
    return namePart
      .replace(/([A-Z])/g, ' $1')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Get the first 5 skins for preview
  const previewSkins = skins.slice(0, 5).map(cleanSkinName);
  const remainingSkins = skins.length - 5;

  return (
    <div className="relative rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-lg transition-all hover:border-purple-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {skins.length} skins {name}
          </h3>
          <p className="text-2xl font-bold text-purple-500">${price}</p>
        </div>
        <div className="text-right">
          <p className="text-base text-slate-400">Level {level || 0}</p>
          <p className="text-base text-slate-400">Backpacks {backpacks || 0} </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {previewSkins.map((skinName, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-purple-400"
            >
              {skinName}
            </span>
          ))}
          {remainingSkins > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-blue-400"
            >
              +{remainingSkins} more
              {isExpanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skins.slice(5).map((skin, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-purple-400"
              >
                {cleanSkinName(skin)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Link href={`/marketplace/${id}`}>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
} 