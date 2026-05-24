import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export const metadata = {
  title: '学習分析 — JLPT N1 Trainer',
  description: 'Vocabulary mastery, grammar accuracy, weak areas, activity heatmap, and exam readiness',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
