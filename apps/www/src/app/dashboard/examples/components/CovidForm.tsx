'use client';

import React, { useState } from 'react';
import { type FieldErrors, useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';

import { useBlazeID, useVeramo } from '~/lib/hooks';
import { cn } from '~/lib/utils';

import { zodResolver } from '@hookform/resolvers/zod';
import type { VerifiableCredential } from '@veramo/core';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import { CalendarIcon } from 'lucide-react';

const CovidForm = () => {
  const { activeDID } = useBlazeID();
  const { createCredential, getDID } = useVeramo();
  const [open, setOpen] = useState<boolean>(false);
  const [credential, setCredential] = useState<VerifiableCredential>();
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormType) => {
    const id = toast.loading('Issuing Credentials..');
    try {
      if (!activeDID) {
        throw new Error('Set Active DID First.');
      }
      const did = await getDID(activeDID);
      if (!did) {
        throw new Error('Active DID should be did:web, did:key or did:ethr');
      }
      const vc = await createCredential({
        credential: {
          type: ['VerifiableCredential', 'Covid19VaccineCredential'],
          issuer: { id: activeDID },
          credentialSubject: data,
          expirationDate: data.dateOfExpiry,
        },
        proofFormat: 'jwt',
      });
      if (!vc) {
        throw new Error('Failed to create credential');
      }
      toast.success('Credential saved successfully', { id });
      setCredential(vc);
      setOpen(true);
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message, { id });
    }
  };

  const onError = (errors: FieldErrors<FormType>) => {
    toast.error('Invalid Inputs');
  };

  return (
    <div className='my-8 w-full max-w-xl justify-start rounded-2xl bg-white p-3 py-6'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className='space-y-3'
        >
          <FormField
            control={form.control}
            name='id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>User DID</FormLabel>
                <FormControl>
                  <Input placeholder='User DID' {...field} />
                </FormControl>
                <FormDescription>
                  User Identifier to issue the credential.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Name' {...field} />
                </FormControl>
                <FormDescription>
                  Please enter your name as per your identification.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='age'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type='number' placeholder='Age' {...field} />
                </FormControl>
                <FormDescription>
                  Please enter your age as per your identification.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vaccine Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select Vaccine Type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='pcr'>PCR Test</SelectItem>
                    <SelectItem value='antigen'>Antigen Test</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Please select the type of vaccine you have taken.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='performer'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Performing Laboratory</FormLabel>
                <FormControl>
                  <Input placeholder='Laboratory Name' {...field} />
                </FormControl>
                <FormDescription>
                  Please enter the name of the laboratory where the test was
                  conducted.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dateOfApplication'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Date of Application</FormLabel>
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
                      fromDate={new Date('01-01-2020')}
                      fromMonth={new Date('01-01-2020')}
                      fromYear={2020}
                      captionLayout='dropdown'
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date of application for the test.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dateOfExpiry'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Date of Expiry</FormLabel>
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
                      fromYear={2023}
                      toDate={new Date('01-01-2050')}
                      toMonth={new Date('01-01-2050')}
                      toYear={2050}
                      captionLayout='dropdown'
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Date of expiry of the test.</FormDescription>
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
              {credential && (
                <QRCode value={JSON.stringify(credential)} size={256 * 2} />
              )}
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

const formSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    age: z.string(),
    type: z.enum(['pcr', 'antigen']),
    performer: z.string(),
    dateOfApplication: z.date({
      required_error: 'Date of Application is required',
    }),
    dateOfExpiry: z.date({
      required_error: 'Date of Expiry is required',
    }),
  })
  .refine((value) => {
    if (value.dateOfApplication > value.dateOfExpiry) {
      return false;
    }
    return true;
  });

type FormType = z.infer<typeof formSchema>;

export default CovidForm;
