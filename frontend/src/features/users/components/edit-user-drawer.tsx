import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Form, Input, Textarea } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';

import { useUser } from '../api/get-user';
import { updateUserInputSchema, useUpdateUser } from '../api/update-user';

import { RoleManagementDrawer } from './role-management-drawer';

type EditUserDrawerProps = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const EditUserDrawer = ({
  userId,
  isOpen,
  onClose,
}: EditUserDrawerProps) => {
  const { addNotification } = useNotifications();
  const userQuery = useUser({ userId });
  const updateUserMutation = useUpdateUser({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'User Updated',
          message: 'User profile has been successfully updated.',
        });
        onClose();
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Failed to update user profile.',
        });
      },
    },
  });

  if (userQuery.isLoading) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="flex max-w-[800px] flex-col justify-center sm:max-w-[540px]">
          <div className="flex h-48 w-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!userQuery.data) {
    return null;
  }

  const user = userQuery.data;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
        <div className="flex flex-col">
          <DrawerHeader>
            <DrawerTitle>
              Edit User: {user.firstName} {user.lastName}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6">
            <Form
              id="edit-user"
              onSubmit={(values) => {
                updateUserMutation.mutate({ userId, data: values });
              }}
              options={{
                defaultValues: {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  bio: user.bio || '',
                },
              }}
              schema={updateUserInputSchema}
            >
              {({ register, formState }) => (
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
                  <Textarea
                    label="Bio"
                    error={formState.errors['bio']}
                    registration={register('bio')}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm">{user.role}</span>
                    <RoleManagementDrawer
                      userId={userId}
                      currentRole={user.role}
                    />
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
            form="edit-user"
            type="submit"
            isLoading={updateUserMutation.isPending}
          >
            Update User
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
