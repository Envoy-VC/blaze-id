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
  const { setActiveDID } = useBlazeStore();
  const { getAllDIDs } = useVeramo();
  const { getAllDIDs: getAllPolygonIDs } = usePolygonID();

  const dids = useLiveQuery(async () => {
    const dids = await getAllDIDs();
    const polygonDIDS = await getAllPolygonIDs();
    return [...dids, ...polygonDIDS];
  });
  if (dids)
    return (
      <Select
        onValueChange={(val) => {
          const did = dids?.find((d) => d.did === val);
          setActiveDID(did!);
        }}
      >
        <SelectTrigger className='mx-0 w-fit px-2'>
          <SelectValue placeholder='Active DID' />
        </SelectTrigger>
        <SelectContent>
          {dids?.map((did) => (
            <SelectItem key={did.did} value={did.did}>
              {did.did}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
};

export default SelectDID;
