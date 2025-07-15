import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { formatDate } from '@/utils/format';

import { useUsers } from '../api/get-users';

import { DeleteUser } from './delete-user';
import { EditUserDrawer } from './edit-user-drawer';

export const UsersList = () => {
  const [searchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const searchQuery = searchParams.get('search') || '';
  const usersQuery = useUsers({
    params: { search: searchQuery },
  });

  if (usersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const users = usersQuery.data?.data;

  if (!users) return null;

  return (
    <>
      <Table
        data={users}
        columns={[
          {
            title: 'First Name',
            field: 'firstName',
            Cell({ entry: { firstName, id } }) {
              return (
                <button
                  onClick={() => setSelectedUserId(id)}
                  className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {firstName}
                </button>
              );
            },
          },
          {
            title: 'Last Name',
            field: 'lastName',
          },
          {
            title: 'Email',
            field: 'email',
          },
          {
            title: 'Role',
            field: 'role',
          },
          {
            title: 'Created At',
            field: 'createdAt',
            Cell({ entry: { createdAt } }) {
              return <span>{formatDate(createdAt)}</span>;
            },
          },
          {
            title: '',
            field: 'id',
            Cell({ entry: { id } }) {
              return <DeleteUser id={id} />;
            },
          },
        ]}
      />
      {selectedUserId && (
        <EditUserDrawer
          userId={selectedUserId}
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
};
