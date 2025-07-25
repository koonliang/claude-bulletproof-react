import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { Authorization, ROLES } from '@/lib/authorization';

import { useDeleteDiscussion } from '../api/delete-discussion';

type DeleteDiscussionProps = {
  id: string;
};

export const DeleteDiscussion = ({ id }: DeleteDiscussionProps) => {
  const { addNotification } = useNotifications();
  const deleteDiscussionMutation = useDeleteDiscussion({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Discussion Deleted',
        });
      },
    },
  });

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <ConfirmationDialog
        icon="danger"
        title="Delete Discussion"
        body="Are you sure you want to delete this discussion?"
        isDone={deleteDiscussionMutation.isSuccess}
        triggerButton={
          <button className="text-slate-600 hover:text-slate-900">
            Delete
          </button>
        }
        confirmButton={
          <Button
            isLoading={deleteDiscussionMutation.isPending}
            type="button"
            variant="destructive"
            onClick={() =>
              deleteDiscussionMutation.mutate({ discussionId: id })
            }
          >
            Delete Discussion
          </Button>
        }
      />
    </Authorization>
  );
};
