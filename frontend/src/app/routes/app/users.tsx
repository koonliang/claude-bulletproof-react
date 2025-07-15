import { QueryClient } from '@tanstack/react-query';

import { ContentLayout } from '@/components/layouts';
import { getUsersQueryOptions } from '@/features/users/api/get-users';
import { AddUserButton } from '@/features/users/components/add-user-button';
import { SearchUsers } from '@/features/users/components/search-users';
import { UsersList } from '@/features/users/components/users-list';
import { Authorization, ROLES } from '@/lib/authorization';

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getUsersQueryOptions();

  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};

const UsersRoute = () => {
  return (
    <ContentLayout title="Users">
      <Authorization
        forbiddenFallback={<div>Only admin can view this.</div>}
        allowedRoles={[ROLES.ADMIN]}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <SearchUsers />
            <AddUserButton />
          </div>
          <UsersList />
        </div>
      </Authorization>
    </ContentLayout>
  );
};

export default UsersRoute;
