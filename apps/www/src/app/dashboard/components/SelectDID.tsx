'use client';

import { usePolygonID, useVeramo } from '~/lib/hooks';
import { useBlazeStore } from '~/lib/stores';

import { useLiveQuery } from 'dexie-react-hooks';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

const SelectDID = () => {
  const { activeDID, setActiveDID } = useBlazeStore();
  const { getAllDIDs } = useVeramo();
  const {} = usePolygonID();

  const dids = useLiveQuery(async () => {
    const dids = await getAllDIDs();
    return dids;
  });
  if (dids)
    return (
      <Select>
        <SelectTrigger className='mx-0 w-fit px-2'>
          <SelectValue placeholder='Active DID' />
        </SelectTrigger>
        <SelectContent>
          {dids?.map((did) => (
            <SelectItem
              key={did.did}
              value={did.did}
              onClick={() => {
                setActiveDID(did);
              }}
            >
              {did.did}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
};

export default SelectDID;
