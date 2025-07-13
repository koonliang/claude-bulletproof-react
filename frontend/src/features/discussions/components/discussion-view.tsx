import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { MDPreview } from '@/components/ui/md-preview';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/format';

import { useDiscussion } from '../api/get-discussion';
import { UpdateDiscussion } from '../components/update-discussion';

export const DiscussionView = ({ discussionId }: { discussionId: string }) => {
  const navigate = useNavigate();
  const discussionQuery = useDiscussion({
    discussionId,
  });

  if (discussionQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const discussion = discussionQuery?.data?.data;

  if (!discussion) return null;

  return (
    <div>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(paths.app.discussions.getHref())}
          icon={<ArrowLeft className="size-4" />}
        >
          Back to Discussions
        </Button>
      </div>
      <span className="text-xs font-bold">
        {formatDate(discussion.createdAt)}
      </span>
      {discussion.author && (
        <span className="ml-2 text-sm font-bold">
          by {discussion.author.firstName} {discussion.author.lastName}
        </span>
      )}
      <div className="mt-6 flex flex-col space-y-16">
        <div className="flex justify-end">
          <UpdateDiscussion discussionId={discussionId} />
        </div>
        <div>
          <div className="overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="mt-1 max-w-2xl text-sm text-gray-500">
                <MDPreview value={discussion.body} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
