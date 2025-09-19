import React from 'react';
import { Asset, Location } from '@/types';
import CreateEdit from './create';

interface Props {
    asset: Asset;
    locations: Location[];
    assetTypes: string[];
}

export default function Edit({ asset, locations, assetTypes }: Props) {
    return (
        <CreateEdit 
            asset={asset} 
            locations={locations} 
            assetTypes={assetTypes}
        />
    );
}