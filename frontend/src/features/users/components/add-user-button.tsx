import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { AddUserDrawer } from './add-user-drawer';

export const AddUserButton = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDrawerOpen(true)}
        icon={<Plus className="size-4" />}
        size="sm"
      >
        Add User
      </Button>
      <AddUserDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};