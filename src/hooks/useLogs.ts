import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
    id: string;
    userId: string | null;
    action: string;
    entityType: string;
    entityName: string | null;
    createdAt: string;
    userEmail?: string;
    userFullName?: string;
}

export function useLogs() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = useCallback(async (isMounted: boolean = true) => {
        setIsLoading(true);
        try {
            const { data: logsData, error: logsError } = await supabase
                .from('activity_logs')
                .select(`
                    id,
                    user_id,
                    action,
                    entity_type,
                    entity_name,
                    created_at,
                    profiles:user_id (
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (isMounted) {
                if (logsError) {
                    console.error('Error fetching logs:', logsError);
                } else {
                    setLogs((logsData || []).map((row: any) => ({
                        id: row.id,
                        userId: row.user_id,
                        action: row.action,
                        entityType: row.entity_type,
                        entityName: row.entity_name,
                        createdAt: row.created_at,
                        userEmail: row.profiles?.email,
                        userFullName: row.profiles?.full_name,
                    })));
                }
            }
        } catch (error) {
            if (isMounted) {
                console.error('Unexpected error fetching logs:', error);
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }, []);

    const addLog = useCallback(async (action: string, entityType: string, entityName?: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: user.id,
                action,
                entity_type: entityType,
                entity_name: entityName || null,
            });

        if (error) {
            console.error('Error manual adding log:', error);
        } else {
            fetchLogs();
        }
    }, [fetchLogs]);

    useEffect(() => {
        let isMounted = true;
        fetchLogs(isMounted);

        const channel = supabase
            .channel('activity_logs_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_logs'
                },
                () => {
                    fetchLogs(isMounted);
                }
            )
            .subscribe();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                fetchLogs(isMounted);
            }
        });

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
            subscription.unsubscribe();
        };
    }, [fetchLogs]);

    return {
        logs,
        isLoading,
        addLog,
        refetch: fetchLogs,
    };
}
