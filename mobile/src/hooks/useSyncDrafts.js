import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCreateJobMutation } from '@services/api/jobApi';
import { removeDraft } from '@store/slices/draftSlice';
import { Alert } from 'react-native';
import NotificationUtils from '@utils/notificationUtils';

export default function useSyncDrafts() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0); // 0 to 1
  const drafts = useSelector((state) => state.draft.drafts);
  const dispatch = useDispatch();
  const [createJob] = useCreateJobMutation();

  const syncAll = async () => {
    if (drafts.length === 0) return;
    
    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      try {
        const result = await createJob(draft.data).unwrap();
        
        // Schedule reminder for the newly created job
        if (result?.data?._id) {
          await NotificationUtils.scheduleJobReminders(result.data);
        }
        
        // Remove draft upon success (await so SQLite write completes)
        await dispatch(removeDraft(draft.id)).unwrap();
        successCount++;
      } catch (err) {
        console.error(`Failed to sync draft ${draft.id}:`, err);
        failCount++;
      }
      setSyncProgress((i + 1) / drafts.length);
    }

    setIsSyncing(false);
    setSyncProgress(0);

    if (failCount === 0) {
      Alert.alert("Sync Complete", `Successfully uploaded ${successCount} jobs.`);
    } else {
      Alert.alert("Sync Finished", `Uploaded ${successCount} jobs. ${failCount} failed to sync.`);
    }
  };

  return {
    syncAll,
    isSyncing,
    syncProgress,
    hasDrafts: drafts.length > 0,
    draftCount: drafts.length
  };
}
