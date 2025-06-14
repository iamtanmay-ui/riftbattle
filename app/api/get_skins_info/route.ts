import { NextResponse } from 'next/server';

interface CosmeticItem {
  id: string;
  name: string;
  rarity: string;
  image: string;
  type: string;
}

const RARITY_MAP: { [key: string]: string } = {
  CID: 'Epic',
  BID: 'Rare',
  EID: 'Rare',
  Glider: 'Uncommon',
  Trails: 'Uncommon',
  Wrap: 'Rare',
  Umbrella: 'Uncommon',
  Emoji: 'Common',
  Backpack: 'Rare'
};

function getItemType(id: string): string {
  console.log('Getting item type for ID:', id);
  if (id.startsWith('CID_')) return 'outfit';
  if (id.startsWith('BID_')) return 'backbling';
  if (id.startsWith('EID_')) return 'emote';
  if (id.startsWith('Glider_')) return 'glider';
  if (id.startsWith('Trails_')) return 'contrail';
  if (id.startsWith('Wrap_')) return 'wrap';
  if (id.startsWith('Umbrella_')) return 'glider';
  if (id.startsWith('Emoji_')) return 'emoji';
  if (id.startsWith('Backpack_')) return 'backbling';
  console.log('Unknown item type for ID:', id);
  return 'unknown';
}

function formatName(id: string): string {
  console.log('Formatting name for ID:', id);
  const formatted = id
    .replace(/^([A-Za-z]+)_\d+_/i, '')
    .replace(/^cid_\d+_/i, '')
    .replace(/^bid_\d+_/i, '')
    .replace(/^eid_\d+_/i, '')
    .replace(/^athena_commando_[fm]_/i, '')
    .replace(/Athena[_\s]Commando[_\s][MF][_\s]/i, '')
    .replace(/Athena/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
  console.log('Formatted name:', formatted);
  return formatted;
}

function getRarity(id: string): string {
  console.log('Getting rarity for ID:', id);
  for (const [prefix, rarity] of Object.entries(RARITY_MAP)) {
    if (id.startsWith(prefix)) {
      console.log('Found rarity:', rarity, 'for prefix:', prefix);
      return rarity;
    }
  }
  console.log('No matching rarity found, defaulting to Uncommon');
  return 'Uncommon';
}

function getImageUrl(id: string, type: string): string {
  console.log('Generating image URL for ID:', id, 'type:', type);
  
  // Base URL for Fortnite API images
  const baseUrl = 'https://fortnite-api.com/images/cosmetics/br';
  
  // Clean the ID for the URL
  const cleanId = id.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  // Generate the appropriate URL based on type
  let url = '';
  switch (type) {
    case 'outfit':
      url = `${baseUrl}/outfits/${cleanId}.png`;
      break;
    case 'backbling':
      url = `${baseUrl}/backblings/${cleanId}.png`;
      break;
    case 'emote':
      url = `${baseUrl}/emotes/${cleanId}.png`;
      break;
    case 'glider':
      url = `${baseUrl}/gliders/${cleanId}.png`;
      break;
    case 'pickaxe':
      url = `${baseUrl}/pickaxes/${cleanId}.png`;
      break;
    default:
      url = `${baseUrl}/icons/${cleanId}.png`;
  }
  
  console.log('Generated image URL:', url);
  return url;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const athenaID = searchParams.get('athenaID');

    console.log('Received request for athenaID:', athenaID);

    if (!athenaID) {
      console.error('No athenaID provided');
      return NextResponse.json(
        { error: 'athenaID is required' },
        { status: 400 }
      );
    }

    // Determine item type and generate info
    const type = getItemType(athenaID);
    const name = formatName(athenaID);
    const rarity = getRarity(athenaID);
    const image = getImageUrl(athenaID, type);

    const cosmeticItem: CosmeticItem = {
      id: athenaID,
      name,
      rarity,
      image,
      type
    };

    console.log('Generated cosmetic item:', cosmeticItem);
    return NextResponse.json(cosmeticItem);
  } catch (error) {
    console.error('Error processing cosmetic item:', error);
    return NextResponse.json(
      { error: 'Failed to get skin information' },
      { status: 500 }
    );
  }
} 