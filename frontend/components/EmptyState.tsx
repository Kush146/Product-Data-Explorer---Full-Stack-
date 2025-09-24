export default function EmptyState({
  title = 'Nothing here (yet)',
  subtitle,
  action,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-6 text-center space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
      {action}
    </div>
  );
}
