'use client';

import React from 'react';
import { type FieldErrors, useForm } from 'react-hook-form';

import type {
  CreateKeyDIDOptions,
  CreateKeyOptions,
} from '~/lib/hooks/useVeramo';
import useVeramo from '~/lib/hooks/useVeramo';

import { usePolygonID } from '~/lib/hooks';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

const CreateForm = () => {
  const { createDID } = useVeramo();
  const { createDID: createPolygonID } = usePolygonID();
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'key',
    },
  });

  const watchType = form.watch('type');

  const onSubmit = async (values: FormType) => {
    const t = toast.loading('Creating identifier...');
    let did;
    try {
      if (values.type === 'polygonid') {
        const res = await createPolygonID();
        did = res.did.id;
      } else {
        const { alias, keyType } = values;
        const options: CreateKeyDIDOptions = {
          keyType,
        };
        const provider =
          `did:${values.type}` + (values.type === 'ethr' ? ':mainnet' : '');
        
        const res = await createDID({
          alias,
          provider: provider as CreateKeyOptions['provider'],
          options,
        });
        did = res.did;
      }
      toast.success('Identifier created', {
        description: `${did}`,
        id: t,
      });
    } catch (error) {
      toast.error('Failed to create identifier', {
        id: t,
      });
    } finally {
      form.reset();
    }
  };
  const onInvalid = async (errors: FieldErrors<FormType>) => {
    console.log(errors);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifier Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a verified email to display' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='key'>Key</SelectItem>
                      <SelectItem value='web'>Web</SelectItem>
                      <SelectItem value='ethr'>Ethr</SelectItem>
                      <SelectItem value='polygonid'>Polygon ID</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  The type of identifier you want to create (did:key, did:web,
                  did:ethr, did:polygonid)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {watchType === 'key' && (
            <FormField
              control={form.control}
              name='keyType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a verified email to display' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Ed25519'>Ed25519</SelectItem>
                        <SelectItem value='X25519'>X25519</SelectItem>
                        <SelectItem value='Secp256k1'>Secp256k1</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    The type of key you want to create (Ed25519, X25519,
                    Secp256k1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {watchType !== 'polygonid' && (
            <FormField
              control={form.control}
              name='alias'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    An alias for your identifier (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
};

const formSchema = z.object({
  type: z.enum(['key', 'web', 'ethr', 'polygonid']),
  keyType: z.enum(['Ed25519', 'X25519', 'Secp256k1']).optional(),
  alias: z.string().optional(),
});

type FormType = z.infer<typeof formSchema>;
export default CreateForm;
