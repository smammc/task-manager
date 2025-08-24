import { databaseConfig } from '@/config/database'

export async function getMainTasksWithProgress(projectId: string) {
  // Query main tasks and compute subtask progress for each
  const query = `
    SELECT t.id, t.project_id, t.name, t.status, t.description, t.parent_task_id, t.category_id, t.created_at, t.updated_at,
      (SELECT COUNT(*) FROM tasks st WHERE st.parent_task_id = t.id) AS "totalCount",
      (SELECT COUNT(*) FROM tasks st WHERE st.parent_task_id = t.id AND st.status = 'Completed') AS "completedCount"
    FROM tasks t
    WHERE t.project_id = $1 AND t.parent_task_id IS NULL
    ORDER BY t.created_at ASC
  `
  const result = await databaseConfig.query(query, [projectId])
  return result.rows
}
