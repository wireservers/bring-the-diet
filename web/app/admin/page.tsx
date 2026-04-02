import { Shell } from '@bringthediet/ui';

export default function Dashboard() {
  return (
    <Shell title="Dashboard">
      <p style={{ maxWidth: 900 }}>
        This is the Admin Console foundation. Next steps: wire CRUD tables to the API, enforce RBAC permissions, and implement workflow actions (draft/review/publish).
      </p>
      <ul>
        <li>Foods, Nutrition Facts, Recipes CRUD</li>
        <li>Diet taxonomy management</li>
        <li>Blog authoring + publishing</li>
        <li>Comment moderation</li>
      </ul>
    </Shell>
  );
}
