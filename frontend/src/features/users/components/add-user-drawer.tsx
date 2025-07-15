import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Form, Input, Textarea, Select } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';

import { createUserInputSchema, useCreateUser } from '../api/create-user';

type AddUserDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddUserDrawer = ({ isOpen, onClose }: AddUserDrawerProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { addNotification } = useNotifications();

  const createUserMutation = useCreateUser({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'User Created',
          message: 'User has been successfully created and added to your team.',
        });
        onClose();
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: error.message || 'Failed to create user.',
        });
      },
    },
  });

  const generatePassword = () => {
    // Generate a simple random password
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
        <div className="flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Add New User</DrawerTitle>
          </DrawerHeader>
          <div className="px-6">
            <Form
              id="add-user"
              onSubmit={(values) => {
                createUserMutation.mutate(values);
              }}
              options={{
                defaultValues: {
                  firstName: '',
                  lastName: '',
                  email: '',
                  role: 'USER' as const,
                  bio: '',
                  password: '',
                },
              }}
              schema={createUserInputSchema}
            >
              {({ register, formState, setValue, watch }) => {
                const password = watch('password');

                return (
                  <div className="space-y-4">
                    <Input
                      label="First Name"
                      error={formState.errors['firstName']}
                      registration={register('firstName')}
                    />
                    <Input
                      label="Last Name"
                      error={formState.errors['lastName']}
                      registration={register('lastName')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      error={formState.errors['email']}
                      registration={register('email')}
                    />
                    <Select
                      label="Role"
                      error={formState.errors['role']}
                      registration={register('role')}
                      options={[
                        { label: 'User', value: 'USER' },
                        { label: 'Admin', value: 'ADMIN' },
                      ]}
                    />
                    <Textarea
                      label="Bio (Optional)"
                      error={formState.errors['bio']}
                      registration={register('bio')}
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Password</label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPassword = generatePassword();
                            setValue('password', newPassword);
                          }}
                        >
                          Generate Password
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          error={formState.errors['password']}
                          registration={register('password')}
                          placeholder="Enter password (min 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      {password && (
                        <p className="text-sm text-gray-600">
                          Password length: {password.length} characters
                        </p>
                      )}
                    </div>
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            User Creation
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              The new user will be added to your team with the
                              selected role:
                            </p>
                            <ul className="mt-1 list-inside list-disc">
                              <li>
                                <strong>USER:</strong> Can view and comment on
                                discussions
                              </li>
                              <li>
                                <strong>ADMIN:</strong> Can manage users,
                                discussions, and team settings
                              </li>
                            </ul>
                            <p className="mt-2">
                              <strong>Important:</strong> Make sure to share the
                              password with the new user securely.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            </Form>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            form="add-user"
            type="submit"
            isLoading={createUserMutation.isPending}
          >
            Create User
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
