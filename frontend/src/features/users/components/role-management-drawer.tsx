import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, Select } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { updateUserRoleInputSchema, useUpdateUserRole } from '../api/update-user-role';

type RoleManagementDrawerProps = {
  userId: string;
  currentRole: 'USER' | 'ADMIN';
};

export const RoleManagementDrawer = ({ userId, currentRole }: RoleManagementDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addNotification } = useNotifications();
  
  const updateUserRoleMutation = useUpdateUserRole({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Role Updated',
          message: 'User role has been successfully updated.',
        });
        setIsOpen(false);
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Failed to update user role.',
        });
      },
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline" icon={<ShieldCheck className="size-4" />}>
          Change Role
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
        <div className="flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Change User Role</DrawerTitle>
          </DrawerHeader>
          <div className="px-6">
            <Form
              id="change-role"
              onSubmit={(values) => {
                updateUserRoleMutation.mutate({ userId, data: values });
              }}
              options={{
                defaultValues: {
                  role: currentRole,
                },
              }}
              schema={updateUserRoleInputSchema}
            >
              {({ register, formState }) => (
                <div className="space-y-4">
                  <Select
                    label="Role"
                    error={formState.errors['role']}
                    registration={register('role')}
                    options={[
                      { label: 'User', value: 'USER' },
                      { label: 'Admin', value: 'ADMIN' },
                    ]}
                  />
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Important Notice
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Changing a user's role will immediately affect their permissions:
                          </p>
                          <ul className="mt-1 list-disc list-inside">
                            <li><strong>ADMIN:</strong> Can manage users, discussions, and all team settings</li>
                            <li><strong>USER:</strong> Can view and comment on discussions only</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Form>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            form="change-role"
            type="submit"
            isLoading={updateUserRoleMutation.isPending}
          >
            Update Role
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};