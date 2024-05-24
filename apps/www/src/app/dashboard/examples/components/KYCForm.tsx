'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';

import { getKYCAgeCredential } from '~/lib/credentials';
import { useBlazeID, usePolygonID } from '~/lib/hooks';
import { cn } from '~/lib/utils';

import type { W3CCredential } from '@0xpolygonid/js-sdk';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

import { CalendarIcon } from 'lucide-react';

const KYCForm = () => {
  const { issueCredential, getDID } = usePolygonID();
  const { activeDID } = useBlazeID();
  const [open, setOpen] = useState<boolean>(false);
  const [credential, setCredential] = useState<W3CCredential>();

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormType) => {
    try {
      const req = getKYCAgeCredential(
        data.user,
        data.birthday.getTime(),
        data.expiry.getTime()
      );
      if (!activeDID) {
        throw new Error('Set Active DID First.');
      }
      const did = await getDID(activeDID);
      if (!did) {
        throw new Error('Active DID should be a Polygon ID');
      }
      const credential = await issueCredential(did.did, req);
      setCredential(credential);
      setOpen(true);
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    }
  };

  return (
    <div className='my-8 w-full max-w-xl justify-start rounded-2xl bg-white p-3 py-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
          <FormField
            control={form.control}
            name='user'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='User DID' {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='birthday'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      toDate={new Date(Date.now())}
                      toMonth={new Date(Date.now())}
                      toYear={2023}
                      fromDate={new Date('01-01-1900')}
                      fromMonth={new Date('01-01-1900')}
                      fromYear={1900}
                      captionLayout='dropdown'
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Birth date for KYC Credential</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='expiry'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Expiry Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      fromDate={new Date(Date.now())}
                      fromMonth={new Date(Date.now())}
                      fromYear={2022}
                      toDate={new Date('01-01-2200')}
                      toMonth={new Date('01-01-2200')}
                      toYear={2200}
                      captionLayout='dropdown'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Expiry date for KYC Credential
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Issue Credential</Button>
        </form>
      </Form>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='m-0 w-full max-w-xl px-4'>
          <DialogHeader>
            <DialogTitle className='mb-4 text-center'>
              Share Credential
            </DialogTitle>
            <div className='flex flex-col items-center justify-center gap-4'>
              <QRCode value={JSON.stringify(credential)} size={256 * 2} />
              <Button
                type='button'
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(credential));
                  toast.success('Credential Copied to Clipboard');
                }}
              >
                Copy Credential
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const formSchema = z.object({
  user: z.string().refine((value) => {
    return value.startsWith('did:polygonid');
  }),
  birthday: z.date({
    required_error: 'A date of birth is required.',
  }),
  expiry: z.date({
    required_error: 'A expiry date is required.',
  }),
});

type FormType = z.infer<typeof formSchema>;

export default KYCForm;
